# Local Live Captions — verification 13 handoff

## Outcome: FAIL

Candidate `242656aeed034e3600ba3b98eafe47ea34249033` was independently tested
against <https://local-live-captions.sociobot.in> on 30 August 2026. Do not
release it. Full evidence is in [verification-13.md](verification-13.md).

## Release blockers

1. **Critical — no candidate-matched desktop download.** The deployed static
   site and its files match candidate `242656ae…`, but the `v0.1.11` tag,
   GitHub release, and `latest.json` point to `6b919f6a…`. The landing page says
   “Downloads are being published,” the Linux installer exits 1, and both
   `verify:release-source` and `verify:published-release` fail.
2. **High — intermittent checkout failure.** The advertised Sociobot checkout
   returned HTTP 500 three times and caused the exact `free-and-paid` manifest
   claim to fail on its initial attempt and retry. It later recovered to 303,
   so this is an intermittent production failure rather than a permanent
   configuration failure.

## What passed

- First-read gate and one-click isolated sample on desktop and 390 px mobile.
- All native claim commands after installing the repository's documented OS
  dependencies, including four manifest invocations of the real Linux audio
  acceptance suite.
- Full unit/browser suite, typecheck, lint, Rust format/test/check, site/app
  build, native DEB/RPM/AppImage build, and 15-second AppImage smoke.
- Demo pause/recovery, 20–42 px sizing, TXT/SRT export, reset isolation,
  invalid-input recovery, service-worker update, and offline reload.
- Axe serious/critical scans on all routes plus light/dark mobile; keyboard,
  focus, touch targets, 200% text, reduced motion, semantics, and 404 behavior.
- Privacy request inspection and security/cache headers. License verification
  allows 30 requests; request 31 returns 429 with `Retry-After: 4`.
- Lighthouse mobile: performance 97, accessibility 100, best practices 100,
  SEO 100; LCP 1.2 s, CLS 0.012, 111 KiB transfer.

## How to reproduce

```sh
npm ci
CI=1 npm test
npm run typecheck
npm run lint
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
npm run test:linux-audio
npm run build
APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build
npm run verify:release-source -- v0.1.11
npm run verify:published-release
npm test -- --grep @claim:free-and-paid
```

Install the Linux/Tauri/PulseAudio packages listed in the release workflow
before native checks. Detailed evidence and screenshots are in
`.factory/verification-evidence-13/`.

## Required operator action

- Create a new version/tag and publish all platform artifacts from candidate
  `242656ae…`; deploy the same identity. Do not retag `v0.1.11`.
- Investigate the checkout 500s and demonstrate stable 303 redirects.
- Rerun every claim and release audit. Signing still needs operator-owned
  `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets.

No product code was changed.
