# Independent product verification — FAIL

Verified 28 August 2026 against candidate commit `a3d43bffd5d160571e01f8f20ebc4253f94187b5` and <https://local-live-captions.sociobot.in>.

## Decision

**FAIL — do not release this candidate.**

The first-read and browser demo gates pass, but the candidate cannot produce a desktop package from a clean checkout, the advertised paid checkout returns 404, the real caption path is not covered by the claim test and has concrete failure-state defects, long-session SRT output is invalid, and dark mode has serious axe failures.

## First-read test

Cold desktop load, fresh Chromium context, 1440 × 900:

- What it does: “Caption any Linux audio locally.”
- For whom: “For deaf and hard-of-hearing students when lectures, calls, or recordings have no captions.”
- What to click first: “Try it with sample data,” followed by “Opens a private sample. Nothing is saved.”
- Result: **PASS**. All three answers are on the first screen, and the sample is one click away.

Evidence: `evidence-first-read.png` and `verify-url/screenshot-desktop.png`.

## Mandatory claim tests

`.factory/claims.json` exists with five entries. Each exact command was run before broader QA:

| Claim | Exact command | Result | Evidence |
|---|---|---:|---|
| `private-local` | `npm test -- --grep @claim:private-local` | PASS | 2 project runs passed; demo had no cross-origin requests. |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS | 2 project runs passed; the controlled demo reloaded and remained operable offline. |
| `srt-export` | `npm test -- --grep @claim:srt-export` | PASS | Desktop Chromium passed; mobile intentionally skipped. Four sample cues and sample speech were asserted. |
| `demo-isolated` | `npm test -- --grep @claim:demo-isolated` | PASS | 2 project runs passed; reset removed the demo key and kept a real key. |
| `free-and-paid` | `npm test -- --grep @claim:free-and-paid` | PASS | 2 project runs passed; copy, price, and checkout-link shape were asserted. |

The claim contract still fails:

- The `private-local` test uses bundled text and never starts native audio capture. It cannot prove “Audio stays on your device” for the desktop product.
- The pricing test checks only the checkout URL string. The actual checkout returns HTTP 404.
- Unlisted landing/README claims include selectable system audio, a resizable always-on-top overlay, source validation, consent enforcement, German support, no saved audio, in-memory-only transcripts, no telemetry, and local-only settings/license storage.

## Clean-checkout gates

A separate clone at `/tmp/llc-qa.c0mDrB` was detached at the exact candidate SHA and began clean.

| Check | Result | Evidence |
|---|---:|---|
| `npm ci` | PASS | 66 packages installed; 0 vulnerabilities. |
| `npm test` | PASS on repeat | 2 Vitest tests passed; 14 Playwright tests passed; 2 intentional project skips. The first run had one Chromium SIGSEGV while creating a mobile context; the exact rerun passed. |
| `npx tsc --noEmit` | PASS | Exit 0. |
| `npm run build` | PASS | Produced `dist/site` and `dist/app`. |
| `cargo fmt --check --manifest-path src-tauri/Cargo.toml` | PASS | Exit 0. |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS with no tests | Compilation succeeded; 0 Rust tests ran. |
| `cargo check --manifest-path src-tauri/Cargo.toml` | PASS | Exit 0 after dependency resolution. |
| `CI=true npm run tauri build` | **FAIL** | Rust `tauri v2.11.5` does not match npm `@tauri-apps/api v2.8.0`. |

`src-tauri/Cargo.lock` is not tracked. The clean Rust run resolved 486 packages and selected newer Tauri crates, making native packaging non-reproducible. A direct command first rejected the container's `CI=1`; using the boolean value Tauri expects exposed the product mismatch above.

The release workflow runs `npm ci` followed by `tauri-action`; it does not run the test suite or typecheck.

## End-to-end and boundary behavior

Browser demo passes:

- One-click `/demo`, persistent banner, pause/resume, 20–42 px size bounds, four-cue SRT, four-line TXT, reset isolation, and offline reload all worked.
- Direct demo use made no cross-origin requests and produced no console/page errors.
- The active service worker updated successfully before offline reload.

Failures:

- Leaving via “Start for real” does not discard demo state. A stored caption size of 40 remained and was restored on return.
- SRT fails beyond 59 seconds. `{at:65,end:3661}` produced `00:00:65,000 --> 00:00:3661,000`, invalid for a lecture-length transcript.

Desktop evidence:

- The live Linux installer completed in a temporary consumer home, verified SHA256, and installed an 82,844,152-byte AppImage.
- AppImage SHA256 `78531e49e5dd9794eecf6f749032404713ab4c643c10799ff8f01b86c8c2b4a4` matches the release manifest.
- The extracted AppImage remained running under Xvfb for 12 seconds until intentional timeout. Only container portal/PipeWire warnings appeared.
- “Load sample project” showed captions, allowed size 48, and exported four SRT cues.

The real audio-to-caption job is not acceptable:

