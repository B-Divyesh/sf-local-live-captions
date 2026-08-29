# Local Live Captions — independent verification 10 handoff

## Outcome

**FAIL — do not release candidate
`3d56e7f2b3492daccce2107532b6c41f4b661a75`.**

The prior stale-installer failure is repaired and all claims, source gates,
native acceptance tests, production builds, deployment identity checks,
published-package checks, accessibility audits, privacy checks, and performance
budgets pass. A new independent first-read test found one release blocker: at
1366 × 768 the audience sentence is clipped and **Try it with sample data** is
entirely below the initial viewport. This violates the work order's explicit
first-screen acceptance rule.

No product code was changed during verification. Full evidence and command
results are in `.factory/verification-10.md`.

## Required repair

Make the cold landing screen fit the complete audience sentence, sample action,
action explanation, and three facts at ordinary desktop sizes including
1366 × 768. The current compact rule stops at `max-height: 760px`, producing a
sharp failure at 768 px. Add a 1366 × 768 assertion to the first-screen E2E
coverage.

## Findings

- **Major:** first-read action is below the fold at 1366 × 768. Audience bottom
  792.19 px; action y=820.19–872.53; facts y=908.53–1036.56.
- **Minor:** Android is detected as Linux and receives an AppImage link.
- Critical: none.
- Moderate: none.

Evidence: `.factory/evidence-verification-10-first-read-1366x768-fail.png`.

## What passed

- All 26 `.factory/claims.json` entries after the documented clean install and
  system prerequisites.
- `npm test`, typecheck, lint/Clippy, crash recovery, Rust format/test/check,
  real Linux audio acceptance, `npm run build`, and the exact Tauri release
  build.
- Real isolated PulseAudio monitor capture with local English and German
  Whisper transcription, SRT output, restart, and no raw-audio file.
- Live demo pause/resume, 20/42 px boundaries, TXT/SRT downloads, sandbox reset,
  invalid-input recovery, offline reload, and service-worker activation.
- Axe on all public routes and the 404 in both themes: zero violations. Keyboard
  focus, range controls, 44 px mobile targets, reduced motion, and 200% text
  resize passed.
- Demo request log was same-origin only. Security/cache headers passed. The
  license endpoint allowed 30 requests and returned 429 plus `Retry-After: 3`
  on request 31.
- All 30 candidate site files byte-match live. Tag/release/manifest/site all
  identify the candidate. GitHub Actions release run `33273539176` succeeded.
- Published AppImage checksum matched `SHA256SUMS`; the live one-line installer
  installed it into an isolated directory and the app launched. Linux, Windows,
  and macOS release assets are present.
- Mobile Lighthouse: 96 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 2.2 s, TBT 170 ms, CLS 0.012.

## Reproduce

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run test:browser-lifecycle
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
npm run test:linux-audio
npm run build
APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build
```

Native checks require the Linux packages listed in
`.github/workflows/release.yml`. The first pre-install claim attempt in the
untouched clone could not load uninstalled test/native dependencies; every
entry passed after that documented setup.

## Evidence limits

The 20-minute, 75% human retention success measure still needs a user pilot.
Only the Linux package could be launched here; Windows/macOS were validated by
the successful release workflow, asset manifest, and checksums.
