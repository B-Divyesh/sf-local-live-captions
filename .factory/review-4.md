# Adversarial first-read review 4

Reviewed 2 September 2026 against commit
`8d20bc9bbd587498b6e770e3195070b54c01b7b9` and the live product at
<https://local-live-captions.sociobot.in>.

## Verdict: FAIL

Five findings remain. One is blocking because a previously reported privacy
claim still lacks an observable test of its full storage boundary. Four new
findings cover mobile touch targets and public claims absent from the claim
inventory. PASS requires zero findings and no untested claim.

## Findings

### Blocking

#### F-2-1 — Reopened: the no-audio-storage test observes only one folder

- Exact claim/location: `.factory/claims.json`, `no-audio-storage`, **“The app
  does not save raw audio.”** The same promise appears on the landing page and
  in `README.md` line 5.
- Check performed: the exact command
  `npm run test:native-claim -- no-audio-storage` passed from the clean clone.
  The tagged test records real monitor audio, then compares only the filenames
  in `destination.parent()`, the speech-model folder, before and after capture.
  Its assertion message is **“capturing must not write raw audio beside the
  local model.”** It does not observe the app-data root, working directory,
  temporary directory, or system file writes.
- Why this remains blocking: F-2-1 required an observable filesystem comparison
  around real capture. The current check proves only that no new file appeared
  beside the model. It cannot prove the broader claim that raw audio is not
  saved anywhere, so the privacy claim remains partly untested.
- Concrete fix: run the built capture process in a fresh mount namespace or
  temporary home/app-data root, snapshot all writable locations before and
  after capture, and fail on any created audio file or unexpected write.
  Alternatively narrow the public claim and `claims.json` entry to the exact
  storage boundary the test observes.

### Major

#### F-4-1 — Legal-page email links are 20 px-high touch targets

- Exact locations: `/privacy` link **“privacy@sociobot.in”** and `/terms` link
  **“support@sociobot.in.”**
- Check performed: fresh mobile Chromium at 390 × 844 measured the interactive
  rectangles. They were 137 × 20 px and 143 × 20 px. Every other visible link,
  button, input, and select on the five checked routes met 44 × 44 px.
- First-time impact: a phone user must accurately tap a 20 px-high inline
  target. This misses the attached accessibility baseline of 44 px for every
  interactive element.
- Concrete fix: give legal-copy links an inline-flex or inline-block hit area
  with at least `min-height: 44px`, while retaining the visible link affordance.
  Add a 390 px test that measures every interactive rectangle on `/privacy`
  and `/terms`.

#### F-4-2 — The payment-purpose sentence is unlisted and untestable

- Exact quote/location: landing supporter section, **“A supporter license helps
  fund updates; it does not unlock caption features.”**
- Evidence: `free-and-paid` proves the price, free features, and checkout link.
  No `claims.json` entry or observable sandbox test proves how supporter money
  is used.
- First-time impact: a buyer may rely on the stated purpose of the payment.
  Checkout availability does not verify that purpose.
- Concrete fix: remove the untestable clause and use **“A supporter license is
  optional; it does not unlock caption features.”** Keep a funding-purpose
  statement only if the billing system exposes a testable allocation record.

#### F-4-3 — The project-license statement is absent from the claim inventory

- Exact quote/location: `README.md` line 84, **“The source is available under
  the MIT License.”**
- Evidence: a root `LICENSE` file exists, but no `.factory/claims.json` entry
  registers this legal statement. `model-provenance-license` covers the bundled
  upstream whisper.cpp license, not this application's license.
- First-time impact: contributors and distributors may rely on the declared
  license. The current claim gate can remove or change the root license without
  failing this statement.
- Concrete fix: add a `project-license` claim and one focused test that verifies
  the root MIT text and README link, or remove the sentence until it is
  inventoried.

### Minor

#### F-4-4 — Microphone support is an unlisted capability claim

