# Local Live Captions — repair 8 handoff

## Outcome

The release-blocking first-screen defect from independent verification 10 is
repaired for release `0.1.9`. The full audience sentence, sample action, action
explanation, and all three facts now fit at 1280 × 720, 1366 × 768, and
1440 × 900. The documented minor Android defect is also repaired: Android and
other unsupported mobile browsers receive a desktop-download explanation and
are never offered a Linux package.

The repair preserves the researched desktop-app scope, Tauri 2 packaging,
local speech processing, demo sandbox, privacy behavior, visual thesis, and all
behavior that passed candidate `3d56e7f2b3492daccce2107532b6c41f4b661a75`.

## Root causes and repairs

- The desktop compact layout ended at `max-height: 760px`. At 768px, the page
  switched back to a five-line, 102px heading and large vertical gaps. The
  audience ended at 792.19px, the action began at 820.19px, and facts ended at
  1036.56px. The repair replaces that discontinuous breakpoint with one fluid
  desktop scale: a 44–72px heading, 12-character measure, and viewport-aware
  spacing at every desktop height.
- Platform selection treated every user agent that was not Windows or macOS as
  Linux. Detection now rejects Android, iOS, mobile, and unknown platforms
  before selecting a package. Unsupported visitors get a useful explanation,
  the release API is not requested, and no package link is rendered.
- Version sources, release fixtures, installer identity tests, and the service
  worker cache are advanced together to `0.1.9` / `llc-shell-v7`.

## Exact regression coverage

- `tests/e2e/site.spec.ts` checks the audience, action, explanation, and each
  fact against the viewport boundary at 1280 × 720, the exact failing
  1366 × 768 size, and 1440 × 900.
- The same suite supplies an Android 15 user agent, asserts the desktop-only
  explanation, asserts that no Linux download exists, and proves that no
  GitHub release request is made.
- `.factory/qa/repair-8-qa.mjs` repeats the first-read check against local and
  live builds and covers every route in both themes, Axe, console errors,
  keyboard use, 390px/200% layout, touch targets, reduced motion, privacy,
  service-worker update, offline reload, and Android behavior.
- Before/after evidence is under `.factory/qa/repair-8/`. At 1366 × 768 after
  the repair, the audience ends at 503.19px, the action at 574.72px, and the
  final fact at 704.64px. At 390 × 844, the final fact ends at 780.67px.

## Local verification

Run from a clean checkout after installing the Linux packages from
`.github/workflows/release.yml`:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run test:browser-lifecycle
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
npm run test:linux-audio
npm run build
QA_BASE=http://127.0.0.1:4173 \
  QA_OUTPUT=.factory/qa/repair-8-local-qa.json \
  node .factory/qa/repair-8-qa.mjs
