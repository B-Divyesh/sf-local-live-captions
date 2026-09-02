# Independent verification 17 — FAIL

Verified on 2 September 2026 from clean candidate commit
`7188bacd897b1040d81772938c59afcb3a4d2384` against
<https://local-live-captions.sociobot.in>.

## Decision

**FAIL.** The deployed web site identifies the candidate, but the installable
desktop release and `latest.json` identify the older commit
`5a5d585503d23707cbf0fdb4a9301b9113463849`. In addition, a fresh exact Linux
production package build fails while bundling the AppImage. The candidate is
therefore not an end-to-end releasable desktop application.

## Release-blocking defects

### High — published desktop artifacts do not match the candidate

- Live `/release-identity.json` is
  `{"tag":"v0.1.17","commit":"7188bacd897b1040d81772938c59afcb3a4d2384"}`.
- Fresh `npm run verify:published-release` fails: the latest GitHub release and
  `latest.json` both identify `5a5d585503d23707cbf0fdb4a9301b9113463849`, not
  the candidate.
- This means the web download UI and any installed desktop package cannot be
  truthfully attributed to the deployed candidate.

Required repair: create a new immutable version/tag and all platform packages
from `7188bac…`, generate matching `latest.json` and `SHA256SUMS`, deploy the
site from that tag, then rerun the published-release verifier. Do not retag an
old release.

### High — fresh Linux AppImage packaging fails

The exact production command, run after the clean install, was:

```sh
env -u CI npx tauri build --bundles appimage,deb
```

It compiled the release binary successfully but ended with
`failed to bundle project: failed to run linuxdeploy` while producing
`Local Live Captions_0.1.17_amd64.AppImage`. Only a partial `.AppDir` remained;
there was no usable AppImage or DEB. The log also records a Tauri warning that
`__TAURI_BUNDLE_TYPE` could not be patched. This violates the desktop-app
production-build and installer requirements.

### Medium — text at 200% requires horizontal scrolling

At 390×844 the demo renders normally. At an effective 200% reflow viewport
(195 CSS px), fresh Playwright measurement reported `scrollWidth: 320` and
`clientWidth: 195`; the screenshot is
`verification-evidence-17/live-demo-200-percent-reflow.png`. The factory
accessibility contract requires 200% text resizing without loss, so the
320-pixel minimum layout needs a narrow/reflow treatment.

## Required first-read and demo gate

**PASS.** Cold desktop load returned HTTP 200 with no console errors.

- What it does: “Caption Linux calls and recordings locally.”
- Who it is for: “For deaf and hard-of-hearing students when lectures, calls,
  or recordings have no captions.”
- First action: visible “Try it with sample data” beside “Opens a private
  sample. Nothing is saved.”

One click to `/demo` showed the realistic astronomy captions and persistent
“Demo — sample data, nothing is saved” banner. Evidence:
`verification-evidence-17/live-cold-first-read.json` and
`live-demo-desktop.png`.

## Claims and clean-checkout checks

`.factory/claims.json` exists and contains 27 entries. After `npm ci`, every
exact declared command was executed independently from the demo entry point:
**27/27 passed**. The native English/German PulseAudio checks compiled from
scratch, downloaded their isolated models, ran real local transcription under
network tracing, and passed. Their only trailing messages were benign
PulseAudio DBus warnings from the disposable container.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 66 packages, 0 vulnerabilities |
| all 27 exact claims commands | PASS — logs in `verification-evidence-17/claim-*.log` |
| `npm test` | PASS — 28 unit tests; desktop E2E 24 passed/4 expected skips; mobile E2E 25 passed/3 expected skips |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — TypeScript and Clippy warnings denied |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS — 10 passed; 2 isolated-audio tests separately exercised by claims |
| `npm run build` | PASS — `dist/site` and `dist/app` produced; initial site JS 9.91 kB gzip and CSS 4.87 kB gzip |
| exact Tauri AppImage/DEB build | **FAIL** — `linuxdeploy` packaging failure described above |
| `npm run verify:published-release` | **FAIL** — current latest release/manifest point to `5a5d585…` |

The locally compiled release binary was also launched under Xvfb. It remained
open and visibly displayed the honest “No audio source found” recovery state
in this audio-less worker; evidence:
`verification-evidence-17/native-app-first-run.png`.

## Live product QA

- Candidate/live identity: PASS; `/release-identity.json` is exactly
  `7188bac…`.
- `/`, `/demo`, `/privacy`, and `/terms` return 200; an unknown route returns
  404. Response headers include CSP, HSTS, `nosniff`, strict-origin referrer
  policy, and a restrictive camera/microphone/geolocation permissions policy.
  HTML and service worker revalidate in 30 seconds; fingerprinted JS is
  one-year immutable cached.
- `/opt/fleet/lib/verify-url.sh` passed for `/demo`: title, `lang="en"`, one
  `h1`, `main`, no missing image alternatives, no unlabeled buttons, and no
  console errors. Axe injected through Playwright found zero serious/critical
  findings (40 checks passed).
- Keyboard: the visible skip link is first-focusable and Enter moves focus to
  `#main`. Invalid license input returns “This license is not active. Check the
  token or buy a supporter license.” No desktop or 390px console/page error was
  observed.
- Reduced motion: the media query matched and no animations remained. The PWA
  controller was `/sw.js`; `registration.update()` resolved; a new offline
  context reloaded `/demo` with its expected caption sample.
- Privacy: the fresh demo request log contains only same-origin document,
  script, stylesheet, font, and sample requests. Home makes the documented
  GitHub release API lookup; the Sociobot license endpoint is called only after
  explicitly verifying the entered token. No analytics, cloud audio upload,
  third-party scripts/fonts, or Azure endpoint was seen.
- License allowance: 30 consecutive invalid-license verification requests from
  one client returned 200; request 31 returned 429 with `Retry-After: 3`.
  Further requests remained rate-limited (evidence
  `verification-evidence-17/license-rate-limit.tsv`).
- Live mobile Lighthouse returned Performance 98, Accessibility 100, Best
  Practices 100, SEO 100; LCP 1.15 s and CLS 0.034. Lighthouse emitted a
  non-scoring BFCache `TARGET_CRASHED` warning while closing its tab.

## Evidence

All fresh outputs are in `.factory/verification-evidence-17/`, including claim
logs, build logs, headers, route screenshots, offline PWA result, axe result,
Lighthouse JSON, release-verifier failure, rate-limit result, and native-app
smoke screenshot.
