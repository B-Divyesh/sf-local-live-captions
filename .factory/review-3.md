# Adversarial first-read review 3

Reviewed 1 September 2026 against commit
`5d8a774cebafc08fd0f4b935690c7d0ec6fe0118` and the live site at
<https://local-live-captions.sociobot.in>.

## Verdict: FAIL

One blocking finding remains. The product is clear and usable on the public
site, but 12 of 26 registered claim commands fail from a fresh clone in this
sandbox. The claims contract requires every listed command to pass.

## Findings

### Blocking

#### F-3-1 — Native claim commands do not run in a clean checkout

- Exact location: `.factory/claims.json` entries `native-local-processing`,
  `capture-recovery`, `language-models`, `linux-system-audio`,
  `session-transcript`, `consent-before-capture`, `local-model-storage`,
  `source-start-validation`, `german-caption-end-to-end`, `no-audio-storage`,
  `linux-monitor-end-to-end`, and their shared test commands.
- Check performed: cloned commit `5d8a774` to a new directory, ran `npm ci`,
  then ran every `test` value in the claim inventory. `npm test`, the browser
  claim commands, and the focused unit commands passed. The eight exact
  `cargo test --manifest-path src-tauri/Cargo.toml <claim>` commands stopped
  while building `glib-sys` because `pkg-config` could not find `glib-2.0`.
  The four exact `npm run test:linux-audio` commands stopped with
  `Install pulseaudio before running this test.`
- Why this blocks acceptance: a verifier following the recorded claim command
  from a clean clone cannot confirm the local-processing, capture, language,
  consent, storage, monitor, English, or German outcomes. The README names
  host requirements, but the commands recorded as the claim contract do not
  provide a reproducible sandbox or setup step.
- Concrete fix: provide a repository-owned, pinned test environment that
  includes the required GLib, Tauri, and PulseAudio packages (for example a
  devcontainer or container-based claim runner). Change each affected
  `claims.json` `test` value to that reproducible command, then run all 12
  commands from a new clone and record their passing output. The command must
  set up its own prerequisites or fail before the claim inventory is used.

## Cold first screen

Fresh Chromium contexts at 390 x 844 and 1366 x 768 were opened without
scrolling. The first screen answers the three required questions.

| Viewport | What it does, in my words | For whom | First click | Check |
| --- | --- | --- | --- | --- |
| 390 x 844 | Captions Linux calls and recordings on the computer. | Deaf and hard-of-hearing students whose lecture, call, or recording lacks captions. | `Try it with sample data` | Pass. The action ends at 562.8 px; all three facts end at 780.7 px. |
| 1366 x 768 | Same. | Same. | `Try it with sample data` | Pass. The action ends at 574.7 px; all three facts end at 704.6 px. |

The exact first-read text is **“Caption Linux calls and recordings locally,”**
**“For deaf and hard-of-hearing students when lectures, calls, or recordings
have no captions,”** and **“Try it with sample data.”** The adjacent result is
**“Opens a private sample. Nothing is saved.”** No first-read finding is
raised.

## Copy audit

Word counts use whitespace-delimited words. Code blocks, URLs used as links,
and commands are not prose sentences. No audited sentence exceeds 22 words,
uses a banned marketing adjective, or has an unclear heading. Every landing
button names its result: `Try it with sample data`, `Stop captions`, `Pause
captions`, `Export TXT`, `Export subtitle file (.srt)`, `Reset demo`, `Start
for real`, `Buy supporter license`, and `Verify license`.

