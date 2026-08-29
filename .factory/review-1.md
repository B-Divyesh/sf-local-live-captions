# Adversarial first-read review 1

Reviewed 29 August 2026 against commit
`f7e7133c209f09b62930d7ede6bda9a0d777fe8d` and the live site at
<https://local-live-captions.sociobot.in>.

## Verdict: FAIL

There are 17 findings. Four are blocking because prominent product claims are
broader than the implementation or their tests. A PASS requires zero findings
and no untested claim.

## Findings

### Blocking

#### F-1-1 — “Any Linux audio” is broader than the supported and tested path

- Exact quote/location: landing `<h1>`, **“Caption any Linux audio locally.”**
- Evidence: `linux-system-audio` promises only that PipeWire or PulseAudio
  monitor sources appear *when the sound server exposes them*. Its unit test
  parses one representative `pactl` listing. The end-to-end test covers one
  PulseAudio null-sink monitor. Neither test proves “any Linux audio.” The
  landing instructions also use the narrower conditional wording.
- First-read impact: “any” tells a visitor that every Linux audio path will
  work, including configurations the product neither names nor tests.
- Concrete fix: change the headline to **“Caption Linux system audio locally”**
  or **“Caption Linux calls and recordings locally.”** If “any” remains, add a
  support matrix and end-to-end tests for every audio path included by “any.”

#### F-1-2 — German captioning is listed as a capability but is not tested as an outcome

- Exact quotes/locations: landing fact, **“English and German captions are
  free.”** README, **“Download free English or multilingual German-capable
  models.”** Claim `language-models`, **“The app offers free English and German
  speech models.”**
- Evidence: `claim_language_models_include_english_and_german` checks catalog
  entries and that the multilingual model uses `auto`; it does not transcribe
  German. `npm run test:linux-audio` transcribes only the English JFK fixture.
  The existing handoff also records that there is no German speech fixture.
- First-read impact: a German-speaking student can reasonably rely on the
  sentence as proof that German captions work, but the test proves only that a
  model can be selected.
- Concrete fix: add a consented, public-domain German speech fixture and a
  `@claim:german-caption-end-to-end` test that captures it through the monitor,
  runs the downloaded multilingual model, and asserts recognizable German
  output. Point the landing and README sentence to that claim.

#### F-1-3 — The demo says it makes no network requests, but it does

- Exact quote/location: `/demo` introduction, **“It makes no network
  requests.”**
- Evidence: a fresh direct `/demo` visit made 12 requests, all to
  `https://local-live-captions.sociobot.in`. Claim `private-local` and its test
  assert only that no request is cross-origin. They do not test zero network
  requests.
- First-read impact: the copy states a stronger privacy/offline property than
  the implementation and its registered claim.
- Concrete fix: replace it with **“The sample sends no data to other sites.”**
  That sentence matches the existing same-origin request test. If zero requests
  after initial load is intended, state that scope and add a request-log test.

#### F-1-17 — The privacy page promises deletion controls that do not exist

- Exact quote/location: `/privacy`, “Your choices,” **“You can delete models
  and remove your license from the app settings.”**
- Evidence: the desktop setup and caption screens have no settings route,
  model-delete action, or license-removal action. The native command list has
  no delete-model command. The only `localStorage.removeItem` calls remove an
  invalid license after verification; they are not a user-controlled removal
  path. No `claims.json` entry tests this promise.
- First-read impact: the privacy policy promises control over stored model and
  license data that a user cannot exercise in the product.
- Concrete fix: add visible **Delete downloaded model** and **Remove supporter
  license** actions, implement the matching local deletion, and add a claim
  test that proves both are gone. Until that ships, replace the sentence with
  accurate manual file/browser-storage removal instructions.

### Major

#### F-1-4 — The merchant-of-record and refund statement is unlisted and untested

- Exact quote/location: supporter section, **“Checkout and refunds are handled
  by Sociobot, the merchant of record.”** Terms also say **“Sociobot and Dodo
  handle payment as merchant of record. A refund revokes the related
  license.”**
