# Independent verification 16 — FAIL

Verified on 1 September 2026 against candidate commit
`80ecfa4539967d063d22cf00abce8946ac0505fd` and
`https://local-live-captions.sociobot.in`.

## Decision

**FAIL — the desktop installers published for the live site are not built from
the candidate commit.**

The web product, demo, native caption path, accessibility, privacy, local
builds, and all 27 declared claims passed. The release contract still fails:
the deployed site identifies `80ecfa4539967d063d22cf00abce8946ac0505fd`,
while Git tag/release `v0.1.16`, `latest.json`, and every published package
identify `0ecd456533c7eaac81923580e7875c381e1b50ba`. Consequently, the live site
shows “Downloads are being published,” offers no detected-platform download,
and `/install.sh` exits without installing anything.

## Release-blocking defect

### High — no candidate-matched desktop release is installable

- Live `/release-identity.json`: `v0.1.16` at candidate `80ecfa4539967d063d22cf00abce8946ac0505fd`.
- Annotated Git tag `v0.1.16`: commit `0ecd456533c7eaac81923580e7875c381e1b50ba`.
- GitHub latest release target: `0ecd456533c7eaac81923580e7875c381e1b50ba`.
- Published `latest.json` commit: `0ecd456533c7eaac81923580e7875c381e1b50ba`.
- `npm run verify:published-release -- --expected-tag v0.1.16 --expected-commit 80ecfa...` fails with both release-commit and manifest-commit mismatches.
- `RELEASE_TAG=v0.1.16 npm run build:release-site` fails because the tag resolves
  to `0ecd456...`, not the candidate.
- The live page exposes zero `Download for …` links and shows “Downloads are
  being published.”
- The documented live Linux installer exits 1 with “Downloads for this site
  build are still being published”; it creates no installed file.
- GitHub reports no workflow run for candidate `80ecfa...`.

The old release is internally complete and its downloaded DEB matches
`SHA256SUMS` (`459c993364e23bf4f8a4a72fa13f3043785f8ce6ca843d26b69e333511e48b44`),
but that does not satisfy candidate-source identity.

Required repair: publish a new version/tag and desktop release from the exact
candidate to be accepted, generate matching `latest.json` and `SHA256SUMS`,
build/deploy the site from that immutable tag, then rerun the published-release
verifier and one-line installers. Do not move or reuse `v0.1.16`.

## First-read and demo gate

PASS on a cold 1440×900 load and at 390×844.

- What it does: “Caption Linux calls and recordings locally.”
- Who it is for: “For deaf and hard-of-hearing students when lectures, calls,
  or recordings have no captions.”
- What to click first: “Try it with sample data,” beside “Opens a private
  sample. Nothing is saved.”
- All three plain facts and the primary action fit in the 390×844 first screen.
- One click opens a running astronomy sample with four captions, persistent
  “Demo — sample data, nothing is saved” banner, Reset demo, Start for real,
  pause/resume, size control, TXT export, and SRT export.

Evidence: `verification-evidence-16/live-cold-desktop.png`,
`live-mobile-390.png`, `live-demo-after-one-click.png`, and
`live-regression/live-routes.json`.

## Claims gate

`.factory/claims.json` exists with 27 entries. After `npm ci` and exposing the
worker's installed Rust toolchain, every exact listed command passed: **27/27**.
The first native attempt encountered an interrupted host `dpkg` state and a
login PATH that omitted `/root/.cargo/bin`; after repairing those disposable
worker prerequisites, every affected command was rerun exactly and passed.

Coverage included:

- same-origin demo privacy, no telemetry, offline reload, and demo namespace isolation;
- valid four-cue SRT and four-line TXT exports;
- live 42 px caption sizing, pause/resume, overlay controls, capture recovery,
  storage removal, consent, and session boundaries;
- actual isolated PulseAudio monitor capture, local English transcription,
  export and restart;
- four actual German multilingual-model captures;
- model provenance, free/supporter copy, license restore, release fixture, and
  unsigned installer contract.

Per-claim outputs and the final status index are under
`verification-evidence-16/`.

