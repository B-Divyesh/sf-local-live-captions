use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use serde::Serialize;
use std::{
    path::PathBuf,
    sync::{
        atomic::{AtomicBool, Ordering},
        mpsc, Arc, Mutex,
    },
    time::{Duration, Instant},
};
use tauri::{Manager, State, Window};
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters};

#[cfg(target_os = "linux")]
use libpulse_binding::{
    sample::{Format, Spec},
    stream::Direction,
};
#[cfg(target_os = "linux")]
use libpulse_simple_binding::Simple as PulseSimple;

#[derive(Clone, Serialize)]
struct CaptionLine {
    at: u64,
    end: u64,
    text: String,
}

struct CaptionState {
    transcript: Arc<Mutex<Vec<CaptionLine>>>,
    running: Arc<AtomicBool>,
    last_error: Arc<Mutex<Option<String>>>,
    data_dir: PathBuf,
}

#[derive(Serialize)]
struct CaptureStatus {
    active: bool,
    error: Option<String>,
}

fn record_capture_failure(
    running: &AtomicBool,
    last_error: &Mutex<Option<String>>,
    message: String,
) {
    running.store(false, Ordering::SeqCst);
    if let Ok(mut saved) = last_error.lock() {
        *saved = Some(message);
    }
}

fn require_consent(consent: bool) -> Result<(), String> {
    if consent {
        Ok(())
    } else {
        Err("Confirm that everyone agreed before capture.".into())
    }
}

fn report_start_failure(
    running: &AtomicBool,
    last_error: &Mutex<Option<String>>,
    reply: &mpsc::SyncSender<Result<(), String>>,
    message: String,
) {
    record_capture_failure(running, last_error, message.clone());
    let _ = reply.send(Err(message));
}

fn reset_session(state: &CaptionState) -> Result<(), String> {
    state
        .transcript
        .lock()
        .map_err(|_| "The transcript is busy.".to_string())?
        .clear();
    if let Ok(mut last_error) = state.last_error.lock() {
        *last_error = None;
    }
    Ok(())
}

#[tauri::command]
fn list_audio_devices() -> Result<Vec<String>, String> {
    let host = cpal::default_host();
    let mut names: Vec<String> = host
        .input_devices()
        .map_err(|error| format!("Audio sources are unavailable: {error}"))?
        .filter_map(|device| device.name().ok())
        .collect();
    names.sort();
    names.dedup();
    #[cfg(target_os = "linux")]
    names.extend(pulse_monitor_sources());
    names.sort();
    names.dedup();
    Ok(names)
}

/// PipeWire exposes its PulseAudio compatibility server through `pactl`; a
/// monitor source is the desktop-output stream a caption user needs.
#[cfg(target_os = "linux")]
fn pulse_monitor_sources_from_pactl(output: &str) -> Vec<String> {
    output
        .lines()
        .filter_map(|line| line.split_whitespace().nth(1))
        .filter(|source| source.ends_with(".monitor"))
        .map(|source| format!("pulse:{source}"))
        .collect()
}

#[cfg(target_os = "linux")]
fn pulse_monitor_sources() -> Vec<String> {
    let output = std::process::Command::new("pactl")
        .args(["list", "short", "sources"])
        .output();
    match output {
        Ok(result) if result.status.success() => {
            pulse_monitor_sources_from_pactl(&String::from_utf8_lossy(&result.stdout))
        }
        _ => vec![],
    }
}

#[cfg(target_os = "linux")]
fn pulse_monitor_is_available(device_name: &str, available: &[String]) -> bool {
    device_name.starts_with("pulse:") && available.iter().any(|source| source == device_name)
}

fn model_file(model: &str) -> Option<(&'static str, &'static str)> {
    match model {
        "tiny.en" => Some((
            "ggml-tiny.en.bin",
            "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin",
        )),
        "base.en" => Some((
            "ggml-base.en.bin",
            "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin",
        )),
        "base" => Some((
            "ggml-base.bin",
            "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin",
        )),
        _ => None,
    }
}

