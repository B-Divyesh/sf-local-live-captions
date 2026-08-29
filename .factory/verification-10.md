# Independent verification 10 — FAIL

Verified 29 August 2026 (UTC) from clean checkout candidate
`3d56e7f2b3492daccce2107532b6c41f4b661a75` against
<https://local-live-captions.sociobot.in>.

## Verdict

**FAIL — do not accept this candidate.** The previous stale-release defect is
repaired: the deployed site, tag, release manifest, installers, and published
desktop packages now identify this exact candidate. The candidate nevertheless
fails the mandatory cold first-screen contract at a common 1366 × 768 desktop
viewport. The audience sentence is cut off and the required **Try it with
sample data** action begins below the viewport, so a visitor cannot see what to
click first without scrolling.

No product code was modified during verification.

## Release-blocking defect

### Major — first action is below the fold at 1366 × 768

- A fresh Chromium context at 1366 × 768 opened the live `/` route with no
  stored state.
- The audience paragraph occupied y=727.22–792.19, so its final line was below
  the 768 px viewport.
- The **Try it with sample data** link occupied y=820.19–872.53 and was wholly
  below the viewport. The three facts began at y=908.53.
- Evidence: `evidence-verification-10-first-read-1366x768-fail.png`.
- This is non-monotonic responsive behavior. The compact desktop rule is
  `@media (min-width: 801px) and (max-height: 760px)`, so 1280 × 720 passes,
  while the common 1366 × 768 size misses the rule and renders the oversized
  five-line heading.

Required repair: make the audience sentence, sample action, action explanation,
and three plain facts fit without scrolling across ordinary desktop heights,
including 1366 × 768. Add that viewport to the first-screen browser test.

## Mandatory first-read test

The copy itself is plain and answers the required questions:

- What: “Caption Linux calls and recordings locally.”
- Who: “For deaf and hard-of-hearing students when lectures, calls, or
  recordings have no captions.”
- First click: “Try it with sample data,” beside “Opens a private sample.
  Nothing is saved.”

At 390 × 844 all of that copy, the action, and the three facts fit; the facts
end at y=780.67. One click opens a running sample with the persistent demo
banner. At 1440 × 900 the action fits but the three facts do not. At 1366 × 768
the audience sentence is clipped and the action is absent, which triggers the
work order's explicit automatic-fail rule. Passing mobile evidence is in
`evidence-verification-10-live-first-read-mobile.png`; the initial 1440 × 900
capture is `evidence-verification-10-first-read-desktop.png`.

## Mandatory claims gate

`.factory/claims.json` exists with 26 entries. As required, every listed command
was attempted before other setup in the untouched clone. Browser commands could
not find the uninstalled runner, native commands lacked the documented system
libraries, and the Linux acceptance command reported that PulseAudio was not
installed. After `npm ci` and installation of the exact Linux prerequisites
listed in the repository's release workflow, every one of the 26 claim entries
was executed exactly as declared and passed.

| Claims | Result and evidence |
| --- | --- |
| `private-local`, `offline-reload`, `srt-export`, `txt-export`, `live-caption-sizing`, `demo-isolated` | PASS — isolated browser demo, request log, offline service-worker reload, exports, size boundaries, and storage reset. |
| `free-and-paid`, `supporter-license-restore` | PASS — free-feature/$24 copy, live Sociobot checkout redirect, and recorded restore response. |
| `native-local-processing`, `german-caption-end-to-end`, `no-audio-storage`, `linux-monitor-end-to-end` | PASS — each shared command reran separately; isolated PulseAudio monitor, real local `tiny.en` and multilingual `base` models, English/German speech, SRT, restart, and unchanged model folder. |
| `capture-recovery`, `desktop-overlay`, `storage-controls` | PASS — renderer/native bridge error recovery, keep-on-top, deletion, and license removal. |
| `language-models`, `linux-system-audio`, `session-transcript`, `consent-before-capture`, `local-model-storage`, `source-start-validation` | PASS — focused Rust claim tests. |
| `no-telemetry-trackers`, `call-speaker-boundaries`, `unsigned-installers`, `model-provenance-license`, `release-artifacts` | PASS — focused browser and policy tests. |

The live landing, legal pages, desktop copy, and README were cross-checked
against the inventory. No material unlisted product claim was found.

## Clean install, tests, and production builds

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 66 packages, 0 vulnerabilities |
| `npm test` | PASS — 19 Vitest; desktop 23 passed/4 expected skips; mobile 24 passed/3 expected skips |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — TypeScript and Clippy with warnings denied |
| `npm run test:browser-lifecycle` | PASS — deliberate first Chromium SIGSEGV retried in a clean browser |
| `cargo fmt --check --manifest-path src-tauri/Cargo.toml` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS — 9 passed; 2 acceptance-only tests ignored as designed |
| `cargo check --manifest-path src-tauri/Cargo.toml` | PASS |
| `npm run test:linux-audio` | PASS — repeated for all four manifest entries using it |
| `npm run build` | PASS — produced `dist/site` and `dist/app` |
| `APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build` | PASS — AppImage, DEB, and RPM produced in 9m35s |

Tauri emitted its known `__TAURI_BUNDLE_TYPE` updater warning. The app does not
ship an updater.

## Smallest useful product and recovery paths

- The native acceptance test created an isolated PulseAudio sink, played the
  shipped English and German fixtures through its monitor, transcribed with
  downloaded local Whisper models, generated SRT, stopped, and opened capture
  again.
- The published v0.1.8 AppImage launched under Xvfb and remained open through
  the 15-second smoke timeout. With no host audio device it showed “No audio
  source found” and kept Start disabled.
