# Independent verification 13 — FAIL

Verified 30 August 2026 against candidate
`242656aeed034e3600ba3b98eafe47ea34249033` and
<https://local-live-captions.sociobot.in>.

## Verdict

**FAIL. Do not release this candidate.**

The deployed website bytes match the candidate, but the desktop product cannot
be downloaded through its primary install path. The live candidate identifies
itself as `v0.1.11` at `242656a…`, while the existing `v0.1.11` tag, GitHub
release, and `latest.json` identify `6b919f6…`. The site therefore renders
“Downloads are being published,” and its one-line Linux installer exits 1.
Both repository release-identity audits fail.

The paid checkout was also intermittently unavailable during verification.
It returned HTTP 500 on three direct requests and on both attempts made by the
exact `free-and-paid` claim test. It later recovered to the expected HTTP 303.
An intermittently broken advertised purchase action is not releasable, and the
contract explicitly makes any failed claim test release-blocking.

No product code was modified.

## Release-blocking findings

### Critical — no candidate-matched installer is available

- Live `/release-identity.json`: tag `v0.1.11`, commit `242656ae…`.
- Local candidate: `242656ae…`; `origin/main`: `242656ae…`.
- `v0.1.11^{}` and the GitHub release target: `6b919f6a…`.
- Published `latest.json`: commit `6b919f6a…`.
- `npm run verify:release-source -- v0.1.11`: **FAIL**, reporting that the tag
  resolves to `6b919f6a…` while the workflow is building `242656ae…`.
- `npm run verify:published-release`: **FAIL**, reporting both release and
  manifest commit mismatches.
- The live page shows “Downloads are being published.”
- `curl .../install.sh | sh` in an empty install directory: **FAIL**, exit 1,
  “Downloads for this site build are still being published.”

The older release assets themselves are internally intact: the downloaded
Linux DEB matched `SHA256SUMS`
(`2884bda8ee47b8b713928af7b695fee48fd25d7e9069d8373f87362de28acf15`)
and reports package `local-live-captions`, version `0.1.11`, architecture
`amd64`. They are not artifacts for the requested candidate.

### High — advertised supporter checkout failed its claim test

At 04:39 UTC, the checkout endpoint returned HTTP 500 three times in a row.
The exact manifest command below then failed on its initial attempt and retry:

```text
npm test -- --grep @claim:free-and-paid
Expected: 303
Received: 500
1 failed
```

At 04:52 UTC the endpoint recovered and returned HTTP 303 to a Dodo checkout
session. The recovery does not erase the observed production outage or failed
claim gate.

## Mandatory first checks

### Claims gate

`.factory/claims.json` exists with 26 entries. Every listed command was invoked
independently and in manifest order. In the untouched worker, 16 passed and 10
native entries could not start because PulseAudio and Tauri/GLib development
packages were absent. After installing the exact Linux prerequisites documented
in the repository and release workflow, all 10 native entries passed. The
checkout claim subsequently failed against the live billing service as detailed
above.

| Claim | Final evidence |
| --- | --- |
| `private-local` | PASS — demo requests remained same-origin. |
| `offline-reload` | PASS — controlled demo reloaded and operated offline. |
| `srt-export` | PASS — four valid numbered SubRip cues. |
| `txt-export` | PASS — four sample lines in `sample-transcript.txt`. |
| `live-caption-sizing` | PASS — 42 px while capture remained active. |
| `demo-isolated` | PASS — reset removed demo state and preserved real state. |
| `free-and-paid` | **FAIL** — live checkout returned 500 instead of 303 on both test attempts. |
| `supporter-license-restore` | PASS — recorded verification response, request, and storage. |
| `native-local-processing` | PASS with documented native prerequisites. |
| `capture-recovery` | PASS — visible error followed by successful retry. |
| `language-models` | PASS — exact English and German catalog. |
| `german-caption-end-to-end` | PASS — four real local German captures per invocation. |
| `linux-system-audio` | PASS — monitor-source parsing. |
| `desktop-overlay` | PASS — sample, resizing, and always-on-top bridge. |
| `no-audio-storage` | PASS — capture left model storage unchanged. |
| `session-transcript` | PASS — a new runtime session is empty. |
| `no-telemetry-trackers` | PASS — privacy route remained same-origin. |
| `consent-before-capture` | PASS — consent guard precedes capture. |
| `local-model-storage` | PASS — model path stays below app data. |
| `storage-controls` | PASS — delete-model bridge and license removal. |
| `source-start-validation` | PASS — missing monitor is rejected. |
| `call-speaker-boundaries` | PASS — no call or speaker-identification integration. |
| `unsigned-installers` | PASS — workflow has no signing path. |
| `linux-monitor-end-to-end` | PASS — real capture, SRT, stop, and restart. |
| `model-provenance-license` | PASS — pinned source and license checks. |
| `release-artifacts` | PASS only for its fixture; live candidate identity audit fails. |

No material landing-page or README claim was found outside the manifest.

### Cold first-read