fn model_destination(data_dir: &std::path::Path, model: &str) -> Result<PathBuf, String> {
    let (file_name, _) =
        model_file(model).ok_or_else(|| "That model is not available.".to_string())?;
    Ok(data_dir.join("models").join(file_name))
}

fn delete_model_file(data_dir: &std::path::Path, model: &str) -> Result<String, String> {
    let destination = model_destination(data_dir, model)?;
    if !destination.exists() {
        return Ok("The selected model is not downloaded on this computer.".into());
    }
    std::fs::remove_file(&destination)
        .map_err(|error| format!("Could not delete the selected model: {error}"))?;
    Ok("The downloaded model was deleted from this computer.".into())
}

async fn download_model_file(model: &str, destination: &std::path::Path) -> Result<(), String> {
    let (_, url) = model_file(model).ok_or_else(|| "That model is not available.".to_string())?;
    if destination.exists() {
        return Ok(());
    }
    let parent = destination
        .parent()
        .ok_or_else(|| "The model folder is unavailable.".to_string())?;
    std::fs::create_dir_all(parent)
        .map_err(|error| format!("Could not create the model folder: {error}"))?;
    let bytes = reqwest::get(url)
        .await
        .map_err(|error| format!("Download failed: {error}"))?
        .error_for_status()
        .map_err(|error| format!("The model server refused the download: {error}"))?
        .bytes()
        .await
        .map_err(|error| format!("The model download ended early: {error}"))?;
    if bytes.len() < 10_000_000 {
        return Err("The downloaded model was incomplete.".into());
    }
    let temporary = destination.with_extension("download");
    std::fs::write(&temporary, bytes)
        .map_err(|error| format!("Could not save the model: {error}"))?;
    std::fs::rename(&temporary, destination)
        .map_err(|error| format!("Could not finish the model download: {error}"))
}

fn language_for_model(model: &str) -> String {
    if model == "base" { "auto" } else { "en" }.to_string()
}

#[tauri::command]
async fn download_model(
    model: String,
    license: Option<String>,
    state: State<'_, CaptionState>,
) -> Result<String, String> {
    // All speech models, including multilingual German-capable `base`, remain
    // free. Captions are an accessibility behavior and must never be paywalled.
    let _ = license;
    let destination = model_destination(&state.data_dir, &model)?;
    download_model_file(&model, &destination).await?;
    Ok(destination.display().to_string())
}

#[tauri::command]
fn delete_model(model: String, state: State<'_, CaptionState>) -> Result<String, String> {
    delete_model_file(&state.data_dir, &model)
}

#[derive(serde::Deserialize)]
struct LicenseVerdict {
    valid: bool,
}

#[tauri::command]
async fn verify_license(license: String) -> Result<bool, String> {
    if license.trim().is_empty() {
        return Ok(false);
    }
    let url = format!(
        "https://api.sociobot.in/api/v1/products/local-live-captions/verify?license={}",
        license.trim()
    );
    let verdict = reqwest::get(url)
        .await
        .map_err(|error| format!("License check failed: {error}"))?
        .error_for_status()
        .map_err(|error| format!("License check was refused: {error}"))?
        .json::<LicenseVerdict>()
        .await
        .map_err(|error| format!("License reply was invalid: {error}"))?;
    Ok(verdict.valid)
}

fn resample_to_16k(input: &[f32], channels: usize, source_rate: u32) -> Vec<f32> {
    if input.is_empty() || channels == 0 {
        return vec![];
    }
    let mono: Vec<f32> = input
        .chunks(channels)
        .map(|frame| frame.iter().sum::<f32>() / frame.len() as f32)
        .collect();
    if source_rate == 16_000 {
        return mono;
    }
    let output_len = mono.len() * 16_000 / source_rate as usize;
    (0..output_len)
        .map(|index| {
            let position = index as f64 * source_rate as f64 / 16_000.0;
            let left = position.floor() as usize;
            let right = (left + 1).min(mono.len() - 1);
            let blend = (position - left as f64) as f32;
            mono[left] * (1.0 - blend) + mono[right] * blend
        })
        .collect()
}

