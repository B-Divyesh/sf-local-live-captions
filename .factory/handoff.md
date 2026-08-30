# Local Live Captions — independent verification 12 handoff

## Outcome: FAIL

Independent verification on 30 August 2026 **fails the requested candidate**
`fcb90cf990981ea8987341b4621dc1f8bbff974c` at
<https://local-live-captions.sociobot.in>.

Release blockers:

- The requested candidate SHA is absent locally and from GitHub (`upload-pack:
  not our ref`). The live site, public release, `v0.1.10`, `origin/main`, and the
  clean checkout instead identify
  `fcb90c7a2e659e930e7ec8fe519eb55118494e8c`. The deployment cannot match the
  requested candidate.
- One mandatory `german-caption-end-to-end` invocation failed after all
  documented native prerequisites were installed. The real local Whisper run
  returned German text, but the assertion rejected it as unexpected. The same
  shared command passed on the other three invocations, making this a
  reproducible intermittent claim failure. The claims contract makes any such
  failure release-blocking.

Full evidence and severity are in [verification-12.md](verification-12.md),
with raw output under `verification-evidence-12/`. No product code was changed.

## Verification 12 summary

- First-read and one-click sample gate: PASS on desktop and 390 px mobile.
- Claims: 25 PASS, 1 FAIL after prerequisites; all 26 commands were run.
- `npm ci`, `npm test`, typecheck, lint/clippy, browser crash recovery, Rust
  format/test/check, `npm run build`, and release-mode Tauri packaging: PASS.
- Live demo, TXT/SRT export, reset/isolation, invalid-license recovery,
  keyboard, 200% text, reduced motion, PWA update/offline reload: PASS.
- Axe serious/critical: zero. Normal-route console/page errors: zero.
- Privacy: demo and privacy flows were same-origin only.
- Product-unlock API: 30 requests allowed; request 31 returned 429 with
  `Retry-After: 3`.
- Lighthouse mobile: 100/100/100/100; LCP 1.2 s, CLS 0.012, 111 KiB transfer.
- Published `v0.1.10` release assets and live identity match the available
  `fcb90c7…` commit; a downloaded DEB passed `SHA256SUMS`.

## Required next steps

1. Provide and deploy an actual reachable candidate SHA, then rerun independent
   verification against that exact commit.
2. Make the German real-audio acceptance deterministic while still testing
   useful recognizable transcription; do not weaken it to a button/source
   presence check.
3. Rerun all 26 claim entries from a prerequisite-complete clean worker and
   require every invocation to pass before release.

---

# Previous builder handoff — repair 9

## Outcome

Independent verification 11's release blocker is repaired. The product remains
a Tauri 2 desktop app with its static landing site at
<https://local-live-captions.sociobot.in>.

The immutable repair release is `v0.1.10`. Its tag, GitHub release target,
`latest.json`, and deployed `release-identity.json` all resolve to the same
repair commit. The existing fail-closed site and installer checks were kept.

## Finding reproduced

Before repair, the public state reproduced the verifier's evidence exactly:

- deployed identity: `v0.1.9` at
  `f81f6c0eb051326dee835280bd25818c8a3d2b15`;
- latest release target and `latest.json`: `v0.1.9` at
  `6ec51c0352298721e6ef7905da7c1485ce526fab`;
- live Linux one-line installer: exit 1, publication warning, zero files
  installed.

The release workflow validated a tag only against the workflow's own source.
It did not audit the complete published release or compare it with the deployed
site after a later site-only build. That sequencing gap allowed a good safety
check to become a total download outage.

## Repair

- Bumped all package identities and release fixtures to `0.1.10`.
- Added `scripts/verify-published-release.mjs`. It verifies the live or expected
  tag and commit against GitHub's latest release and `latest.json`.
- The audit requires AppImage, DEB, RPM, DMG, macOS archive, MSI, EXE,
  `SHA256SUMS`, and `latest.json`. Every package must appear at the same URL in
  the manifest and have a checksum entry.
- The manifest job now runs that audit after uploading its integrity files. It
  retries for GitHub's publication delay and fails the release workflow on any
  mismatch.
