# Adversarial first-read review 2

Reviewed 29 August 2026 against commit `c2a422d4981f58cdb2524a1635bc45c07dd37adf` and the live site at <https://local-live-captions.sociobot.in>.

## Verdict: FAIL

There are eight findings: one blocking, five major, and two minor. All 24 registered claim commands eventually passed from a fresh clone after the documented native packages were installed. The verdict is still FAIL because seven native claims are not tested as observable outcomes, public claims are stronger than or absent from the claim inventory, the required three facts do not fit on the first screen, and cross-route focus is lost.

## Findings

### Blocking

#### F-2-1 — Seven native claims are source assertions, not observable product tests

- Exact claims/locations: `.factory/claims.json` claims `native-local-processing`, `capture-recovery`, `desktop-overlay`, `no-audio-storage`, `session-transcript`, `no-telemetry-trackers`, and `storage-controls`.
- Evidence:
  - `claim_native_local_processing...` counts two occurrences of `reqwest::get(` and searches the source around `fn transcribe`; it does not record the packaged app's requests while captions run.
  - `claim_no_audio_storage...` counts `std::fs::write(` strings; it does not compare the filesystem before and after real capture.
  - `claim_session_transcript...` searches for an in-memory type, `.clear()`, and the absence of one filename; it does not close and reopen a session.
  - `claim_capture_recovery...` calls the internal failure helper; it never confirms that the user sees the error or can start captions again.
  - `@claim:desktop-overlay` reads configuration and checks that a command name exists; it does not resize the packaged window or toggle its actual always-on-top state.
  - `claim_storage_controls...` deletes a temporary model, but the license half only searches for button IDs and `localStorage.removeItem` strings. It does not operate the visible controls.
  - `@claim:no-telemetry-trackers` scans only `src/main.ts` for a short endpoint blacklist. The claim also covers the native app, which the test neither runs nor observes.
- Why this blocks acceptance: these are privacy, recovery, and desktop-control promises a user may rely on. Passing source-text checks does not demonstrate the promised behavior. Under the claims contract, each remains untested.
- Concrete fix: add a packaged-desktop integration harness. Run consented fixture audio while recording outbound connections and filesystem changes; close and reopen a session; inject a capture failure and restart; resize and pin the window; then click both storage controls and inspect the model file and license store. Give each observable test its existing `@claim:<id>` tag. Replace the endpoint blacklist with a full request log for both site and app.

### Major

#### F-2-2 — The three required facts do not fit on the first screen

- Exact location: landing hero facts, **“Private — Audio stays on your device,” “Offline — The sample works without internet,”** and **“Free — English and German speech models are free.”**
- Evidence: at 1280 × 720 only Private is fully visible; Offline begins at y=717 and ends below the 720 px viewport, while Free begins at y=756. At 390 × 844, Free ends at y=852 and is clipped.
- First-read impact: the mandatory privacy/offline/price facts require scrolling at both required review sizes. A visitor cannot read all three from the first screen.
- Concrete fix: reduce hero top/bottom spacing or headline size and compact the fact rows. Add viewport assertions that every `.facts li` rectangle is fully inside 1280 × 720 and 390 × 844.

#### F-2-3 — The offline sentence is broader than its registered claim

- Exact quote/location: landing fact, **“The sample works without internet.”**
- Evidence: `offline-reload` is registered as **“The bundled browser sample works without internet after its first visit.”** Its test first loads `/demo`, waits for service-worker control, then goes offline and reloads. A fresh browser cannot make the first visit without the site.
- First-read impact: the public sentence omits the required first-visit setup and promises a stronger result than the test proves.
- Concrete fix: use **“The sample works offline after your first visit.”** Keep the current claim test and make its displayed sentence exact.

#### F-2-4 — Cross-route section links and Back lose keyboard focus