fn transcribe(model_path: &str, audio: &[f32], language: &str) -> Result<Vec<String>, String> {
    let context = WhisperContext::new_with_params(model_path, WhisperContextParameters::default())
        .map_err(|error| format!("The speech model could not open: {error}"))?;
    let mut whisper = context
        .create_state()
        .map_err(|error| format!("The caption engine could not start: {error}"))?;
    let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
    params.set_n_threads(
        std::thread::available_parallelism()
            .map(|n| n.get().min(4) as i32)
            .unwrap_or(2),
    );
    params.set_language(Some(language));
    params.set_translate(false);
    params.set_print_progress(false);
    params.set_print_realtime(false);
    params.set_print_timestamps(false);
    params.set_no_context(true);
    whisper
        .full(params, audio)
        .map_err(|error| format!("The caption engine stopped: {error}"))?;
    Ok(whisper
        .as_iter()
        .map(|segment| segment.to_string().trim().to_string())
        .filter(|text| !text.is_empty())
        .collect())
}

#[cfg(test)]
fn format_srt(lines: &[CaptionLine]) -> String {
    fn timestamp(seconds: u64) -> String {
        format!(
            "{:02}:{:02}:{:02},000",
            seconds / 3600,
            (seconds / 60) % 60,
            seconds % 60
        )
    }
    lines
        .iter()
        .enumerate()
        .map(|(index, line)| {
            format!(
                "{}\n{} --> {}\n{}\n",
                index + 1,
                timestamp(line.at),
                timestamp(line.end),
                line.text
            )
        })
        .collect()
}

#[cfg(target_os = "linux")]
fn start_pulse_capture(
    source: &str,
    model_path: PathBuf,
    language: String,
    state: State<'_, CaptionState>,
) -> Result<(), String> {
    reset_session(&state)?;
    let transcript = state.transcript.clone();
    let running = state.running.clone();
    let last_error = state.last_error.clone();
    let source = source.to_string();
    let model_path = model_path.display().to_string();
    let (startup_sender, startup_receiver) = mpsc::sync_channel::<Result<(), String>>(1);
    std::thread::spawn(move || {
        let sample_spec = Spec {
            format: Format::S16NE,
            channels: 1,
            rate: 16_000,
        };
        let capture = match PulseSimple::new(
            None,
            "Local Live Captions",
            Direction::Record,
            Some(&source),
            "Desktop caption audio",
            &sample_spec,
            None,
            None,
        ) {
            Ok(capture) => capture,
            Err(error) => {
                report_start_failure(
                    &running,
                    &last_error,
                    &startup_sender,
                    format!("Could not open the PipeWire or PulseAudio monitor: {error}"),
                );
                return;
            }
        };
        running.store(true, Ordering::SeqCst);
        let _ = startup_sender.send(Ok(()));
        let started = Instant::now();
        let mut audio = Vec::with_capacity(16_000 * 5);
        let mut bytes = vec![0_u8; 16_000 * 2];
        while running.load(Ordering::SeqCst) {
            if let Err(error) = capture.read(&mut bytes) {
                record_capture_failure(
                    &running,
                    &last_error,
                    format!("The PipeWire or PulseAudio monitor stopped: {error}"),
                );
                break;
            }
            audio.extend(
                bytes.as_chunks::<2>().0.iter().map(|sample| {
                    i16::from_ne_bytes([sample[0], sample[1]]) as f32 / i16::MAX as f32
                }),
            );
            if audio.len() >= 16_000 * 5 {
                match transcribe(&model_path, &audio, &language) {
                    Ok(texts) => {
                        if let Ok(mut saved) = transcript.lock() {
                            for text in texts {
                                let end = started.elapsed().as_secs();
                                saved.push(CaptionLine {
                                    at: end.saturating_sub(5),
                                    end,
                                    text,
                                });
                            }
                        }
                    }
                    Err(error) => {
                        record_capture_failure(&running, &last_error, error);
                        break;
                    }
                }
                audio.clear();
            }
        }
    });
    match startup_receiver.recv_timeout(Duration::from_secs(5)) {
        Ok(result) => result,
        Err(_) => {
            let message = "The PipeWire or PulseAudio monitor did not start in time. Choose another source and try again.".to_string();
            record_capture_failure(&state.running, &state.last_error, message.clone());
            Err(message)
        }
    }
}