- At a 390 × 844 native window, four keyboard Tabs placed the designed focus
  ring on **Load sample project**. Activating it opened the usable caption
  overlay with sample text, visible capture state, stop, size, pin, and export
  controls. Evidence:
  `evidence-verification-10-public-native-390-setup.png`,
  `evidence-verification-10-public-native-390-keyboard-focus.png`, and
  `evidence-verification-10-public-native-390-sample-click.png`.
- The live demo paused and resumed, accepted its 20 px and 42 px limits while
  capture remained active, exported a four-line TXT file and four-cue padded
  SRT file, and reset only `demo:` session data while preserving a `real:`
  control key.
- Empty license input produced “Enter the license token from your receipt.” A
  fresh invalid token returned HTTP 200 with `valid:false`, gave a recovery
  instruction, and was not stored.

## Accessibility, keyboard, and responsive QA

- Axe 4.13 found zero violations of any impact on `/`, `/demo`, `/privacy`,
  `/terms`, and the designed 404 in both light and dark modes.
- `/opt/fleet/lib/verify-url.sh` passed `/` and `/demo`; saved reports are under
  `.factory/qa/verification-10-home/` and
  `.factory/qa/verification-10-demo/`.
- Every route had `lang=en`, a route-specific title, one h1, one main, and no
  horizontal overflow. The intentional 404 returned HTTP 404 and otherwise
  passed the same structural/Axe checks.
- Keyboard Tab exposed the skip link first with a 3 px cobalt outline; Enter
  focused `main`. Space toggled captions and Home/End changed the range from
  20 to 42. History/focus behavior also passed the repository browser suite.
- At 390 px, no visible link, button, or input measured below 44 × 44 CSS px.
  All routes remained free of horizontal overflow at 200% text size.
- Reduced motion changed transitions and animations to 0.01 ms and disabled
  smooth scrolling.
- Normal live routes produced no console or page errors. Chromium logged only
  its expected failed-document message on the deliberate HTTP 404 route.

The 1366 × 768 first-screen failure remains the release blocker described
above.

## Privacy, headers, offline behavior, and endpoint limits

- The full live demo flow issued six same-origin requests and no request to
  another site. `/privacy` was also same-origin only. Landing contacted only
  the documented GitHub release API.
- Source review found native network access only for documented Hugging Face
  model downloads and Sociobot license verification. Capture samples remain in
  memory; the real native acceptance found no new raw-audio file.
- Live HTML sends CSP with `frame-ancestors 'none'`, HSTS, `nosniff`,
  strict-origin referrer policy, and camera/microphone/geolocation denial.
- HTML, service worker, and manifest revalidate after 30 seconds. Hashed JS/CSS
  use one-year immutable caching. `release-identity.json` uses `no-cache`.
- Service worker `llc-shell-v6` was active with no waiting worker. Its cache
  contained `/`, demo/legal routes, the built JS/CSS, local fonts, mobile hero,
  and favicon. An offline `/demo` reload remained operable.
- The Sociobot verification endpoint allowed 30 requests from one client in
  the observed window. Request 31 returned HTTP 429 with `Retry-After: 3` and
  `x-ratelimit-after: 3`. A later request with the live origin confirmed the
  expected CORS header and `Cache-Control: no-store`.
- No sign-in is required, so Entra authority validation is not applicable.

## Deployment, releases, and installability

- All 30 public files from `dist/site` byte-matched the live deployment.
  `staticwebapp.config.json` is hosting configuration and was correctly not
  treated as a public artifact.
- Deployed `release-identity.json`, annotated tag `v0.1.8`, the GitHub release
  `target_commitish`, and release `latest.json` all resolve to
  `3d56e7f2b3492daccce2107532b6c41f4b661a75`.
- GitHub Actions run `33273539176` for that SHA/tag completed successfully.
- The release contains AppImage, DEB, RPM, universal DMG/macOS archive, MSI,
  EXE, `SHA256SUMS`, and `latest.json`.
- Downloaded AppImage: 83,823,096 bytes; SHA-256
  `a7bd944bf9a0929f9a8ebdfc7e135c6101cbdbdc074bf39b82a9693483bbf1e5`.
  It matches published `SHA256SUMS`.
- The live `curl …/install.sh | sh` path installed that exact checksum with
  mode 755 into an isolated consumer directory.
- Live OS detection selected the AppImage for Linux, EXE for Windows, and DMG
  for macOS. All actionable links returned their expected successful response
  or the checkout's expected 303; the 404 page's skip link correctly remains
  within that 404 document.

## Performance

Successful fresh mobile Lighthouse run: performance 96, accessibility 100,
best practices 100, SEO 100; FCP 1.2 s, LCP 2.2 s, TBT 170 ms, CLS 0.012,
speed index 1.2 s.

The production build reports 9.77 KB gzip JS and 4.86 KB gzip CSS. The mobile
hero is 25,040 bytes and the three loaded font files total 71,352 bytes. The
observed mobile page resource transfer was 113,059 bytes. Applicable budgets
pass.

## Defects by severity

- Critical: none.
- Major: 1 — the mandatory audience/action content falls below the cold first
  screen at 1366 × 768.
- Moderate: none.
- Minor: 1 — an Android user agent is classified as Linux and offered an
  AppImage that Android cannot run; unsupported mobile OSes should get a
  desktop-download explanation instead.

## Evidence limits

The brief's 75% retention goal over 20-minute pilot recordings requires a
human pilot study and was not measured. The product makes no retention or
accuracy guarantee. Windows and macOS packages were release-manifest and
workflow checked; only the Linux AppImage could be launched in this worker.