- Exact location: header links **“How it works”** and **“Price”** when used from `/privacy`, `/terms`, or `/demo`.
- Evidence: `/privacy` → “How it works” reaches `/#how`, but `document.activeElement` is `<body>`, not the destination heading. Browser Back returns to `/privacy` with focus still on `<body>`. In contrast, the JavaScript-managed Demo and Privacy links correctly focus the new `<h1>`.
- First-read impact: sighted users reach the section, but keyboard and screen reader users receive no focused heading or route announcement and lose their place on Back.
- Concrete fix: route section links through the same navigation handler. After rendering, focus `#how-title` or `#price-title` and announce it. On Back, restore the previous trigger or focus the restored route's `<h1>`. Add direct, cross-route, back, and forward focus assertions.

#### F-2-5 — Model provenance and license statements are unlisted claims

- Exact quotes/location: README Develop, **“Speech models download on demand from the official `ggerganov/whisper.cpp` Hugging Face repository.”** and **“OpenAI Whisper and whisper.cpp publish their code and converted models under the MIT License.”** The desktop setup also says **“Whisper models use the MIT License.”**
- Evidence: no `.factory/claims.json` entry names the download repository, “official” provenance, or the model-license statement. `local-model-storage` checks only a destination path; `language-models` checks catalog keys and a language value.
- First-read impact: model origin and licensing are security and legal facts a user may rely on, but the claim inventory provides no reproducible proof.
- Concrete fix: add a `model-provenance-license` claim that checks every model URL against the intended repository and verifies the exact upstream license artifact/version. If that proof cannot be pinned, remove “official” and replace the license sentence with a link to each model's current license.

#### F-2-6 — README distribution promises are absent from the claim inventory

- Exact quotes/location: README Release, **“Desktop installers are built only in GitHub Actions.”** and **“It creates unsigned macOS, Windows, and Linux packages, then publishes `SHA256SUMS` and `latest.json`.”**
- Evidence: the live v0.1.7 release currently has those platform assets and files, but no claims entry tests that inventory or that releases are built only by the stated path. `unsigned-installers` checks only that signing terms are absent from the workflow.
- First-read impact: a downloader can rely on the named platforms and integrity files, but this promise can regress without a claim-gated failure.
- Concrete fix: add a `release-artifacts` claim. In a release fixture or the clean build sandbox, assert the three platform package families, `SHA256SUMS`, `latest.json`, and the permitted workflow trigger/path. Or narrow the README to the artifacts verified by the existing claim.

### Minor

#### F-2-7 — “Ask, then start” is not a self-contained heading

- Exact quote/location: landing “How it works,” step 3 heading, **“Ask, then start.”**
- Why it fails: a heading list does not say whom to ask, what to ask, or what starts. The useful consent detail exists only in the paragraph below.
- Concrete fix: **“Confirm consent and start captions.”**

#### F-2-8 — Two interface labels use unexplained technical shorthand

- Exact quotes/locations: landing overlay label **“English · local model”** and action **“Export SRT.”**
- Why it fails: “local model” does not name the user-visible result, and the landing page never expands SRT. The README defines SubRip, but a landing-page visitor should not need another document.
- Concrete fix: use **“English · processed on this computer”** and **“Export subtitle file (.srt).”**

## Cold first screen

Fresh Chromium contexts were used with service workers blocked and no stored site data. No scrolling occurred before recording the interpretation.

| Viewport | What it does, in my words | For whom | First click | Result |
|---|---|---|---|---|
| 390 × 844 | Captions Linux calls and recordings on the computer. | Deaf and hard-of-hearing students whose lecture, call, or recording lacks captions. | “Try it with sample data.” | Clear; action fully visible at y=560–611. The third fact is clipped; F-2-2. |
| 1280 × 720 | Same. | Same. | “Try it with sample data.” | Clear; action fully visible at y=578–630. Two facts fall below the fold; F-2-2. |

The exact first-screen text that answers the three questions is **“Caption Linux calls and recordings locally,” “For deaf and hard-of-hearing students when lectures, calls, or recordings have no captions,”** and **“Try it with sample data.”** The adjacent result, **“Opens a private sample. Nothing is saved,”** is also visible at both widths. This part is not blocking.