#[tauri::command]
fn start_capture(
    device_name: String,
    model: String,
    consent: bool,
    state: State<'_, CaptionState>,
) -> Result<(), String> {
    require_consent(consent)?;
    if state.running.load(Ordering::SeqCst) {
        return Err("Captions are already running.".into());
    }
    let (file_name, _) =
        model_file(&model).ok_or_else(|| "That model is not available.".to_string())?;
    let model_path = state.data_dir.join("models").join(file_name);
    if !model_path.exists() {
        return Err("Download this speech model first.".into());
    }
    #[cfg(target_os = "linux")]
    if let Some(source) = device_name.strip_prefix("pulse:") {
        if !pulse_monitor_is_available(&device_name, &pulse_monitor_sources()) {
            return Err(
                "The selected PipeWire or PulseAudio monitor is no longer available.".into(),
            );
        }
        return start_pulse_capture(source, model_path, language_for_model(&model), state);
    }
    reset_session(&state)?;
    let transcript = state.transcript.clone();
    let running = state.running.clone();
    let last_error = state.last_error.clone();
    let model_path_string = model_path.display().to_string();
    let language = language_for_model(&model);
    let (startup_sender, startup_receiver) = mpsc::sync_channel::<Result<(), String>>(1);
    let startup_cancelled = Arc::new(AtomicBool::new(false));
    let worker_cancelled = startup_cancelled.clone();
    std::thread::spawn(move || {
        let host = cpal::default_host();
        let device = match host.input_devices() {
            Ok(mut devices) => devices.find(|device| {
                device
                    .name()
                    .map(|name| name == device_name)
                    .unwrap_or(false)
            }),
            Err(error) => {
                report_start_failure(
                    &running,
                    &last_error,
                    &startup_sender,
                    format!("Audio sources are unavailable: {error}"),
                );
                return;
            }
        };
        let Some(device) = device else {
            report_start_failure(
                &running,
                &last_error,
                &startup_sender,
                "The selected audio source is no longer available.".into(),
            );
            return;
        };
        let supported = match device.default_input_config() {
            Ok(config) => config,
            Err(error) => {
                report_start_failure(
                    &running,
                    &last_error,
                    &startup_sender,
                    format!("The audio source has no supported format: {error}"),
                );
                return;
            }
        };
        let sample_format = supported.sample_format();
        let config: cpal::StreamConfig = supported.into();
        let channels = config.channels as usize;
        let sample_rate = config.sample_rate.0;
        let (sender, receiver) = mpsc::sync_channel::<Vec<f32>>(32);
        let callback_running = running.clone();
        let callback_error = last_error.clone();
        let on_error = move |error: cpal::StreamError| {
            record_capture_failure(
                &callback_running,
                &callback_error,
                format!("The audio source stopped: {error}"),
            );
        };
        let stream = match sample_format {
            cpal::SampleFormat::F32 => device.build_input_stream(
                &config,
                move |data: &[f32], _| {
                    let _ = sender.try_send(data.to_vec());
                },
                on_error,
                None,
            ),
            cpal::SampleFormat::I16 => device.build_input_stream(
                &config,
                move |data: &[i16], _| {
                    let _ =
                        sender.try_send(data.iter().map(|s| *s as f32 / i16::MAX as f32).collect());
                },
                on_error,
                None,
            ),
            cpal::SampleFormat::U16 => device.build_input_stream(
                &config,
                move |data: &[u16], _| {
                    let _ = sender.try_send(
                        data.iter()
                            .map(|s| (*s as f32 / u16::MAX as f32) * 2.0 - 1.0)
                            .collect(),
                    );
                },
                on_error,
                None,
            ),
            _ => {
                report_start_failure(
                    &running,
                    &last_error,
                    &startup_sender,
                    "The selected audio format is not supported.".into(),
                );
                return;
            }
        };
        let stream = match stream {
            Ok(stream) => stream,
            Err(error) => {
                report_start_failure(
                    &running,
                    &last_error,
                    &startup_sender,
                    format!("Could not start the selected audio source: {error}"),
                );
                return;
            }
        };
        if let Err(error) = stream.play() {
            report_start_failure(
                &running,
                &last_error,
                &startup_sender,
                format!("Could not play the selected audio source: {error}"),
            );
            return;
        }
        if worker_cancelled.load(Ordering::SeqCst) {
            return;
        }
        running.store(true, Ordering::SeqCst);
        let _ = startup_sender.send(Ok(()));
        let started = Instant::now();
        let target_samples = sample_rate as usize * channels * 5;
        let mut buffer = Vec::with_capacity(target_samples);
        while running.load(Ordering::SeqCst) {
            if let Ok(chunk) = receiver.recv_timeout(Duration::from_millis(250)) {
                buffer.extend(chunk);
            }
            if buffer.len() >= target_samples {
                let audio = resample_to_16k(&buffer, channels, sample_rate);
                buffer.clear();
                match transcribe(&model_path_string, &audio, &language) {
                    Ok(texts) => {
                        if let Ok(mut saved) = transcript.lock() {
                            for text in texts {
                                let end = started.elapsed().as_secs();
                                saved.push(CaptionLine {
                                    at: end.saturating_sub(5),
                                    end,
                                    text,
                                });
                            }
                        }
                    }
                    Err(error) => {
                        record_capture_failure(&running, &last_error, error);
                        break;
                    }
                }
            }
        }
        drop(stream);
    });
    match startup_receiver.recv_timeout(Duration::from_secs(5)) {
        Ok(result) => result,
        Err(_) => {
            startup_cancelled.store(true, Ordering::SeqCst);
            let message =
                "The audio source did not start in time. Choose another source and try again."
                    .to_string();
            record_capture_failure(&state.running, &state.last_error, message.clone());
            Err(message)
        }
    }
}