- Evidence: `free-and-paid` proves the Sociobot URL returns a live redirect to
  `checkout.dodopayments.com`; it does not prove who is legally the merchant of
  record, who handles refunds, or that a refund revokes a license. No other
  `claims.json` entry covers these statements.
- First-read impact: this is a payment and refund assurance a buyer may rely on.
- Concrete fix: confirm the legal arrangement, then either add a tested claim
  tied to billing configuration or write **“Checkout opens Dodo through
  Sociobot. Review the checkout terms before paying.”**

#### F-1-5 — The paid checkout leaves the site without saying so

- Exact quote/location: supporter action, **“Buy supporter license.”**
- Evidence: following the link ends at
  `https://checkout.dodopayments.com/session/...`, while other outbound links
  explicitly include “(external).”
- First-read impact: the user is moved from the product site to a payment site
  without the site’s established external-link disclosure.
- Concrete fix: label the action **“Buy supporter license (external
  checkout)”** and identify Dodo in the adjacent payment copy.

### Minor

#### F-1-6 — The overlay heading is an idiom, not a section name

- Exact quote/location: landing section 01 heading, **“Read the room, not
  another window.”**
- Why it fails: it is a slogan and does not identify the feature when headings
  are read out of context.
- Concrete fix: **“Resizable caption overlay.”** Keep the current explanatory
  sentences below it.

#### F-1-7 — The payment heading is an appeal, not a section name

- Exact quote/location: landing supporter heading, **“Keep accessibility
  features free.”**
- Why it fails: it does not tell a scanning visitor that this section contains
  an optional $24 payment and license restore form.
- Concrete fix: **“Optional $24 supporter license.”**

#### F-1-8 — The privacy headline uses an imprecise metaphor

- Exact quote/location: `/privacy` `<h1>`, **“Your audio stays with you.”**
- Why it fails: “with you” is less concrete than the actual device boundary.
- Concrete fix: **“Your audio stays on your computer.”**

#### F-1-9 — The 404 headline uses brand mood instead of naming the error

- Exact quotes/location: 404 eyebrow and `<h1>`, **“404 · Lost caption”** and
  **“This page went quiet.”**
- Why it fails: both are metaphors. The useful explanation appears only below
  them.
- Concrete fix: use `<h1>Page not found</h1>` and keep **“The address does not
  point to a page here.”**

#### F-1-10 — The hero caption turns a privacy fact into a metaphor

- Exact quote/location: landing artwork caption, **“Speech becomes text
  without leaving the room.”**
- Why it fails: “leaving the room” is not the tested boundary; the tested
  boundary is the computer/network path.
- Concrete fix: **“The app turns audio into captions on your computer.”**

#### F-1-11 — Decorative labels duplicate or obscure the section names

- Exact quotes/locations: **“A private listening aid for Linux,” “01 / THE
  OVERLAY,” “02 / HOW IT WORKS,” “03 / CLEAR BOUNDARIES,” “04 / SUPPORT THE
  APP,”** and **“BUILT FIRST FOR LINUX.”**
- Why it fails: the numbered margin labels are visual lore rather than the
  semantic heading, and “listening aid” can suggest an assistive listening
  device rather than caption software.
- Concrete fix: remove the numbers and first-screen slogan. Use the descriptive
  section names as the actual headings: **“Resizable caption overlay,” “How it
  works,” “Privacy and limits,” “Supporter license,”** and **“Download for
  Linux.”**

#### F-1-12 — The README opens with implementation jargon before explaining it

- Exact quotes/location: README introduction, **“Local Live Captions is a
  Tauri 2 desktop overlay for deaf and hard-of-hearing students.”** and **“It
  captures a selected audio input, runs a downloadable Whisper model locally,
  and exports transcript text as SRT.”**
- Why it fails: “Tauri 2,” “Whisper model,” and “SRT” are unexplained in the
  first product description.
- Concrete fix: **“Local Live Captions is a desktop overlay for deaf and
  hard-of-hearing students. It turns a selected audio source into captions on
  your computer and exports SubRip (SRT) subtitle files.”** Put Tauri and
  Whisper in the development section.