## Copy audit

Counts are whitespace-delimited. Hyphenated terms, code tokens, prices, versions, and URLs count as one word. No sentence exceeds 22 words and no banned marketing adjective appears. The 31 landing sentences average 7.8 words; the 52 README sentences average 9.9 words.

### Landing sentences

| # | Words | Sentence | Flag |
|---:|---:|---|---|
| 1 | 13 | For deaf and hard-of-hearing students when lectures, calls, or recordings have no captions. | — |
| 2 | 4 | Opens a private sample. | — |
| 3 | 3 | Nothing is saved. | — |
| 4 | 5 | Audio stays on your device. | — |
| 5 | 5 | The sample works without internet. | F-2-3 |
| 6 | 7 | English and German speech models are free. | — |
| 7 | 15 | Paper sound waves fold into caption ribbons above a laptop in an empty lecture room. | —; image alternative text |
| 8 | 9 | The app turns audio into captions on your computer. | — |
| 9 | 9 | Keep the resizable overlay above your lecture or call. | — |
| 10 | 6 | Adjust the words without stopping captions. | — |
| 11 | 9 | Gravity pulls the cloud inward while pressure pushes back. | —; sample text |
| 12 | 11 | Today we will trace how a star changes over its lifetime. | —; sample text |
| 13 | 4 | Choose an audio source. | — |
| 14 | 10 | A monitor source carries system audio through PipeWire or PulseAudio. | —; defines the term |
| 15 | 8 | The app checks a monitor source before capture. | — |
| 16 | 4 | Choose English or German. | — |
| 17 | 6 | The model stays on this computer. | — |
| 18 | 6 | Confirm that everyone agreed to captions. | — |
| 19 | 4 | Stop at any time. | — |
| 20 | 8 | That balance can last for billions of years. | —; sample text |
| 21 | 11 | The app does not join calls, name speakers, or save audio. | — |
| 22 | 10 | It keeps transcript text only while the session is open. | — |
| 23 | 12 | English and German speech models, size controls, and transcript export stay free. | — |
| 24 | 12 | A supporter license helps fund updates; it does not unlock caption features. | —; literal feature access |
| 25 | 5 | Checkout opens Dodo through Sociobot. | — |
| 26 | 6 | Review the checkout terms before paying. | — |
| 27 | 11 | Choose the package that matches your computer from the current release. | — |
| 28 | 4 | Current builds are unsigned. | — |
| 29 | 9 | Your system may ask you to confirm the download. | — |
| 30 | 8 | Caption Linux calls and recordings on your device. | — |
| 31 | 8 | Generated artwork disclosed in the design notes (external). | — |

### Landing headings, labels, and actions

| Area | Copy with word count | Result |
|---|---|---|
| Header | “Skip to content” (3); “Local Live Captions” (3); “Demo” (1); “How it works” (3); “Price” (1); “Privacy” (1) | Pass |
| First screen | “Caption Linux calls and recordings locally” (6); “Try it with sample data” (5); “Private” (1); “Offline” (1); “Free” (1) | Actions pass; layout F-2-2 |
| Overlay | “Resizable caption overlay” (3); “Capturing” (1); “English · local model” (3); “Stop captions” (2); “Caption size” (2); “28 px” (2); “Export SRT” (2) | F-2-8 |
| How it works | “How it works” (3); “Choose the audio source” (4); “Download a speech model” (4); “Ask, then start” (3); “1 · Pick” (2); “Audio source” (2); “Monitor of Built-in Audio” (4); “2 · Confirm” (2); “Consent” (1); “Everyone has agreed” (3); “3 · Read” (2); “Capturing” (1) | F-2-7 |
| Limits | “Privacy and limits” (3); “No cloud recording” (3); “Consent before capture” (3); “Resizable overlay” (2); “No perfect accuracy promise” (4) | Pass |
| Support | “Local Live Captions supporter license” (5); “Optional $24 supporter license” (4); “$24 once” (2); “Buy supporter license (external checkout)” (5); “Restore a supporter license” (4); “License token” (2); “Verify license” (2) | Pass |
| Download/footer | “Download for Linux” (3); “Download for Linux” (3); “See every download (external)” (4); “Privacy” (1); “Terms” (1); “Built by Param Factory (external)” (5); “v0.1.7 · build 2026.08.29” (3) | Pass |