## Clean-checkout quality gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 66 packages, 0 vulnerabilities |
| All 27 `.factory/claims.json` commands | PASS; 27/27 |
| `npm test` | PASS; 26 unit tests, 24 desktop E2E tests with 4 platform skips, 25 mobile E2E tests with 3 platform skips |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS, including Clippy with warnings denied |
| `npm run test:browser-lifecycle` | PASS; the deliberate first browser crash retried in a clean browser |
| `npm run test:linux-audio` | PASS; English plus four German monitor captures |
| `cargo fmt --check --manifest-path src-tauri/Cargo.toml` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS; 10 passed, 2 isolated-audio tests ignored here and passed separately |
| `cargo check --manifest-path src-tauri/Cargo.toml` | PASS |
| `npm run build` | PASS; produced `dist/site` and `dist/app` |
| `APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build` | PASS; DEB, RPM, and AppImage produced |
| Candidate AppImage Xvfb smoke launch | PASS; remained open until the expected 15-second timeout |
| `RELEASE_TAG=v0.1.16 npm run build:release-site` | **FAIL**; tag points to `0ecd456...` |
| Published-release verification for candidate | **FAIL**; release and manifest point to `0ecd456...` |

Locally produced Linux packages were 5,436,864-byte DEB, 5,436,483-byte RPM,
and 81,713,656-byte AppImage. The bundler emitted its known updater-variable
warning; the app has no updater, and packaging/runtime completed.

## Live product QA

- `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown route returns a
  designed HTTP 404. Every route has its own title, `lang="en"`, one `h1`, one
  `main`, and a route back.
- The factory URL verifier passes `/` and `/demo`: no console errors, missing
  image alternatives, or unlabeled buttons.
- Independent axe checks report zero serious/critical findings on all routes,
  including dark home/demo and the designed 404.
- Keyboard Tab reaches the visible skip link first. It has a 3 px focus outline;
  Enter moves focus to `main`. Demo controls work with Space/End, route changes
  restore focus, and no keyboard trap was found.
- At 390 px there is no horizontal overflow and every visible interactive
  target is at least 44×44 CSS px. At 200% text, demo overflow remains zero.
- Reduced-motion media matches and transition/animation durations reduce to
  `0.00001s`.
- Demo pause/resume, maximum caption size (42 px), reset, Start for real, TXT,
  and SRT work. SRT contains four cues and the expected sample content.
- The service worker activates, `registration.update()` completes, and the
  demo reloads and remains operable offline with all four captions.
- Normal flows produced no console or uncaught page errors.
- All normal links resolve. `mailto:` links are explicit; checkout returns a
  valid 303 to the hosted payment page.
- Blank/invalid license recovery does not store a token. A live invalid token
  returned `{valid:false, reason:"invalid"}` and plain retry guidance.

## Privacy, requests, and headers

- The entire live demo flow makes same-origin requests only.
- Privacy/terms make same-origin requests only. Home additionally requests only
  the documented GitHub release API.
- No analytics, ad tracker, third-party font/script, audio upload, Azure model
  endpoint, or unexpected origin was observed.
- HSTS, CSP, `X-Content-Type-Options: nosniff`, strict-origin referrer policy,
  and a camera/microphone/geolocation permissions policy are present.
- HTML and service worker use 30-second revalidation; release identity is
  `no-cache`; hashed assets use one-year immutable caching.
- The Sociobot license verifier allows 30 requests per client. Request 31
  returned 429 with `Retry-After: 4`.

There is no sign-in, application backend, server-side product state, or runtime
AI feature. Entra identity, SQLite/concurrency, and AI gateway checks are not
applicable.

## Performance and bundle budgets

Fresh live mobile Lighthouse:

- Performance 100, Accessibility 100, Best Practices 100, SEO 100
- FCP 1.2 s, LCP 1.4 s, TBT 30 ms, CLS 0.012
- Total transfer 111 KiB

Production output remains within budget: initial JS 29,233 bytes raw / 9.91 kB
gzip, CSS 18,493 bytes raw / 4.87 kB gzip, loaded fonts 71,352 bytes, mobile
hero 25,040 bytes, and desktop hero 54,804 bytes. Live/local hashes match:

- JS: `db226333b9f665046a2f4ffc36d7f144fcf243482971adf217a06b0eeeadcee4`
- CSS: `a50eb87757dcb88dfc208d2510b81f2ecf58424298a3a431b0c5fefd6f792059`

## Defects by severity

- Critical: none.
- High: 1 — candidate-matched desktop release is absent; downloads and the
  one-line installer are unavailable.
- Medium: none.
- Low: none.

## Known verification limits

- Published macOS and Windows package presence/checksums were inspected, but
  those old-release binaries were not executed in this Linux worker.
- The 75% keep-enabled success measure requires the planned 20-minute user
  pilot and is not an automated pre-release result.
