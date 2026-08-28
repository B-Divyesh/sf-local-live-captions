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

#[derive(Clone, Serialize)]
struct CaptionLine {
    at: u64,
    end: u64,
    text: String,
}

struct CaptionState {
    transcript: Arc<Mutex<Vec<CaptionLine>>>,
    running: Arc<AtomicBool>,
    data_dir: PathBuf,
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
    Ok(names)
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

#[tauri::command]
async fn download_model(
    model: String,
    license: Option<String>,
    state: State<'_, CaptionState>,
) -> Result<String, String> {
    let (file_name, url) =
        model_file(&model).ok_or_else(|| "That model is not available.".to_string())?;
    if model != "tiny.en" {
        let token =
            license.ok_or_else(|| "A Plus license is required for this model.".to_string())?;
        if !verify_license(token).await? {
            return Err("This Plus license is not active.".into());
        }
    }
    let models = state.data_dir.join("models");
    std::fs::create_dir_all(&models)
        .map_err(|error| format!("Could not create the model folder: {error}"))?;
    let destination = models.join(file_name);
    if destination.exists() {
        return Ok(destination.display().to_string());
    }
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
    std::fs::rename(&temporary, &destination)
        .map_err(|error| format!("Could not finish the model download: {error}"))?;
    Ok(destination.display().to_string())
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

#[tauri::command]
fn start_capture(
    device_name: String,
    model: String,
    consent: bool,
    state: State<'_, CaptionState>,
) -> Result<(), String> {
    if !consent {
        return Err("Confirm that everyone agreed before capture.".into());
    }
    if state.running.swap(true, Ordering::SeqCst) {
        return Err("Captions are already running.".into());
    }
    let (file_name, _) =
        model_file(&model).ok_or_else(|| "That model is not available.".to_string())?;
    let model_path = state.data_dir.join("models").join(file_name);
    if !model_path.exists() {
        state.running.store(false, Ordering::SeqCst);
        return Err("Download this speech model first.".into());
    }
    let host = cpal::default_host();
    let device = host
        .input_devices()
        .map_err(|error| format!("Audio sources are unavailable: {error}"))?
        .find(|device| {
            device
                .name()
                .map(|name| name == device_name)
                .unwrap_or(false)
        })
        .ok_or_else(|| "The selected audio source is no longer available.".to_string())?;
    let supported = device
        .default_input_config()
        .map_err(|error| format!("The audio source has no supported format: {error}"))?;
    let sample_format = supported.sample_format();
    let config: cpal::StreamConfig = supported.into();
    let channels = config.channels as usize;
    let sample_rate = config.sample_rate.0;
    let transcript = state.transcript.clone();
    transcript
        .lock()
        .map_err(|_| "The transcript is busy.".to_string())?
        .clear();
    let running = state.running.clone();
    let model_path_string = model_path.display().to_string();
    let language = if model == "base" { "auto" } else { "en" }.to_string();
    std::thread::spawn(move || {
        let (sender, receiver) = mpsc::sync_channel::<Vec<f32>>(32);
        let on_error = |_error| {};
        let stream_result = match sample_format {
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
                running.store(false, Ordering::SeqCst);
                return;
            }
        };
        let Ok(stream) = stream_result else {
            running.store(false, Ordering::SeqCst);
            return;
        };
        if stream.play().is_err() {
            running.store(false, Ordering::SeqCst);
            return;
        }
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
                if let Ok(texts) = transcribe(&model_path_string, &audio, &language) {
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
            }
        }
        drop(stream);
    });
    Ok(())
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
fn stop_capture(state: State<'_, CaptionState>) -> Result<Vec<CaptionLine>, String> {
    state.running.store(false, Ordering::SeqCst);
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
                data_dir,
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_audio_devices,
            download_model,
            verify_license,
            start_capture,
            get_transcript,
            stop_capture,
            set_always_on_top
        ])
        .run(tauri::generate_context!())
        .expect("Local Live Captions could not start");
}
