# Caption Linux calls and recordings locally — review 5

## Verdict: PASS

The live site and released desktop app pass this strict review with **zero
findings** at every severity and **zero untested public claims**.

- Implementation reviewed: `541c7907f2805d2bcad10140520a50309b92b435`
- Documentation checkout reviewed: `0aae941b1a4d143a65db0335f480f19dbe081cf0`
- Release: `v0.1.20`
- Live URL: <https://local-live-captions.sociobot.in>

The later documentation commit does not change product files. The live site,
release manifest, tag, and installed Linux artifact all identify the
implementation commit above.

## First screen and sample

Fresh, storage-free browsers were opened without scrolling at 1366 × 768 and
390 × 844. Both showed:

- Job: “Caption Linux calls and recordings locally.”
- Audience: deaf and hard-of-hearing students whose lecture, call, or
  recording has no captions.
- First action: “Try it with sample data.”
- Three facts about local audio, offline sample use after the first visit, and
  free English and German speech models.

One click opened the astronomy sample. The first demo screen already contained
four realistic caption lines. Pause and resume worked, caption size changed to
42 px while the sample remained active, TXT contained four lines, and SRT
contained four cues.

The “Demo — sample data, nothing is saved” label remained visible after
**Reset demo**. Reset and **Start for real** removed `demo:` session data while
preserving a seeded `real:` value. A separate service-worker context reloaded
the four-line demo offline and its pause control still worked.

Evidence: `.factory/review-evidence-5/live-review.json` and the adjacent fresh
phone, desktop, populated-demo, dark/reduced-motion, and 195 CSS-pixel images.

## Public claims

The live landing page, demo, legal routes, installed app, README, and
`.factory/copy-audit.md` were checked against `.factory/claims.json`. The
inventory contains 29 unique public claims with one exact command per claim.
No additional public capability or privacy promise lacked a test.

From a separate clean checkout at documentation commit `0aae941`, `npm ci`
installed 66 packages and reported zero vulnerabilities. Every exact declared
command then passed separately:

| Claims | Result |
| --- | --- |
| `private-local`, `offline-reload`, `srt-export`, `txt-export` | PASS |
| `live-caption-sizing`, `demo-isolated`, `free-and-paid` | PASS |
| `supporter-license-restore`, `capture-recovery`, `desktop-overlay` | PASS |
| `native-local-processing`, `no-audio-storage`, `session-transcript` | PASS |
| `language-models`, `german-caption-end-to-end` | PASS |
| `linux-system-audio`, `linux-monitor-end-to-end` | PASS |
| `consent-before-capture`, `source-start-validation` | PASS |
| `local-model-storage`, `storage-controls` | PASS |
| `no-telemetry-trackers`, `call-speaker-boundaries` | PASS |
| `model-provenance-license`, `project-license` | PASS |
| `release-artifacts`, `unsigned-installers`, `native-claim-environment` | PASS |
| `microphone-input-listing` | PASS |

The native runner installed its declared Ubuntu prerequisites before testing.
The English monitor path performed local transcription, SRT export, stop, and
restart. The German path performed four isolated real captures with networking
disabled during each capture. The no-audio-storage run traced all visible
filesystem paths and found zero successful capture-time writes or mutations.
Missing system D-Bus messages from isolated PulseAudio were expected and did
not affect assertions.

## Normal, invalid, boundary, and recovery paths

- Normal: live sample use, size changes, pause/resume, both exports, release
  selection, installation, and the installed app sample all worked.
- Invalid: a fresh invalid supporter token showed the inactive-license message
  and stored neither the token nor a verified timestamp.
- Boundary: 20 px and 42 px caption sizes are covered by the suite. A 195
  CSS-pixel viewport had `scrollWidth = clientWidth = 195`, and Reset demo,
  Start for real, Pause captions, and Export TXT remained inside the viewport.
- Recovery: the renderer test injected a capture failure, showed a useful
  error, and started captions on retry. The source-start test rejected a stale
  monitor. The browser-lifecycle test killed Chromium and passed on its clean
  retry.
- Billing allowance: 30 invalid verification requests returned 200. Request
  31 returned 429 with `Retry-After: 4` and the correct live-site CORS origin.

This product has no product backend or tenant database. Backend tenant
isolation, restart persistence, and health checks are therefore not
applicable. The only remote product path is the scoped Sociobot license API.

## Accessibility, privacy, routes, and performance

- `/`, `/demo`, `/privacy`, and `/terms` returned 200. The designed unknown
  route returned the expected HTTP 404 with “Page not found” and a way home.
- Every route had `lang="en"`, one `h1`, one `main`, an ordered heading
  outline, and a route-specific title of at most 60 characters.
- Fresh Axe scans found zero serious or critical results on all five routes.
  The dark, reduced-motion demo also had zero serious or critical results.
- Keyboard Tab reached the skip link first; Enter focused `main`. Keyboard
  focus on Pause captions had a 3 px visible outline, and Space paused it.
  Back and Forward restored the destination heading focus.
- Reduced motion left no active animation. All measured privacy and terms
  controls were at least 44 × 44 CSS px.
- Direct demo use made eight self-hosted requests and no cross-origin request.
  The privacy route made no advertising or telemetry request in its claim
  test. Privacy and support email links are present.