- Exact quote/location: `README.md` line 80, **“The app also lists microphones
  reported by the operating system.”**
- Evidence: no `claims.json` entry names microphone enumeration. The
  `linux-system-audio` test passes a `pactl` fixture and asserts only one
  `.monitor` source; renderer tests mock only `pulse:classroom.monitor`.
- First-time impact: a reader can reasonably expect microphone inputs to
  appear, but the claim gate will not catch a regression in that path.
- Concrete fix: add a `microphone-input-listing` claim with an injectable native
  device-enumeration test that returns a microphone and a monitor, then asserts
  both appear. If microphone input is outside scope, delete the sentence.

## Cold first screen

Fresh Chromium contexts were opened without scrolling or stored site data.

| Viewport | What it does, in my words | For whom | What I should click first | Result |
| --- | --- | --- | --- | --- |
| 390 × 844 | It captions Linux calls and recordings on the computer. | Deaf and hard-of-hearing students whose audio has no captions. | `Try it with sample data` | Pass; the final fact ends at 781 px. |
| 1366 × 768 | Same. | Same. | `Try it with sample data` | Pass; the final fact ends at 705 px. |

The exact text that answered the three questions was **“Caption Linux calls
and recordings locally,”** **“For deaf and hard-of-hearing students when
lectures, calls, or recordings have no captions,”** and **“Try it with sample
data.”** The adjacent outcome, **“Opens a private sample. Nothing is saved,”**
was also visible. No first-screen blocking finding is raised.

## Copy audit

Counts use whitespace-delimited words. Hyphenated terms, code tokens, prices,
versions, and URLs count as one word. Code blocks are commands rather than
sentences. No sentence exceeds 22 words; the 32 landing sentences average 7.8
words and the 62 README sentences average 10.1 words. There are no banned
marketing adjectives. Necessary Linux and build terms appear in instructions
for users or contributors; `monitor source` and SubRip (SRT) are defined.

### Landing sentences

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
| 1 | 13 | For deaf and hard-of-hearing students when lectures, calls, or recordings have no captions. | — |
| 2 | 4 | Opens a private sample. | — |
| 3 | 3 | Nothing is saved. | — |
| 4 | 5 | Audio stays on your device. | F-2-1 test coverage |
| 5 | 8 | The sample works offline after your first visit. | — |
| 6 | 7 | English and German speech models are free. | — |
| 7 | 15 | Paper sound waves fold into caption ribbons above a laptop in an empty lecture room. | Image alternative text; — |
| 8 | 9 | The app turns audio into captions on your computer. | — |
| 9 | 9 | Keep the resizable overlay above your lecture or call. | — |
| 10 | 6 | Adjust the words without stopping captions. | — |
| 11 | 9 | Gravity pulls the cloud inward while pressure pushes back. | Sample caption; — |
| 12 | 11 | Today we will trace how a star changes over its lifetime. | Sample caption; — |
| 13 | 4 | Choose an audio source. | — |
| 14 | 10 | A monitor source carries system audio through PipeWire or PulseAudio. | Defines the term; — |
| 15 | 8 | The app checks a monitor source before capture. | — |
| 16 | 4 | Choose English or German. | — |
| 17 | 6 | The model stays on this computer. | — |
| 18 | 6 | Confirm that everyone agreed to captions. | — |
| 19 | 4 | Stop at any time. | — |
| 20 | 8 | That balance can last for billions of years. | Sample caption; — |
| 21 | 11 | The app does not join calls, name speakers, or save audio. | F-2-1 test coverage |
| 22 | 10 | It keeps transcript text only while the session is open. | — |
| 23 | 12 | English and German speech models, size controls, and transcript export stay free. | — |
| 24 | 12 | A supporter license helps fund updates; it does not unlock caption features. | F-4-2 |
| 25 | 6 | The checkout link opens through Sociobot. | — |
| 26 | 8 | If it does not open, try again later. | — |
| 27 | 3 | Captions stay free. | — |
| 28 | 11 | Choose the package that matches your computer from the current release. | — |
| 29 | 4 | Current builds are unsigned. | — |
| 30 | 9 | Your system may ask you to confirm the download. | — |
| 31 | 8 | Caption Linux calls and recordings on your device. | — |
| 32 | 8 | Generated artwork disclosed in the design notes (external). | — |

