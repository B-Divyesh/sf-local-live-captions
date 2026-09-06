# Caption Linux calls and recordings locally — verification 20

## Verdict: PASS

The released desktop app and live site pass independent verification. There
are **zero findings** at every severity and **zero untested public claims**.

- Implementation reviewed: `541c7907f2805d2bcad10140520a50309b92b435`
- Documentation checkout: `b5e4aa0398a88cdd321abde15f6c3e93de97cbc4`
- Live release: `v0.1.20`
- Live URL: <https://local-live-captions.sociobot.in>

The documentation checkout differs from the implementation only in `.factory`
records and the handoff. The live release identity is exactly `v0.1.20` at
`541c7907f2805d2bcad10140520a50309b92b435`.

## First screen and sample

Fresh, storage-free desktop (1366 × 768) and phone (390 × 844) contexts both
showed these items before scrolling:

- Job: “Caption Linux calls and recordings locally.”
- Audience: deaf and hard-of-hearing students when a lecture, call, or
  recording has no captions.
- First action: “Try it with sample data.”

One click opened the astronomy sample with four realistic caption lines. The
“Demo — sample data, nothing is saved” label remained present after Reset demo.
Pause/resume and the 42 px caption size control worked. TXT export contained
four lines. Reset and Start for real removed only `demo:` session data and
preserved a seeded `real:` value. A fresh controlled service-worker context
reloaded the sample offline with all four captions.

Evidence: `.factory/verification-evidence-20/live-check.json` and the adjacent
phone, desktop, populated-demo, reduced-motion, and 195 CSS-pixel screenshots.

## Claims from a clean checkout

`npm ci` completed in a separate clean clone at the documentation SHA (66
packages, zero reported vulnerabilities). Each exact command in
`.factory/claims.json` was run. All 29 passed.

| Claim | Result |
| --- | --- |
| private-local | PASS |
| offline-reload | PASS |
| srt-export | PASS |
| txt-export | PASS |
| live-caption-sizing | PASS |
| demo-isolated | PASS |
| free-and-paid | PASS |
| supporter-license-restore | PASS |
| native-local-processing | PASS |
| capture-recovery | PASS |
| language-models | PASS |
| german-caption-end-to-end | PASS — four isolated real captures |
| linux-system-audio | PASS |
| desktop-overlay | PASS |
| no-audio-storage | PASS — real monitor capture traced across visible file paths |
| session-transcript | PASS |
| no-telemetry-trackers | PASS |
| consent-before-capture | PASS |
| local-model-storage | PASS |
| storage-controls | PASS |
| source-start-validation | PASS |
| call-speaker-boundaries | PASS |
| unsigned-installers | PASS |
| linux-monitor-end-to-end | PASS — local English monitor capture, SRT, and restart |
| model-provenance-license | PASS |
| release-artifacts | PASS |
| native-claim-environment | PASS |
| project-license | PASS |
| microphone-input-listing | PASS |

The documented runner installed its Debian/Ubuntu prerequisites itself. The
real English runs used local `tiny.en`; the German run used local multilingual
`base` and made four successful captures with networking disabled during each
capture. The isolated PulseAudio server reports harmless missing-DBus warnings
in this container; they did not affect any assertion.

## Quality, accessibility, privacy, and routes

- `npm test`: PASS — 35 unit tests; 24 desktop and 27 mobile browser tests,
  with only configured skips.
- `npm run typecheck`, `npm run lint`, Rust formatting, Rust tests, Rust check,
  and `npm run build`: PASS. Both `dist/site` and `dist/app` were produced.
- Fresh Axe checks found no serious or critical result on `/`, `/demo`,
  `/privacy`, `/terms`, or the designed 404 page.
- Every checked route has one `h1`, one `main`, `lang="en"`, and a route title.
  The valid routes return 200. `/not-a-real-route` deliberately returns HTTP
  404 and renders a complete page; this is expected behavior, not a defect.
- No unexpected console or page errors occurred. Keyboard Enter on the skip
  link moved focus to `#main`. Reduced motion had no active animations.
- At the 195 CSS-pixel reflow boundary for 200% text, scroll width and client
  width were both 195: no horizontal overflow.
- Direct demo privacy and telemetry claim tests passed. The live home page made
  only its documented GitHub Releases lookup in addition to self-hosted files.
  The live demo uses self-hosted application assets and fonts.
- CSP, HSTS, `nosniff`, strict-origin referrer policy, and a permissions policy
  denying camera, microphone, and geolocation were present on tested routes.
- The supporter-license integration allowed 30 invalid verification requests;
  request 31 returned HTTP 429 with `Retry-After: 0`.

## Release and installed artifact

`npm run verify:published-release` passed. It verifies `v0.1.20`, the exact
implementation SHA, seven platform assets, `SHA256SUMS`, and `latest.json`.

The live Linux installer ran in a fresh temporary consumer directory. It
verified its downloaded checksum and installed `local-live-captions`. The
installed AppImage remained running for 12 seconds under Xvfb. The worker has
no physical audio device, so its only output was expected ALSA/PulseAudio
device warnings.

## Earlier findings

All prior review and verification findings, including minor findings, are now
closed:

- Earlier candidate/release mismatches and unavailable downloads are closed by
  the matching v0.1.20 live identity, published-release verification, and the
  fresh installer smoke test.
- The earlier Linux package and AppImage concern is closed for the documented
  FUSE-less release path; the published AppImage installs and runs.
- The earlier 200% overflow is closed by the 195 CSS-pixel reflow check.
- The earlier no-audio-storage coverage gap is closed by the real capture test
  that traces filesystem paths and rejects unexpected successful writes.
- Earlier legal touch-target, unlisted payment-purpose, project-license, and
  microphone-capability findings are covered by current interaction and claim
  tests. The claim inventory now contains project-license and microphone-input-listing.
- Earlier first-screen, keyboard focus, model, German-caption, privacy,
  checkout, source-validation, and packaging findings are covered by the
  passing checks above.

## Known limitation

The macOS and Windows installers are intentionally unsigned. The site and
README disclose this. No further action is needed for this verification.
