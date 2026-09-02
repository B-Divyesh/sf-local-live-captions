# Local Live Captions — polish round 4 handoff

## Outcome

Release `v0.1.19` closes every finding in adversarial reviews 1–4. The repair
keeps the Listening Room visual system and the Tauri 2 desktop artifact with
its static download site.

The cumulative mapping is in `.factory/polish-4.md`. The released source is
`724bcff0ae029269bb502b31ec88ed22c0f3cd2c`.

## What changed

- Real PulseAudio monitor capture now runs inside isolated home, app-data,
  XDG, temporary, and working roots under a full path/network `strace`. The
  claim fails on any successful write-capable open or filesystem mutation and
  on any before/after snapshot difference.
- The two legal email links have 44 px hit areas, backed by a mobile test of
  every legal-page interactive target.
- The unsupported supporter-funding sentence was removed. The page now says
  that the optional $24 license changes no caption feature.
- The application MIT statement and native microphone enumeration are now
  registered claims with focused tests.
- `.factory/claims.json` contains 29 claims, each with one exact runnable
  command. Claim governance recognizes both new IDs.
- The catalog description is the 78-character verb-first sentence: “Caption
  Linux calls, lectures, and recordings locally without uploading audio.”
- Package, Cargo, Tauri, release fixtures, and service-worker cache identity
  moved to `0.1.19`.

## Clean-clone verification

At `/tmp/local-live-captions-polish4-clean.sfD5A9/repo`, from commit
`724bcff0ae029269bb502b31ec88ed22c0f3cd2c`:

- `npm ci` — passed.
- Every one of the 29 exact `.factory/claims.json` commands — passed.
- `npm test` — 33 unit tests passed; 24 desktop browser tests passed with six
  intentional project skips; 27 mobile browser tests passed with three
  intentional project skips.
- `npm run typecheck` — passed.
- `npm run lint` — passed with Clippy warnings denied.
- `npm run build` — passed and produced `dist/site` plus `dist/app`.
- `npm run test:browser-lifecycle` — Chromium was deliberately terminated on
  the first attempt and the clean retry passed.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check` — passed.
- `cargo test --manifest-path src-tauri/Cargo.toml` — 11 passed and the two
  real-audio tests were intentionally ignored outside their acceptance runner.
- `cargo check --manifest-path src-tauri/Cargo.toml` — passed.

The privacy acceptance output states: “zero successful path-based write opens
or filesystem mutations by capture or its child process; isolated HOME,
app-data, XDG, temporary, and working directories are unchanged.” The real
English transcription and four independent German transcription runs passed.

The static budget is 9.90 kB JavaScript gzip and 5.04 kB CSS gzip. There are
no third-party runtime fonts or scripts.

## Browser and accessibility evidence

Local production-build evidence is stored in
`.factory/evidence-polish-4/local/`:

- `live-first-read-390.png` and `live-first-read-desktop.png` show the complete
  first screen without scrolling.
- `live-demo-390.png` shows direct isolated demo entry and its persistent
  banner.
- `live-legal-mobile.png` shows the repaired legal link targets.
- `live-routes.json` records route titles and structure, zero serious/critical
  Axe findings, no console errors, history focus restoration, demo isolation,
  offline reload, 200% reflow, and all legal targets at least 44 px.

## Release and deployment

Release workflow
<https://github.com/B-Divyesh/sf-local-live-captions/actions/runs/33594819376>
passed every job and published seven packages for Linux, macOS, and Windows,
plus `SHA256SUMS` and `latest.json`.

`npm run verify:published-release` confirms that the public release, manifest,
checksums, and deployed site all identify `v0.1.19` at
`724bcff0ae029269bb502b31ec88ed22c0f3cd2c`. A newly downloaded DEB matched
its published SHA-256 value. `RELEASE_TAG=v0.1.19 npm run deploy:release-site`
completed successfully.

The deployed product is <https://local-live-captions.sociobot.in>. A cold
post-deploy pass found:

- HTTP 200 for `/`, `/demo`, `/privacy`, and `/terms`; the designed unknown
  route returned HTTP 404.
- Correct route titles, `lang="en"`, one `h1`, one `main`, no console errors,
  and zero serious or critical Axe findings on all five routes.
- Direct `/?demo=1`, four bundled captions, persistent banner, reset, exit,
  TXT export, real/demo namespace isolation, and offline reload all passed.
- Every 390 px first-screen item remained in view. At 200% text size, the demo
  had zero horizontal overflow.
- The Privacy and Terms email targets measured 137 × 44 px and 143 × 44 px.
  Every legal-page interactive target was at least 44 × 44 px.
- History focus moved to the destination heading and returned to the Privacy
  heading on Back.
- `/opt/fleet/lib/verify-url.sh` loaded the home page in 883 ms with no
  structural, alternative-text, button-label, or console failure.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100, LCP 1.072 s, CLS 0.0118, total blocking time 50 ms. The first
  Chromium tab exited; a clean retry passed.

Live screenshots, route JSON, verifier output, and Lighthouse JSON are under
`.factory/evidence-polish-4/live/`.

## Run it

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:native-claim -- no-audio-storage
```

Run the desktop application with `npm run tauri dev`. Run the static site with
`npm run dev:site`.

## Known gaps and operator action

No review finding remains. Release packages are intentionally unsigned, and
the website says so before download. Signing a future macOS release requires
`APPLE_CERTIFICATE`; signing a future Windows release requires
`WINDOWS_CERT_PFX` and the corresponding certificate passwords in GitHub
Actions. These optional credentials were not present in this work order.