### Landing headings, labels, and actions

| Area | Copy and word count | Result |
| --- | --- | --- |
| Header | `Skip to content` (3); `Local Live Captions` (3); `Demo` (1); `How it works` (3); `Price` (1); `Privacy` (1) | Pass |
| First screen | `Caption Linux calls and recordings locally` (6); `Try it with sample data` (5); `Private` (1); `Offline` (1); `Free` (1) | Pass |
| Overlay | `Resizable caption overlay` (3); `Capturing` (1); `English · processed on this computer` (5); `Stop captions` (2); `Caption size` (2); `28 px` (2); `Export subtitle file (.srt)` (4) | Pass |
| How it works | `How it works` (3); `Choose the audio source` (4); `Download a speech model` (4); `Confirm consent and start captions` (5); `1 · Pick` (2); `2 · Confirm` (2); `3 · Read` (2) | Pass |
| Limits | `Privacy and limits` (3); `No cloud recording` (3); `Consent before capture` (3); `Resizable overlay` (2); `No perfect accuracy promise` (4) | Pass |
| Payment | `Optional $24 supporter license` (4); `Buy supporter license` (3); `Restore a supporter license` (4); `Verify license` (2) | Actions pass; sentence F-4-2 |
| Download/footer | `Download for Linux` (3); `See every download` (3); `Privacy` (1); `Terms` (1); `Built by Param Factory` (4) | Pass |

Every landing button or button-styled link starts with a result-naming verb.
Navigation labels are place names, not actions. Headings name their sections
without metaphor or mood copy.

### README sentences

