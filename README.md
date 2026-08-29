# Local Live Captions

Caption Linux calls, lectures, and recordings on your device.

Local Live Captions is a Tauri 2 desktop overlay for deaf and hard-of-hearing students. It captures a selected audio input, runs a downloadable Whisper model locally, and exports transcript text as SRT. Raw audio is held in memory and is not saved.

The public site is at <https://local-live-captions.sociobot.in>. Open the isolated sample at <https://local-live-captions.sociobot.in/demo>.

## What works

- Select an input exposed by the operating system. On Linux, PipeWire or PulseAudio monitor sources appear when the sound server exposes them.
- Download free English or multilingual German-capable models.
- Start only after confirming consent.
- Read captions in an always-on-top, resizable overlay.
- Change caption size while capture runs.
- Export the current transcript as SRT.
- Optionally buy a $24 one-time supporter license. It does not lock caption features.

Whisper can mishear names and technical words. Do not treat automatic captions as an official record.

## Develop

Requirements: Node.js 22, Rust stable, Tauri 2 system packages, Linux ALSA development headers, and PulseAudio development headers for Linux monitor capture.

```sh
npm ci
npm run dev          # website
npm run tauri dev    # desktop app
```

The desktop build needs the platform packages listed in [the release workflow](.github/workflows/release.yml). Speech models download on demand from the official `ggerganov/whisper.cpp` Hugging Face repository. OpenAI Whisper and whisper.cpp publish their code and converted models under the MIT License.

`src-tauri/Cargo.lock` is committed on purpose. It pins the Rust Tauri stack to the compatible 2.8 release used by the desktop JavaScript API. Do not commit `src-tauri/target/` or `src-tauri/gen/`; both are generated during native builds.

## Test and build

The factory build command is:

```sh
npm ci && npm test && npm run build:site
```

The static output lands in `dist/site`, with `index.html` at its root.

```sh
npm test             # Vitest + isolated desktop/mobile Playwright checks
npm run typecheck    # TypeScript type check
npm run lint         # TypeScript type check + Rust Clippy with warnings denied
npm run test:browser-lifecycle # inject a mobile Chromium SIGSEGV and prove clean retry
npm run test:linux-audio # isolated PulseAudio monitor → real speech caption acceptance test
npm run build        # site in dist/site; desktop frontend in dist/app
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build
```

Release verification sets `CI=1`. Desktop and 390 px mobile tests run in
separate Playwright processes, and every test receives a newly launched browser
and context. An unexpected Chromium exit gets one clean retry in CI.

Desktop installers are built only in GitHub Actions. Tag a `v*` release or run the release workflow. It creates unsigned macOS, Windows, and Linux packages, then publishes `SHA256SUMS` and `latest.json`.

## Privacy and licensing

There is no telemetry. Settings and the optional supporter-license token stay on the computer. Model downloads contact Hugging Face. License checks contact the Sociobot billing API. Neither request includes audio or transcript text.

## Linux system audio

The app opens PipeWire or PulseAudio monitor sources through the local PulseAudio-compatible server, rather than relying only on ALSA device enumeration. A monitor source must exist and be visible to `pactl list short sources`; normal microphones are still listed through the operating system's native input list. Before a monitor starts, the app confirms that it is still exposed by the sound server.

`npm run test:linux-audio` is the reproducible Linux acceptance run. It starts an isolated PulseAudio null sink, plays the shipped public-domain JFK speech fixture into its monitor, downloads the real `tiny.en` model if needed, asserts the caption text, checks SRT formatting, and opens a second capture after stopping. It needs `pulseaudio`, `pulseaudio-utils`, and the Linux development packages in the release workflow. The fixture is local only and is never uploaded.

The source is available under the [MIT License](LICENSE). Read the site [privacy policy](https://local-live-captions.sociobot.in/privacy) and [terms](https://local-live-captions.sociobot.in/terms).
