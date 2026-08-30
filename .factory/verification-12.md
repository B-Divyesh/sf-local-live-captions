# Independent verification 12 — FAIL

Verified 30 August 2026 against the requested candidate
`fcb90cf990981ea8987341b4621dc1f8bbff974c` and
<https://local-live-captions.sociobot.in>.

## Verdict

**FAIL. Do not release the requested candidate.**

Two independent release blockers were found:

1. **Critical — the requested candidate does not exist in the supplied repository.**
   `git fetch origin fcb90cf990981ea8987341b4621dc1f8bbff974c`
   returns `upload-pack: not our ref`. Local `HEAD`, `origin/main`, the `v0.1.10`
   tag, the live `release-identity.json`, the public release target, and the live
   footer all identify
   `fcb90c7a2e659e930e7ec8fe519eb55118494e8c`. The live deployment therefore
   cannot match the requested candidate. Evidence:
   `verification-evidence-12/candidate-live-identity.log`.
2. **High — a required German caption claim test is nondeterministic and failed.**
   After installing the repository's documented Linux/Tauri/PulseAudio
   prerequisites, the exact manifest command `npm run test:linux-audio` failed
   during the `german-caption-end-to-end` claim invocation. Whisper returned
   intelligible German — `das ist ein sehr wichtiges, ums leben zu machen` — but
   the test rejected it as `unexpected German caption output`. The same shared
   command passed in the other three claim invocations, demonstrating a
   one-in-four failure in this verification. Any failed manifest claim blocks
   acceptance. Evidence:
   `verification-evidence-12/claim-german-caption-end-to-end-with-prereqs.log`.

No product code was modified.

## Mandatory first checks

### Claims gate

`.factory/claims.json` exists and contains 26 entries. Every listed command was
run independently from the clean checkout. The untouched worker initially
failed all ten native invocations because PulseAudio and Tauri development
packages were absent. I then installed the exact Ubuntu package set from
`.github/workflows/release.yml` and reran every affected native command to
distinguish environment setup from product behavior.

With documented prerequisites installed, 25 claim invocations passed and one
failed:

| Claim | Result | Evidence |
| --- | --- | --- |
| `private-local` | PASS | Demo flow used only its own origin. |
| `offline-reload` | PASS | Service-worker-controlled demo reloaded and remained operable offline. |
| `srt-export` | PASS | Valid padded timestamps; live export had four cues. |
| `txt-export` | PASS | Live export was `sample-transcript.txt` with four lines. |
| `live-caption-sizing` | PASS | Running demo reached 42 px without stopping. |
| `demo-isolated` | PASS | Reset removed demo state and preserved real state. |
| `free-and-paid` | PASS | Free model copy, $24 price, and live Sociobot/Dodo redirect verified. |
| `supporter-license-restore` | PASS | Recorded verify response, request, and storage behavior passed. |
| `native-local-processing` | PASS after prerequisites | Real isolated PulseAudio monitor and local Whisper path passed. |
| `capture-recovery` | PASS | Visible error followed by successful retry. |
| `language-models` | PASS after prerequisites | Exact English/German catalog passed. |
| `german-caption-end-to-end` | **FAIL** | Exact real-audio command rejected recognizable German output. |
| `linux-system-audio` | PASS after prerequisites | Monitor parsing passed. |
| `desktop-overlay` | PASS | Sample and always-on-top bridge behavior passed. |
| `no-audio-storage` | PASS after prerequisites | Real capture left model storage unchanged. |
| `session-transcript` | PASS after prerequisites | New in-memory session was empty. |
| `no-telemetry-trackers` | PASS | Privacy route requests were same-origin only. |
| `consent-before-capture` | PASS after prerequisites | Consent guard preceded capture. |
| `local-model-storage` | PASS after prerequisites | Model resolved below local app data. |
| `storage-controls` | PASS | Model-delete bridge and license removal passed. |
| `source-start-validation` | PASS after prerequisites | Missing monitor was rejected. |
| `call-speaker-boundaries` | PASS | No call join or speaker identification integration. |
| `unsigned-installers` | PASS | Release workflow contains no signing path. |
| `linux-monitor-end-to-end` | PASS after prerequisites | Capture, transcription, SRT, stop, and restart passed. |
| `model-provenance-license` | PASS | Source, revision, license, and checksum passed. |
| `release-artifacts` | PASS | Platform and integrity fixture passed. |

The clean-worker and prerequisite-complete logs are both retained under
`verification-evidence-12/claim-*.log`.

### Cold first-read

**PASS on desktop and 390 × 844 mobile.** The first screen answers all three
questions in plain words:

- What: “Caption Linux calls and recordings locally.”
- For whom: deaf and hard-of-hearing students whose lectures, calls, or
  recordings have no captions.
- First click: “Try it with sample data,” followed by “Opens a private sample.
  Nothing is saved.”

The action opens the working sample in one click. At 390 × 844, the heading,
audience sentence, action, explanation, and all three privacy/offline/free facts
end above 781 px. Evidence: `live-cold-desktop.png`,
`live-cold-mobile-390.png`, and `live-cold-first-read.json`.

## Build and automated checks

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 66 packages, 0 vulnerabilities |
| `npm test` | PASS — 22 Vitest; desktop 24 passed/4 skipped; mobile 25 passed/3 skipped |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — TypeScript and clippy with warnings denied |
| `npm run test:browser-lifecycle` | PASS — intentional first browser crash recovered on retry |
| `/opt/fleet/lib/verify-url.sh` on `/` and `/demo` | PASS — 200, title/lang/main/alt/console checks |
| `cargo fmt --check --manifest-path src-tauri/Cargo.toml` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS — 9 passed, 2 acceptance-only ignored |
| `cargo check --manifest-path src-tauri/Cargo.toml` | PASS |
| `npm run build` | PASS — exact site and desktop renderer output created under `dist/` |
| `APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build` | PASS — AppImage, DEB, RPM |
| candidate AppImage smoke | PASS — stayed open for 15 seconds in Xvfb |
| `npm run verify:release-source -- v0.1.10` | PASS for available commit `fcb90c7…` |
| `npm run verify:published-release` | PASS for available commit `fcb90c7…` |