Every button or button-styled link uses a result-naming verb. The terminology exceptions are F-2-8; otherwise the landing page consistently distinguishes an audio source, a system-audio monitor source, captions, a transcript, a speech model, consent, the demo, and the supporter license.

### README sentences

| # | Words | Sentence | Flag |
|---:|---:|---|---|
| 1 | 9 | Caption Linux calls, lectures, and recordings on your device. | — |
| 2 | 12 | Local Live Captions is a desktop overlay for deaf and hard-of-hearing students. | — |
| 3 | 17 | It turns a selected audio source into captions on your computer and exports SubRip (SRT) subtitle files. | — |
| 4 | 9 | Raw audio stays in memory and is not saved. | — |
| 5 | 6 | The public site is at https://local-live-captions.sociobot.in. | — |
| 6 | 6 | Open the isolated sample at https://local-live-captions.sociobot.in/demo. | — |
| 7 | 9 | Select an audio source exposed by the operating system. | — |
| 8 | 14 | On Linux, PipeWire or PulseAudio monitor sources appear when the sound server exposes them. | — |
| 9 | 8 | Download free English or multilingual German speech models. | — |
| 10 | 5 | Start only after confirming consent. | — |
| 11 | 7 | Read captions in an always-on-top, resizable overlay. | — |
| 12 | 6 | Change caption size while capture runs. | — |
| 13 | 6 | Export the current transcript as SRT. | —; SRT defined in sentence 3 |
| 14 | 7 | Optionally buy a $24 one-time supporter license. | — |
| 15 | 6 | It does not lock caption features. | — |
| 16 | 7 | Whisper can mishear names and technical words. | —; necessary limitation |
| 17 | 9 | Do not treat automatic captions as an official record. | —; safety instruction |
| 18 | 21 | Requirements: Node.js 22, Rust stable, Tauri 2 system packages, Linux ALSA development headers, and PulseAudio development headers for Linux monitor capture. | — |
| 19 | 12 | The desktop build needs the platform packages listed in the release workflow. | — |
| 20 | 12 | Speech models download on demand from the official `ggerganov/whisper.cpp` Hugging Face repository. | F-2-5 |
| 21 | 14 | OpenAI Whisper and whisper.cpp publish their code and converted models under the MIT License. | F-2-5 |
| 22 | 5 | `src-tauri/Cargo.lock` is committed on purpose. | — |
| 23 | 17 | It pins the Rust Tauri stack to the compatible 2.8 release used by the desktop JavaScript API. | — |
| 24 | 12 | Do not commit `src-tauri/target/` or `src-tauri/gen/`; both are generated during native builds. | — |
| 25 | 5 | The factory build command is: | — |
| 26 | 11 | The static output lands in `dist/site`, with `index.html` at its root. | —; confirmed by build |
| 27 | 4 | Release verification sets `CI=1`. | — |
| 28 | 21 | Desktop and 390 px mobile tests run in separate Playwright processes, and every test receives a newly launched browser and context. | — |
| 29 | 10 | An unexpected Chromium exit gets one clean retry in CI. | — |
| 30 | 8 | Desktop installers are built only in GitHub Actions. | F-2-6 |
| 31 | 9 | Tag a `v*` release or run the release workflow. | — |
| 32 | 13 | It creates unsigned macOS, Windows, and Linux packages, then publishes `SHA256SUMS` and `latest.json`. | F-2-6 |
| 33 | 4 | There is no telemetry. | F-2-1 test coverage |
| 34 | 10 | Settings and the optional supporter-license token stay on the computer. | — |
| 35 | 5 | Model downloads contact Hugging Face. | F-2-5 test coverage |
| 36 | 7 | License checks contact the Sociobot billing API. | — |
| 37 | 7 | Neither request includes audio or transcript text. | F-2-1 test coverage |
| 38 | 15 | Desktop setup can delete a downloaded model and remove a supporter license from this computer. | F-2-1 test coverage |
| 39 | 13 | The app opens PipeWire or PulseAudio monitor sources through the local PulseAudio-compatible server. | — |
| 40 | 6 | A monitor source carries system audio. | — |
| 41 | 13 | A monitor source must appear in `pactl list short sources` before capture starts. | — |
| 42 | 10 | The app also lists microphones reported by the operating system. | — |
| 43 | 16 | Before capture, the app confirms that a monitor source is still exposed by the sound server. | — |
| 44 | 9 | `npm run test:linux-audio` is the reproducible Linux acceptance run. | — |
| 45 | 14 | The test creates an isolated PulseAudio output and plays the included public-domain JFK clip. | — |
| 46 | 12 | It downloads `tiny.en`, checks captions and SRT output, then starts capture again. | — |
| 47 | 11 | It also plays the included original German clip through that monitor. | — |
| 48 | 10 | The multilingual `base` model must return recognizable German caption text. | — |
| 49 | 14 | The test needs `pulseaudio`, `pulseaudio-utils`, and the Linux development packages in the release workflow. | — |
| 50 | 7 | Fixtures stay local and are never uploaded. | — |
| 51 | 8 | The source is available under the MIT License. | —; repository LICENSE present |
| 52 | 7 | Read the site privacy policy and terms. | — |