- Clean native packaging fails, and zero Rust tests cover capture, resampling, downloads, transcription, or recovery.
- `start_capture` marks the state running before device validation. Several errors do not reset it; retry then reports “Captions are already running,” while setup has no stop action.
- Stream construction/playback and transcription failures are discarded inside the worker thread after the command has returned success. The UI can say “Capturing” when no capture exists.

## Deployment and release identity

- Live `index.html`, `index-BC-rNCKX.js`, `index-ZTRBEf-0.css`, and `sw.js` hashes match the candidate's clean build byte-for-byte.
- Release v0.1.1 targets `84551dd9caaa4f8f1b2164499244a0e5ce7793bf`; its only diff to the candidate is three handoff links. Product code is identical.
- GitHub Actions run `33193693227` succeeded for Linux, Windows, universal macOS, and manifest jobs.
- `latest.json` lists seven platform assets. The Debian package matched SHA256 `59fe3fc017888c0f07065952e123389772afcf3510c1d43c3fd4debd5f2ffe9e`.

## Accessibility and responsive behavior

Passes:

- `/`, `/demo`, `/privacy`, `/terms`, and missing-page content have `lang=en`, a title, one `<h1>`, one `<main>`, and no missing image alt.
- Light-mode axe found no serious/critical issue on these routes at desktop or 390 px.
- Keyboard focus is a visible 3 px cobalt outline with a 6 px acid halo. Tested controls were operable without a pointer.
- Reduced-motion emulation produced no running animations; transitions reduced to 0.01 ms.
- No horizontal overflow occurred at 390 px or in a 200% text-size simulation.

Failures:

- Dark mode has serious axe contrast failures on the live landing and demo: primary buttons 1.99:1, demo banner 1.23:1, section labels as low as 1.84:1, and license controls 1.12:1.
- Desktop caption “Stop captions” is 4.19:1 (4.5:1 required) and that screen has no `<h1>`.
- Desktop dark setup selects are 1.46:1.
- At 390 px, nav links are 32 px high, footer links 25 px, and the wordmark 42 × 42 px, below the 44 px requirement.

Evidence: `evidence-mobile-light.png`, `evidence-desktop-dark.png`, and `evidence-desktop-app-caption.png`.

## Privacy, headers, and rate limiting

- Fresh direct demo use made only same-origin requests. No analytics, trackers, third-party fonts, console errors, or page errors were observed.
- The landing made one expected request to GitHub's release API. Source review found native network destinations limited to Hugging Face model files and Sociobot license checks; audio buffers go to local whisper.cpp.
- HTTPS returned 200; HTTP redirected 301 to HTTPS. HSTS, CSP, nosniff, strict referrer policy, and restrictive permissions policy were present.
- Sociobot verify allowed 30 requests from one client in the observed window. Request 31 returned 429 with `Retry-After: 4`.
- **FAIL:** checkout returned HTTP 404 with `{"error":"enabled factory product","status":404}`.
- **FAIL:** a returned `?license=` was stored and stripped but not verified on first load; zero `/verify` requests occurred.

No sign-in exists, so Entra External ID is not applicable.

## Performance, caching, and PWA

- Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100; FCP 1.4 s, LCP 2.1 s, TBT 0 ms, CLS 0, 114,948 bytes transferred.
- Initial JS: 24,436 bytes raw / 8.88 KB gzip. CSS: 17,136 bytes raw / 4.58 KB gzip. Loaded fonts: 71,552 bytes. Mobile hero: 25,040 bytes. Budgets pass.
- Service-worker activation, update, and offline demo reload passed.
- **FAIL:** hashed JS is served with `Cache-Control: public, must-revalidate, max-age=30`, not long-lived immutable caching.
- **FAIL:** unknown URLs show the 404 design with HTTP 200 instead of a real 404 response.

## Defects by severity

### Critical / release blocking

1. Clean native packaging fails because the untracked Rust dependency set no longer matches npm Tauri.
2. Paid checkout is HTTP 404, blocking Plus and German-model access.
3. Core privacy/native-caption promises are unlisted or not proved by their assigned demo-only test.

### Major

1. Serious axe contrast failures exist in dark mode and the desktop overlay.
2. SRT timestamps become invalid from 60 seconds onward.
3. Native capture can silently fail while showing “Capturing”; some start errors prevent recovery.
4. Multiple 390 px targets are smaller than 44 px.

### Moderate

1. Demo state persists after “Start for real.”
2. The caption screen lacks an `<h1>`.
3. Unknown routes return HTTP 200.
4. Hashed assets have a 30-second cache lifetime.
5. Returned licenses are not automatically verified.

## Evidence files

- `.factory/evidence-first-read.png`
- `.factory/evidence-desktop-light.png`
- `.factory/evidence-mobile-light.png`
- `.factory/evidence-desktop-dark.png`
- `.factory/evidence-desktop-app-caption.png`
- `.factory/verify-url/verify.json`
- `.factory/verify-url/screenshot-desktop.png`
- `.factory/verify-url/screenshot-mobile.png`