#### F-1-13 — The same input concept has four names

- Exact quotes/locations: landing and README use **“Linux input,” “audio
  input,” “input,” “audio source,”** and **“monitor source.”**
- Why it fails: a first-time user cannot tell whether these are separate
  choices or synonyms.
- Concrete fix: use **“audio source”** for the selectable item everywhere, then
  define once: **“A monitor source is the PipeWire or PulseAudio source that
  carries system audio.”**

#### F-1-14 — One README sentence exceeds the 22-word cap

- Exact quote/location: README, “Linux system audio,” **“A monitor source must
  exist and be visible to `pactl list short sources`; normal microphones are
  still listed through the operating system’s native input list.”** (25 words)
- Concrete fix: **“A monitor source must appear in `pactl list short sources`
  before capture starts. The app also lists microphones reported by the
  operating system.”**

#### F-1-15 — The Linux acceptance-test sentence exceeds the 22-word cap

- Exact quote/location: README, “Linux system audio,” **“It starts an isolated
  PulseAudio null sink, plays the shipped public-domain JFK speech fixture into
  its monitor, downloads the real `tiny.en` model if needed, asserts the caption
  text, checks SRT formatting, and opens a second capture after stopping.”**
  (38 words)
- Concrete fix: **“The test creates an isolated PulseAudio output and plays the
  included public-domain JFK clip. It downloads `tiny.en`, checks captions and
  SRT output, then starts capture again.”**

#### F-1-16 — The handoff gives two different claim totals

- Exact quotes/location: `.factory/handoff.md`, **“All 23 claims passed”** and
  later **“22/22 passed verbatim.”** The current `claims.json` contains 22
  entries.
- Why it fails: the verification record cannot be reconciled without manually
  recounting the inventory.
- Concrete fix: correct the historical summary to **“All 22 claims passed.”**

## Cold first screen

Fresh Chromium contexts were opened without scrolling.

| Viewport | What it does, in my words | For whom | First click | Result |
|---|---|---|---|---|
| 390 × 844 | A Linux desktop app captions call, lecture, or recording audio locally. | Deaf and hard-of-hearing students whose audio has no captions. | “Try it with sample data.” | Clear, but the absolute word “any” is unsupported; see F-1-1. |
| 1280 × 720 | Same interpretation. | Same audience. | “Try it with sample data.” | Clear; the action ends at y=528, inside the 720 px viewport. |

The first-screen shape is otherwise complete: five-word headline, 13-word
audience sentence, one primary sample action with an adjacent outcome, and
three privacy/offline/price facts.

## Copy audit

Counting method: whitespace-delimited words; hyphenated terms, code tokens,
prices, versions, and URLs count as one word. The landing table covers every
rendered sentence plus the image alternative text. Interface fragments and
headings follow it. The README table excludes code blocks because commands are
not sentences.

### Landing sentences

