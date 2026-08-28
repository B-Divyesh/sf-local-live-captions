# Independent product verification 3 — FAIL

Verified 28 August 2026 (UTC) against candidate
`491726b573aabbc95079cc5e3e24f8d54e9e822c` and
<https://local-live-captions.sociobot.in>.

Product code was not changed. The only source-file mutation made by Cargo
(`src-tauri/Cargo.lock` package version `0.1.2` → `0.1.3`) was reverted before
handoff; it is itself recorded below as a finding.

## Verdict

**FAIL — do not accept this candidate.**

The deployed web site, demo, release assets, normal browser flows, packaging,
and listed claim tests are substantially working. It nevertheless fails the
factory claims contract: material promises visitors can rely on are absent from
`.factory/claims.json`, so they have no required observable regression test.
The core real-audio path also lacks an end-to-end acceptance test or independent
evidence with a real PipeWire/PulseAudio monitor and consented speech fixture.

## Mandatory first read — PASS

A cold 1440×900 visit states all required points in plain words:

- What: **“Caption any Linux audio locally.”**
- Who: **“For deaf and hard-of-hearing students when lectures, calls, or
  recordings have no captions.”**
- First action: **“Try it with sample data”**, with **“Opens a private sample.
  Nothing is saved.”**

The action opens `/demo` in one click. It immediately displays a realistic
astronomy transcript and a persistent **“Demo — sample data, nothing is saved”**
banner with Reset demo and Start for real controls.

## Release-blocking findings

### High — public claims are not all listed and testable

The exact ten claims in `.factory/claims.json` each have one tag and their
commands pass. That inventory does not cover all claim-like public statements,
contrary to the supplied claims contract. Unlisted examples include:

- “The app does not … save audio” and “It keeps transcript text only while the
  session is open” (landing), plus the same raw-audio/transcript-memory promise
  in the privacy page and README.
- “This site has no advertising trackers” (privacy page) and “There is no
  telemetry” (README).
- “The app checks the source before capture,” “The model stays on this
  computer,” and “The app now opens PipeWire or PulseAudio monitor sources”
  (landing/README).
- “The app does not join calls [or] name speakers,” and the current unsigned
  installer representation.

The claim test for `native-local-processing` inspects network-bearing Rust
source, but does not assert storage boundaries, the tracker claim, source
validation, or the other visitor-visible promises. The contract explicitly
requires an inventory entry and one sandbox-observable test for every public
claim; it says an unlisted claim fails review until it is added and tested (or
removed). This is release-blocking.

### High — core Linux system-audio job is not independently end-to-end proven

The implementation and a unit test show the intended direct PulseAudio-compatible
monitor path (`pactl … sources` parsing and `libpulse_simple` capture). The
packaged AppImage launches under Xvfb, and the sample overlay works. But this
verifier container has no live PipeWire/PulseAudio server (`pactl` returns
connection refused), no monitor source, and no consented speech fixture. It was
therefore not possible to demonstrate the actual required sequence: select
system-output monitor → download model → caption audible speech → stop/recover
→ export SRT. The current unit test is not a substitute for that end-to-end
acceptance evidence.

Add a reproducible Linux test fixture (or a recorded hardware/virtual-audio
acceptance run) that exercises the full job. Until then the core brief outcome
cannot be verified independently.

### Medium — committed Rust lockfile is stale

`src-tauri/Cargo.toml` and `tauri.conf.json` declare 0.1.3, but the committed
root `local-live-captions` package entry in `src-tauri/Cargo.lock` declares
0.1.2. Every Cargo command rewrites that one line. This leaves a clean checkout
dirty after normal test/build commands and weakens reproducibility. Regenerate
and commit the lockfile for 0.1.3.

## Claims gate — PASS as written

Started at the requested commit, ran `npm ci` (66 packages, 0 vulnerabilities),
then every exact command from `.factory/claims.json` against its demo entry
point where applicable:

| Claim | Result |
| --- | --- |
| `private-local` | PASS — 2 browser project executions |
| `offline-reload` | PASS — 2 browser project executions |
| `srt-export` | PASS — desktop execution passed; intentional mobile download skip |
| `demo-isolated` | PASS — 2 browser project executions |
| `free-and-paid` | PASS — live checkout test expects and observed a 303 to Dodo |
| `native-local-processing` | PASS — 1 Rust test |
| `capture-recovery` | PASS — 1 Rust test |
| `language-models` | PASS — 1 Rust test |
| `linux-system-audio` | PASS — 1 Rust test |
| `desktop-overlay` | PASS — 2 browser project executions |