| # | Line | Words | Sentence | Flag |
| ---: | ---: | ---: | --- | --- |
| 1 | 3 | 9 | Caption Linux calls, lectures, and recordings on your device. | — |
| 2 | 5 | 12 | Local Live Captions is a desktop overlay for deaf and hard-of-hearing students. | — |
| 3 | 5 | 17 | It turns a selected audio source into captions on your computer and exports SubRip (SRT) subtitle files. | — |
| 4 | 5 | 9 | Raw audio stays in memory and is not saved. | F-2-1 test coverage |
| 5 | 7 | 6 | The public site is at https://local-live-captions.sociobot.in. | — |
| 6 | 7 | 6 | Open the isolated sample at https://local-live-captions.sociobot.in/demo. | — |
| 7 | 11 | 9 | Select an audio source exposed by the operating system. | — |
| 8 | 11 | 14 | On Linux, PipeWire or PulseAudio monitor sources appear when the sound server exposes them. | — |
| 9 | 12 | 8 | Download free English or multilingual German speech models. | — |
| 10 | 13 | 5 | Start only after confirming consent. | — |
| 11 | 14 | 7 | Read captions in an always-on-top, resizable overlay. | — |
| 12 | 15 | 6 | Change caption size while capture runs. | — |
| 13 | 16 | 6 | Export the current transcript as SRT. | — |
| 14 | 17 | 7 | Optionally buy a $24 one-time supporter license. | — |
| 15 | 17 | 6 | It does not lock caption features. | — |
| 16 | 19 | 7 | Whisper can mishear names and technical words. | Necessary accuracy limit; — |
| 17 | 19 | 9 | Do not treat automatic captions as an official record. | Safety instruction; — |
| 18 | 23 | 21 | Requirements: Node.js 22, Rust stable, Tauri 2 system packages, Linux ALSA development headers, and PulseAudio development headers for Linux monitor capture. | Technical prerequisites; — |
| 19 | 31 | 12 | The desktop build needs the platform packages listed in the release workflow. | — |
| 20 | 31 | 10 | Speech model downloads use the listed ggerganov/whisper.cpp Hugging Face repository. | — |
| 21 | 31 | 10 | The bundled upstream MIT license copy is pinned in third_party/whisper.cpp-LICENSE. | — |
| 22 | 33 | 5 | src-tauri/Cargo.lock is committed on purpose. | — |
| 23 | 33 | 17 | It pins the Rust Tauri stack to the compatible 2.8 release used by the desktop JavaScript API. | — |
| 24 | 33 | 12 | Do not commit src-tauri/target/ or src-tauri/gen/; both are generated during native builds. | — |
| 25 | 37 | 5 | The factory build command is: | — |
| 26 | 43 | 11 | The static output lands in dist/site, with index.html at its root. | — |
| 27 | 59 | 4 | Release verification sets CI=1. | — |
| 28 | 59 | 21 | Desktop and 390 px mobile tests run in separate Playwright processes, and every test receives a newly launched browser and context. | — |
| 29 | 59 | 10 | An unexpected Chromium exit gets one clean retry in CI. | — |
| 30 | 63 | 7 | Desktop installers are built in GitHub Actions. | — |
| 31 | 63 | 12 | Tag the exact commit with the version from package.json, such as v0.1.18. | — |
| 32 | 63 | 8 | To rebuild, run the workflow for that tag. | — |
| 33 | 63 | 10 | The workflow resolves that tag to one commit before packaging. | — |
| 34 | 63 | 9 | It creates unsigned packages for macOS, Windows, and Linux. | — |
| 35 | 63 | 12 | Linux first proves a usable AppImage and DEB in a FUSE-less worker. | Technical release context; — |
| 36 | 63 | 9 | It also publishes SHA256SUMS and latest.json with that commit. | — |
| 37 | 63 | 13 | The workflow audits their source identity, package list, URLs, and checksums after publication. | — |
| 38 | 65 | 9 | Deploy the static site only from that checked-out tag: | — |
| 39 | 72 | 6 | deploy:release-site always runs build:release-site before uploading. | — |
| 40 | 72 | 16 | It stops before the uploader can see dist/site when the checkout, tag, or generated release-identity.json disagree. | — |
| 41 | 72 | 18 | The site offers packages only when the release, manifest, and deployed site use the same tag and commit. | — |
| 42 | 76 | 8 | The website makes no advertising or telemetry request. | — |
| 43 | 76 | 10 | Settings and the optional supporter-license token stay on the computer. | — |
| 44 | 76 | 5 | Model downloads contact Hugging Face. | — |
| 45 | 76 | 7 | License checks contact the Sociobot billing API. | — |
| 46 | 76 | 7 | Neither request includes audio or transcript text. | — |
| 47 | 76 | 15 | Desktop setup can delete a downloaded model and remove a supporter license from this computer. | — |
| 48 | 80 | 13 | The app opens PipeWire or PulseAudio monitor sources through the local PulseAudio-compatible server. | — |
| 49 | 80 | 6 | A monitor source carries system audio. | — |
| 50 | 80 | 13 | A monitor source must appear in pactl list short sources before capture starts. | — |
| 51 | 80 | 10 | The app also lists microphones reported by the operating system. | F-4-4 |
| 52 | 80 | 16 | Before capture, the app confirms that a monitor source is still exposed by the sound server. | — |
| 53 | 82 | 9 | npm run test:linux-audio is the reproducible Linux acceptance run. | — |
| 54 | 82 | 12 | Native claim commands use a pinned repository container when Docker is available. | — |
| 55 | 82 | 10 | Without Docker, they install the required Linux packages before testing. | — |
| 56 | 82 | 14 | The test creates an isolated PulseAudio output and plays the included public-domain JFK clip. | — |
| 57 | 82 | 12 | It downloads tiny.en, checks captions and SRT output, then starts capture again. | — |
| 58 | 82 | 14 | It opens the monitor before playing the original German clip and runs four captures. | — |
| 59 | 82 | 11 | The multilingual base model must return a multiword, recognizable German caption. | — |
| 60 | 82 | 7 | Fixtures stay local and are never uploaded. | — |
| 61 | 84 | 8 | The source is available under the MIT License. | F-4-3 |
| 62 | 84 | 7 | Read the site privacy policy and terms. | — |

