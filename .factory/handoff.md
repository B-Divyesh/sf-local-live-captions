# Local Live Captions 0.1.7 — polish round 1

## Outcome

Repair source commits `6e5c0ddabddc9375a6713b79da8425ef12c76123`,
`17d47c8ee4494f6cd3f1c3ecd643d1f6557c64fc`, and
`8deb0c33b78c40164717a60a5b77d49c46c3075f` resolve all 17 findings in
`.factory/review-1.md`. The static site was deployed from its `dist/site`
build to <https://local-live-captions.sociobot.in> and cold-checked on
29 August 2026. Finding-by-finding closure is in `.factory/polish-1.md`.

## What changed

- Rewrote first-screen, section, legal, 404, checkout, demo, and README copy
  in plain language. The hero no longer promises unsupported “any” audio.
- Added `/?demo=1` as a direct isolated sample entry. It shows the persistent
  banner, Reset demo, and Start for real controls, and uses only `demo:`
  session storage.
- Added an original German speech fixture and a real isolated PulseAudio
  monitor → multilingual Whisper base-model → German-text claim test.
- Added visible desktop setup controls for deleting a downloaded model and
  removing the local supporter-license keys.
- Added route metadata updates, accurate checkout disclosure, real 404 copy,
  and version alignment at 0.1.7.
- Stabilized the real German fixture assertion by requiring three of a broad
  set of recognized German markers. Switched the release lookup to GitHub's
  200-on-empty releases-list endpoint, preventing a no-release 404 console
  error while keeping the same one-hour cache and fallback state.
- Updated the 24-entry claims inventory, demo documentation, catalog sentence,
  copy audit, and fixture provenance.

## Verify locally

Install the release-workflow native prerequisites on Linux, then run:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
npm run test:linux-audio
```

Every command listed in `.factory/claims.json` was invoked individually after
`npm ci`; the final real-audio command passed both the English monitor/restart
test and the German monitor test. The inventory has **24 claims**, not 22 or
23. The Linux run uses cached/downloaded 77.11 MB `tiny.en` and 147.37 MB
multilingual `base` models. Container D-Bus messages are expected while its
isolated PulseAudio server runs.

Results from the final local build:

- `npm test`: 15 unit tests passed; Playwright ran 19 passed / 3 expected
  project skips in each desktop and mobile process.
- `npm run lint`, TypeScript, Rust formatting, and `cargo test`: passed. Rust
  ran 11 passed with two externally invoked audio tests ignored in the normal
  unit run.
- `npm run build`: produced `dist/site` and `dist/app`. Final site JavaScript
  is 27.97 KB raw / 9.47 KB gzip; CSS is 18.25 KB raw / 4.80 KB gzip.
- Local URL verifier passed title, `lang`, one h1, main landmark, image alt,
  button names, and console checks. Evidence:
  `.factory/verify-url-polish-1/verify.json`.

## Live deployment checks

- `deploy-static.sh local-live-captions dist/site` succeeded for deployment
  `aa5fcd78-2728-4bc4-984f-db7b425d837a`. The deployed Static Web App is
  `sf-local-live-captions` in Central US.
- `/`, `/?demo=1`, `/privacy`, and `/terms` returned HTTP 200. An unknown URL
  returned HTTP 404 with “Page not found.”
- A fresh cold `/?demo=1` had no cross-origin requests or console errors,
  showed the demo banner, Reset demo, and Start for real controls, and had
  zero mobile overflow at 390 px. Landing made only its documented GitHub
  release-metadata request and had no console errors.
- Route titles and headings were checked live for home, privacy, terms, and
  404. Axe found zero serious or critical violations on the demo and each
  checked route. The expected failed-resource console message occurred only
  while deliberately loading the unknown route.
- Live URL-verifier evidence:
  `.factory/verify-url-polish-1-live-017/verify.json`.
  Screenshots: `.factory/qa/polish-1-live-first-read.png`,
  `.factory/qa/polish-1-live-demo-desktop.png`, and
  `.factory/qa/polish-1-live-demo-mobile.png`.
- GitHub Actions run
  [`33259117240`](https://github.com/B-Divyesh/sf-local-live-captions/actions/runs/33259117240)
  passed its fresh Linux verifier, macOS universal build, Windows build,
  Linux build, and manifest job. The published
  [`v0.1.7` release](https://github.com/B-Divyesh/sf-local-live-captions/releases/tag/v0.1.7)
  contains `.dmg`, `.msi`, `.exe`, `.deb`, `.rpm`, AppImage,
  `SHA256SUMS`, and `latest.json`.
- `latest.json` reported `v0.1.7` with seven installer assets. Downloading
  `Local.Live.Captions_0.1.7_amd64.deb` and checking it against
  `SHA256SUMS` produced
  `78b80ee0d5df3f28aa6dafac05b25471ead387886e1ec21e7e9a02b2434c4cef`.
  A fresh Linux browser resolved the live download button to the v0.1.7
  AppImage and reported no console errors.

## Known limits

There are no unresolved review findings. Caption accuracy still depends on the
chosen model and audio quality; the product makes no accuracy guarantee. The
brief’s 75% 20-minute human pilot result requires an external participant
study, so it is not represented as a shipped claim. Desktop builds remain
unsigned and the site discloses this; signing would require operator-provided
`APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` before changing the release workflow.