**PASS at 1440 × 900 and 390 × 844.** The first viewport says:

- What: “Caption Linux calls and recordings locally.”
- For whom: deaf and hard-of-hearing students whose lectures, calls, or
  recordings have no captions.
- First click: “Try it with sample data,” followed by “Opens a private sample.
  Nothing is saved.”

The action is at y=595 on desktop and y=512 on mobile. One click opens a
working four-line sample with the persistent demo banner and active capture
state. Screenshots are in `verification-evidence-13/cold-*.png` and
`demo-*.png`.

## Build and automated checks

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 66 packages, 0 vulnerabilities |
| `CI=1 npm test` | PASS at 04:29 — 23 unit; desktop 24 passed/4 skipped; mobile 25 passed/3 skipped |
| Later exact `free-and-paid` claim rerun | **FAIL** — live checkout 500 on initial attempt and retry |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — TypeScript and clippy with warnings denied |
| `npm run test:browser-lifecycle` | PASS — expected injected crash recovered on retry |
| `cargo fmt --check` | PASS |
| `cargo test` | PASS — 10 passed, 2 hardware tests ignored by the normal suite |
| `cargo check` | PASS |
| all 10 native manifest invocations after prerequisites | PASS |
| `npm run build` | PASS — site and desktop renderer under `dist/` |
| `APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build` | PASS — DEB, RPM, AppImage |
| candidate AppImage smoke under Xvfb | PASS — stayed open for 15 seconds; timeout exit 124 |
| `npm run verify:release-source -- v0.1.11` | **FAIL** — tag points to older commit |
| `npm run verify:published-release` | **FAIL** — release and manifest point to older commit |

The Tauri bundler emitted its known `__TAURI_BUNDLE_TYPE` updater warning. No
updater is shipped.

## End-to-end, accessibility, privacy, and PWA evidence

- Demo pause/resume worked with Space; the state changed from “Capturing
  sample” to “Stopped” and back.
- SRT and TXT downloads contained all four sample captions. The SRT timestamps
  were valid and padded.
- Empty license input gave a specific next step. An invalid token was rejected
  and not stored.
- Reset removed `demo:caption-size` while preserving an independent
  `real:sentinel` value.
- `/`, `/demo`, `/privacy`, `/terms`, and the real HTTP 404 each have `lang=en`,
  one h1, one main landmark, route-specific titles, no missing image alt text,
  no unlabeled buttons, and zero serious/critical axe findings.
- Light and dark mobile demo scans both had zero serious/critical axe findings,
  zero sub-44-pixel interactive targets, and no horizontal overflow.
- The first Tab reaches the visible skip link; Enter moves focus to `main`.
  Focus has a visible 3 px solid outline.
- At 200% root text size, the 390 px demo retained zero horizontal overflow.
- Reduced motion yields `0.00001s` transitions and `scroll-behavior: auto`.
- The demo made no cross-origin requests. Normal routes produced no console,
  page, or failed-request errors. The landing makes only its documented GitHub
  release metadata request in addition to same-origin assets.
- The service worker controlled `/demo`, `registration.update()` completed,
  cache `llc-shell-v7` existed, and an offline reload retained the correct
  title, heading, and pause action.
- Response headers include CSP, HSTS, `nosniff`, strict-origin referrer policy,
  and camera/microphone/geolocation denial. HTML and `sw.js` revalidate after
  30 seconds; hashed assets are immutable for one year.
- The license-verify API allowed 30 requests from one client. Request 31
  returned HTTP 429 with `Retry-After: 4` and correct CORS origin.
- Sign-in is not used, so the Entra authority requirement is not applicable.

## Performance

Fresh Lighthouse 12.8.2 mobile results for the live landing page:

- Performance 97, accessibility 100, best practices 100, SEO 100.
- FCP 1.0 s, LCP 1.2 s, TBT 200 ms, CLS 0.012, total transfer 111 KiB.
- Production site JavaScript is 29,315 bytes raw total (9,869 bytes gzip for
  the main chunk); CSS is 18,493 bytes raw / 4,875 bytes gzip; hero WebP is
  54,804 bytes.

All stated static budgets pass. Local JS, CSS, and hero SHA-256 values exactly
match the live files, confirming that the deployed static UI matches the
candidate.

## Evidence

Machine-readable evidence and screenshots are under
`.factory/verification-evidence-13/`, including `live-independent.json`, the
reproducible `live-independent.mjs`, cold/demo screenshots, URL verifier output,
and `lighthouse.json`.

## Required next steps

1. Publish a new immutable version/tag and desktop artifacts for candidate
   `242656ae…` (do not move `v0.1.11`), deploy that same tag/commit identity, and
   make both release audit commands pass.
2. Diagnose the checkout's intermittent 500 response, then rerun the exact
   `free-and-paid` claim repeatedly from a clean context.
3. Rerun all 26 claim commands and the full verification matrix before release.

The brief's 75% retention target still requires a human 20-minute pilot and is
not claimed by the product. Windows and macOS packages cannot be launched in
this Linux worker.
