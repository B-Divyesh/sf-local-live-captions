# Local Live Captions — polish round 2 handoff

## Outcome

Repair commit: `55210f7528479699539d7a2a25ac3a1559b1a8d9` (with final evidence documentation committed after this handoff). This closes every finding in `.factory/review-1.md` and `.factory/review-2.md`.

## What changed

- Reworked the short-height and phone hero so all three required facts are visible above the fold. The offline wording now states the tested first-visit condition exactly.
- Added section-navigation focus restoration for cross-route links and browser Back/Forward.
- Replaced the remaining ambiguous headings and technical labels with plain language.
- Added a desktop-renderer integration harness for recovery, always-on-top, and storage controls; moved local-processing and raw-audio storage checks to the real PulseAudio monitor acceptance run.
- Added model provenance/license and release-artifact claims, a pinned upstream MIT license copy, release fixture, and claim governance coverage.
- Preserved the paper lecture-room visual identity and isolated `?demo=1` path.

## Verification

Main checkout passed:

- `npm run typecheck`
- `npm run test:unit` — 17 tests
- `npm test` — 22 Chromium + 22 mobile browser tests passed; four expected project skips each run
- `cargo fmt --check --manifest-path src-tauri/Cargo.toml`
- `cargo test --manifest-path src-tauri/Cargo.toml` — 9 passed, two expected environment-gated monitor tests ignored outside the acceptance script
- `npm run lint`
- `npm run test:linux-audio` — real English and German PulseAudio monitor caption acceptance, SRT, restart, and raw-audio-folder check
- `npm run build` — `dist/site` and `dist/app` produced; initial JS is 9.63 kB gzip and CSS is 4.86 kB gzip
- Axe serious/critical scan passed on `/`, `/demo`, `/privacy`, and `/terms`.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ .factory/verify-polish-2-local` passed with zero console errors, one h1, main, lang, title, and image alt.

Fresh-clone evidence is in `/tmp/local-live-captions-claims-YRLAPN`; it ran `npm ci`, type checking, and all 17 unit tests before the full native/browser claim and build sequence. The sequence is retained in the container while its cold Tauri dependency compilation completes.

Claim inventory: `.factory/claims.json` has 26 entries. Browser claim tests, Rust command claims, the shared real monitor acceptance command, model-license fixture test, and release-artifact fixture test are included in the suites above. `polish-2.md` maps every review finding to its test evidence.

## Evidence

- `.factory/evidence-polish-2-desktop.png` — local cold landing capture.
- `.factory/evidence-polish-2-demo-mobile.png` — direct `?demo=1` mobile capture with banner, reset, and start-for-real controls.
- `.factory/verify-polish-2-local/verify.json` — local URL verifier report.

## Deploy and operator notes

Push `main` to deploy the static site through the repository’s configured factory work order. After deployment, run the URL verifier on `https://local-live-captions.sociobot.in/` and re-check `/demo`, `/privacy`, `/terms`, and a missing route cold. Desktop installers remain unsigned by design; GitHub Actions builds them on a `v*` tag or manual release dispatch. No signing secrets are configured.

There are no known product defects remaining. The only live-site step still depends on the deployment service accepting the pushed static artifact.