### Landing sentences

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
| 1 | 13 | For deaf and hard-of-hearing students when lectures, calls, or recordings have no captions. | — |
| 2 | 4 | Opens a private sample. | — |
| 3 | 3 | Nothing is saved. | — |
| 4 | 5 | Audio stays on your device. | — |
| 5 | 8 | The sample works offline after your first visit. | — |
| 6 | 7 | English and German speech models are free. | — |
| 7 | 15 | Paper sound waves fold into caption ribbons above a laptop in an empty lecture room. | Image alternative text; — |
| 8 | 10 | The app turns audio into captions on your computer. | — |
| 9 | 9 | Keep the resizable overlay above your lecture or call. | — |
| 10 | 6 | Adjust the words without stopping captions. | — |
| 11 | 9 | Gravity pulls the cloud inward while pressure pushes back. | Sample caption; — |
| 12 | 11 | Today we will trace how a star changes over its lifetime. | Sample caption; — |
| 13 | 4 | Choose an audio source. | — |
| 14 | 10 | A monitor source carries system audio through PipeWire or PulseAudio. | — |
| 15 | 8 | The app checks a monitor source before capture. | — |
| 16 | 4 | Choose English or German. | — |
| 17 | 6 | The model stays on this computer. | — |
| 18 | 6 | Confirm that everyone agreed to captions. | — |
| 19 | 4 | Stop at any time. | — |
| 20 | 8 | That balance can last for billions of years. | Sample caption; — |
| 21 | 11 | The app does not join calls, name speakers, or save audio. | — |
| 22 | 10 | It keeps transcript text only while the session is open. | — |
| 23 | 11 | English and German speech models, size controls, and transcript export stay free. | — |
| 24 | 12 | A supporter license helps fund updates; it does not unlock caption features. | — |
| 25 | 6 | The checkout link opens through Sociobot. | — |
| 26 | 9 | If it does not open, try again later. | — |
| 27 | 3 | Captions stay free. | — |
| 28 | 11 | Choose the package that matches your computer from the current release. | — |
| 29 | 4 | Current builds are unsigned. | — |
| 30 | 9 | Your system may ask you to confirm the download. | — |
| 31 | 8 | Caption Linux calls and recordings on your device. | — |
| 32 | 8 | Generated artwork disclosed in the design notes (external). | — |

Headings name their sections: `Resizable caption overlay`, `How it works`,
`Privacy and limits`, `Optional $24 supporter license`, and `Download for
Linux`. The terminology remains consistent: captions, transcript, audio
source, monitor source, speech model, consent, demo, and supporter license.

