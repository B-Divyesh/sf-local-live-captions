# Independent verification 9 — FAIL

Verified 29 August 2026 (UTC) from clean checkout candidate
`108dc52d41d58cd6d6e1712646e2df7e6f26d0d5` against
<https://local-live-captions.sociobot.in>.

## Verdict

**FAIL — do not accept this candidate.** The live website is the candidate and
the product works in source builds, but the desktop packages offered to users
are from older tag `v0.1.7` at commit
`4c24e8f0d6ebf5910acbd00b8ffe7840750ba643`. Candidate product changes landed
later. An installable desktop product cannot pass while its primary downloads
do not match the candidate under review.

No product code was modified during verification.

## Release-blocking defect

### Major — live desktop downloads predate the candidate

- Candidate: `108dc52`, committed at `2026-08-29T17:59:46Z`; it is not
  contained by a release tag.
- Candidate-changing commit: `55210f7`, committed at `17:45:21Z`, modifies
  `src/main.ts`, `src/styles.css`, and `src-tauri/src/lib.rs`.
- Latest public release: `v0.1.7`, whose tag resolves to `4c24e8f`, committed
  at `15:01:22Z`. GitHub reports `target_commitish` as that same commit and the
  assets were published around `15:16Z`, before `55210f7` existed.
- The live download button and `/install.sh` install the `v0.1.7` AppImage,
  SHA-256 `b52204ab5b6375736e3f11513fbdd164e9c3c0459551d92a662ff4c92621fef5`
  (83,802,616 bytes).
- A fresh candidate build produced a different AppImage,
  SHA-256 `caf1f6fbc8b90c60a01dab100081b26d69d95256fa0f997d82f213ffdb5c4c39`
  (81,250,808 bytes). Build reproducibility alone is not assumed; the tag and
  timestamps independently prove the source mismatch.
- The mismatch is visible in the running binaries. The published setup says
  “Whisper models use the MIT License.” The candidate build says “See the
  bundled upstream MIT license.” Evidence:
  `evidence-verification-9-published-native-390-setup.png` and
  `evidence-verification-9-native-390-setup.png`.

Required repair: tag the candidate (for example `v0.1.8`), let the release
workflow publish all platform packages plus `SHA256SUMS` and `latest.json`,
then confirm the site selects that release and its tag resolves to the
candidate.

## Mandatory first-read gate — PASS

The cold first screen answers all three required questions in plain words:

- What: “Caption Linux calls and recordings locally.”
- Who: “For deaf and hard-of-hearing students when lectures, calls, or
  recordings have no captions.”
- First click: “Try it with sample data,” beside “Opens a private sample.
  Nothing is saved.”

At 390 x 844, the action ended at 562.81 CSS px and all three plain facts ended
at 780.67 px. One click opened `/?demo=1`, showed the persistent demo banner,
and displayed running sample captions. Evidence:
`evidence-verification-9-live-first-read-mobile.png`.

## Mandatory claims gate — PASS

`.factory/claims.json` exists with 26 entries. The first claim command was
attempted before dependency setup and correctly could not find `vitest` in a
clean checkout. After `npm ci` and installation of the exact Linux packages
listed in the release workflow, every distinct command in the manifest ran;
all 26 claim entries passed.

| Claims | Result and evidence |
| --- | --- |
| `private-local`, `offline-reload`, `srt-export`, `txt-export`, `live-caption-sizing`, `demo-isolated` | PASS — real browser demo, downloads, storage isolation, and offline reload. |
| `free-and-paid`, `supporter-license-restore` | PASS — $24/free copy, live 303 Dodo checkout, and recorded license restore path. |
| `native-local-processing`, `german-caption-end-to-end`, `no-audio-storage`, `linux-monitor-end-to-end` | PASS — isolated PulseAudio monitor, real local tiny.en/base models, English and German output, SRT, restart, and unchanged model folder. |
| `capture-recovery`, `desktop-overlay`, `storage-controls` | PASS — renderer/native bridge harnesses exercised errors, retry, always-on-top, model deletion, and license removal. |
| `language-models`, `linux-system-audio`, `session-transcript`, `consent-before-capture`, `local-model-storage`, `source-start-validation` | PASS — focused Rust tests. |
| `no-telemetry-trackers`, `call-speaker-boundaries`, `unsigned-installers`, `model-provenance-license`, `release-artifacts` | PASS — focused browser/unit policy tests; the current release contains all named asset families, though it is stale relative to this candidate. |

The live copy and README were cross-checked against the claim inventory. No
material unlisted product claim was found.

## Clean install, tests, and builds

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 66 packages, 0 vulnerabilities |
| `npm test` | PASS — 17 Vitest; desktop 22 passed/4 expected skips; mobile 23 passed/3 expected skips |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — TypeScript and Clippy with warnings denied |
| `cargo fmt --check --manifest-path src-tauri/Cargo.toml` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS — 9 passed; 2 monitor tests intentionally delegated to the acceptance script |
| `cargo check --manifest-path src-tauri/Cargo.toml` | PASS |
| `npm run test:browser-lifecycle` | PASS — intentional first Chromium SIGSEGV retried with a clean browser |
| `npm run test:linux-audio` | PASS — real English and German local transcription |
| `npm run build` | PASS — `dist/site` and `dist/app` produced |
| `APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build` | PASS — fresh DEB, RPM, and AppImage |

