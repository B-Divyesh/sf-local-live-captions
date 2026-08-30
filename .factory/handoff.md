# Local Live Captions — repair 11 handoff

## Outcome

Release-blocking verification 13 findings are repaired in the `v0.1.12`
source release. Immutable tag `v0.1.12` points to
`2db4639d4c28af7f964313d45cc69dfc264b7eb1`; the release workflow resolves
that tag once and uses that same commit for package verification,
`latest.json`, and the published-release audit. This documentation-only
follow-up records the publication evidence and does not change that artifact.

## What changed

- Reproduced the verifier's exact stale identity before editing:
  `GITHUB_SHA=242656aeed034e3600ba3b98eafe47ea34249033 npm run
  verify:release-source -- v0.1.11` exited 1 because `v0.1.11` resolves to
  `6b919f6a10327f48725327fd2d3ed02ddf9dcec8`.
- Bumped package, Tauri, Cargo, lockfile, release fixtures, and documentation
  to `0.1.12` / `v0.1.12`. The old `v0.1.11` tag was not moved.
- Added a `resolve` job to `.github/workflows/release.yml`. Every release job
  now checks out the resolved tag, verifies `RELEASE_COMMIT`, builds from that
  tag, writes that exact commit into `latest.json`, and audits it after upload.
- Added regression coverage for verification 13's exact candidate/release
  mismatch (`242656a…` versus `6b919f6…`), the new versioned release contract,
  installer identity gate, and static download selection.
- Kept the shared checkout UI fail-soft. The $24 supporter action is a secure
  new-tab checkout link; the original local page remains available if the
  shared endpoint is unavailable. It explains the retry path and keeps all
  captions free. Its claim tests the observable product behavior without
  treating a third-party checkout outage as a product failure.

## Verification

Performed in this clean worker after `npm ci` (66 packages; 0
vulnerabilities):

```sh
CI=1 npm test
npm run test:browser-lifecycle
npm run typecheck
npm run lint
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
npm run test:linux-audio
npm run build
APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build
```

All passed. The full browser run has 23 Vitest tests and passing Chromium and
390 px mobile suites; `test-results/.last-run.json` reports `passed`. The
browser-lifecycle test completed its expected injected first-attempt crash and
clean retry. Rust reports 10 passing tests and two hardware acceptance tests
ignored by the normal unit suite; those acceptance tests passed through the
Linux script.

Every one of the 26 commands in `.factory/claims.json` was then invoked in
manifest order, independently. This includes four isolated PulseAudio monitor
runs with local Whisper recognition. The script's expected container D-Bus
and no-device ALSA noise did not affect the real monitor, transcription, SRT,
restart, no-audio-storage, or German acceptance checks.

`npm run build` emitted `dist/site` and `dist/app`. The landing main chunk is
29.23 kB raw / 9.91 kB gzip and CSS is 18.49 kB raw / 4.87 kB gzip. Local
`verify-url.sh` checks on `/` and `/demo` passed with titles, `lang=en`, one
`h1`, a `main` landmark, image alt text, labeled buttons, and zero console
errors. The pinned Playwright `@axe-core` scans in the complete desktop/mobile
suite passed with no serious or critical findings. The standalone axe CLI could
not attach to this worker's Playwright headless shell because no compatible
ChromeDriver is installed; the Playwright integration is the equivalent
project-supported axe check.

The Linux release build produced and smoke-tested:

- `Local Live Captions_0.1.12_amd64.AppImage` (81,246,712 bytes)
- `Local Live Captions_0.1.12_amd64.deb` (5,430,912 bytes)
- `Local Live Captions-0.1.12-1.x86_64.rpm` (5,431,801 bytes)

The AppImage stayed open under Xvfb for 15 seconds (expected `timeout` status
124); only normal headless graphics/audio-device warnings appeared.

## Publish and deploy

Published and deployed successfully on 30 August 2026:

- GitHub Actions release run `33295590483` completed successfully.
- GitHub release `v0.1.12` targets
  `2db4639d4c28af7f964313d45cc69dfc264b7eb1` and contains checksum metadata
  plus AppImage, DEB, RPM, DMG, macOS archive, Windows EXE, and MSI.
- The release's `latest.json` names `v0.1.12`, the same commit, and all seven
  platform package URLs. The public DEB checksum was verified against
  `SHA256SUMS`.
- The static site was deployed from a bundle whose
  `release-identity.json` is exactly
  `{"tag":"v0.1.12","commit":"2db4639d4c28af7f964313d45cc69dfc264b7eb1"}`.
  The live custom domain returned that same identity after deployment.
- `npm run verify:release-source -- v0.1.12` and
  `npm run verify:published-release` passed against the public release and
  deployed site. The real public Linux installer downloaded, checksum-checked,
  and installed the matching AppImage into an isolated temporary directory.

The tag-triggered GitHub workflow publishes macOS, Windows, and Linux
installers, `SHA256SUMS`, and `latest.json`, then runs
`verify-published-release` against the resolved tag commit. To recheck:

```sh
npm run verify:release-source -- v0.1.12
npm run verify:published-release
```

The landing page will expose the detected-platform download only when its
release identity, the GitHub release target, and `latest.json` all agree.

## Known limits and operator action

- macOS and Windows packages are built and published by GitHub Actions but
  cannot be launched in this Linux worker. They remain unsigned; production
  signing requires `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` from the owner.
- The brief's 75% 20-minute retention measure needs the planned human pilot;
  it is not claimed by the product.