### README sentences

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
| 1 | 9 | Caption Linux calls, lectures, and recordings on your device. | — |
| 2 | 12 | Local Live Captions is a desktop overlay for deaf and hard-of-hearing students. | — |
| 3 | 17 | It turns a selected audio source into captions on your computer and exports SubRip (SRT) subtitle files. | — |
| 4 | 9 | Raw audio stays in memory and is not saved. | — |
| 5 | 6 | The public site is at <https://local-live-captions.sociobot.in>. | — |
| 6 | 6 | Open the isolated sample at <https://local-live-captions.sociobot.in/demo>. | — |
| 7 | 9 | Select an audio source exposed by the operating system. | — |
| 8 | 14 | On Linux, PipeWire or PulseAudio monitor sources appear when the sound server exposes them. | — |
| 9 | 8 | Download free English or multilingual German speech models. | — |
| 10 | 5 | Start only after confirming consent. | — |
| 11 | 7 | Read captions in an always-on-top, resizable overlay. | — |
| 12 | 6 | Change caption size while capture runs. | — |
| 13 | 6 | Export the current transcript as SRT. | — |
| 14 | 7 | Optionally buy a $24 one-time supporter license. | — |
| 15 | 6 | It does not lock caption features. | — |
| 16 | 7 | Whisper can mishear names and technical words. | — |
| 17 | 9 | Do not treat automatic captions as an official record. | — |
| 18 | 21 | Requirements: Node.js 22, Rust stable, Tauri 2 system packages, Linux ALSA development headers, and PulseAudio development headers for Linux monitor capture. | — |
| 19 | 12 | The desktop build needs the platform packages listed in the release workflow. | — |
| 20 | 10 | Speech model downloads use the listed `ggerganov/whisper.cpp` Hugging Face repository. | — |
| 21 | 10 | The bundled upstream MIT license copy is pinned in `third_party/whisper.cpp-LICENSE`. | — |
| 22 | 5 | `src-tauri/Cargo.lock` is committed on purpose. | — |
| 23 | 17 | It pins the Rust Tauri stack to the compatible 2.8 release used by the desktop JavaScript API. | — |
| 24 | 12 | Do not commit `src-tauri/target/` or `src-tauri/gen/`; both are generated during native builds. | — |
| 25 | 11 | The static output lands in `dist/site`, with `index.html` at its root. | — |
| 26 | 4 | Release verification sets `CI=1`. | — |
| 27 | 21 | Desktop and 390 px mobile tests run in separate Playwright processes, and every test receives a newly launched browser and context. | — |
| 28 | 10 | An unexpected Chromium exit gets one clean retry in CI. | — |
| 29 | 8 | Desktop installers are built only in GitHub Actions. | — |
| 30 | 12 | Tag the exact commit with the version from `package.json`, such as `v0.1.13`. | — |
| 31 | 8 | To rebuild, run the workflow for that tag. | — |
| 32 | 10 | The workflow resolves that tag to one commit before packaging. | — |
| 33 | 9 | It creates unsigned packages for macOS, Windows, and Linux. | — |
| 34 | 9 | It also publishes `SHA256SUMS` and `latest.json` with that commit. | — |
| 35 | 13 | The workflow audits their source identity, package list, URLs, and checksums after publication. | — |
| 36 | 15 | `build:release-site` stops before writing a deployable site when the checkout, tag, or generated `release-identity.json` disagree. | — |
| 37 | 17 | The site offers packages only when the release and deployed site use the same tag and commit. | — |
| 38 | 8 | The website makes no advertising or telemetry request. | — |
| 39 | 10 | Settings and the optional supporter-license token stay on the computer. | — |
| 40 | 5 | Model downloads contact Hugging Face. | — |
| 41 | 7 | License checks contact the Sociobot billing API. | — |
| 42 | 7 | Neither request includes audio or transcript text. | — |
| 43 | 15 | Desktop setup can delete a downloaded model and remove a supporter license from this computer. | — |
| 44 | 13 | The app opens PipeWire or PulseAudio monitor sources through the local PulseAudio-compatible server. | — |
| 45 | 6 | A monitor source carries system audio. | — |
| 46 | 13 | A monitor source must appear in `pactl list short sources` before capture starts. | — |
| 47 | 10 | The app also lists microphones reported by the operating system. | — |
| 48 | 16 | Before capture, the app confirms that a monitor source is still exposed by the sound server. | — |
| 49 | 9 | `npm run test:linux-audio` is the reproducible Linux acceptance run. | F-3-1 |
| 50 | 14 | The test creates an isolated PulseAudio output and plays the included public-domain JFK clip. | F-3-1 |
| 51 | 12 | It downloads `tiny.en`, checks captions and SRT output, then starts capture again. | F-3-1 |
| 52 | 14 | It opens the monitor before playing the original German clip and runs four captures. | F-3-1 |
| 53 | 11 | The multilingual `base` model must return a multiword, recognizable German caption. | F-3-1 |
| 54 | 14 | The test needs `pulseaudio`, `pulseaudio-utils`, and the Linux development packages in the release workflow. | F-3-1 |
| 55 | 7 | Fixtures stay local and are never uploaded. | F-3-1 |
| 56 | 8 | The source is available under the MIT License. | — |
| 57 | 7 | Read the site privacy policy and terms. | — |

The README flags are the same reproducibility evidence as F-3-1, rather than
new copy findings. All claim-like public sentences map to a current
`.factory/claims.json` entry; no unlisted-claim finding is raised.

## Demo and sandbox

- Landing to `/?demo=1` takes one click. The first screen after the click
  already contains a running sample, four realistic astronomy transcript lines,
  pause, size, TXT, and SRT controls.
- The persistent banner is exactly **“Demo — sample data, nothing is saved”**
  and includes `Reset demo` and `Start for real`.
- With a seeded `real:control` local-storage entry and `demo:review`
  session-storage entry, Reset removed the demo value, restored the sample,
  and retained the real value. Start for real removed the demo state and
  retained the real value.
- A fresh `/demo` flow requested only the product origin. The landing also
  requested public GitHub release metadata for its download control. No demo
  request reached another origin.

## Claim results

All 26 entries were invoked from the fresh clone. Browser claims and focused
unit claims passed, including `private-local`, `offline-reload`, `srt-export`,
`desktop-overlay`, `no-telemetry-trackers`, `storage-controls`,
`call-speaker-boundaries`, and `unsigned-installers`. `npm test` also passed:
25 Vitest tests and 24 browser checks passed, with four intentional skips.

The following exact declared commands failed before their product assertions:

| Claims | Exact command | Result |
| --- | --- | --- |
| `native-local-processing`, `german-caption-end-to-end`, `no-audio-storage`, `linux-monitor-end-to-end` | `npm run test:linux-audio` | Fail: `Install pulseaudio before running this test.` |
| `capture-recovery`, `language-models`, `linux-system-audio`, `session-transcript`, `consent-before-capture`, `local-model-storage`, `source-start-validation` | `cargo test --manifest-path src-tauri/Cargo.toml <listed claim filter>` | Fail: `pkg-config` could not find `glib-2.0`. |

