# Independent verification 14 — FAIL

Verified 30 August 2026 against candidate commit
`003f7a396d6cf279326a9d5481ce4f1b82af43a1` and
<https://local-live-captions.sociobot.in>.

## Decision

**FAIL — do not release this candidate.**

The deployed static site is the requested candidate, but no immutable desktop
release matches it. The site advertises `v0.1.12` at `003f7a3…`; the latest
GitHub release and its `latest.json` identify `v0.1.12` at `2db4639…`.
Consequently the landing page correctly withholds its platform download and
the production installer refuses to install anything. That is a release-
blocking failure for this desktop app even though all local product and
accessibility checks passed.

## Release-blocking defect

### Critical — candidate-matched installer is not published

- Live `/release-identity.json`: `{"tag":"v0.1.12","commit":"003f7a396d6cf279326a9d5481ce4f1b82af43a1"}`.
- `v0.1.12`, the latest GitHub release, and its `latest.json`: commit
  `2db4639d4c28af7f964313d45cc69dfc264b7eb1`.
- `npm run verify:release-source -- v0.1.12` failed because the immutable tag
  is not the candidate.
- `npm run verify:published-release` failed on both release and manifest
  commit mismatches.
- The live download slot says “Downloads are being published” and provides no
  detected-platform package link. `install.sh` has the same identity guard and
  exits before installing a file.

The local candidate's produced `index-DIIh7Bk8.js` and
`index-DecVP1iZ.css` have the same SHA-256 values as their live counterparts;
this is a release-publication identity problem, not a stale landing bundle.

## First-read and demo gate

**PASS** on cold 1440 × 900 and 390 × 844 views.

- What it does: “Caption Linux calls and recordings locally.”
- For whom: deaf and hard-of-hearing students when lectures, calls, or
  recordings have no captions.
- First action: “Try it with sample data”; the adjacent explanation says it
  opens a private sample and nothing is saved.

The action was visible at y=595 desktop and y=512 mobile. One click opened
`?demo=1`, a persistent “Demo — sample data, nothing is saved” banner, four
sample captions, and the “Capturing sample” state. Evidence is in
`verification-evidence-14/live-cold-*.png` and `live-demo-*.png`.

## Claims gate

`.factory/claims.json` exists with 26 claims and 23 distinct exact commands.
All browser/policy commands passed on the first manifest run. The first six
native commands could not start because this disposable worker lacked the
repository-documented PulseAudio and Tauri development packages; after
installing the exact packages from the release workflow, every affected
command was rerun and passed. The final result for all claims is **PASS**:

| Claims | Result |
| --- | --- |
| `private-local`, `offline-reload`, `srt-export`, `txt-export`, `live-caption-sizing`, `demo-isolated` | PASS |
| `free-and-paid`, `supporter-license-restore`, `capture-recovery`, `desktop-overlay`, `storage-controls` | PASS |
| `native-local-processing`, `german-caption-end-to-end`, `linux-monitor-end-to-end`, `no-audio-storage` | PASS — isolated PulseAudio monitor, local Whisper, SRT, restart, and four German runs |
| `language-models`, `linux-system-audio`, `session-transcript`, `consent-before-capture`, `local-model-storage`, `source-start-validation` | PASS |
| `no-telemetry-trackers`, `call-speaker-boundaries`, `unsigned-installers`, `model-provenance-license`, `release-artifacts` | PASS |

The real German acceptance recognized multiword German sample speech. The
normal container D-Bus and absent-audio-device messages did not affect the
isolated monitor test. Command logs, including the post-prerequisite reruns,
are in `verification-evidence-14/claim-*.log`.

## Clean-checkout and native checks

All passed after `npm ci` (66 packages; no npm vulnerabilities):

| Check | Result |
| --- | --- |
| `CI=1 npm test` | PASS — 23 unit tests, 24 desktop browser tests, 25 mobile browser tests; only intended project skips |
| `npm run typecheck`, `npm run lint` | PASS |
| `npm run test:browser-lifecycle` | PASS — injected browser crash recovered cleanly |
| `cargo fmt --check`, `cargo test`, `cargo check` | PASS |
| `npm run build` | PASS — `dist/site` and `dist/app` |
| `APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build` | PASS — DEB, RPM, and 81,246,712-byte AppImage |
| AppImage smoke | PASS — stayed open under Xvfb for 15 seconds (expected timeout 124) |

The Tauri bundler emitted its known `__TAURI_BUNDLE_TYPE` updater warning;
this app does not ship an updater.

## Live UX, accessibility, privacy, and performance

- `/`, `/demo`, `/privacy`, `/terms`, and the real HTTP 404 have route-specific
  titles, `lang=en`, one h1, one main landmark, and no image-alt or unlabeled-
  button failures. The 404 navigation's expected HTTP error was the sole
  console entry on that route; normal routes had none.
- `/opt/fleet/lib/verify-url.sh` passed for both `/` and `/demo` with zero
  console/page errors. Playwright axe scans on the live routes found zero
  serious/critical findings. The full desktop/mobile suite verified skip-link
  order, visible focus, keyboard pause/resume/size controls, reduced motion,
  44 px mobile targets, and 390 px at 200% text size.
- A direct demo request log contained only same-origin requests. The landing's
  only extra request is its documented GitHub release metadata call. No
  third-party fonts, analytics, page errors, or tracker requests appeared.
- HTTPS headers include CSP with `frame-ancestors 'none'`, HSTS, nosniff,
  strict-origin referrer policy, and denied camera/microphone/geolocation.
  Hashed JS is `public, max-age=31536000, immutable`; HTML revalidates after
  30 seconds.
- The service-worker offline/demo and reset-isolation claims passed. No sign-in
  is used, so the Entra tenant condition is not applicable.
- The product-license verification endpoint allowed 30 invalid-token requests
  from one client; requests 31 and 32 returned `429` with `Retry-After: 4`.
- Fresh Lighthouse 12.8.2 mobile: performance 93, accessibility 100, best
  practices 100, SEO 100; FCP 1.20 s, LCP 1.35 s, TBT 318 ms, CLS 0.026,
  transfer 113,123 bytes. The production main JS is 29.23 kB raw / 9.91 kB
  gzip and CSS is 18.49 kB raw / 4.87 kB gzip, within static bundle budgets.

## Required next step

Publish a new immutable tag and complete desktop release for commit
`003f7a396d6cf279326a9d5481ce4f1b82af43a1`, or redeploy the site from the
existing immutable `2db4639…` release source. Then verify that the live
identity, GitHub release target, `latest.json`, landing download link, and
`install.sh` all name the same commit before release.

## Evidence

All command logs, headers, screenshots, URL-verifier reports, Lighthouse
output, and native build output are under `.factory/verification-evidence-14/`.
