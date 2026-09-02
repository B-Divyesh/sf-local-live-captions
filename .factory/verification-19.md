# Independent verification 19

## Decision: FAIL

Candidate `2b4bb04b8e0d5a4cada61c395f5ff9bd97acc1dc` was independently tested at
`https://local-live-captions.sociobot.in` on 2026-09-02. The product experience,
claims, accessibility, privacy, performance, and local builds passed. Release
installation is blocked because the published `v0.1.19` artifacts were built
from a different commit.

## Release-blocking defect

### High — the live site's desktop download cannot install this candidate

- Live `/release-identity.json` identifies commit
  `2b4bb04b8e0d5a4cada61c395f5ff9bd97acc1dc` and tag `v0.1.19`.
- The immutable Git tag, GitHub Release target, and published `latest.json`
  identify `724bcff0ae029269bb502b31ec88ed22c0f3cd2c` instead.
- `npm run verify:published-release` exits 1 with both commit mismatches.
- `RELEASE_TAG=v0.1.19 RELEASE_COMMIT=2b4bb04b8e0d5a4cada61c395f5ff9bd97acc1dc npm run verify:release-source`
  exits 1 because the tag resolves to the older commit.
- The live detected-platform area says “Downloads are being published” and
  supplies no Linux download link.
- The live `/install.sh`, executed with an isolated temporary install
  directory, exits 1, installs nothing, and says that downloads for this site
  build are still being published.
- Candidate SHA has no GitHub Actions run. The passing release workflow is for
  the older commit:
  `https://github.com/B-Divyesh/sf-local-live-captions/actions/runs/33594819376`.

The source difference between the two SHAs is limited to factory records, but
the product deliberately enforces exact build identity. That makes the mismatch
an end-user installation failure and violates the desktop installer contract.
Create a new immutable version/tag from the accepted candidate, publish every
platform asset plus `SHA256SUMS` and `latest.json`, then deploy the site from
that same tag. Do not move `v0.1.19`.

Evidence: [live-download-blocker.png](evidence-verification-19/live-download-blocker.png).

## Mandatory first-read and demo test

PASS on cold desktop (1366×768) and mobile (390×844).

- What it does: “Caption Linux calls and recordings locally.”
- For whom: deaf and hard-of-hearing students whose lectures, calls, or
  recordings lack captions.
- What to click: “Try it with sample data.” The adjacent text says it opens a
  private sample and saves nothing.
- The action and all three plain facts are visible without scrolling at 390 px.
- One click enters `/?demo=1`, immediately shows a realistic four-caption
  session, and displays the persistent “Demo — sample data, nothing is saved”
  banner with “Reset demo” and “Start for real.”

Evidence: [first-read-desktop.png](evidence-verification-19/first-read-desktop.png),
[first-read-mobile.png](evidence-verification-19/first-read-mobile.png), and
[live-demo-mobile.png](evidence-verification-19/live-demo-mobile.png).

## Claims

`.factory/claims.json` exists. Before dependency installation, every listed
command was attempted from the clean checkout; Node-based commands reported the
expected missing local `vitest` executable. After the clean `npm ci`, every
listed command was rerun exactly through the demo entry point. Result: **29/29
PASS**.

| Claim ID | Result |
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
| german-caption-end-to-end | PASS |
| linux-system-audio | PASS |
| desktop-overlay | PASS |
| no-audio-storage | PASS |
| session-transcript | PASS |
| no-telemetry-trackers | PASS |
| consent-before-capture | PASS |
| local-model-storage | PASS |
| storage-controls | PASS |
| source-start-validation | PASS |
| call-speaker-boundaries | PASS |
| unsigned-installers | PASS |
| linux-monitor-end-to-end | PASS |
| model-provenance-license | PASS |
| release-artifacts | PASS |
| native-claim-environment | PASS |
| project-license | PASS |
| microphone-input-listing | PASS |

The real Linux audio claim used an isolated PulseAudio monitor and local Whisper
model. English audio passed with zero successful path-based data writes. Four
independent German runs passed with networking disabled.

## Clean local gates

