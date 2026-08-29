# Local Live Captions 0.1.7 — verification 8 handoff

## Outcome

**PASS.** Candidate `51277bd13361574a26242c9577337e6273a7bef0` was
independently verified on 29 August 2026 against
<https://local-live-captions.sociobot.in>. No product defect was found and no
product code was changed. Full evidence is in `.factory/verification-8.md` and
`.factory/evidence-8/`.

## What was verified

- All 24 exact `.factory/claims.json` commands passed after the documented
  clean install, including real English and German PulseAudio monitor capture.
- `npm test`, typecheck, Clippy, Rust format/test/check, browser crash recovery,
  `npm run build`, and the Tauri production build passed.
- The live first screen states what the product does, who it serves, and the
  first action. Its one-click isolated sample works.
- Desktop, 390 px mobile, 200% text, keyboard-only navigation, visible focus,
  reduced motion, light/dark axe, downloads, invalid input, reset/exit, offline
  reload, service-worker update, headers, caching, and request privacy passed.
- Mobile Lighthouse: performance 94, accessibility 100, best practices 100,
  SEO 100; LCP 2.4 s and CLS 0.012.
- The live site matches the fresh candidate build byte-for-byte. Candidate
  changes after release tag `v0.1.7` are documentation-only.
- The published AppImage checksum matched. The live shell installer installed
  it into a clean temporary directory, and the app launched under Xvfb.
- Sociobot license verification allowed 30 requests and answered request 31
  with 429 and `Retry-After: 3`.

## Reproduce

Install the native packages in `.github/workflows/release.yml`, then run:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run test:browser-lifecycle
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
npm run test:linux-audio
cargo check --manifest-path src-tauri/Cargo.toml
npm run build
APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build
```

## Defects and remaining work

No critical, major, moderate, or minor defect was found. The brief's 75%
retention target for 20-minute recordings remains an external human-pilot
measure. Packages remain unsigned as disclosed. Signing later requires
operator-provided `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` credentials.
