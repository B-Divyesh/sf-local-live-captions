# Independent verification 11 — FAIL

Verified 30 August 2026 (UTC) from clean checkout candidate
`f81f6c0eb051326dee835280bd25818c8a3d2b15` against
<https://local-live-captions.sociobot.in>.

## Verdict

**FAIL — do not accept this candidate.** The deployed static site exactly
matches the candidate and the previously reported first-screen defect is fixed.
However, the current `v0.1.9` release, tag, manifest, and packages identify the
older commit `6ec51c0352298721e6ef7905da7c1485ce526fab`. The candidate-bound site
correctly refuses those packages, leaving every supported desktop platform
without a download. The live one-line Linux installer exits 1 without
installing anything.

No product code was modified during verification.

## Release-blocking defect

### Major — no published installer matches the candidate

- Live `/release-identity.json` identifies `v0.1.9` and candidate
  `f81f6c0eb051326dee835280bd25818c8a3d2b15`.
- The annotated `v0.1.9` tag dereferences to
  `6ec51c0352298721e6ef7905da7c1485ce526fab`. The GitHub release
  `target_commitish` and published `latest.json` name that older SHA too.
- GitHub reports no Actions run for candidate `f81f6c0`. The existing release
  was published on 29 August for the older repair source.
- With fresh Linux, Windows, and macOS user agents, the live site says
  **“Downloads are being published. Check the release page”** and renders no
  platform download link. Evidence:
  `evidence-verification-11-download-linux.png`.
- Fresh Linux consumer test:
  `XDG_BIN_HOME=<empty temp dir> sh -c 'curl -fsSL
  https://local-live-captions.sociobot.in/install.sh | sh'` exited 1, printed
  the same publication message, and created no file.
- The release does contain AppImage, DEB, RPM, DMG, macOS archive, MSI, EXE,
  `SHA256SUMS`, and `latest.json`. The downloaded AppImage was 83,802,616
  bytes; SHA-256
  `7fefb71ae9de933feb02a3a82ad068213476c8b26979db32016e1b0786c5fbf8`
  matched `SHA256SUMS`, and it stayed open for the 15-second Xvfb smoke window.
  It is nevertheless an artifact for the wrong commit.
- The source difference from the release commit to the candidate is confined
  to factory evidence and handoff files, not product source. That does not
  satisfy the exact-candidate release contract, and the product's deliberate
  identity guard makes the mismatch an end-user installation failure.

Required repair: publish a release/tag/`latest.json` whose commit is exactly
`f81f6c0eb051326dee835280bd25818c8a3d2b15`, deploy the matching identity, and
verify real Linux, Windows, and macOS download links plus both one-line
installers from clean consumers.

## Mandatory first-read test — PASS

A cold 1366 × 768 Chromium page answered all three questions in plain words:

- What: “Caption Linux calls and recordings locally.”
- Who: “For deaf and hard-of-hearing students when lectures, calls, or
  recordings have no captions.”
- First click: “Try it with sample data,” beside “Opens a private sample.
  Nothing is saved.”

The audience, action, explanation, and three facts all fit without scrolling.
The last fact ended at y=704.64 px at 1366 × 768. It also fit at 1280 × 720
(y=669.48), 1440 × 900 (y=785.52), and 390 × 844 (y=780.67). One click opened
the active transcript and persistent **Demo — sample data, nothing is saved**
banner. Evidence:
`evidence-verification-11-first-1280x720.png`,
`evidence-verification-11-first-1366x768.png`,
`evidence-verification-11-first-1440x900.png`,
`evidence-verification-11-first-390x844.png`, and
`evidence-verification-11-demo-mobile.png`.

## Mandatory claims gate — PASS

`.factory/claims.json` exists with 26 entries. The manifest was read and every
listed command was attempted before broader QA. The untouched clone initially
had no installed JavaScript runner or Linux audio/build libraries. After
`npm ci` and installation of the repository's documented Ubuntu prerequisites,
every exact claim command passed. Each repeated `npm run test:linux-audio`
entry was run separately.

| Claims | Result and observable evidence |
| --- | --- |
| `private-local`, `offline-reload`, `srt-export`, `txt-export`, `live-caption-sizing`, `demo-isolated` | PASS — isolated demo request log, offline reload, real downloads, 20/42 px bounds, and demo-only reset. |
| `free-and-paid`, `supporter-license-restore` | PASS — free/$24 copy, checkout, restore validation, and recorded error path. |
| `native-local-processing`, `german-caption-end-to-end`, `no-audio-storage`, `linux-monitor-end-to-end` | PASS — four independent real PulseAudio-monitor runs using local `tiny.en` and multilingual `base` models, English/German fixtures, SRT, restart, and unchanged model storage. |
| `capture-recovery`, `desktop-overlay`, `storage-controls` | PASS — bridge failure recovery, always-on-top overlay, deletion, and license removal. |
| `language-models`, `linux-system-audio`, `session-transcript`, `consent-before-capture`, `local-model-storage`, `source-start-validation` | PASS — focused Rust claim tests. |
| `no-telemetry-trackers`, `call-speaker-boundaries`, `unsigned-installers`, `model-provenance-license`, `release-artifacts` | PASS — focused browser and policy tests. |

The landing page, legal routes, desktop app, and README were cross-checked with
the inventory. No material unlisted claim was found.