README headings — `Local Live Captions`, `What works`, `Develop`, `Test and
build`, `Privacy and licensing`, and `Linux system audio` — name their sections.
The README has no buttons.

### Terminology

| Concept | One term used |
| --- | --- |
| On-screen speech text | captions |
| Full session text | transcript |
| Selectable input | audio source |
| System-output input | monitor source |
| Local recognition file | speech model |
| Permission from participants | consent |
| Isolated try-out | demo; sample means its bundled data |
| Optional payment | supporter license |

The catalog description, **“Caption Linux calls, lectures, and recordings on
your device,”** begins with a verb and is 63 characters.

## Demo and sandbox

- Landing to `/?demo=1` takes one click at both checked widths.
- The first screen after the click already shows `Capturing sample`, two large
  captions, and four realistic astronomy transcript lines.
- The persistent banner says **“Demo — sample data, nothing is saved”** and
  includes `Reset demo` and `Start for real`.
- Changing caption size created only `demo:caption-size` in session storage.
  Reset returned 42 px to 28 px, cleared that key, and restored all four lines.
- Seeded `real:review-marker` local storage and `real:session-marker` session
  storage survived Reset and Start for real. All `demo:` keys were gone after
  exit.
- A direct `/demo` request log contained only
  `https://local-live-captions.sociobot.in`. After service-worker control, an
  offline reload retained the title, h1, and four sample lines.
- The desktop renderer's `Load sample project` path is exercised by
  `@claim:desktop-overlay`; it loads the bundled sample into memory.

The demo itself passes. F-2-1 concerns the real desktop capture claim, not the
browser demo namespace.

## Claims results

The clean clone was `/tmp/llc-review4-clean.OktoTR/repo`. `npm ci` ran first.
Every exact `test` value in `.factory/claims.json` then ran separately. All 27
commands exited 0. The browser commands each ran their matching tagged test;
the SRT and TXT cases intentionally skip the mobile download project after
passing in desktop Chromium. Passing commands do not resolve the inadequate
storage boundary in F-2-1.