| # | Words | Sentence | Flag |
|---:|---:|---|---|
| 1 | 13 | For deaf and hard-of-hearing students when lectures, calls, or recordings have no captions. | — |
| 2 | 4 | Opens a private sample. | — |
| 3 | 3 | Nothing is saved. | — |
| 4 | 5 | Audio stays on your device. | — |
| 5 | 5 | The sample works without internet. | — |
| 6 | 6 | English and German captions are free. | F-1-2 |
| 7 | 7 | Speech becomes text without leaving the room. | F-1-10 |
| 8 | 9 | Keep the resizable overlay above your lecture or call. | — |
| 9 | 6 | Adjust the words without stopping captions. | — |
| 10 | 9 | Gravity pulls the cloud inward while pressure pushes back. | —; realistic sample text |
| 11 | 11 | Today we will trace how a star changes over its lifetime. | —; realistic sample text |
| 12 | 11 | Choose a Linux input or a PipeWire or PulseAudio monitor source. | F-1-13 |
| 13 | 7 | The app checks the source before capture. | — |
| 14 | 5 | Choose English or German once. | F-1-2 |
| 15 | 6 | The model stays on this computer. | — |
| 16 | 6 | Confirm that everyone agreed to captions. | — |
| 17 | 4 | Stop at any time. | — |
| 18 | 8 | That balance can last for billions of years. | —; realistic sample text |
| 19 | 11 | The app does not join calls, name speakers, or save audio. | — |
| 20 | 10 | It keeps transcript text only while the session is open. | — |
| 21 | 11 | English and German captions, size controls, and transcript export stay free. | F-1-2 |
| 22 | 12 | A supporter license helps fund updates; it does not unlock caption features. | —; “unlock” is literal feature gating |
| 23 | 11 | Checkout and refunds are handled by Sociobot, the merchant of record. | F-1-4 |
| 24 | 11 | Choose the package that matches your computer from the current release. | — |
| 25 | 4 | Current builds are unsigned. | — |
| 26 | 9 | Your system may ask you to confirm the download. | — |
| 27 | 8 | Caption Linux calls and recordings on your device. | — |
| 28 | 15 | Paper sound waves fold into caption ribbons above a laptop in an empty lecture room. | —; image alternative text |
| 29 | 8 | Generated artwork disclosed in the design notes (external). | — |

No landing sentence exceeds 22 words. The 29 sentences average 7.8 words
before the two accessibility-only sentences are included and remain well below
14 words with them.

### Landing headings, labels, and actions

All counts are shown so the flagged non-sentence copy is auditable.

| Area | Copy with word count | Result |
|---|---|---|
| Header | “Skip to content” (3); “Local Live Captions” (3); “Demo” (1); “How it works” (3); “Price” (1); “Privacy” (1) | Pass |
| First screen | “A private listening aid for Linux” (6); “Caption any Linux audio locally” (5); “Try it with sample data” (5); “Private” (1); “Offline” (1); “Free” (1) | F-1-1, F-1-11 |
| Overlay | “01 / THE OVERLAY” (3); “Read the room, not another window” (6); “Capturing” (1); “English · local model” (3); “Stop captions” (2); “Caption size” (2); “28 px” (2); “Export SRT” (2) | F-1-6, F-1-11; actions pass |
| How it works | “02 / HOW IT WORKS” (4); “Start captions in three clear steps” (6); “Choose the audio source” (4); “Download a speech model” (4); “Ask, then start” (3); “1 · Pick” (2); “Audio source” (2); “Monitor of Built-in Audio” (4); “2 · Confirm” (2); “Consent” (1); “Everyone has agreed” (3); “3 · Read” (2); “Capturing” (1) | F-1-11; headings/actions otherwise pass |
| Boundaries | “03 / CLEAR BOUNDARIES” (3); “Captions, without a meeting bot” (5); “No cloud recording” (3); “Consent before capture” (3); “Resizable overlay” (2); “No perfect accuracy promise” (4) | F-1-11 |
| Support | “04 / SUPPORT THE APP” (4); “Local Live Captions supporter license” (5); “Keep accessibility features free” (4); “$24 once” (2); “Buy supporter license” (3); “Restore a supporter license” (4); “License token” (2); “Verify license” (2) | F-1-5, F-1-7, F-1-11; other actions pass |
| Download/footer | “BUILT FIRST FOR LINUX” (4); “Download the desktop app” (4); “Download for Linux” (3); “See every download (external)” (4); “Privacy” (1); “Terms” (1); “Built by Param Factory (external)” (5); “v0.1.5 · build 2026.08.29” (3) | F-1-11; actions otherwise pass |

There are no banned marketing adjectives. Every button uses a verb that names
its result. F-1-5 is about missing external-destination disclosure, not its
verb.

### README sentences

