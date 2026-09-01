# Independent verification 15 — PASS

Verified on 1 September 2026 against candidate commit
`6c0e4798a5d3a65c32ab100d49ee420a60d78d83` and
`https://local-live-captions.sociobot.in`.

## Decision

**PASS — the candidate satisfies the acceptance contract.**

No critical, high, medium, or low severity defects were found. The previously
reported release-publication concern is resolved: the deployed site, build
identity, Git tag, GitHub release, manifest, installer, and published packages
all identify the candidate commit.

## First-read and demo gate

PASS on a cold 1280×720 visit and at 390×844:

- What it does: “Caption Linux calls and recordings locally.”
- Who it is for: the first screen names deaf and hard-of-hearing students whose
  calls, lectures, and recordings lack captions.
- What to click first: `Try it with sample data`, followed by “Opens a private
  sample. Nothing is saved.”
- The mobile primary action begins at y=512 and is visible without scrolling.
- One click opens a working sample with a persistent demo banner, four realistic
  astronomy transcript lines, pause/resume, caption-size control, reset/start
  actions, and TXT export.

Evidence: `verification-evidence-15/live-cold-first-read.png`,
`live-independent.json`, and `live-mobile-390-200-percent.png`.

## Claims gate

`.factory/claims.json` exists and lists 26 claims. Every listed command was run
from the candidate checkout through the documented demo entry point before the
broader QA pass. The pristine worker initially lacked installed npm modules and
Linux native build/audio prerequisites. After `npm ci` and installation of the
packages declared by the release workflow, every affected command was rerun
exactly. Final result: **26/26 claims passed**.

| Claim coverage | Result |
| --- | --- |
| Private sample mode, reset, and storage separation | PASS |
| Local-only demo requests and no audio upload | PASS |
| Offline shell/demo reload and service-worker update | PASS |
| English/German sample captions and transcript export | PASS |
| Keyboard use, focus, reduced motion, touch targets, and 200% text | PASS |
| License storage, validation, recovery, and cached verdict behavior | PASS |
| Linux system-audio capture, local English transcription, SRT/restart, and four German regression runs | PASS |
| Published release source and release-asset completeness | PASS |

The native Linux claim suite used an isolated PulseAudio monitor and local
Whisper inference. It confirmed English transcription, four German regression
runs, SRT export, and clean capture restart without uploading audio.

## Clean-checkout quality gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 66 packages, 0 vulnerabilities |
| `npm test` | PASS; 25 unit tests, 24 desktop browser tests, 25 mobile browser tests; documented platform-only skips |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS, including Rust clippy with warnings denied |
| `npm run test:browser-lifecycle` | PASS; deliberate first-attempt crash recovered on retry |
| `cargo fmt --check --manifest-path src-tauri/Cargo.toml` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS; 10 tests, 2 dedicated hardware tests ignored by design |
| `cargo check --manifest-path src-tauri/Cargo.toml` | PASS |
| `npm run build` | PASS; produced `dist/site` and `dist/app` |
| `APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build` | PASS |
| Built AppImage launch under Xvfb | PASS; remained open until the 15-second smoke-test timeout |

The first Tauri packaging attempt identified that the clean worker did not have
the workflow-declared `file` utility. Installing that prerequisite and rerunning
the exact command produced:

- DEB: 5,430,954 bytes
- RPM: 5,431,810 bytes
- AppImage: 81,705,464 bytes

The Tauri bundler printed an updater-related environment warning, but this app
does not ship or invoke an updater. It did not affect packaging or runtime.

## Live product, accessibility, privacy, and recovery

- `/`, `/demo`, `/privacy`, and `/terms` return 200 with route-specific titles,
  `lang="en"`, one `h1`, and a `main` landmark. A nonexistent route returns a
  designed HTTP 404 with a route-specific title and a way home.
- The factory URL verifier passed on `/` and `/demo` with no console errors.
- Independent axe runs found zero serious or critical issues on all public
  routes, the demo, dark treatment, and the designed 404.
- Keyboard-only use reaches the skip link first, then navigation and product
  controls. Focus has a 3 px outline and 6 px halo. No keyboard trap was found.
- All visible mobile targets meet 44×44 px. At 200% root text size the page has
  no horizontal overflow or lost controls.
- Reduced-motion preference matches and leaves no visible animated elements.
- Demo pause/resume, maximum caption size (42), TXT download, reset, and
  start-for-real recovery paths work. Export contained four lines and 204 bytes.
- The service worker controls the page, `registration.update()` completes, and
  an offline demo reload retains the banner and all four sample captions.
- No page or uncaught console errors occurred on normal routes. The deliberate
  404 check produced only the expected failed-resource message for its own 404.
- Demo, privacy, and terms traffic is same-origin only. Home also requests the
  documented GitHub release metadata endpoint. No analytics, trackers, CDN
  fonts, audio upload, Azure endpoint, or unexpected third party was observed.
- Empty and invalid license input gives plain recovery guidance. An invalid
  token is not stored.
- The public license verification allowance was confirmed without purchasing:
  requests 1–30 returned 200; request 31 returned 429 with `Retry-After: 3`.
- Response headers include HSTS, `X-Content-Type-Options: nosniff`, strict-origin
  referrer policy, restrictive permissions policy, and a CSP limited to self,
  GitHub release metadata, and the Sociobot billing API. HTML uses 30-second
  revalidation; hashed assets are immutable for one year.

No sign-in, server-side product state, runtime AI call, or application backend
exists, so Entra authority, SQLite persistence/concurrency, and AI gateway checks
are not applicable. The only server endpoint used by the product is the
documented Sociobot license service, whose allowance is reported above.

## Performance and release evidence

Live mobile Lighthouse:

- Performance: 95
- Accessibility: 100
- Best practices: 100
- SEO: 100
- FCP: 1.21 s
- LCP: 1.46 s
- TBT: 261 ms
- CLS: 0.012
- Total transfer: 113,143 bytes

Production build budgets pass: initial JS is 29,233 bytes raw / 9.91 kB gzip,
CSS is 18,493 bytes raw / 4.87 kB gzip, initial fonts total 71,352 bytes, desktop
hero art is 54,804 bytes, and mobile hero art is 25,040 bytes.

The live JS and CSS hashes exactly match the local production build:

- JS: `c2a004076237a030a963fad7f70833d8795be8ea586091d63a24802306868c4d`
- CSS: `a50eb87757dcb88dfc208d2510b81f2ecf58424298a3a431b0c5fefd6f792059`

`/release-identity.json`, tag `v0.1.13`, the GitHub release target, and the
published source verification all resolve to the candidate. The release has
Linux AppImage/DEB/RPM, universal macOS DMG/tarball, Windows EXE/MSI,
`SHA256SUMS`, and `latest.json`. A freshly downloaded published DEB matched its
listed SHA-256. The live Linux installer was run with an isolated destination;
it verified and installed an executable 83,798,520-byte static PIE binary.

## Defects by severity

- Critical: none
- High: none
- Medium: none
- Low: none

## Known verification limits

- macOS and Windows release packages were confirmed by manifest, source commit,
  presence, and checksums, but were not executed in this Linux worker.
- Desktop packages are unsigned pending the documented operator certificates.
- The product's 75% keep-enabled success measure requires the planned user pilot
  and is not a pre-release automated result.

Raw outputs, screenshots, headers, URL-verifier reports, and Lighthouse data are
under `.factory/verification-evidence-15/`.
