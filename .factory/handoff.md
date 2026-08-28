# Local Live Captions — build handoff

## What was built

- A Tauri 2 desktop app with a Rust audio path, selected input-device capture, five-second in-memory chunks, 16 kHz resampling, and local whisper.cpp transcription.
- A consent checkbox that blocks real capture until confirmed. Capture state remains visible in the overlay.
- On-demand official Whisper model downloads. English Tiny is free. A $24 one-time Plus license adds larger English and multilingual English/German models.
- Sociobot checkout, license return storage, daily cached browser verification, in-app paste-to-restore, and server-side verification before paid model download.
- An always-on-top caption view with live updates, caption sizing, pause/stop, SRT export, loading, empty, device-error, model-error, and offline-error copy.
- A one-click sample on `/demo` and in the desktop first-run screen. Browser demo state is restricted to `demo:` session keys.
- A responsive static site in `dist/site`, with platform-aware release downloads, privacy and terms routes, service-worker offline support, a designed 404, metadata, security headers, sitemap, and installers.
- Original surreal editorial artwork generated for the product. Prompt and provenance are in `.factory/design.md` and `assets/src/`.
- A tag-triggered GitHub Actions matrix for unsigned AppImage/deb, MSI/EXE, and universal macOS builds. It also publishes `SHA256SUMS` and `latest.json`.

## How to run and verify

```sh
npm ci
npm test
npm run build:site
npm run build:app
npx tsc --noEmit
cargo fmt --check --manifest-path src-tauri/Cargo.toml
```

Verified on 28 August 2026:

- Vitest: 2 passed.
- Playwright: 14 passed, 2 intentional per-project skips.
- Every test referenced in `.factory/claims.json` passed in the demo sandbox.
- Axe: no serious or critical violations on the landing page.
- Mobile: no horizontal overflow at 390 × 844.
- Build: `dist/site/index.html` and `dist/app/index.html` generated.
- Initial site JavaScript: 24.4 KB raw / 8.9 KB gzip.
- CSS: 17.1 KB raw / 4.6 KB gzip.
- Hero WebP: 28 KB mobile / 56 KB desktop.
- Self-hosted fonts loaded on the first view: about 71 KB WOFF2.
- Lighthouse mobile: performance 99, accessibility 100, best practices 96, SEO 100.
- Lighthouse lab metrics: LCP 1.7 s, CLS 0.044, total blocking time 0 ms.
- `npm audit`: 0 vulnerabilities.
- Rust formatting and Cargo manifest metadata passed. Platform binaries are intentionally built by GitHub Actions, per the installer contract.
- GitHub Actions: Linux, Windows, macOS, and final manifest jobs passed.
- Release checksum: the published Debian package matched `SHA256SUMS`.
- Release manifest: valid JSON for v0.1.1 with seven platform assets.

Release workflow: <https://github.com/B-Divyesh/sf-local-live-captions/actions/runs/33193693227>

Release: <https://github.com/B-Divyesh/sf-local-live-captions/releases/tag/v0.1.1>

## Known gaps

- The 20-minute user pilot in the success measure has not happened. Caption retention and real lecture accuracy remain unmeasured.
- Linux system sound must appear as an input device. Most PipeWire and PulseAudio desktops expose a monitor source, but some users must enable it in sound settings.
- macOS and Windows builds can caption selectable inputs. Automatic system-loopback routing is not implemented in v0.1.
- The app holds no audio files. A crash during an active session loses transcript text that was not exported.

## Needs operator action

- Register `local-live-captions` and its $24 one-time Plus price in the Sociobot billing system. The code intentionally uses only the slug.
- Add `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` release secrets when signing certificates are available. v0.1 builds are unsigned and the site says so.
- Run the 20-minute English and German accessibility pilot with consenting users. Record model, hardware, word-error patterns, and whether captions stayed enabled.