| # | Words | Sentence | Flag |
|---:|---:|---|---|
| 1 | 9 | Caption Linux calls, lectures, and recordings on your device. | — |
| 2 | 14 | Local Live Captions is a Tauri 2 desktop overlay for deaf and hard-of-hearing students. | F-1-12 |
| 3 | 18 | It captures a selected audio input, runs a downloadable Whisper model locally, and exports transcript text as SRT. | F-1-12, F-1-13 |
| 4 | 10 | Raw audio is held in memory and is not saved. | — |
| 5 | 6 | The public site is at https://local-live-captions.sociobot.in. | — |
| 6 | 6 | Open the isolated sample at https://local-live-captions.sociobot.in/demo. | — |
| 7 | 8 | Select an input exposed by the operating system. | F-1-13 |
| 8 | 14 | On Linux, PipeWire or PulseAudio monitor sources appear when the sound server exposes them. | F-1-13 |
| 9 | 7 | Download free English or multilingual German-capable models. | F-1-2 |
| 10 | 5 | Start only after confirming consent. | — |
| 11 | 7 | Read captions in an always-on-top, resizable overlay. | — |
| 12 | 6 | Change caption size while capture runs. | — |
| 13 | 6 | Export the current transcript as SRT. | F-1-12; define SRT on first use |
| 14 | 7 | Optionally buy a $24 one-time supporter license. | — |
| 15 | 6 | It does not lock caption features. | — |
| 16 | 7 | Whisper can mishear names and technical words. | —; necessary limitation |
| 17 | 9 | Do not treat automatic captions as an official record. | —; necessary safety instruction |
| 18 | 21 | Requirements: Node.js 22, Rust stable, Tauri 2 system packages, Linux ALSA development headers, and PulseAudio development headers for Linux monitor capture. | —; technical names are required here |
| 19 | 12 | The desktop build needs the platform packages listed in the release workflow. | — |
| 20 | 12 | Speech models download on demand from the official `ggerganov/whisper.cpp` Hugging Face repository. | — |
| 21 | 14 | OpenAI Whisper and whisper.cpp publish their code and converted models under the MIT License. | — |
| 22 | 5 | `src-tauri/Cargo.lock` is committed on purpose. | — |
| 23 | 17 | It pins the Rust Tauri stack to the compatible 2.8 release used by the desktop JavaScript API. | — |
| 24 | 12 | Do not commit `src-tauri/target/` or `src-tauri/gen/`; both are generated during native builds. | — |
| 25 | 5 | The factory build command is: | — |
| 26 | 11 | The static output lands in `dist/site`, with `index.html` at its root. | — |
| 27 | 4 | Release verification sets `CI=1`. | — |
| 28 | 21 | Desktop and 390 px mobile tests run in separate Playwright processes, and every test receives a newly launched browser and context. | — |
| 29 | 10 | An unexpected Chromium exit gets one clean retry in CI. | — |
| 30 | 8 | Desktop installers are built only in GitHub Actions. | — |
| 31 | 9 | Tag a `v*` release or run the release workflow. | — |
| 32 | 13 | It creates unsigned macOS, Windows, and Linux packages, then publishes `SHA256SUMS` and `latest.json`. | — |
| 33 | 4 | There is no telemetry. | — |
| 34 | 10 | Settings and the optional supporter-license token stay on the computer. | — |
| 35 | 5 | Model downloads contact Hugging Face. | — |
| 36 | 7 | License checks contact the Sociobot billing API. | — |
| 37 | 7 | Neither request includes audio or transcript text. | — |
| 38 | 21 | The app opens PipeWire or PulseAudio monitor sources through the local PulseAudio-compatible server, rather than relying only on ALSA device enumeration. | F-1-13; terms need one definition |
| 39 | 25 | A monitor source must exist and be visible to `pactl list short sources`; normal microphones are still listed through the operating system’s native input list. | F-1-14 |
| 40 | 16 | Before a monitor starts, the app confirms that it is still exposed by the sound server. | — |
| 41 | 9 | `npm run test:linux-audio` is the reproducible Linux acceptance run. | — |
| 42 | 38 | It starts an isolated PulseAudio null sink, plays the shipped public-domain JFK speech fixture into its monitor, downloads the real `tiny.en` model if needed, asserts the caption text, checks SRT formatting, and opens a second capture after stopping. | F-1-15 |
| 43 | 13 | It needs `pulseaudio`, `pulseaudio-utils`, and the Linux development packages in the release workflow. | — |
| 44 | 9 | The fixture is local only and is never uploaded. | — |
| 45 | 8 | The source is available under the MIT License. | — |
| 46 | 7 | Read the site privacy policy and terms. | — |