- Added the exact verification 11 regression: site commit `f81f6c0...` with
  release and manifest commit `6ec51c0...` must produce both source-mismatch
  errors. Matching identity and incomplete-integrity cases are also covered.
- Kept the browser and both one-line installers fail closed when site and
  release identities differ. The release source/tag guard remains in place.
- Added a QA evidence-prefix override so later repair evidence cannot overwrite
  an earlier verifier's files.
- Updated README release instructions and the copy audit. The brief, design,
  product behavior, privacy model, and pricing did not change.

## Verification evidence

Clean and automated gates run on 30 August 2026:

| Gate | Result |
| --- | --- |
| `npm ci` | PASS — 66 packages, 0 vulnerabilities |
| All 26 commands in `.factory/claims.json` | PASS individually, including four independent real Linux-audio runs |
| `CI=1 npm test` | PASS — 22 Vitest; desktop 24 passed/4 skipped; mobile 25 passed/3 skipped |
| exact publication regression | PASS — stale report SHAs rejected; matching release accepted; missing manifest/checksum rejected |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — TypeScript and Clippy with warnings denied |
| `npm run test:browser-lifecycle` | PASS — intentional first SIGSEGV recovered with a clean browser retry |
| Rust format, tests, and check | PASS — 9 tests passed; 2 acceptance-only tests ignored by the unit command |
| `npm run test:linux-audio` | PASS — English and German monitor capture, SRT, restart, and unchanged model storage |
| `npm run build` | PASS — `dist/site` and `dist/app` |
| `APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build` | PASS — AppImage, DEB, and RPM |
| candidate AppImage smoke | PASS — stayed open for the 15-second Xvfb window |

The known Tauri `__TAURI_BUNDLE_TYPE` warning still appears. The product does
not ship an updater.

Local browser evidence is in `.factory/qa/repair-9-local-qa.json` and the two
adjacent screenshots:

- zero failures, page errors, console errors, or axe violations across five
  routes in light and dark themes;
- first-screen content fits 1280 × 720, 1366 × 768, 1440 × 900, and 390 × 844;
- at 390 px, the first screen ends at 780.67 px, every target is at least
  44 × 44 px, and normal/200% text have zero horizontal overflow;
- skip link, main focus, pause/resume, and range Home/End keyboard behavior
  pass;
- demo requests remain same-origin and an offline reload stays operable from
  `llc-shell-v7`;
- Android makes no GitHub request and receives the desktop-device explanation;
- built site bundles are 10,035 bytes gzip JavaScript and 4,875 bytes gzip CSS.

## Release and deployment verification

GitHub Actions is the only desktop package builder. Release
<https://github.com/B-Divyesh/sf-local-live-captions/releases/tag/v0.1.10>
contains every documented platform package plus integrity files. The workflow
source is the exact annotated tag commit:

```sh
git rev-list -n 1 v0.1.10
```

The static site was built and deployed from that same immutable source:

```sh
VITE_BUILD_SHA="$(git rev-list -n 1 v0.1.10)" npm run build:site
/opt/fleet/lib/deploy-static.sh local-live-captions dist/site
npm run verify:published-release
```

The final audit validates the live identity, release target, manifest identity,
all platform URLs, and all package checksum entries. Fresh Linux, Windows, and
macOS user agents expose their AppImage, EXE/MSI, and DMG links respectively.
The Linux one-line installer installs a checksum-verified AppImage in an empty
consumer directory. The PowerShell consumer path resolves a published Windows
installer covered by the same `SHA256SUMS` file.

## How to verify

Install the Ubuntu packages listed in `.github/workflows/release.yml`, then run:

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
APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build
npm run verify:published-release
```

## Known limits and operator action

- A human 20-minute pilot is still needed to evaluate the brief's 75%
  retention success measure. No retention or accuracy guarantee is made.
- Packages remain intentionally unsigned. Future signing requires operator
  certificates and the `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets.
- Only Linux packages can be launched in this worker. Windows and macOS are
  built on their native GitHub runners and checked through release metadata,
  manifest identity, and checksums.
