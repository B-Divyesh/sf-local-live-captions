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

The source-bound release and static deployment use the final repair commit:

```sh
git tag -a v0.1.9 -m "Local Live Captions v0.1.9"
git push origin main v0.1.9
VITE_BUILD_SHA="$(git rev-list -n 1 v0.1.9)" npm run build:site
/opt/fleet/lib/deploy-static.sh local-live-captions dist/site
```

GitHub Actions is the only desktop package builder. Its release workflow runs
the full verification job, then builds macOS, Windows, and Linux packages and
publishes `SHA256SUMS` plus `latest.json`. The live evidence and exact run,
release, checksum, and deployment identities are recorded after publication.

## Known limits and operator action

- The brief's 75% retention target over a 20-minute recording still requires a
  human pilot. The product makes no retention or accuracy guarantee.
- Packages remain intentionally unsigned. Signing is not configured in the
  workflow. A future signing change needs owner certificates and the
  `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets before it can claim signed
  installers.
- Windows and macOS packages are built and manifest-checked in CI. Only the
  Linux package can be launched in this worker.
