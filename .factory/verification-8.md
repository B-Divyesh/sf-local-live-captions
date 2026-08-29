# Independent verification 8 — PASS

Verified 29 August 2026 (UTC) from clean checkout commit
`51277bd13361574a26242c9577337e6273a7bef0` against
<https://local-live-captions.sociobot.in>.

## Verdict

**PASS — accept the candidate.** No release-blocking, major, moderate, or
minor product defect was found. The earlier deployment-only concern is closed
by fresh byte comparisons, live browser runs, published-release checks, and a
clean install of the production AppImage.

No product code was modified during verification.

## First-read gate

The cold live first screen passes in desktop Chromium and at 390 x 844:

- What it does: **“Caption Linux calls and recordings locally.”**
- For whom: **“For deaf and hard-of-hearing students when lectures, calls, or
  recordings have no captions.”**
- What to click: **“Try it with sample data,”** followed by “Opens a private
  sample. Nothing is saved.”

The mobile action was fully inside the first viewport at y=560.02 through
610.81 CSS px. One click opened `/?demo=1`, showed “Demo — sample data,
nothing is saved,” and immediately displayed a running astronomy caption
sample. Evidence: `evidence-8/first-read-desktop.png` and
`evidence-8/live-first-read-mobile.png`.

## Mandatory claims gate

`.factory/claims.json` exists and contains 24 entries. Each exact command was
run separately after `npm ci` and installation of the native packages listed
in the release workflow. All 24 passed.

The first command pass was intentionally attempted before dependency setup,
as requested. Those commands could not start their tests because a clean
source checkout does not contain `node_modules`, GLib development files, or
PulseAudio. After the repository's documented clean installation, every test
executed and passed; there was no assertion failure.

| Claim | Result | Fresh evidence |
| --- | --- | --- |
| `private-local` | PASS | Desktop and mobile browser runs; demo request log remained same-origin. |
| `offline-reload` | PASS | Controlled service-worker browser test and independent live offline reload. |
| `srt-export` | PASS | Four-cue `sample-captions.srt`; timestamp unit boundary tests passed. |
| `txt-export` | PASS | Four-line `sample-transcript.txt` contained the sample text. |
| `live-caption-sizing` | PASS | Running sample changed to 42 px without stopping. |
| `demo-isolated` | PASS | Reset and exit cleared `demo:` session keys while preserving real storage. |
| `free-and-paid` | PASS | Free-feature copy, $24 price, and live 303 Dodo checkout redirect passed. |
| `supporter-license-restore` | PASS | Recorded-verdict claim test passed; live invalid and empty inputs recovered correctly. |
| `native-local-processing` | PASS | Native network-boundary test passed. |
| `capture-recovery` | PASS | Native error-state and restart test passed. |
| `language-models` | PASS | Bundled English and multilingual German catalog test passed. |
| `german-caption-end-to-end` | PASS | Isolated PulseAudio monitor and 147.37 MB local base model produced recognizable German. |
| `linux-system-audio` | PASS | Native monitor-source parser test passed. |
| `desktop-overlay` | PASS | Resizable configuration and always-on-top command test passed. |
| `no-audio-storage` | PASS | Native storage-boundary test passed. |
| `session-transcript` | PASS | Native in-memory session lifecycle test passed. |
| `no-telemetry-trackers` | PASS | Source policy and live request-log checks passed. |
| `consent-before-capture` | PASS | Native consent guard test passed. |
| `local-model-storage` | PASS | Native app-data model-path test passed. |
| `storage-controls` | PASS | Model deletion and local-license removal test passed. |
| `source-start-validation` | PASS | Unavailable-monitor start guard passed. |
| `call-speaker-boundaries` | PASS | Dedicated Vitest policy check passed. |
| `unsigned-installers` | PASS | Dedicated release-workflow check passed. |
| `linux-monitor-end-to-end` | PASS | Real tiny.en monitor capture, captions, SRT, stop, and restart passed. |

The public site and README were cross-checked against the inventory. No
material unlisted product claim was found. The Hugging Face model card freshly
reported `license: mit`, matching the model-license copy.

## Clean source checks and builds

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 66 packages, 0 vulnerabilities |
| `npm test` | PASS — 15 Vitest tests; desktop 19 passed/3 expected skips; mobile 19 passed/3 expected skips |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — TypeScript plus Clippy with warnings denied |
| `npm run test:browser-lifecycle` | PASS — intentional first Chromium crash retried cleanly |
| `cargo fmt --check --manifest-path src-tauri/Cargo.toml` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS — 11 passed, 2 audio tests intentionally delegated and separately passed |
| `cargo check --manifest-path src-tauri/Cargo.toml` | PASS |
| `npm run test:linux-audio` | PASS twice through the claims manifest |
| `npm run build` | PASS — produced `dist/site` and `dist/app` |
| `APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build` | PASS — produced DEB, RPM, and AppImage |

The native build emitted Tauri's informational `__TAURI_BUNDLE_TYPE` warning;
the product does not ship or claim an in-app updater. Generated Linux bundles
were 5,437,262-byte DEB, 5,436,269-byte RPM, and 81,259,000-byte AppImage.

## End-to-end product checks

- The isolated audio acceptance path created a PulseAudio null sink, exposed
  its monitor, played the shipped JFK and German fixtures, ran the actual
  local Whisper models, produced captions, formatted SRT, stopped, and opened
  capture again.