README headings: “Local Live Captions” (3), “What works” (2), “Develop” (1),
“Test and build” (3), “Privacy and licensing” (3), and “Linux system audio”
(3). They name their sections. The README has no buttons. Its 46 sentences
average 10.8 words; sentences 39 and 42 exceed the hard cap.

## Demo and sandbox

- Landing → demo is one click at both viewports.
- The first demo screen already shows a running astronomy sample, two visible
  captions, a four-row session transcript, pause, size, TXT, and SRT controls.
- The persistent banner says “Demo — sample data, nothing is saved” and exposes
  both Reset demo and Start for real.
- Reset removed a seeded `demo:dirty` session key, restored the bundled sample,
  and retained a seeded `real:review-marker` local-storage key.
- Start for real returned to `/`, cleared demo session state, and retained the
  real marker.
- A direct fresh `/demo` run contacted only the product origin. After the
  service worker controlled the page, an offline reload still showed the
  sample and Pause changed to Resume.
- F-1-3 still blocks acceptance because the displayed zero-request sentence is
  not what the request log or registered claim proves.

## Claims results

All commands were run from a fresh clone in
`/tmp/llc-review-clone.CRPpno`. The first Rust attempt correctly reported
missing host libraries. After installing the exact native packages documented
in `.github/workflows/release.yml`, every command was rerun and passed. That
environment setup is not counted as a product failure.

| Claim | Exact command | Result |
|---|---|---|
| `private-local` | `npm test -- --grep @claim:private-local` | PASS |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS |
| `srt-export` | `npm test -- --grep @claim:srt-export` | PASS |
| `txt-export` | `npm test -- --grep @claim:txt-export` | PASS |
| `live-caption-sizing` | `npm test -- --grep @claim:live-caption-sizing` | PASS |
| `demo-isolated` | `npm test -- --grep @claim:demo-isolated` | PASS |
| `free-and-paid` | `npm test -- --grep @claim:free-and-paid` | PASS |
| `supporter-license-restore` | `npm test -- --grep @claim:supporter-license-restore` | PASS |
| `native-local-processing` | `cargo test --manifest-path src-tauri/Cargo.toml claim_native_local_processing` | PASS |
| `capture-recovery` | `cargo test --manifest-path src-tauri/Cargo.toml claim_capture_recovery` | PASS |
| `language-models` | `cargo test --manifest-path src-tauri/Cargo.toml claim_language_models` | PASS, but inadequate for the public German-caption outcome; F-1-2 |
| `linux-system-audio` | `cargo test --manifest-path src-tauri/Cargo.toml claim_linux_system_audio` | PASS |
| `desktop-overlay` | `npm test -- --grep @claim:desktop-overlay` | PASS |
| `no-audio-storage` | `cargo test --manifest-path src-tauri/Cargo.toml claim_no_audio_storage` | PASS |
| `session-transcript` | `cargo test --manifest-path src-tauri/Cargo.toml claim_session_transcript` | PASS |
| `no-telemetry-trackers` | `npm test -- --grep @claim:no-telemetry-trackers` | PASS |
| `consent-before-capture` | `cargo test --manifest-path src-tauri/Cargo.toml claim_consent_is_required` | PASS |
| `local-model-storage` | `cargo test --manifest-path src-tauri/Cargo.toml claim_models_are_downloaded` | PASS |
| `source-start-validation` | `cargo test --manifest-path src-tauri/Cargo.toml claim_linux_monitor_must_still_be_exposed` | PASS |
| `call-speaker-boundaries` | `npm run test:unit -- --testNamePattern @claim:call-speaker-boundaries` | PASS |
| `unsigned-installers` | `npm run test:unit -- --testNamePattern @claim:unsigned-installers` | PASS |
| `linux-monitor-end-to-end` | `npm run test:linux-audio` | PASS; real 77.11 MB `tiny.en` model and PulseAudio monitor |