| # | Claim id | Exact command | Result |
| ---: | --- | --- | --- |
| 1 | `private-local` | `npm test -- --grep @claim:private-local` | PASS |
| 2 | `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS |
| 3 | `srt-export` | `npm test -- --grep @claim:srt-export` | PASS |
| 4 | `txt-export` | `npm test -- --grep @claim:txt-export` | PASS |
| 5 | `live-caption-sizing` | `npm test -- --grep @claim:live-caption-sizing` | PASS |
| 6 | `demo-isolated` | `npm test -- --grep @claim:demo-isolated` | PASS |
| 7 | `free-and-paid` | `npm test -- --grep @claim:free-and-paid` | PASS; F-4-2 is not in this claim |
| 8 | `supporter-license-restore` | `npm test -- --grep @claim:supporter-license-restore` | PASS |
| 9 | `native-local-processing` | `npm run test:native-claim -- native-local-processing` | PASS |
| 10 | `capture-recovery` | `npm test -- --grep @claim:capture-recovery` | PASS |
| 11 | `language-models` | `npm run test:native-claim -- language-models` | PASS |
| 12 | `german-caption-end-to-end` | `npm run test:native-claim -- german-caption-end-to-end` | PASS; four real captures |
| 13 | `linux-system-audio` | `npm run test:native-claim -- linux-system-audio` | PASS; microphone sentence remains unlisted |
| 14 | `desktop-overlay` | `npm test -- --grep @claim:desktop-overlay` | PASS |
| 15 | `no-audio-storage` | `npm run test:native-claim -- no-audio-storage` | Command PASS; coverage FAIL, F-2-1 |
| 16 | `session-transcript` | `npm run test:native-claim -- session-transcript` | PASS |
| 17 | `no-telemetry-trackers` | `npm test -- --grep @claim:no-telemetry-trackers` | PASS |
| 18 | `consent-before-capture` | `npm run test:native-claim -- consent-before-capture` | PASS |
| 19 | `local-model-storage` | `npm run test:native-claim -- local-model-storage` | PASS |
| 20 | `storage-controls` | `npm test -- --grep @claim:storage-controls` | PASS |
| 21 | `source-start-validation` | `npm run test:native-claim -- source-start-validation` | PASS |
| 22 | `call-speaker-boundaries` | `npm run test:unit -- --testNamePattern @claim:call-speaker-boundaries` | PASS |
| 23 | `unsigned-installers` | `npm run test:unit -- --testNamePattern @claim:unsigned-installers` | PASS |
| 24 | `linux-monitor-end-to-end` | `npm run test:native-claim -- linux-monitor-end-to-end` | PASS |
| 25 | `model-provenance-license` | `npm run test:unit -- --testNamePattern @claim:model-provenance-license` | PASS |
| 26 | `release-artifacts` | `npm run test:unit -- --testNamePattern @claim:release-artifacts` | PASS |
| 27 | `native-claim-environment` | `npm run test:unit -- --testNamePattern @claim:native-claim-environment` | PASS |

The governance test found one tag for every listed id. The independent live
request log confirmed the demo privacy claim. `npm run
verify:published-release` also confirmed `v0.1.18`, commit `f3eb675`, seven
packages, `SHA256SUMS`, and `latest.json`.

## Earlier-finding recheck

Every earlier review, polish report, and the existing handoff was read. Each
row below records both the live and repository check.

| Earlier id | Live confirmation | Code/test confirmation | Status |
| --- | --- | --- | --- |
| F-1-1 | Headline remains bounded to Linux calls and recordings. | Landing source matches; native monitor claim passes. | Fixed |
| F-1-2 | Landing names English and German models. | Four real German monitor captures passed. | Fixed |
| F-1-3 | Demo says it sends no data to other sites. | Fresh request log had zero cross-origin demo requests. | Fixed |
| F-1-4 | Merchant/refund assertions remain absent. | Copy and checkout test use only the Sociobot path. | Fixed |
| F-1-5 | Checkout accessible name includes `external checkout`. | Live endpoint returned a 303 to Dodo; tagged test passed. | Fixed |
| F-1-6 | Heading is `Resizable caption overlay`. | Landing source and heading outline match. | Fixed |
| F-1-7 | Heading is `Optional $24 supporter license`. | Landing source and payment test match. | Fixed |
| F-1-8 | Privacy h1 says audio stays on the computer. | Route metadata and legal source match. | Fixed |
| F-1-9 | Unknown URL shows `Page not found` and Return home. | Unknown URL returned real HTTP 404 through the configured override. | Fixed |
| F-1-10 | Figure caption says the app captions on the computer. | Source matches the rendered copy. | Fixed |
| F-1-11 | No numbered lore labels appear. | Semantic heading list contains only descriptive names. | Fixed |
| F-1-12 | README opens with the desktop-overlay job and defines SubRip. | Current README inspection matches. | Fixed |
| F-1-13 | `audio source` is consistent; `monitor source` is defined. | Landing and README terminology match. | Fixed |
| F-1-14 | Monitor explanation is split. | Longest README sentence is 21 words. | Fixed |
| F-1-15 | Acceptance explanation uses short sentences. | English and German native commands passed. | Fixed |
| F-1-16 | Existing handoff says 27 claims. | `claims.json` has 27 unique ids. | Fixed |
| F-1-17 | Privacy page names both removal controls. | Renderer storage-control test and native deletion core passed. | Fixed |
| F-2-1 | Privacy promises remain public. | Most observable harnesses pass, but no-audio-storage checks only the model folder. | **Reopened; blocking** |
| F-2-2 | All three facts fit at 390 × 844 and 1366 × 768. | Viewport rectangles ended at 781 px and 705 px. | Fixed |
| F-2-3 | Offline wording includes `after your first visit`. | Dedicated fresh-context offline reload passed. | Fixed |
| F-2-4 | Privacy → How it works focused `#how-title`; Back focused the privacy h1. | History handler and live focus states match. | Fixed |
| F-2-5 | Model provenance wording remains bounded. | Pinned repository/license claim passed. | Fixed |
| F-2-6 | Current release link resolves. | Artifact claim and live published-release verifier passed. | Fixed |
| F-2-7 | Step heading is `Confirm consent and start captions`. | Source and live outline match. | Fixed |
| F-2-8 | UI says `processed on this computer` and expands subtitle-file output. | Live labels and SRT claim passed. | Fixed |
| F-3-1 | No live regression depends on native setup. | All self-provisioning native commands passed from the clean clone. | Fixed |