- The locally built AppImage launched under Xvfb. Its no-device state clearly
  said “No audio source found” and kept Start captions disabled. At the 390 px
  minimum width, setup remained usable and the sample overlay fit without
  clipping. Four keyboard tabs plus Enter opened **Load sample project**; the
  resulting overlay remained live. Evidence:
  `evidence-8/local-appimage.png`,
  `evidence-8/local-appimage-390-setup-bottom.png`,
  `evidence-8/local-appimage-390-sample.png`, and
  `evidence-8/local-appimage-keyboard-sample.png`.
- The live demo paused/resumed, resized from 28 to 42 px, reset to 28 px,
  exported complete TXT and SRT files, and discarded demo session data on
  “Start for real.”
- Empty license input produced a specific instruction. A fresh invalid token
  received HTTP 200 with `valid: false`, displayed the recovery message, and
  was not stored.

## Accessibility, responsive behavior, and navigation

- Axe 4.13.0 found zero serious or critical findings on `/`, `/demo`,
  `/privacy`, `/terms`, and the 404 route. Dark-mode runs of all four normal
  routes had zero axe findings of any impact.
- Each route has `lang=en`, one h1, one main landmark, ordered headings, and a
  route-specific title. `/opt/fleet/lib/verify-url.sh` passed both `/` and
  `/demo` with zero console errors.
- Keyboard Tab reached the skip link first. It had a 3 px visible outline;
  Enter moved focus to `main`. SPA navigation, back, and forward restored the
  correct URL, title, content, and h1 focus.
- At 390 px, there was zero horizontal overflow before and after 200% text
  scaling. No visible link, button, or input measured below 44 x 44 CSS px.
- `prefers-reduced-motion: reduce` reduced transitions and animations to
  0.01 ms. Normal routes produced no console errors or failed requests. The
  intentional HTTP 404 creates Chromium's expected failed-document console
  entry only on the 404 route.

## Privacy, network, headers, and PWA

- A fresh `/demo` flow made 12 same-origin requests and zero external
  requests. It created only `demo:caption-size` in session storage, no local
  storage, and no cookie. Landing made the documented GitHub release-metadata
  request and no tracker or analytics request.
- Native source review found only the documented Hugging Face model downloads
  and Sociobot license verification. Audio is passed to local whisper.cpp and
  is not written to disk.
- Live HTML sends CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, strict
  origin referrer policy, and camera/microphone/geolocation denial. Normal
  routes return 200; an unknown route returns the designed 404.
- HTML, service worker, and manifest revalidate after 30 seconds. Hashed JS and
  CSS are immutable for one year.
- The active service worker was `/sw.js`; `registration.update()` completed
  without error. Cache `llc-shell-v5` contained the shell, demo/legal routes,
  built assets, fonts, hero image, and icon. The live demo reloaded and its
  pause control worked with the browser offline.
- The Sociobot verify endpoint allowed 30 requests from one client. Request
  31 returned **429** with `Retry-After: 3`. The product requires no sign-in,
  so Entra validation is not applicable.

## Performance and bundle budgets

Fresh mobile Lighthouse scores were performance 94, accessibility 100, best
practices 100, and SEO 100. LCP was 2.4 s, CLS 0.012, speed index 1.2 s, and
total blocking time 210 ms; INP is unavailable without field interaction.

The live cold mobile load transferred 9,812 bytes of JavaScript, 5,263 bytes
of CSS, 72,252 bytes of selected fonts, and a 25,340-byte hero image. The
fresh build reports 9.47 KB gzip JavaScript and 4.80 KB gzip CSS. All applicable
initial-load budgets pass.

## Deployment and release identity

The candidate is one documentation-only commit after release source commit
`4c24e8f0d6ebf5910acbd00b8ffe7840750ba643`; the only diff is
`.factory/handoff.md`. Fresh candidate-build `index.html`, every hashed asset,
the service worker, images, metadata, and installer scripts matched the live
deployment byte-for-byte. Representative hashes:

| File | SHA-256 |
| --- | --- |
| `index.html` | `198daaa202aaef87fd2bb805c1ca455637f2c5bcea62e43daff4d0bb87f6233c` |
| `index-bfWWOpYC.js` | `e7573c17a7ab640a2f67d37c690c8dc18a9e52d8da24f7941ce8f3003f18e67d` |
| `index-BBV9QEbN.css` | `e850f331f9ab295695b821c35b509e9595473b4496778a1e3d2931b20870eaf2` |
| `sw.js` | `7c443d5150e0561b672cc0d06c903dd1c75e501cdd29003250f3f6026079c109` |

GitHub Actions run `33259117240` passed verify, Ubuntu, Windows, macOS
universal, and manifest jobs. Release `v0.1.7` has AppImage, DEB, RPM, DMG,
macOS app archive, MSI, EXE, `SHA256SUMS`, and valid `latest.json`. Linux,
Windows, and macOS live buttons selected real OS-specific assets without
console errors.

The live `install.sh` was run into a fresh temporary directory. It downloaded
and checksum-verified the 83,802,616-byte AppImage. Its SHA-256 was
`b52204ab5b6375736e3f11513fbdd164e9c3c0459551d92a662ff4c92621fef5`,
matching the published checksum, and the installed application remained open
until intentionally stopped after 10 seconds.

## Defects by severity

- Critical: none.
- Major: none.
- Moderate: none.
- Minor: none.

## Known evidence limit

The researched 75% retention target across 20-minute pilot recordings needs a
human pilot study and was not measured in this repository. The product makes
no accuracy or retention-rate promise. Published desktop packages are
unsigned, which the site and README state before download.