README headings — “Local Live Captions,” “What works,” “Develop,” “Test and build,” “Privacy and licensing,” and “Linux system audio” — name their sections without mood copy. The README contains no buttons.

### Terminology table

| Concept | Term used |
|---|---|
| On-screen speech text | captions |
| Full session text | transcript |
| Selectable input | audio source |
| System-output input | monitor source |
| Local recognition file | speech model |
| Permission from participants | consent |
| Isolated try-out | demo; sample refers to its bundled data |
| Optional payment | supporter license |

## Demo and sandbox

- Landing → demo takes one click at 390 px and desktop widths.
- The first demo screen is already in use: “Capturing sample,” two visible captions, a four-line astronomy transcript, pause, size, TXT, and SRT actions.
- The persistent banner reads **“Demo — sample data, nothing is saved”** and contains **Reset demo** and **Start for real**.
- Reset removed a seeded `demo:dirty` session key, restored all four bundled lines, and retained a seeded `real:review-marker` local-storage key.
- Start for real cleared all `demo:` session keys and retained the real marker.
- A direct `/demo` flow made only same-origin requests. The GitHub release API request occurred only after Start for real returned to the landing page.
- After service-worker control, an offline reload retained the sample and Pause changed to Resume.
- The native first-run source exposes one-click **Load sample project** and does not write its sample lines to persistent storage.

The demo itself passes. F-2-3 concerns the broader landing wording, not the demonstrated after-first-visit offline behavior.

## Claims results

The clone was `/tmp/llc-review2.Yj2XZq`. `npm ci` was run first. The initial native commands reported missing host packages; the exact packages documented in `.github/workflows/release.yml` were installed, then every affected exact command was rerun. The table records those final clean-clone results.

