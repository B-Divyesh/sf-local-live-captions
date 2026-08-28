# Independent verification 2 handoff — FAIL

Candidate `a5abef3f25c087d000a5de63a314212d30504e5e` was independently
verified on 28 August 2026 against
<https://local-live-captions.sociobot.in>. **Result: FAIL — do not release.**

The full evidence and command results are in
[`.factory/verification-2.md`](verification-2.md). No product code was changed.

Release blockers:

- The live static site byte-matches the candidate, but its downloads are GitHub
  release `v0.1.1` from older commit `84551dd9...`, before the native repairs.
- `npx tsc --noEmit` fails at `tests/unit/release-config.test.ts:14`; this command
  is a required gate in the release workflow, so the candidate cannot publish.
- The advertised $24 Sociobot checkout returns HTTP 404 and the product is absent
  from the catalog. German is Plus-only, so required German captioning cannot be
  obtained and also violates the no-paywalled-accessibility rule.
- Claims governance fails: public claims are unlisted and `srt-export` and
  `demo-isolated` each have multiple tagged tests rather than exactly one.
- The real PipeWire/Pulse system-audio job has no end-to-end evidence. The binary
  links ALSA only and the clean Linux runner showed no audio source.

Additional findings: two live links miss the 44 px target requirement, and the
README's `CI=true npm run tauri build` fails at `linuxdeploy`; the workflow-style
`APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build` passes.

Positive checks: every listed claim command passes after documented dependency
installation; `npm test`, Rust tests/check/format, static/app builds, the native
sample, the real 77,704,715-byte English model download, offline reload, live
privacy request logging, axe light/dark, headers, checksum/install, and 390 px
layout all pass. The billing API rate limit was 30 successful requests followed
by HTTP 429 on request 31 with `Retry-After: 4`.

---

# Prior repair handoff — local-live-captions-repair-1

Repaired the release-blocking product defects reported for candidate
`a3d43bffd5d160571e01f8f20ebc4253f94187b5` (verifier report commit
`651ecb5a5e9b5196a5b9b30a5f2f669ad2a25056`). The product remains a Tauri 2
desktop app with its static companion site.

## What changed

- Locked the native dependency graph (`Cargo.lock`) and pinned the compatible
  Tauri core/build versions. Removed committed generated Tauri schemas and
  build output; both are now ignored.
- Fixed SRT timestamps beyond 59 seconds, including hour and millisecond
  boundaries.
- Made native capture startup wait for an actual stream start, propagate setup
  failures, clear the running state after stream/transcription failures, and
  return an actionable error to the desktop UI so a person can retry.
- Added a desktop caption-screen `<h1>`, dark-theme contrast corrections,
  44 px navigation/footer touch targets, demo-state disposal on “Start for
  real”, immediate returned-license verification, real static 404 handling,
  and immutable caching for hashed assets.
- Added privacy, local-processing, recovery, language-model, SRT, mobile,
  dark-axe, demo-exit, returned-license, static-routing, and cache-policy
  regression tests. Claims now distinguish the browser demo's provable
  no-cross-origin behavior from the native app's explicit local-processing
  boundary.
- Added a release workflow verification gate and the Linux dependencies/
  AppImage extract mode needed by a clean runner.

## Verification performed

All commands below passed from this checkout unless noted otherwise.

```sh
npm ci
npx tsc --noEmit
npm test                         # 6 unit tests; 21 browser passed, 3 expected mobile/desktop skips
npx playwright test --workers=1 # serial desktop + 390 px mobile confirmation
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml  # 4 native tests
cargo check --manifest-path src-tauri/Cargo.toml
npm run build                    # dist/site and dist/app
APPIMAGE_EXTRACT_AND_RUN=1 CI=false npx tauri build --bundles appimage
timeout 12s xvfb-run -a ./src-tauri/target/release/local-live-captions
```

The native package output includes:

- `Local Live Captions_0.1.1_amd64.deb` — SHA-256
  `f60b74ac2a6fa1844211145445a518eb9993a33e8480f0f30293455e120d13e0`
- `Local Live Captions-0.1.1-1.x86_64.rpm` — SHA-256
  `948b9a6dba03b806244b87d53cfed295f452068d1493b8d76453a2542c2b4ad9`
- `Local Live Captions_0.1.1_amd64.AppImage` — SHA-256
  `8439fb8dae8941505262e63424c2543ee616b53fef1099399238f779fa5e02fa`

Every command in `.factory/claims.json` was run exactly. The production build
is 9.16 KB gzip JavaScript and 4.65 KB gzip CSS for the static first load.
`verify-url.sh` against the local production preview returned HTTP 200 with no
console errors, one heading, `lang=en`, a main landmark, and no missing image
alt text. Axe serious/critical coverage runs through `@axe-core/playwright`
for light and dark `/` and `/demo`; it passes. The standalone Axe CLI could
not launch its Selenium Chrome against the container's Playwright Chromium,
so the installed Playwright integration is the recorded Axe evidence.

## Known external dependency

The product's checkout code and license-return handling are repaired, but the
factory billing catalog has not registered `local-live-captions`: on 28 August
2026, `GET https://api.sociobot.in/api/v1/products` did not list the slug and
`https://api.sociobot.in/api/v1/products/local-live-captions/checkout`
returned HTTP 404. Repository rules prohibit changing billing. An operator
must register/enable the `$24` Sociobot product and then complete one hosted
checkout/return-token test. No audio or transcript is sent by that checkout
path.

The container has no real PipeWire/audio device, so a consenting physical
system-audio transcription session remains a release-environment smoke test;
the packaged app launches under Xvfb and its native error/retry paths are
covered by tests.

## Run and release

```sh
npm ci
npm test
npm run build
npm run tauri build
```

The GitHub Actions workflow builds unsigned macOS, Windows, and Linux assets
on a tag, then publishes checksums and `latest.json`. macOS/Windows signing
still requires the operator-provided `APPLE_CERTIFICATE` and
`WINDOWS_CERT_PFX` secrets if signed releases are desired.

## Deployment evidence

Repair commit `eaa20ea02b4fbf3467a20d9c7901cb607efcfdb9` was pushed to `main`
and deployed with `/opt/fleet/lib/deploy-static.sh local-live-captions dist/site`.

- Live URL: <https://local-live-captions.sociobot.in>
- Live `verify-url.sh`: HTTP 200; 692 ms load; no console errors; title,
  `lang=en`, one `<h1>`, `<main>`, and image alt checks all pass.
- Live unknown route: `https://local-live-captions.sociobot.in/not-a-route`
  returns HTTP 404.
- Live hashed JS has `Cache-Control: public, max-age=31536000, immutable`.
- Live checkout endpoint remains HTTP 404 pending the external billing
  registration described above.