## Clean install, tests, and exact production builds

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 66 packages, 0 vulnerabilities |
| `npm test` | PASS — 19 Vitest; desktop 24 passed/4 skipped; mobile 25 passed/3 skipped |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — TypeScript and Clippy with warnings denied |
| `npm run test:browser-lifecycle` | PASS — the intentional first Chromium crash retried in a clean browser |
| `cargo fmt --check --manifest-path src-tauri/Cargo.toml` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS — 9 passed; 2 acceptance-only tests ignored |
| `cargo check --manifest-path src-tauri/Cargo.toml` | PASS |
| `npm run test:linux-audio` | PASS — independently repeated for all four manifest entries |
| `npm run build` | PASS — produced `dist/site` and `dist/app` |
| `APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build` | PASS — produced AppImage, DEB, and RPM |

Tauri emitted the known `__TAURI_BUNDLE_TYPE` updater warning. The application
does not ship an updater.

## Smallest useful product, boundaries, and recovery

- The real native acceptance path created an isolated PulseAudio sink, played
  shipped English and German speech through its monitor, transcribed locally,
  generated SRT, stopped, and started capture again. No audio file appeared.
- The candidate-built AppImage launched and remained open through a 15-second
  smoke timeout. With no host audio source it displayed **No audio source
  found**, kept **Start captions** disabled, and offered a recovery link.
- At a 390 × 844 native window, four Tabs placed a visible designed focus ring
  on **Load sample project**. Enter opened the usable overlay with sample
  captions, capture state, stop, size, pin, and transcript export controls.
  Evidence: `evidence-verification-11-native-setup-mobile.png`,
  `evidence-verification-11-native-focus-mobile.png`, and
  `evidence-verification-11-native-demo-mobile.png`.
- The web demo paused and resumed, accepted the 20 px and 42 px range limits,
  exported a four-line `sample-transcript.txt`, and exported a four-cue valid
  `sample-captions.srt`. Reset cleared `demo:` state while preserving a
  planted `real:` control key.
- Empty license input said “Enter the license token from your receipt.” A
  fresh invalid token returned `valid:false`, explained recovery, and was not
  stored. Checkout returned HTTP 303 to the hosted Dodo checkout.

## Accessibility, keyboard, responsive behavior, and links

- Axe 4.13 found zero serious or critical findings and zero findings overall
  on `/`, `/demo`, `/privacy`, `/terms`, and the designed 404, in light and
  dark modes.
- `/opt/fleet/lib/verify-url.sh` passed `/` and `/demo`; evidence is under
  `.factory/verify-url-11-home/` and `.factory/verify-url-11-demo/`.
- Every route had `lang=en`, a route-specific title, one h1, one main, header,
  footer, and no horizontal overflow. The missing route returned a real 404.
- Keyboard Tab exposed the skip link first with a visible 3 px cobalt ring;
  Enter focused `main`. Space toggled captions and Home/End changed size from
  20 to 42.
- At 390 px every visible control was at least 44 × 44 CSS px. Normal and 200%
  text had no horizontal overflow. Reduced motion reduced transitions and
  animations to 0.01 ms and disabled smooth scrolling.
- All live internal and external links returned 200 or the checkout's expected
  303. `robots.txt`, `sitemap.xml`, manifest, favicon, apple touch icon, and
  the 1200 × 630 social image returned 200.
- Normal routes produced no console or page errors. Chromium reported only the
  expected failed-document message for the deliberate 404 request.

## Privacy, headers, offline behavior, and endpoint allowance

- The complete demo flow made six same-origin requests: document, built
  JS/CSS, and three self-hosted fonts. It contacted no other origin. The
  privacy route was also same-origin only. The landing page contacted only the
  documented GitHub release API.
- Native source and behavior confine network use to documented model downloads
  and Sociobot license verification. Capture samples remain in memory.
- HTML returns HSTS, `nosniff`, strict-origin referrer policy, denied
  camera/microphone/geolocation permissions, and a CSP with header-only
  `frame-ancestors 'none'`.
- HTML uses `public, must-revalidate, max-age=30`; hashed assets use one-year
  immutable caching; `release-identity.json` uses `no-cache`.
- Service worker cache `llc-shell-v7` was active with no waiting worker. After
  `registration.update()`, a new offline `/demo` load worked and remained
  operable.
- A fresh client received 30 HTTP 200 invalid-license responses. Request 31
  returned HTTP 429 with `Retry-After: 4` and `x-ratelimit-after: 4`.
  Successful responses used exact-origin CORS and `Cache-Control: no-store`.
- No sign-in is required, so Entra authority validation is not applicable.

## Deployment identity and performance

- All 30 public files generated in `dist/site` byte-matched the live site.
  Hosting-only `staticwebapp.config.json` was correctly excluded. Thus the web
  deployment itself is the candidate; only its release artifacts are stale.
- Fresh mobile Lighthouse after retrying one Chromium tab crash: performance
  90, accessibility 100, best practices 100, SEO 100; FCP 1.23 s, LCP 1.51 s,
  TBT 393 ms, CLS 0.0031, speed index 1.23 s, transfer 113,151 bytes. Report:
  `evidence-verification-11-lighthouse.json`.
- Production site output: 9.90 KB gzip JavaScript and 4.87 KB gzip CSS. The
  mobile hero is 25,040 bytes and the three loaded WOFF2 files total 71,352
  bytes. All stated bundle budgets pass.

## Defects by severity

- Critical: none.
- Major: 1 — no installer is published for the exact candidate, so the live
  site exposes no platform download and the Linux installer exits 1.
- Moderate: none.
- Minor: none.

## Evidence limits

The brief's 75% retention goal over 20-minute pilot recordings requires a
human study and was not measured. The product does not claim that outcome.
Windows and macOS packages were inspected through their workflow, release
metadata, and integrity manifest; only Linux AppImages could be launched in
this worker.