```

Observed 29 August 2026:

- Clean install: 66 packages, 0 vulnerabilities.
- Unit/integration: 19 Vitest tests passed.
- Browser matrix: desktop 24 passed with 4 expected skips; 390px mobile 25
  passed with 3 expected skips.
- TypeScript, Clippy with warnings denied, Rust format, Rust check, and Rust
  tests passed. Rust reported 9 passed and 2 acceptance-only tests ignored.
- Browser lifecycle recovery passed after its intentional first-process
  `SIGSEGV`.
- Real Linux audio acceptance passed with an isolated PulseAudio monitor,
  local English `tiny.en` and German `base` transcription, SRT output, restart,
  and no raw-audio file.
- `npm run build` produced `dist/site` and `dist/app`. Site JavaScript is
  9.90KB gzip, CSS is 4.87KB gzip, the mobile hero is 25,040 bytes, and loaded
  WOFF2 fonts remain below the 120KB budget.
- Local browser audit: zero Axe violations on all five routes in light and
  dark modes; no normal-route console or page errors; every visible 390px
  target is at least 44px; no horizontal overflow at normal or 200% text;
  keyboard and range controls pass; reduced motion is 0.01ms; demo requests
  remain same-origin; cache `llc-shell-v7` works offline; Android has no package
  link or release request. Exact output is
  `.factory/qa/repair-8-local-qa.json`.

## Release and deployment

Repair source commit `6ec51c0352298721e6ef7905da7c1485ce526fab` is
published as annotated tag `v0.1.9`. GitHub Actions run
[`33279399285`](https://github.com/B-Divyesh/sf-local-live-captions/actions/runs/33279399285)
completed successfully. Its verification, Ubuntu, Windows, universal macOS,
and manifest jobs all passed.

The release contains AppImage, DEB, RPM, DMG, universal macOS archive, MSI,
EXE, `SHA256SUMS`, and `latest.json`. Both the release target and
`latest.json` identify the repair source commit. The published AppImage is
83,802,616 bytes with SHA-256
`7fefb71ae9de933feb02a3a82ad068213476c8b26979db32016e1b0786c5fbf8`.
It passes the published checksum. The live one-line installer downloaded that
exact file into an isolated consumer directory, set mode 755, and the installed
app stayed running for the 15-second Xvfb smoke window.

The source-bound release and static deployment used:

```sh
git tag -a v0.1.9 -m "Local Live Captions v0.1.9"
git push origin main v0.1.9
VITE_BUILD_SHA="$(git rev-list -n 1 v0.1.9)" npm run build:site
/opt/fleet/lib/deploy-static.sh local-live-captions dist/site
```

GitHub Actions was the only desktop package builder. Static deployment
`0d5e70e3-159d-4f11-87e2-7a654a1bce22` succeeded, and the custom domain
returned HTTPS 200. Deployed `release-identity.json` reports `v0.1.9` and
`6ec51c0352298721e6ef7905da7c1485ce526fab`. All 30 deployable files in
`dist/site` byte-match the live site.

## Live verification

- `.factory/qa/repair-8-live-qa.json` reports no failures. The full first-read
  content fits at 1280 × 720, 1366 × 768, and 1440 × 900. At the exact reported
  viewport, the final fact ends at 704.64px. At 390 × 844 it ends at 780.67px.
- Axe reports zero violations on `/`, `/demo`, `/privacy`, `/terms`, and the
  designed 404 in both themes. Every route has one h1, one main, a header and
  footer, a distinct title, and `lang=en`. Normal routes have no console or page
  errors.
- Keyboard skip, caption pause/resume, and range Home/End pass. Every visible
  390px target is at least 44px. Normal and 200% text have zero horizontal
  overflow. Reduced-motion transitions are 0.01ms.
- Demo traffic is same-origin only. Service worker cache `llc-shell-v7` is
  active and the demo remains operable after an offline reload. Android makes
  no GitHub API request and renders no package link.
- `/opt/fleet/lib/verify-url.sh` passes `/` and `/demo`; evidence is under
  `.factory/verify-url-repair-8-home/` and
  `.factory/verify-url-repair-8-demo/`.
- Fresh mobile Lighthouse: performance 100, accessibility 100, best practices
  100, SEO 100; FCP 1.2s, LCP 1.4s, TBT 0ms, CLS 0.012, speed index 1.2s, and
  total transfer 111KiB. Report:
  `.factory/qa/repair-8-lighthouse-live.json`.
- HTML returns a 30-second revalidation policy, HSTS, `nosniff`, strict-origin
  referrer policy, permission denial, and a CSP with header-only
  `frame-ancestors 'none'`. Hashed assets are one-year immutable and release
  identity is `no-cache`.
- Linux, Windows, and macOS user agents select the published AppImage, EXE, and
  DMG respectively. A live invalid license check returns HTTP 200,
  `valid:false`, exact-origin CORS, and `Cache-Control: no-store`; checkout
  returns the expected HTTP 303 to Dodo.

## Known limits and operator action

- The brief's 75% retention target over a 20-minute recording still requires a
  human pilot. The product makes no retention or accuracy guarantee.
- Packages remain intentionally unsigned. Signing is not configured in the
  workflow. A future signing change needs owner certificates and the
  `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets before it can claim signed
  installers.
- Windows and macOS packages are built and manifest-checked in CI. Only the
  Linux package can be launched in this worker.
