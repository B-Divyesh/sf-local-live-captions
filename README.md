# Local Live Captions

Caption Linux calls, lectures, and recordings on your device.

Local Live Captions is a desktop overlay for deaf and hard-of-hearing students. It turns a selected audio source into captions on your computer and exports SubRip (SRT) subtitle files. Raw audio stays in memory and is not saved.

The public site is at <https://local-live-captions.sociobot.in>. Open the isolated sample at <https://local-live-captions.sociobot.in/demo>.

## What works

- Select an audio source exposed by the operating system. On Linux, PipeWire or PulseAudio monitor sources appear when the sound server exposes them.
- Download free English or multilingual German speech models.
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

The desktop build needs the platform packages listed in [the release workflow](.github/workflows/release.yml). Speech model downloads use the listed `ggerganov/whisper.cpp` Hugging Face repository. The bundled upstream MIT license copy is pinned in [`third_party/whisper.cpp-LICENSE`](third_party/whisper.cpp-LICENSE).

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

Desktop installers are built only in GitHub Actions. Tag the exact commit with the version from `package.json`, such as `v0.1.12`. To rebuild, run the workflow for that tag. The workflow resolves that tag to one commit before packaging. It creates unsigned packages for macOS, Windows, and Linux. It also publishes `SHA256SUMS` and `latest.json` with that commit. The workflow audits their source identity, package list, URLs, and checksums after publication. After deploying the tagged site build, run `npm run verify:published-release` to check the live identity against GitHub. The site offers packages only when the release and deployed site use the same tag and commit.

## Privacy and licensing

The website makes no advertising or telemetry request. Settings and the optional supporter-license token stay on the computer. Model downloads contact Hugging Face. License checks contact the Sociobot billing API. Neither request includes audio or transcript text. Desktop setup can delete a downloaded model and remove a supporter license from this computer.

## Linux system audio

The app opens PipeWire or PulseAudio monitor sources through the local PulseAudio-compatible server. A monitor source carries system audio. A monitor source must appear in `pactl list short sources` before capture starts. The app also lists microphones reported by the operating system. Before capture, the app confirms that a monitor source is still exposed by the sound server.

`npm run test:linux-audio` is the reproducible Linux acceptance run. The test creates an isolated PulseAudio output and plays the included public-domain JFK clip. It downloads `tiny.en`, checks captions and SRT output, then starts capture again. It opens the monitor before playing the original German clip and runs four captures. The multilingual `base` model must return a multiword, recognizable German caption. The test needs `pulseaudio`, `pulseaudio-utils`, and the Linux development packages in the release workflow. Fixtures stay local and are never uploaded.

The source is available under the [MIT License](LICENSE). Read the site [privacy policy](https://local-live-captions.sociobot.in/privacy) and [terms](https://local-live-captions.sociobot.in/terms).
