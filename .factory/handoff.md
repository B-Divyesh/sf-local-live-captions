# Local Live Captions — polish round 3 handoff

## Outcome

**PASS.** Every finding in reviews 1, 2, and 3 is closed. Release
[`v0.1.16`](https://github.com/B-Divyesh/sf-local-live-captions/releases/tag/v0.1.16)
was built from `0ecd456533c7eaac81923580e7875c381e1b50ba`, deployed to
<https://local-live-captions.sociobot.in>, and cold-checked after deployment.

## What changed

- Closed review-3 blocker F-3-1. `scripts/run-native-claim.sh` now declares
  GLib alongside the Tauri, ALSA, and PulseAudio prerequisites in both its
  direct Linux path and repository-owned Docker path. The image uses Rust
  `1.98.0`, matching the locked dependency graph and GitHub runner.
- Kept the previously repaired first-screen copy, one-click isolated
  `?demo=1`/`/demo` sample, demo banner/reset/start-for-real behavior, real
  route titles and 404, legal links, keyboard focus, mobile layout, and the
  Listening Room visual system.
- Completed the 27-entry `.factory/claims.json` inventory and updated the
  catalog sentence to: “Caption Linux calls, lectures, and recordings on your
  device.”
- Added a live regression verifier that distinguishes the intentional document
  404 from real console failures and proves reset/start-for-real isolation,
  direct demo privacy, exported sample text, focus restoration, and mobile
  overflow.

## Verification

### Clean clone claims

A new clone at `0ecd456` ran `npm ci` and every exact command listed in
`.factory/claims.json`: **27/27 passed**. The complete run is at
`/tmp/local-live-captions-polish3-final2-dRqZKL/all-claims.log` and ends with
`===== ALL CLAIMS PASSED =====`.

This includes `@claim:offline-reload`, privacy/request-boundary, TXT/SRT
exports, demo isolation, desktop overlay, language/model/storage, consent,
release-artifact, and every native audio/model claim. The native suite built
and exercised its actual Linux prerequisites rather than a mock.

### Release and local gates

- `npm test` — passed (26 unit tests; browser suite passed with 24 tests and
  4 intentional platform skips).
- `npm run typecheck`, `npm run lint`, and `npm run build` — passed on
  `0.1.16`.
- `RELEASE_TAG=v0.1.16 npm run build:release-site` — passed; site identity is
  `v0.1.16 → 0ecd456533c7eaac81923580e7875c381e1b50ba`.
- GitHub release workflow
  [33563915326](https://github.com/B-Divyesh/sf-local-live-captions/actions/runs/33563915326)
  — passed source, TypeScript, lint, browser lifecycle, full browser suite,
  Rust tests, the Docker `test:linux-audio` native suite, and macOS/Windows/
  Linux packaging.
- `npm run verify:published-release -- --expected-tag v0.1.16 --expected-commit 0ecd456533c7eaac81923580e7875c381e1b50ba`
  — passed. The release has Linux AppImage/DEB/RPM, macOS DMG/app archive,
  Windows MSI/EXE, `SHA256SUMS`, and `latest.json`.

### Live production checks

- `/opt/fleet/lib/verify-url.sh https://local-live-captions.sociobot.in .factory/evidence-polish-3/verify-live`
  — HTTP 200, no console errors, title/lang/one h1/main/image alternatives all
  valid; cold load 916 ms.
- `node scripts/verify-live-polish-3.mjs https://local-live-captions.sociobot.in .factory/evidence-polish-3`
  — `/`, `/demo`, `/privacy`, `/terms` return 200; unknown route returns a
  real 404; all five have one h1/main, correct titles, zero serious/critical
  Axe findings, and no application console errors. Direct demo has four sample
  captions, no external requests, a four-line TXT export, no 200% overflow,
  and reset/start-for-real preserve `real:` while clearing `demo:` state.
  Browser Back restores focus to the Privacy h1.
- Lighthouse mobile (`.factory/evidence-polish-3/lighthouse-mobile.json`) —
  Performance **100**, Accessibility **100**, FCP **1.21 s**, LCP **1.36 s**,
  CLS **0.012**.

Evidence includes first-screen desktop/mobile screenshots, direct-demo
screenshot, route JSON, URL verifier output, and Lighthouse JSON under
`.factory/evidence-polish-3/`. The finding-to-change-to-evidence ledger is
in `.factory/polish-3.md`.

## Run and deploy

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
RELEASE_TAG=v0.1.16 npm run build:release-site
npm run verify:published-release -- --expected-tag v0.1.16 --expected-commit 0ecd456533c7eaac81923580e7875c381e1b50ba
/opt/fleet/lib/deploy-static.sh local-live-captions dist/site
```

For the full claim inventory, execute every `test` command in
`.factory/claims.json` from a new clone; native commands self-provision their
test environment or use the pinned Docker image.

## Needs operator action

No action is required for this release. Desktop installers are deliberately
unsigned and the download UI states that plainly. For optional future signing,
an operator must provide `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` and wire
them into the release workflow; no signing material is stored in this
repository.