Running `npm run verify:release-source` with no tag fails because the script
requires `RELEASE_TAG` or a positional tag; the correctly parameterized command
passes. The Tauri bundler emits its known `__TAURI_BUNDLE_TYPE` warning; no
updater is shipped.

## End-to-end behavior and recovery

- Live demo pause/resume, caption sizing, SRT export, TXT export, reset, and
  separation from real storage all worked.
- SRT export produced `sample-captions.srt`, four numbered cues, and valid
  SubRip timestamps. TXT export produced four sample lines.
- An invalid supporter token produced “This license is not active,” gave a next
  step, and was not stored.
- Native tests covered unavailable-monitor validation, mandatory consent,
  capture failure/retry, runtime-only transcript storage, deletion controls,
  English capture, SRT generation, stop, and restart.
- The independently built AppImage rendered its first-run source/model/consent
  UI; the only launch output was expected headless-container graphics/audio
  device noise.

The German speech path itself returned German text on the failing run, but its
claim test is not reliable enough to support the advertised acceptance claim.

## Live deployment, privacy, security, and API behavior

- Live identity is `v0.1.10` at `fcb90c7a2e659e930e7ec8fe519eb55118494e8c`.
  It matches the current public release, `latest.json`, and available repository
  head, but not the requested candidate.
- Fresh `/demo` and `/privacy` contexts made only same-origin document, script,
  CSS, and self-hosted font requests. There were no failed requests.
- The landing additionally calls only the documented GitHub releases API. The
  invalid-license action called only the documented Sociobot API. No analytics,
  advertising, raw Azure, third-party fonts, or audio upload was observed.
- Response headers include CSP, HSTS, `nosniff`, strict-origin referrer policy,
  and camera/microphone/geolocation denial. HTML and `sw.js` revalidate after 30
  seconds; hashed assets are immutable for one year.
- The product-unlock verify endpoint allowed 30 consecutive requests from one
  client. Request 31 returned HTTP 429 with `Retry-After: 3` and
  `X-RateLimit-After: 3`. Evidence: `license-rate-limit.log`.
- Sign-in is not used, so Entra tenant verification is not applicable.

## Accessibility, responsive behavior, and PWA

- Axe reported zero serious or critical findings for `/`, `/demo`, `/privacy`,
  `/terms`, the real 404, and the 390 px demo.
- Each route has `lang="en"`, one `<h1>`, one `<main>`, and a route-specific
  title. `/missing` returns a real HTTP 404 and a designed recovery page.
- Keyboard order begins with the visible skip link. Enter focuses `#main`.
  Buttons show a 3 px designed outline and Space operates pause/resume.
- The 390 px demo has zero horizontal overflow, including at 200% root text
  size. No mobile console or page errors were recorded.
- Reduced motion produces effectively zero transition time and `scroll-behavior:
  auto`.
- `sw.js` was activated under the site scope, `registration.update()`
  completed, cache `llc-shell-v7` existed, and offline reload retained the
  correct demo title, heading, and pause control.
- The only console error in the multi-route crawl was Chromium's expected
  failed-document message when deliberately navigating to `/missing` (HTTP
  404). Normal pages had no console or page errors.

## Performance and release assets

Lighthouse 12.8.2 mobile against the live landing page, with the unstable
full-page screenshot audit skipped, completed with:

- Performance 100, accessibility 100, best practices 100, SEO 100.
- LCP 1.2 s, FCP 1.1 s, TBT 0 ms, CLS 0.012, total transfer 111 KiB.
- Site JavaScript 29,177 bytes raw (9.90 KiB gzip), CSS 18,493 bytes raw
  (4.87 KiB gzip), hero WebP 54,804 bytes. All are within contract budgets.

The first Lighthouse attempt completed the same scored audits but the browser
crashed while taking its full-page screenshot; the rerun excluding that
non-product audit completed without a runtime error.

Release `v0.1.10` contains AppImage, DEB, RPM, DMG, macOS app archive, MSI,
EXE, `SHA256SUMS`, and `latest.json`. A freshly downloaded Linux DEB matched
the published checksum and its metadata identifies version 0.1.10 with WebKit
and GTK dependencies. All crawled product links returned 2xx or intentional
3xx responses; the deliberate `/missing` route returned 404.

## Known gap

The brief's “75% of 20-minute pilot recordings” success measure still requires
a human pilot and was not claimed by the product. Windows and macOS packages
could be checked for publication and integrity metadata but cannot be launched
inside this Linux worker.

## Evidence index

Primary machine-readable evidence is under `.factory/verification-evidence-12/`:

- `candidate-live-identity.log`
- `claim-*.log`
- `live-routes-demo.json`, `live-mobile-keyboard-pwa.json`
- `live-privacy-requests.json`, `live-link-crawl.json`
- `lighthouse-summary.json`, `lighthouse-live-no-screenshot.json`
- `license-rate-limit.log`, `live-headers.txt`, `live-asset-headers.txt`
- `npm_test.log`, `npm_run_lint.log`, `npm_run_build.log`, `cargo-*.log`
- `tauri-build.log`, `appimage-smoke.log`, `appimage-window.png`
- `verify-published-release.log`, `published-deb-checksum.log`