`native-local-processing` has both command types in the inventory; both fail
for the stated missing native prerequisites. This is one blocking finding,
F-3-1.

## Earlier-history recheck

Every earlier review and polish record was read. The following checks confirm
the earlier copy, behavior, and code repairs remain present. F-3-1 prevents
the native tests from running in this sandbox; it does not restore an earlier
wording or interface defect.

| Earlier finding | Current live/code check | Status |
| --- | --- | --- |
| F-1-1 | Headline is `Caption Linux calls and recordings locally`. | Fixed |
| F-1-2 | English/German wording is bounded; German fixture and registered acceptance path remain in code. | Fixed in code; command blocked by F-3-1 |
| F-1-3 | Demo says it sends no data to other sites; request log confirmed same-origin demo traffic. | Fixed |
| F-1-4 | Merchant/refund language is absent; checkout wording is limited to Sociobot. | Fixed |
| F-1-5 | Checkout accessible name includes `external checkout`. | Fixed |
| F-1-6 | Overlay heading is `Resizable caption overlay`. | Fixed |
| F-1-7 | Payment heading is `Optional $24 supporter license`. | Fixed |
| F-1-8 | Privacy h1 is `Your audio stays on your computer`. | Fixed |
| F-1-9 | Unknown route returns HTTP 404 with h1 `Page not found`. | Fixed |
| F-1-10 | Artwork caption names on-computer caption processing. | Fixed |
| F-1-11 | Descriptive headings replaced decorative labels. | Fixed |
| F-1-12 | README opens in product language and defines SRT. | Fixed |
| F-1-13 | `audio source` is consistent; `monitor source` is defined. | Fixed |
| F-1-14 | Monitor explanation remains within 22 words. | Fixed |
| F-1-15 | Acceptance explanation is split into short sentences. | Fixed |
| F-1-16 | Handoff and inventory each state 26 claims. | Fixed |
| F-1-17 | Desktop setup still includes both deletion controls. | Fixed |
| F-2-1 | Browser renderer harness claims for recovery, overlay, and controls pass. | Fixed; native checks blocked by F-3-1 |
| F-2-2 | All three hero facts are inside both required first screens. | Fixed |
| F-2-3 | Offline wording states `after your first visit`. | Fixed |
| F-2-4 | `/privacy` → `How it works` focuses `#how-title`; Back focuses the privacy h1. | Fixed |
| F-2-5 | `model-provenance-license` is present in the inventory. | Fixed |
| F-2-6 | `release-artifacts` is present in the inventory. | Fixed |
| F-2-7 | Step heading is `Confirm consent and start captions`. | Fixed |
| F-2-8 | Labels use `processed on this computer` and `Export subtitle file (.srt)`. | Fixed |

## Structure, accessibility, and visual identity

- `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown route returns
  404 and offers `Return home`.
- Each checked route has `lang=en`, one h1, one main landmark, a route-specific
  title, description, canonical URL, Open Graph social image, favicon, skip
  link, consistent header, and footer links to Privacy and Terms.
- The direct deep-link and Back check restored focus correctly. No dead
  same-origin link was found. Response headers include CSP with
  `frame-ancestors 'none'`, `nosniff`, referrer policy, and a restrictive
  permissions policy.
- Axe found no violations on `/`, `/demo`, `/privacy`, `/terms`, or the 404
  route in dark mode at 390 px. Normal route loads had no console error; the
  deliberate 404 check emitted the expected failed-document message.
- The parchment/ink/tomato/cobalt palette, paper lecture-room scene,
  Fraunces/Atkinson pairing, asymmetric spread, caption-ribbon shape language,
  and motion policy match `.factory/design.md`. The result is distinct from a
  generic SaaS template.

## Missed leverage

No additional AI, sync, or import feature is required by the brief. The core
job is local speech captioning; adding a gateway step would weaken the stated
offline and privacy boundary. TXT and SRT exports already provide the implied
portable output.

## What would make this perfect

Make the 12 native claim commands reproducible from a new clone in a
repository-owned test environment, then rerun this entire review. After F-3-1
is resolved, the current public first read, demo, wording, route behavior,
accessibility, and visual identity are ready for a zero-finding review.