The first native invocation correctly failed before execution because the base
container lacked GLib/GTK development packages. After installing the exact
Linux packages named in `.github/workflows/release.yml`, all native claim tests
passed. This is an environment prerequisite, not a product test failure.

## Local verification

| Command | Result |
| --- | --- |
| `npm ci` | PASS |
| `npx tsc --noEmit` | PASS |
| `npm test` from clean generated-artifact state | PASS — 8 Vitest; 21 Playwright passed, 3 intentional skips |
| `cargo fmt --check --manifest-path src-tauri/Cargo.toml` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS — 5 tests |
| `cargo check --manifest-path src-tauri/Cargo.toml` | PASS |
| `npm run build` | PASS — `dist/site` and `dist/app` |
| `APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build` | PASS — DEB, RPM, AppImage |

One full browser-suite attempt made after a 5.4 GiB native `target/` directory
had accumulated failed when Chromium SIGSEGV'd while creating a mobile context
(20 passed, 3 skipped). Moving only generated `target/` output aside restored
the clean-checkout condition; the next complete suite passed. Treat this as a
runner resource-stability warning, not evidence of a browser-product defect.

The fresh packages are `Local Live Captions_0.1.3_amd64.deb` (SHA-256
`fc774300d16a63cc182409ad2837d526dff8633556bbfb6f3f1fd292ae7f6fd9`), RPM
`5c4ff917a2d7e4e291a4de7ee0efe3956cb9fc4efd539d2360d27ebf6ee077ca`, and
AppImage `0a5519bcc0eae34b03a9145e48caa6b505319dc56bcbee680e11a82db07f91f7`.
The AppImage remained running under Xvfb for 12 seconds until the intentional
timeout; no app error was emitted.

## Live deployment, privacy, accessibility, and performance

- Local `dist/site` and the live site matched byte-for-byte for all 29 public
  files (deployment-only `staticwebapp.config.json` excluded). Candidate content
  matches release tag `v0.1.3`; the requested commit adds only handoff docs to
  tag `7e0f003`.
- `verify-url.sh` passed: HTTP 200 (972 ms), title, `lang=en`, exactly one h1,
  main landmark, no missing alt text or unlabeled buttons, and no console errors.
  Evidence: `.factory/verify-url-3/verify.json`.
- Axe on live dark `/demo` at 390 px returned no serious or critical findings.
  At 390 px the demo had no horizontal overflow; keyboard Space/Enter paused
  captions, Home/End set caption size to 20/42, and focus was visible.
- Direct `/demo` request logging recorded same-origin requests only. Landing
  additionally fetched the documented `api.github.com` release metadata; no
  analytics/tracker request, console error, or page error was observed.
- PWA: service worker controlled `/demo`; `registration.update()` completed
  with no waiting/installing worker. Offline reload retained the sample and
  pause/resume control.
- Response headers include HSTS, `nosniff`, strict-origin referrer policy,
  a restrictive permissions policy, and CSP limiting connections to self,
  GitHub API, and Sociobot API. HTML has 30-second revalidation; hashed assets
  are immutable for one year.
- Billing verification rate limit: 30 invalid verification requests from this
  client returned 200; request 31 returned **429** with `Retry-After: 3`.
  No sign-in is used, so Entra validation is not applicable.
- Initial site JS is 26,081 bytes raw / 9,382 bytes gzip; CSS is 17,709 / 4,668
  bytes gzip; mobile hero image is 25,040 bytes. All are within the supplied
  static budgets.
- Published v0.1.3 AppImage SHA-256 was independently streamed and matched
  `SHA256SUMS`: `1c355e35a3d36a0987a84076e4670863a9cae34777ec4a275ed273b946e67895`.
  `latest.json` parsed as v0.1.3 with seven assets.

## Evidence

- `evidence-verification-3-first-read.png`
- `evidence-verification-3-mobile.png`
- `verify-url-3/verify.json`, `screenshot-desktop.png`, and `screenshot-mobile.png`

## Required next steps

1. Inventory every visitor-visible claim in `.factory/claims.json`, with one
   observable sandbox test per claim, or remove the claim.
2. Add a reproducible real PipeWire/PulseAudio monitor-to-caption acceptance
   run with a consented speech fixture and SRT export/recovery verification.
3. Regenerate and commit `src-tauri/Cargo.lock` at version 0.1.3.