| # | Claim | Exact command | Result |
|---:|---|---|---|
| 1 | `private-local` | `npm test -- --grep @claim:private-local` | PASS |
| 2 | `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS |
| 3 | `srt-export` | `npm test -- --grep @claim:srt-export` | PASS |
| 4 | `txt-export` | `npm test -- --grep @claim:txt-export` | PASS |
| 5 | `live-caption-sizing` | `npm test -- --grep @claim:live-caption-sizing` | PASS |
| 6 | `demo-isolated` | `npm test -- --grep @claim:demo-isolated` | PASS |
| 7 | `free-and-paid` | `npm test -- --grep @claim:free-and-paid` | PASS |
| 8 | `supporter-license-restore` | `npm test -- --grep @claim:supporter-license-restore` | PASS |
| 9 | `native-local-processing` | `cargo test --manifest-path src-tauri/Cargo.toml claim_native_local_processing` | PASS; inadequate outcome coverage, F-2-1 |
| 10 | `capture-recovery` | `cargo test --manifest-path src-tauri/Cargo.toml claim_capture_recovery` | PASS; inadequate outcome coverage, F-2-1 |
| 11 | `language-models` | `cargo test --manifest-path src-tauri/Cargo.toml claim_language_models` | PASS |
| 12 | `german-caption-end-to-end` | `npm run test:linux-audio` | PASS; real multilingual model and German fixture |
| 13 | `linux-system-audio` | `cargo test --manifest-path src-tauri/Cargo.toml claim_linux_system_audio` | PASS |
| 14 | `desktop-overlay` | `npm test -- --grep @claim:desktop-overlay` | PASS; inadequate outcome coverage, F-2-1 |
| 15 | `no-audio-storage` | `cargo test --manifest-path src-tauri/Cargo.toml claim_no_audio_storage` | PASS; inadequate outcome coverage, F-2-1 |
| 16 | `session-transcript` | `cargo test --manifest-path src-tauri/Cargo.toml claim_session_transcript` | PASS; inadequate outcome coverage, F-2-1 |
| 17 | `no-telemetry-trackers` | `npm test -- --grep @claim:no-telemetry-trackers` | PASS; inadequate native coverage, F-2-1 |
| 18 | `consent-before-capture` | `cargo test --manifest-path src-tauri/Cargo.toml claim_consent_is_required` | PASS |
| 19 | `local-model-storage` | `cargo test --manifest-path src-tauri/Cargo.toml claim_models_are_downloaded` | PASS |
| 20 | `storage-controls` | `cargo test --manifest-path src-tauri/Cargo.toml claim_storage_controls` | PASS; license UI half is source-only, F-2-1 |
| 21 | `source-start-validation` | `cargo test --manifest-path src-tauri/Cargo.toml claim_linux_monitor_must_still_be_exposed` | PASS |
| 22 | `call-speaker-boundaries` | `npm run test:unit -- --testNamePattern @claim:call-speaker-boundaries` | PASS |
| 23 | `unsigned-installers` | `npm run test:unit -- --testNamePattern @claim:unsigned-installers` | PASS |
| 24 | `linux-monitor-end-to-end` | `npm run test:linux-audio` | PASS; real PulseAudio monitor, SRT, and restart |

The duplicate `npm run test:linux-audio` entries each ran both tagged native acceptance tests. The real English and German paths passed on both runs.

## Earlier-history recheck

Every finding in `.factory/review-1.md`, every closure in `.factory/polish-1.md`, and the current `.factory/handoff.md` were checked against live copy/behavior and current source.

| Earlier finding | Live-site check | Code/test check | Status |
|---|---|---|---|
| F-1-1 | Headline is “Caption Linux calls and recordings locally.” | Landing source matches. | Fixed |
| F-1-2 | English/German wording remains narrower than “any language.” | Real German fixture and multilingual model test passed. | Fixed |
| F-1-3 | Demo says “sends no data to other sites.” | Direct demo request log was same-origin only. | Fixed |
| F-1-4 | Merchant/refund assertion is absent. | Copy uses the tested Dodo-through-Sociobot redirect. | Fixed |
| F-1-5 | Checkout accessible name includes “external checkout.” | Live redirect reaches Dodo. | Fixed |
| F-1-6 | Heading is “Resizable caption overlay.” | Source matches. | Fixed |
| F-1-7 | Heading is “Optional $24 supporter license.” | Source matches. | Fixed |
| F-1-8 | Privacy h1 is “Your audio stays on your computer.” | Route title and source match. | Fixed |
| F-1-9 | Real 404 h1 is “Page not found.” | Unknown URL returns HTTP 404 with designed shell. | Fixed |
| F-1-10 | Figure caption says captions run on the computer. | Source matches. | Fixed |
| F-1-11 | Numbered lore labels are absent. | Descriptive section headings are present. | Fixed |
| F-1-12 | README opens in product language and defines SubRip (SRT). | Tauri/Whisper terms are moved to development details. | Fixed |
| F-1-13 | Selectable item is consistently “audio source”; “monitor source” is defined. | Landing and README match. | Fixed |
| F-1-14 | Monitor explanation is split into short sentences. | No sentence exceeds 22 words. | Fixed |
| F-1-15 | Acceptance explanation is split and includes German. | Both real-audio tests passed. | Fixed |
| F-1-16 | Current handoff and inventory both state 24 claims. | `claims.json` has 24 unique IDs. | Fixed |
| F-1-17 | Privacy names both deletion actions. | Model deletion test passed; both controls exist. F-2-1 separately requires an observable license-control test. | Fixed; new test-quality gap |

No earlier finding is reopened under its old ID. F-2-1 is new: the behavior is present in source, but the current claim tests do not meet the observable-test contract.

## Structure, links, accessibility, and visual identity

- `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown path returns a styled page with HTTP 404 and Return home.
- Every route has one `<h1>`, one `<main>`, `lang="en"`, a route-specific title and description, canonical URL, Open Graph/Twitter metadata, 1200 × 630 social image, SVG favicon, and 180 px Apple touch icon.
- Titles follow the required pattern and remain under 60 characters.
- Header and footer are consistent. Privacy, Terms, factory attribution, and version/build ID are present.
- Every link found across all five route states resolved. `mailto:` links were exempted. The current AppImage, release page, checkout redirect, factory, and design-note links all returned successful responses.
- Same-origin demo requests and the offline service-worker reload passed.
- Live Axe checks found zero violations on landing, demo, privacy, and terms in both light and dark modes. `/opt/fleet/lib/verify-url.sh` passed with no errors. Keyboard focus is visible, the skip link works, touch targets pass, reduced motion is covered, and there is no 390 px horizontal overflow.
- F-2-4 is the remaining route-focus failure.
- Response headers include CSP with `frame-ancestors`, nosniff, Referrer-Policy, Permissions-Policy, and HSTS. CSP generated no violations.
- The site is visually distinct. Its paper lecture-room art, parchment/ink/tomato/cobalt palette, Fraunces/Atkinson type pairing, caption ribbons, asymmetric layout, and reduced-motion treatment match `.factory/design.md`. It is not a generic centered SaaS hero or three-card template.
- Fresh-clone gates passed: `npm test` (15 unit plus 19 desktop and 19 mobile Playwright tests, with three expected skips per project), `npm run typecheck`, `npm run lint`, and `npm run build`. `dist/site` and `dist/app` were produced. Site JavaScript is 9.47 kB + 0.15 kB gzip, below 150 kB.

## Missed leverage

No additional AI feature is justified. Captioning is already the core local speech-recognition job, and sending transcripts to a gateway would weaken the offline/privacy proposition. No Azure or provider key is embedded. Native SRT export and browser-demo TXT/SRT export cover the brief's obvious portability need. Sync would add privacy risk without being implied by the brief. No separate missed-leverage finding is raised.

## What would make this perfect

Resolve F-2-1 through F-2-8 and rerun the entire review. The decisive work is to make native privacy, recovery, window, and storage claims observable in a packaged-app harness; then align the offline wording, register model and release claims, fit all three facts above the fold, preserve focus through section navigation and Back, and replace the two remaining ambiguous/jargon labels. There is no additional optional polish list: PASS requires a fresh review with zero findings and no untested claim.
