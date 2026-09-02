# Independent verification 18 — PASS

Verified on 2 September 2026 from clean candidate commit
`f3eb6758089380a103f0882de6db87c3ada09f91` against
<https://local-live-captions.sociobot.in>.

## Decision

**PASS.** The repaired deployment and published desktop release now identify
the candidate exactly, the release workflow's Linux production package gate
builds usable AppImage and DEB outputs, and the web/demo/native claims passed.

## First-read and demo gate

**PASS.** A cold live desktop load returned 200 with no console errors.

- What it does: “Caption Linux calls and recordings locally.”
- Who it is for: “For deaf and hard-of-hearing students when lectures, calls,
  or recordings have no captions.”
- First action: visible “Try it with sample data,” followed by “Opens a private
  sample. Nothing is saved.”

The one-click sample opened at `/demo`, immediately showed realistic astronomy
captions, and retained the banner “Demo — sample data, nothing is saved,” with
Reset demo and Start for real. The first screen therefore answers what, who,
and what to click in plain words.

## Claims and clean-checkout checks

`.factory/claims.json` exists and contains 27 entries. After `npm ci`, every
declared command was run independently: **27/27 passed**. This includes the
isolated real English/German PulseAudio captures under socket tracing, offline
and privacy request checks, transcript export, consent, no-audio-storage,
model provenance, release contract, installer, and recovery cases.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 66 packages; 0 vulnerabilities reported |
| all 27 exact claim commands | PASS |
| `npm test` | PASS — 30 unit tests and 29 browser tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — TypeScript and Clippy warnings denied |
| `npm run build` | PASS — `dist/site` and `dist/app` produced |
| `npm run build:linux-packages` | PASS — AppImage and DEB produced and size-checked |
| `npm run verify:published-release` | PASS — site/release/manifest/checksums agree |

The site build's first JavaScript is 29,233 bytes (10,037 bytes gzip) and CSS
is 19,431 bytes (5,025 bytes gzip), within the static-product budgets.

## Deployment and installer identity

- Live `/release-identity.json` returned
  `{"tag":"v0.1.18","commit":"f3eb6758089380a103f0882de6db87c3ada09f91"}`.
- GitHub’s latest release is `v0.1.18` with the same target commit and seven
  platform package assets plus `SHA256SUMS` and `latest.json`.
- `npm run verify:published-release` passed.
- The downloaded `Local.Live.Captions_0.1.18_amd64.deb` passed
  `sha256sum -c` against published `SHA256SUMS`; `dpkg-deb -f` reports package
  `local-live-captions`, version `0.1.18`, amd64.
- From a clean generated Rust target, `npm run build:linux-packages` passed
  and created a 81,709,560-byte AppImage and 5,437,690-byte DEB. The AppImage
  remained open for 12 seconds under Xvfb (the worker has no real audio source).

The raw FUSE-less command `env -u CI npx tauri build --bundles appimage,deb`
still stops at `failed to run linuxdeploy`. This is not the documented or
workflow production build path: `npm run build:linux-packages` supplies
`APPIMAGE_EXTRACT_AND_RUN=1`, verifies both outputs, and passed. The former
verification's packaging blocker is therefore resolved for the actual release
path.

## Live product QA

- `/`, `/demo`, `/privacy`, and `/terms` returned 200; an unknown route
  returned 404. Headers include HSTS, CSP with `frame-ancestors 'none'`,
  `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation
  permissions denied. Fingerprinted assets are one-year immutable cached.
- Desktop and 390 × 844 mobile loads had no console or page errors. At 195 CSS
  px the demo's `scrollWidth` and `clientWidth` were both 195: no horizontal
  overflow at the 200% reflow boundary.
- Keyboard-only check: Tab first focused “Skip to content”; Enter moved focus
  to `#main`. Empty license submission announced “Enter the license token from
  your receipt.” Demo controls paused/resumed captions, changed 28 px to 42 px,
  reset to 28 px, and cleared `demo:` state when leaving.
- With reduced motion requested, no active page animations remained. The
  service worker controlled `/demo`; `registration.update()` completed; a new
  offline browser context reloaded the demo and displayed its sample heading.
- Axe 4.11.1, injected with CSP bypass only for inspection, found zero serious
  or critical findings on `/`, `/demo`, `/privacy`, and `/terms`.
- Privacy: a fresh demo request log contained only
  `https://local-live-captions.sociobot.in`; no telemetry, audio upload,
  third-party font, or analytics request appeared. The landing page separately
  made its documented GitHub release API lookup.
- License allowance: 30 invalid verification requests from one client returned
  200; request 31 and later returned **429** with `Retry-After: 4`.

## Non-blocking notes

Fresh Lighthouse could not complete in this worker because its Chromium tab
crashed while the native release build was active. This does not affect the
browser, Axe, offline, cache, console, route, or bundle-budget evidence above.
No release-blocking defects were found.