- Every internal link resolved. The only 404 was the deliberate current-route
  skip link on the designed 404 page. External checkout, repository, release,
  download, and factory links returned successful or intentional redirect
  responses.
- HSTS, CSP, `nosniff`, strict-origin referrer policy, and permissions denying
  camera, microphone, and geolocation were present. HTML revalidates after 30
  seconds; the checked hashed script is immutable for one year.
- `/opt/fleet/lib/verify-url.sh` loaded home in 920 ms and demo in 714 ms with
  no console or baseline accessibility error.
- Fresh mobile Lighthouse 12.8.2 scores: Performance 100, Accessibility 100,
  Best Practices 100, SEO 100. FCP was 1.201 s, LCP 1.351 s, total blocking
  time 0 ms, CLS 0.0118, and transfer 113,300 bytes. Two initial Chromium tabs
  crashed; the clean run with shared-memory-safe browser flags completed. The
  repository's explicit crash-recovery test also passed.

## Quality and release checks

All checks below ran in the clean checkout:

| Command | Result |
| --- | --- |
| `npm test` | PASS — 35 unit, 24 desktop browser, 27 mobile browser tests; only configured skips |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS, including Rust Clippy with warnings denied |
| `cargo fmt --check --manifest-path src-tauri/Cargo.toml` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS — 11 ordinary tests; two isolated-audio tests intentionally use their declared runner and passed there |
| `cargo check --manifest-path src-tauri/Cargo.toml` | PASS |
| `npm run test:browser-lifecycle` | PASS after the expected injected crash |
| `npm run build` | PASS; produced `dist/site` and `dist/app` |
| `npm run verify:published-release` | PASS |

The site build contains 9.90 kB gzip JavaScript and 5.04 kB gzip CSS. The
published-release check verified `v0.1.20`, implementation `541c790…`, seven
platform packages, `SHA256SUMS`, and `latest.json`.

The live one-line Linux installer ran in a fresh temporary consumer home. It
installed `local-live-captions`; the installed SHA-256 exactly matched the
published AppImage entry. The installed app remained running for 12 seconds
under Xvfb. It then opened visibly from the clean consumer directory, showed
the normal no-audio-device setup state, and loaded the bundled four-line sample
with one click. Keyboard Tab displayed the designed focus ring on **Keep on
top**. Hardware-device warnings were expected because this worker has no
physical audio device.

Evidence: `.factory/review-evidence-5/installed-app-first-run.png`,
`installed-app-setup-bottom.png`, `installed-app-sample.png`, and
`installed-app-keyboard-focus.png`.

## Earlier findings

All earlier review and verification findings, including minor findings, are
closed in the current implementation:

| Earlier finding group | Current proof |
| --- | --- |
| F-1-1 through F-1-17: broad Linux/German/privacy/payment claims, unclear headings and terms, long copy, inconsistent claim totals, and missing deletion controls | Bounded live copy and current copy audit; all 29 claim commands; visible model and license removal controls; legal and 404 checks |
| F-2-1 through F-2-8: source-only native evidence, first-screen fit, offline wording, history focus, model provenance, release inventory, and technical labels | Real English/German monitor tests and filesystem trace; fresh first screens; offline context; focus history; provenance and artifact claims |
| F-3-1: native commands failed from a clean checkout | The declared runner installed prerequisites itself; all native commands passed from the clean checkout |
| F-4-1 through F-4-4: legal touch targets, untestable funding purpose, project license, and microphone listing | 44 px measurements; funding-purpose sentence remains absent; project-license and microphone claims passed |
| Verification 2, 3, and 5: stale desktop candidate, workflow/type failures, unavailable checkout, incomplete claims, missing monitor acceptance, stale lockfile, and missing claim commands | Release identity and installed checksum match; checkout returns 303; typecheck/lint/Cargo gates and all claims pass |
| Verification 6: hidden first action, missing TXT/size/license claims, initial-focus bypass, small demo action, stale copy audit | Both fresh first screens, full claims inventory, skip-link test, 44 px targets, and current copy audit pass |
| Verification 9, 11, 13, 14, 16, and 19: release/candidate mismatches and unavailable downloads | Live identity, tag, manifest, published-release check, one-line installer, checksum, and launched AppImage all agree on `v0.1.20` / `541c790…` |
| Verification 10: 1366 × 768 first action and Android package selection | Fresh 1366 × 768 first screen passed; full browser suite confirms Android receives the desktop explanation instead of an AppImage |
| Verification 12: invalid requested SHA and nondeterministic German assertion | The reviewed implementation exists at the immutable tag; four real German captures passed in this run |
| Verification 17: Linux AppImage packaging and 200% overflow | Published AppImage installed and ran without FUSE; 195 CSS-pixel reflow had no overflow |

Later verification passes and the release-identity repair were also checked.
No earlier item reopened.

## Known limitation

macOS and Windows installers remain intentionally unsigned. The site and
README disclose this before download. Their publication and checksums were
verified, but only the Linux AppImage can be launched in this Linux worker.
This is not a finding.

The brief's 75% retention target requires a human 20-minute pilot. The product
does not publish that result or an accuracy guarantee, so it is acceptance
context rather than an untested public claim.

The separately referenced `factory-evidence/local-live-captions-verify-20/
qa-report.md` was not mounted under `/work`. The complete committed
`.factory/verification-20.md` was read, and every relevant result was
independently rerun. This evidence-source omission is not a product defect.