## Structure, accessibility, and visual identity

- `/`, `/demo`, `/privacy`, and `/terms` returned 200. An unknown route returned
  404 with the designed shell and a home action.
- Every checked route had `lang=en`, one h1, one main landmark, a specific title
  and description, a canonical URL, Open Graph/Twitter metadata, the 1200 × 630
  product image, SVG favicon, and 180 × 180 Apple touch icon.
- Titles follow the required pattern and stay below 60 characters. Heading
  levels do not skip.
- Header, footer, Privacy, Terms, factory attribution, and version/build id are
  consistent across routes. Internal links returned 200, fragment targets
  existed, mail links were exempt, and external links returned 200 or an
  expected redirect. The 404 page's self skip-link correctly remains on the
  404 document.
- Focus moved to the destination heading across a deep section link and Back.
  The skip link works. Reduced-motion media produced effectively zero button
  transition duration and `scroll-behavior: auto`.
- Axe found zero violations on all five routes in 390 px dark mode. There was no
  horizontal overflow at 390 px or the 195 CSS-px equivalent of 200% zoom.
  F-4-1 is the separate measured target-size failure.
- Normal routes produced no console errors. The deliberate 404 navigation
  emitted only the browser's expected failed-document 404 message.
- Response headers include CSP with header-only `frame-ancestors 'none'`, HSTS,
  `nosniff`, Referrer-Policy, and Permissions-Policy. The live JavaScript is
  29,233 bytes before gzip.
- The parchment/ink/tomato/cobalt palette, generated paper listening-room art,
  Fraunces/Atkinson pairing, asymmetric editorial spread, and caption-ribbon
  shapes match `.factory/design.md`. The site does not resemble a generic SaaS
  hero or three-card template.
- `/opt/fleet/lib/verify-url.sh` passed after receiving its required output
  directory. The unfiltered `npm test` passed 30 unit tests plus 24 desktop and
  26 mobile tests, with expected skips. `npm run typecheck`, `npm run lint`, and
  `npm run build` passed; `dist/site` and `dist/app` were produced.

## Missed leverage

No additional AI, sync, or import finding is raised. Local speech recognition
is the core job; a gateway transcription step would weaken the explicit local
and offline boundary. Playing a recording through the selected system-audio
source covers the brief's smallest useful product, and SRT plus demo TXT export
cover the implied portability need. No provider or Azure key is embedded.

## What would make this perfect

Close F-2-1 with an all-writable-location no-audio-persistence test. Increase
both legal email hit areas to 44 px. Remove or register and test the funding,
project-license, and microphone statements. Then rerun every claim command,
the mobile target-size check, and the entire review from a clean clone. There
is no additional optional polish list; a perfect result has zero findings.