#[tauri::command]
fn get_transcript(state: State<'_, CaptionState>) -> Result<Vec<CaptionLine>, String> {
    state
        .transcript
        .lock()
        .map(|lines| lines.clone())
        .map_err(|_| "The transcript is busy.".to_string())
}

#[tauri::command]
fn capture_status(state: State<'_, CaptionState>) -> Result<CaptureStatus, String> {
    let error = state
        .last_error
        .lock()
        .map_err(|_| "The capture status is busy.".to_string())?
        .clone();
    Ok(CaptureStatus {
        active: state.running.load(Ordering::SeqCst),
        error,
    })
}

#[tauri::command]
fn stop_capture(state: State<'_, CaptionState>) -> Result<Vec<CaptionLine>, String> {
    state.running.store(false, Ordering::SeqCst);
    if let Ok(mut last_error) = state.last_error.lock() {
        *last_error = None;
    }
    get_transcript(state)
}

#[tauri::command]
fn set_always_on_top(window: Window, enabled: bool) -> Result<(), String> {
    window
        .set_always_on_top(enabled)
        .map_err(|error| format!("The overlay could not change: {error}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let data_dir = app
                .path()
                .app_local_data_dir()
                .map_err(|error| format!("App storage is unavailable: {error}"))?;
            app.manage(CaptionState {
                transcript: Arc::new(Mutex::new(Vec::new())),
                running: Arc::new(AtomicBool::new(false)),
                last_error: Arc::new(Mutex::new(None)),
                data_dir,
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_audio_devices,
            download_model,
            delete_model,
            verify_license,
            start_capture,
            get_transcript,
            capture_status,
            stop_capture,
            set_always_on_top
        ])
        .run(tauri::generate_context!())
        .expect("Local Live Captions could not start");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn resampling_downmixes_and_preserves_the_requested_duration() {
        let input = vec![1.0, -1.0, 0.5, 0.5, -0.5, 0.5, 0.0, 0.0];
        let output = resample_to_16k(&input, 2, 32_000);
        assert_eq!(output.len(), 2);
        assert!((output[0] - 0.0).abs() < f32::EPSILON);
    }

    #[test]
    fn capture_recovery_failure_clears_running_state_and_keeps_a_retryable_error() {
        let running = AtomicBool::new(true);
        let error = Mutex::new(None);
        record_capture_failure(
            &running,
            &error,
            "The selected audio source stopped.".into(),
        );
        assert!(!running.load(Ordering::SeqCst));
        assert_eq!(
            error.lock().unwrap().as_deref(),
            Some("The selected audio source stopped.")
        );
    }

    #[test]
    // @claim:session-transcript
    fn claim_session_transcript_is_runtime_state_and_a_new_session_clears_it() {
        let state = CaptionState {
            transcript: Arc::new(Mutex::new(vec![CaptionLine {
                at: 0,
                end: 1,
                text: "sample words".into(),
            }])),
            running: Arc::new(AtomicBool::new(false)),
            last_error: Arc::new(Mutex::new(Some("old error".into()))),
            data_dir: std::env::temp_dir(),
        };
        reset_session(&state).unwrap();
        assert!(state.transcript.lock().unwrap().is_empty());
        assert_eq!(*state.last_error.lock().unwrap(), None);
    }

    #[test]
    // @claim:consent-before-capture
    fn claim_consent_is_required_before_any_capture_can_start() {
        assert!(require_consent(true).is_ok());
        assert_eq!(
            require_consent(false).unwrap_err(),
            "Confirm that everyone agreed before capture."
        );
    }

    #[test]
    // @claim:local-model-storage
    fn claim_models_are_downloaded_to_the_app_data_folder() {
        let destination =
            model_destination(std::path::Path::new("/private/app-data"), "base").unwrap();
        assert_eq!(
            destination,
            PathBuf::from("/private/app-data/models/ggml-base.bin")
        );
    }

    #[test]
    fn storage_control_core_deletes_the_selected_model_file() {
        let folder = std::env::temp_dir().join(format!(
            "local-live-captions-storage-control-{}",
            std::process::id()
        ));
        let destination = model_destination(&folder, "tiny.en").unwrap();
        std::fs::create_dir_all(destination.parent().unwrap()).unwrap();
        std::fs::write(&destination, b"downloaded-model").unwrap();
        assert_eq!(
            delete_model_file(&folder, "tiny.en").unwrap(),
            "The downloaded model was deleted from this computer."
        );
        assert!(!destination.exists());
        std::fs::remove_dir_all(&folder).unwrap();
    }

    #[test]
    // @claim:language-models
    fn claim_language_models_include_english_and_german() {
        assert!(model_file("tiny.en").is_some());
        assert!(model_file("base.en").is_some());
        assert!(model_file("base").is_some());
        assert_eq!(language_for_model("base"), "auto");
    }

    #[cfg(target_os = "linux")]
    #[test]
    // @claim:linux-system-audio
    fn claim_linux_system_audio_lists_pipewire_or_pulseaudio_monitor_sources() {
        let sources = pulse_monitor_sources_from_pactl(
            "42\talsa_output.pci-0000_00_1f.3.analog-stereo.monitor\tPipeWire\ts16le 2ch 48000Hz\tIDLE\n43\talsa_input.pci-0000_00_1f.3.analog-stereo\tPipeWire\ts16le 2ch 48000Hz\tIDLE\n",
        );
        assert_eq!(
            sources,
            vec!["pulse:alsa_output.pci-0000_00_1f.3.analog-stereo.monitor"]
        );
    }

    #[cfg(target_os = "linux")]
    #[test]
    // @claim:source-start-validation
    fn claim_linux_monitor_must_still_be_exposed_when_capture_starts() {
        let sources = pulse_monitor_sources_from_pactl(
            "42\tllc_test.monitor\tPipeWire\ts16le 1ch 16000Hz\tIDLE\n",
        );
        assert!(pulse_monitor_is_available(
            "pulse:llc_test.monitor",
            &sources
        ));
        assert!(!pulse_monitor_is_available(
            "pulse:missing.monitor",
            &sources
        ));
        let source = include_str!("lib.rs");
        assert!(
            source.contains("The selected PipeWire or PulseAudio monitor is no longer available.")
        );
    }

    #[cfg(target_os = "linux")]
    /// Open the monitor before starting fixture playback. Starting `paplay`
    /// first can lose the first words while PulseAudio creates the recording
    /// stream, which makes a real transcription assertion depend on timing.
    fn capture_fixture_from_monitor(
        source: &str,
        fixture: &str,
        seconds: usize,
    ) -> Result<Vec<f32>, String> {
        let sample_spec = Spec {
            format: Format::S16NE,
            channels: 1,
            rate: 16_000,
        };
        let capture = PulseSimple::new(
            None,
            "Local Live Captions acceptance test",
            Direction::Record,
            Some(source),
            "Consented public-domain speech fixture",
            &sample_spec,
            None,
            None,
        )
        .map_err(|error| format!("Could not open monitor {source}: {error}"))?;
        let mut player = std::process::Command::new("paplay")
            .arg(fixture)
            .spawn()
            .map_err(|error| format!("Could not play the speech fixture: {error}"))?;
        let mut bytes = vec![0_u8; 16_000 * seconds * 2];
        let read_result = capture
            .read(&mut bytes)
            .map_err(|error| format!("Could not read monitor audio: {error}"));
        let status = player
            .wait()
            .map_err(|error| format!("Could not wait for the speech fixture: {error}"))?;
        if !status.success() {
            return Err(format!("The speech fixture stopped with {status}."));
        }
        read_result?;
        Ok(bytes
            .as_chunks::<2>()
            .0
            .iter()
            .map(|sample| i16::from_ne_bytes([sample[0], sample[1]]) as f32 / i16::MAX as f32)
            .collect())
    }

    #[cfg(target_os = "linux")]
    #[test]
    #[ignore = "requires scripts/linux-audio-acceptance.sh to provide an isolated PulseAudio monitor"]
    // @claim:native-local-processing
    // @claim:no-audio-storage
    // @claim:linux-monitor-end-to-end
    fn claim_linux_monitor_end_to_end_captions_speech_and_restarts() {
        let cache = std::env::var("LLC_AUDIO_TEST_CACHE")
            .expect("run through scripts/linux-audio-acceptance.sh");
        let source = std::env::var("LLC_TEST_PULSE_SOURCE")
            .expect("the acceptance script must expose a monitor source");
        let fixture = std::env::var("LLC_TEST_SPEECH_FIXTURE")
            .expect("the acceptance script must provide the consented speech fixture");
        let destination = model_destination(std::path::Path::new(&cache), "tiny.en").unwrap();
        tauri::async_runtime::block_on(download_model_file("tiny.en", &destination))
            .expect("the real model download must complete");
        let model_folder = destination.parent().unwrap();
        let before_capture: Vec<_> = std::fs::read_dir(model_folder)
            .unwrap()
            .map(|entry| entry.unwrap().file_name())
            .collect();

        let audio = capture_fixture_from_monitor(&source, &fixture, 9)
            .expect("the selected monitor must yield fixture audio");
        let captions = transcribe(destination.to_str().unwrap(), &audio, "en")
            .expect("the downloaded model must caption monitor audio");
        let joined = captions.join(" ").to_lowercase();
        assert!(
            joined.contains("ask not what your country"),
            "unexpected caption output: {joined}"
        );
        let lines = vec![CaptionLine {
            at: 0,
            end: 9,
            text: captions.join(" "),
        }];
        assert!(format_srt(&lines).contains("00:00:00,000 --> 00:00:09,000"));
        let after_capture: Vec<_> = std::fs::read_dir(model_folder)
            .unwrap()
            .map(|entry| entry.unwrap().file_name())
            .collect();
        assert_eq!(
            before_capture, after_capture,
            "capturing must not write raw audio beside the local model"
        );

        let restarted = capture_fixture_from_monitor(&source, &fixture, 2)
            .expect("a new capture can open after the first capture stops");
        assert!(restarted.iter().any(|sample| sample.abs() > 0.01));
    }

    #[cfg(target_os = "linux")]
    fn is_recognizable_german_caption(transcript: &str) -> bool {
        let normalized = transcript.to_lowercase();
        let words: Vec<_> = normalized
            .split(|character: char| !character.is_alphabetic())
            .filter(|word| !word.is_empty())
            .collect();
        if words.len() < 4 {
            return false;
        }
        [
            "das", "ist", "ein", "ich", "bin", "die", "der", "und", "wie", "zu", "nicht", "mehr",
            "habe", "bühne", "wäsche", "folie", "folgen", "sprechen", "planeten", "guten",
            "morgen", "heute", "sterne", "bitte", "lesen", "nächste", "leben", "machen", "sehr",
            "ums",
        ]
        .iter()
        .filter(|marker| words.iter().any(|word| word == *marker))
        .count()
            >= 3
    }

    #[cfg(target_os = "linux")]
    #[test]
    fn german_caption_regression_accepts_recognizable_local_german_and_rejects_english() {
        assert!(is_recognizable_german_caption(
            "das ist ein sehr wichtiges, ums leben zu machen"
        ));
        assert!(is_recognizable_german_caption(
            "ich bin die bühne, die ich nicht mehr verletzt habe"
        ));
        assert!(!is_recognizable_german_caption(
            "ask not what your country can do for you"
        ));
        assert!(!is_recognizable_german_caption(""));
    }

    #[cfg(target_os = "linux")]
    #[test]
    #[ignore = "requires scripts/linux-audio-acceptance.sh to provide an isolated PulseAudio monitor"]
    // @claim:german-caption-end-to-end
    fn claim_german_caption_end_to_end() {
        let cache = std::env::var("LLC_AUDIO_TEST_CACHE")
            .expect("run through scripts/linux-audio-acceptance.sh");
        let source = std::env::var("LLC_TEST_PULSE_SOURCE")
            .expect("the acceptance script must expose a monitor source");
        let fixture = std::env::var("LLC_TEST_GERMAN_FIXTURE")
            .expect("the acceptance script must provide the German speech fixture");
        let destination = model_destination(std::path::Path::new(&cache), "base").unwrap();
        tauri::async_runtime::block_on(download_model_file("base", &destination))
            .expect("the real multilingual model download must complete");

        let audio = capture_fixture_from_monitor(&source, &fixture, 9)
            .expect("the selected monitor must yield German fixture audio");
        let captions = transcribe(destination.to_str().unwrap(), &audio, "auto")
            .expect("the multilingual model must caption German monitor audio");
        let joined = captions.join(" ").to_lowercase();
        assert!(
            is_recognizable_german_caption(&joined),
            "unexpected German caption output: {joined}"
        );
    }
}
