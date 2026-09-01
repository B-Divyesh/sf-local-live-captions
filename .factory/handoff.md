# Local Live Captions — verification 15 handoff

## Outcome

**PASS.** Independent verification completed on 1 September 2026 for candidate
`6c0e4798a5d3a65c32ab100d49ee420a60d78d83` at
`https://local-live-captions.sociobot.in`.

No product code was changed. The full report is in `.factory/verification-15.md`
and raw QA evidence is in `.factory/verification-evidence-15/`.

## Verified

- All 26 entries in `.factory/claims.json` passed through the demo entry point.
- The cold first screen says what the product does, who it serves, and what to
  click first. `Try it with sample data` opens a complete isolated demo in one
  click on desktop and 390 px mobile.
- `npm test`, typecheck, lint/clippy, browser lifecycle recovery, Rust format,
  Rust test/check, the exact production web build, isolated PulseAudio/local
  Whisper acceptance suite, and exact Tauri production build passed.
- The built AppImage launched and remained open for its headless smoke window.
- Live home, demo, privacy, terms, and designed 404 routes passed semantic,
  keyboard, focus, touch-target, 200% text, reduced-motion, console, and axe
  checks. Serious/critical axe findings: 0.
- Demo pause/resume, caption sizing, TXT export, reset/recovery, service-worker
  update, and offline reload work. Demo traffic remains same-origin.
- No trackers, analytics, CDN fonts, audio upload, or unexpected third-party
  requests were observed. Security and cache headers match the documented
  network behavior.
- The public license verification allowance is 30 requests per client window;
  request 31 returned 429 with `Retry-After: 3`.
- Live mobile Lighthouse scored 95 performance, 100 accessibility, 100 best
  practices, and 100 SEO. LCP was 1.46 s and CLS was 0.012.
- The live JS/CSS exactly match the candidate production build. Build identity,
  tag `v0.1.13`, GitHub release target, `latest.json`, and published source all
  resolve to the candidate.
- Published Linux, macOS, and Windows assets plus `SHA256SUMS` are present. A
  downloaded DEB matched its checksum, and the live Linux installer verified
  and installed an executable binary into an isolated destination.

## Defects by severity

- Critical: none
- High: none
- Medium: none
- Low: none

## Reproduce

After installing the native packages documented in
`.github/workflows/release.yml` (including `file` and `libclang-dev`):

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run test:browser-lifecycle
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
npm run build
npm run test:linux-audio
APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build
npm run verify:release-source -- v0.1.13
npm run verify:published-release
```

Run every `test` value in `.factory/claims.json` individually to reproduce the
claim gate. The live screenshots, headers, independent browser report, URL
verifier output, and Lighthouse JSON are retained in the evidence directory.

## Remaining operator notes

- macOS and Windows artifacts were verified by source identity, manifest,
  presence, and checksums, but were not executed in this Linux worker.
- Packages remain unsigned until the operator provides `APPLE_CERTIFICATE` and
  `WINDOWS_CERT_PFX` to the release workflow.
- The 75% keep-enabled success measure requires the planned user pilot; the site
  does not claim that it has already been achieved.
