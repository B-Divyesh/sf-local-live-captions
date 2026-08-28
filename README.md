# Local Live Captions

Caption Linux calls, lectures, and recordings on your device.

Local Live Captions is a Tauri 2 desktop overlay for deaf and hard-of-hearing students. It captures a selected audio input, runs a downloadable Whisper model locally, and exports transcript text as SRT. Raw audio is held in memory and is not saved.

The public site is at <https://local-live-captions.sociobot.in>. Open the isolated sample at <https://local-live-captions.sociobot.in/demo>.

## What works

- Select any input exposed by the operating system. On Linux, choose the PipeWire or PulseAudio monitor for system sound.
- Download the free 75 MB English model.
- Start only after confirming consent.
- Read captions in an always-on-top, resizable overlay.
- Change caption size while capture runs.
- Export the current transcript as SRT.
- Use a $24 one-time Plus license for German and larger models.

Whisper can mishear names and technical words. Do not treat automatic captions as an official record.

## Develop

Requirements: Node.js 22, Rust stable, Tauri 2 system packages, and Linux ALSA development headers.

```sh
npm ci
npm run dev          # website
npm run tauri dev    # desktop app
```

The desktop build needs the platform packages listed in [the release workflow](.github/workflows/release.yml). Speech models download on demand from the official `ggerganov/whisper.cpp` Hugging Face repository. OpenAI Whisper and whisper.cpp publish their code and converted models under the MIT License.

## Test and build

The factory build command is:

```sh
npm ci && npm test && npm run build:site
```

The static output lands in `dist/site`, with `index.html` at its root.

```sh
npm test             # Vitest + Playwright claims and accessibility checks
npm run build        # site in dist/site; desktop frontend in dist/app
cargo fmt --check --manifest-path src-tauri/Cargo.toml
```

Desktop installers are built only in GitHub Actions. Tag a `v*` release or run the release workflow. It creates unsigned macOS, Windows, and Linux packages, then publishes `SHA256SUMS` and `latest.json`.

## Privacy and licensing

There is no telemetry. Settings and the optional license token stay on the computer. Model downloads contact Hugging Face. License checks contact the Sociobot billing API. Neither request includes audio or transcript text.

The source is available under the [MIT License](LICENSE). Read the site [privacy policy](https://local-live-captions.sociobot.in/privacy) and [terms](https://local-live-captions.sociobot.in/terms).