Claim execution success does not clear F-1-1 through F-1-4 or F-1-17: those
findings are about stronger live wording, missing behavior, or an outcome the
listed test does not assert.

## Earlier-history recheck

No earlier `.factory/review-*.md` or `.factory/polish-*.md` exists. The existing
handoff lists the prior repair work. Each item was checked on the live site and
in current source:

- Desktop first-screen action: fixed; the 1280 × 720 action bottom is 528 px.
- Claims inventory and added tests: fixed at 22 unique entries; all commands
  pass after documented prerequisites. F-1-16 records the stale “23” summary.
- Initial keyboard order and SPA focus: fixed; first Tab reaches the visible
  skip link, and link/back/forward navigation focuses and announces the `<h1>`.
- Demo banner touch targets: fixed; Reset is 120 × 44 px and Start for real is
  94 × 44 px at 390 px.
- Current landing copy evidence: the file matches the current landing source,
  but its “no flags” conclusion misses the new plain-word findings above.
- Stop-button contrast: fixed in source; live and packaged-theme Axe coverage
  passes.
- Service-worker cache/version, typecheck/lint gates, and 0.1.5 metadata:
  present and passing.
- Previously disclosed gaps: unsigned builds remain disclosed and tested. The
  missing German corpus remains material and is reopened as F-1-2.

## Structure, links, accessibility, and visual identity

- `/`, `/demo`, `/privacy`, and `/terms` return 200. A missing path returns a
  designed page with HTTP 404 and a working Return home action.
- Each route has one `<h1>`, one `<main>`, `lang="en"`, a distinct title, the
  correct canonical, meta description, OG/Twitter image metadata, SVG favicon,
  and apple-touch icon. F-1-8 and F-1-9 concern wording, not missing structure.
- Header/footer are consistent. Privacy and Terms are present. Every discovered
  internal route, asset, GitHub link, Param Factory link, and checkout link
  resolved; F-1-5 concerns disclosure of the checkout destination.
- Back/forward navigation restores the route, scrolls to the top, focuses its
  heading, and updates the polite route announcer.
- `/opt/fleet/lib/verify-url.sh` passed. Playwright Axe 4.13.0 found zero
  violations on landing, demo, privacy, and terms at 1280 and 390 px. The Axe
  CLI wrapper could not launch because `/usr/bin/chromedriver` is absent; the
  repository’s pinned Playwright/Axe integration supplied the equivalent scan.
- No horizontal overflow was found at 390 px. Reduced-motion, keyboard, dark
  theme, and touch-target checks pass in the full suite.
- The site is not a generic SaaS template. The paper lecture-room artwork,
  cream/ink/tomato/cobalt palette, Fraunces/Atkinson pairing, caption ribbons,
  asymmetric layout, and reduced-motion treatment match `.factory/design.md`.
- Production build output is 9.25 KB gzip JavaScript plus a 0.15 KB helper,
  below the 150 KB requirement. `npm test`, typecheck, lint/Clippy, and
  `npm run build` pass from the fresh clone; `dist/site` and `dist/app` exist.

## Missed leverage

No decorative AI, embedded provider key, or unjustified AI feature was found.
Adding a cloud AI step would weaken the local/offline job. TXT and SRT export
already cover the obvious portability need. The one material implied gap is
real German end-to-end verification, recorded as F-1-2; no additional feature
is required before that evidence exists.

## What would make this perfect

Resolve F-1-1 through F-1-17, then rerun this entire review from a fresh clone
and fresh browser contexts. In particular: narrow the “any Linux audio” claim,
prove German transcription with real speech, make the demo network sentence
match its same-origin test, ship the promised local deletion controls, verify
or rewrite the payment-party statement, label the external checkout, replace
metaphor/decorative headings, simplify the README, standardize “audio source,”
and correct the historical claim total. There is no remaining optional polish
list beyond those findings; PASS requires the follow-up review to find nothing
else.
