# Verification handoff — Local Live Captions 0.1.4

## Outcome

**FAIL — candidate `56ec6a002df31b82550fe88cbf0f6aca1fe94686`
must not be accepted or released.**

Independent verification was performed 29 August 2026 (UTC) against
<https://local-live-captions.sociobot.in>. The full report is
`.factory/verification-6.md`; fresh browser, screenshot, and Lighthouse evidence
is under `.factory/qa/`. No product code was changed.

## Release blockers

1. At 1280 × 720, the cold landing screen states the job and audience but puts
   **Try it with sample data** below the fold (y=719.48, height=52.34). This
   fails the mandatory first-read gate.
2. `.factory/claims.json` omits visible promises/actions including TXT export,
   caption sizing while running, and supporter-license restore/verification.
   All listed claims pass, but the claims contract also rejects unlisted
   claims.

## Additional defects

- **Medium:** initial `<h1>` focus makes the first Tab on `/demo` jump to an
  off-screen Pause control, bypassing the skip link and header navigation.
- **Medium:** mobile **Start for real** is 86 × 24.8 CSS px, below the required
  44 px touch height.
- **Medium:** `.factory/copy-audit.md` is stale and still describes the old
  paid “Plus” model rather than the current free English/German plus optional
  supporter license copy.
- **Coverage gap:** no 20-minute pilot corpus, German speech acceptance
  fixture, or evidence for the researched 75% full-session success measure.

## What passed

- All 19 exact `.factory/claims.json` commands after `npm ci` and the native
  packages declared by the release workflow.
- `npx tsc --noEmit`, browser crash/retry, full Vitest/Playwright,
  `cargo fmt --check`, `cargo test`, `cargo check`, the real isolated
  PulseAudio/Whisper acceptance test, and `npm run build`.
- Desktop and 390 px product flows, 200% text layout, dark mode, reduced
  motion, invalid license recovery, demo reset/isolation, TXT/SRT export,
  service-worker update, and offline reload.
- Axe reported zero serious/critical issues on tested live pages and the
  packaged frontend. Normal pages produced no console/page errors.
- Fresh demo traffic was same-origin only. Landing contacted only the
  documented GitHub API; license verification contacted only Sociobot.
- Billing rate limit: requests 1–30 returned 200; request 31 returned 429 with
  `Retry-After: 2`; recovery returned 200 after cooldown.
- Live JS/CSS/service-worker hashes exactly match a candidate build. The
  `v0.1.4` release was built successfully from product-code parent `f603ae3`;
  candidate `56ec6a0` changes documentation/evidence only.
- Published macOS, Windows, and Linux assets exist. A fresh DEB matched
  `SHA256SUMS`, and live `install.sh` installed an AppImage that remained open
  under Xvfb until the intentional timeout.
- Mobile Lighthouse: performance 93, accessibility 100, best practices 100,
  SEO 100; LCP 2.30 s and CLS 0.063. JS/CSS/image budgets pass.

## Reproduce

```sh
npm ci
sudo apt-get install -y build-essential cmake file libclang-dev \
  libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf \
  libasound2-dev libpulse-dev pulseaudio pulseaudio-utils
npx tsc --noEmit
CI=1 npm run test:browser-lifecycle
CI=1 npm test
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
npm run test:linux-audio
cargo check --manifest-path src-tauri/Cargo.toml
npm run build
node .factory/qa/live-qa.mjs
```

There is no lint command in this repository. No sign-in or product-owned
backend exists, so Entra, backend concurrency, persistence, and health checks
are not applicable.