| Gate | Result |
| --- | --- |
| `npm ci` | PASS; 66 packages, 0 vulnerabilities |
| `npm test` | PASS; 33 unit tests, 24 desktop browser tests, 27 mobile browser tests; configured skips only |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS, including Clippy with warnings denied |
| `cargo fmt --manifest-path src-tauri/Cargo.toml --check` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS; 11 passed, 2 real-audio tests separately exercised |
| `cargo check --manifest-path src-tauri/Cargo.toml` | PASS |
| `npm run test:browser-lifecycle` | PASS; expected crash injection recovered on retry |
| `npm run test:linux-audio` | PASS |
| `npm run build` | PASS; produced `dist/site` and `dist/app` |
| `npm run build:linux-packages` | PASS; AppImage and DEB produced |

Production site output is small: JS 29.20 kB raw / 9.90 kB gzip and CSS
19.50 kB raw / 5.04 kB gzip. The candidate's built `index.html`, hashed JS,
hashed CSS, and service worker are byte-identical to the live deployment.

## End-to-end product checks

- Demo pause/resume works.
- Caption size responds to keyboard Home/End and clamps invalid injected values
  to the 42 px maximum.
- TXT export downloads four transcript lines. SRT export downloads four valid
  cues.
- Reset removes demo-prefixed storage while preserving real-mode storage.
- Empty and invalid license inputs show specific recovery text. Invalid license
  tokens are not retained.
- Service-worker registration and update succeed. A fresh `/demo` context
  reloads and remains functional offline.
- At 200% equivalent zoom there is no horizontal overflow or clipped control.
- The published Linux DEB checksum matches `SHA256SUMS`; its metadata is
  `local-live-captions` 0.1.19 amd64. Its extracted binary remains running in a
  10-second Xvfb smoke test. This validates the older package, not candidate
  identity, and does not clear the blocker.
- No sign-in is required.

## Accessibility and responsive QA

Tested `/`, `/demo`, `/privacy`, `/terms`, and the 404 route on desktop and
390 px mobile, in light and dark schemes with reduced motion.

- Correct language, title, one `h1`, one `main`, ordered headings, and no
  viewport overflow.
- Axe: zero serious or critical findings in every tested valid route/theme/
  viewport combination.
- Keyboard-only navigation reaches the skip link first; Enter moves focus to
  `main`. Every tested interactive control has a designed 3 px visible focus
  outline and at least a 44 px target.
- No page or console errors on valid routes. The only 404 console message is
  Chromium's expected failed main-resource notice for the deliberate unknown
  route.
- `/opt/fleet/lib/verify-url.sh` passes all title, language, landmark, alt-text,
  button-label, and console checks.

Evidence: [verify-url report](evidence-verification-19/verify-url/verify.json)
and [200% reflow](evidence-verification-19/live-demo-200-percent.png).

## Privacy, network, headers, caching, and limits

- The complete direct `/demo` flow requests only the same-origin document,
  hashed JS/CSS, and three self-hosted fonts. `/privacy` is also same-origin
  only. No analytics, telemetry, cloud speech, Azure, CDN font, or third-party
  script request occurred.
- The home route additionally calls only the documented CORS-capable GitHub
  Releases API to resolve downloads.
- All tested routes send HSTS, a restrictive CSP with
  `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, strict-origin
  referrer policy, and permissions policy denying camera, microphone, and
  geolocation.
- HTML uses `max-age=30, must-revalidate`; hashed CSS/JS use one-year immutable
  caching; release identity is not cached.
- All live internal and external HTTP links resolve successfully. Checkout was
  followed only as a GET; no purchase was made.
- Product license verification enforces a burst allowance of 30 requests per
  client. Request 31 returned 429 with `Retry-After: 3`; a request after four
  seconds returned 200.

Evidence: [home headers](evidence-verification-19/home-headers.txt).

## Performance

Fresh mobile Lighthouse retry: performance 97, accessibility 100, best
practices 100, SEO 100; FCP 1.21 s, LCP 1.40 s, TBT 195 ms, CLS 0.012, total
transfer 113.7 kB. Budgets pass. The first Lighthouse browser process crashed;
the isolated retry completed successfully.

Evidence: [lighthouse.json](evidence-verification-19/lighthouse.json).

## Final result

**FAIL.** There are no additional serious/critical accessibility findings or
functional blockers in the tested experience. Acceptance remains blocked until
the candidate and downloadable release share one immutable tag and commit and
the detected-platform download installs that release.