Tauri emitted the known informational `__TAURI_BUNDLE_TYPE` warning; this app
does not ship an updater.

## End-to-end behavior — PASS

- The native acceptance path created an isolated PulseAudio null sink, played
  both shipped speech fixtures through its monitor, transcribed locally,
  formatted SRT, stopped, and started capture again.
- The fresh candidate AppImage launched under Xvfb. With no audio device it
  showed a specific empty state and disabled Start captions. At 390 px, four
  keyboard Tabs exposed a designed focus ring on “Load sample project”; Enter
  opened the usable live overlay. Evidence:
  `evidence-verification-9-native-390-setup.png` and
  `evidence-verification-9-native-390-sample-keyboard.png`.
- The live demo paused/resumed, accepted the 20 px and 42 px boundary sizes
  while running, exported a four-line TXT file and four-cue valid SRT file,
  reset only `demo:` data, and preserved a control `real:` key.
- Empty license input gave a direct instruction. A fresh invalid token returned
  HTTP 200 with `valid:false`, displayed the recovery message, and was not
  stored.

## Accessibility and responsive QA — PASS

- Axe 4.13 found zero violations of any impact on `/`, `/demo`, `/privacy`,
  and `/terms` in both light and dark modes. The designed 404 had zero
  serious/critical findings.
- Every route has `lang=en`, a route-specific title, one h1, and one main.
  `/opt/fleet/lib/verify-url.sh` passed `/` and `/demo` with zero errors.
- Keyboard Tab reaches the skip link first. Its live focus outline is 3 px
  cobalt; Enter moves focus to `main`. Existing browser tests also pass range
  keyboard operation and SPA/history focus restoration.
- At 390 px there was no horizontal overflow, including at 200% text size.
  No visible interactive target measured below 44 x 44 CSS px.
- Reduced motion set transitions and animations to `0.00001s`.
- Normal routes produced no console or page errors. The deliberate HTTP 404
  produced only Chromium's expected failed-document console message.

## Privacy, PWA, headers, and server endpoint — PASS

- The complete `/demo` interaction log contained six same-origin requests and
  no external request. It stored only `demo:caption-size` in session storage,
  with no cookie or local-storage entry.
- `/privacy` was same-origin only. Landing contacted only the documented GitHub
  release API and cached release metadata for one hour. No analytics or tracker
  request appeared.
- Live HTML sends CSP (including `frame-ancestors 'none'`), HSTS, `nosniff`,
  strict-origin referrer policy, and camera/microphone/geolocation denial.
- HTML, manifest, and service worker use 30-second revalidation. Hashed JS/CSS
  use one-year immutable caching.
- Service worker `/sw.js` updated successfully. Cache `llc-shell-v5` contains
  the app/demo/legal shell, hashed assets, fonts, image, and icon. Offline demo
  reload and pause operation passed.
- The only server-side product call is the Sociobot license endpoint. One
  client received 200 for requests 1–30; request 31 returned 429 with
  `Retry-After: 4`.
- No sign-in is required, so Entra authority validation is not applicable.

## Performance and deployment identity — PASS for the website

Fresh mobile Lighthouse: performance 98, accessibility 100, best practices
100, SEO 100; FCP 1.2 s, LCP 1.4 s, CLS 0.012, total blocking time 150 ms,
and speed index 1.2 s.

The cold load transferred 9,755 bytes JS, 5,132 bytes CSS, 71,543 bytes fonts,
and 25,147 bytes images. The fresh build reported 9.63 KB gzip JS and 4.86 KB
gzip CSS. All applicable budgets pass.

All 29 publicly served files from `dist/site` matched live bytes. Hosting
correctly consumes rather than serves `staticwebapp.config.json`.
Representative SHA-256 values:

| File | SHA-256 |
| --- | --- |
| `index.html` | `be33acc297b5a3197cc18988c7f3a3668c751026a2b86034eee787535cdb7ce3` |
| `assets/index-i_6NcItE.js` | `8425960e5cb38c402ba0410d6221f6a4f7f2468d39ba1755d3ae72a67031d6ee` |
| `assets/index-DNyg_b_0.css` | `46111d8a4805aacfbd969bf42cf781063c24bf5f22a86263e4b75e4fadbf3fb9` |
| `sw.js` | `7c443d5150e0561b672cc0d06c903dd1c75e501cdd29003250f3f6026079c109` |

The public release has AppImage, DEB, RPM, DMG, macOS archive, MSI, EXE,
`SHA256SUMS`, and valid `latest.json`. The live installer verified its checksum
and the published AppImage remained open until the 10-second test timeout.
Those packages fail candidate identity as described above.

## Defects by severity

- Critical: none.
- Major: 1 — publicly offered desktop packages predate and do not match the
  candidate.
- Moderate: none.
- Minor: none.

## Evidence limits

The brief's 75% retention goal over 20-minute pilot recordings requires a
human pilot study and was not measured. The product makes no retention or
accuracy guarantee. Windows and macOS package presence was verified from the
release manifest; only Linux AppImages were launched in this worker.
