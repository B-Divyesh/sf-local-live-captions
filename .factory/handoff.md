# Local Live Captions — verification 17 handoff

## Current outcome

**FAIL — candidate `7188bacd897b1040d81772938c59afcb3a4d2384` is not
releasable.** Fresh independent evidence is in
[`verification-17.md`](verification-17.md).

- The deployed site identity is the candidate, but the latest GitHub desktop
  release and `latest.json` identify older commit `5a5d585…`; the installable
  app does not match the deployed candidate.
- The clean, exact Linux production package command
  `env -u CI npx tauri build --bundles appimage,deb` fails at AppImage
  packaging (`linuxdeploy`), leaving no usable AppImage/DEB.
- At 200% effective text reflow, the live demo has horizontal overflow
  (`320px` content at a `195px` viewport).

All 27 declared claim commands passed, as did `npm test`, typecheck, lint,
full Rust tests, static production build, first-read/demo, offline reload,
privacy request inspection, headers, keyboard skip link, axe serious/critical,
and 390px checks. The license endpoint allowed 30 invalid requests from one
client and returned 429 with `Retry-After` on request 31.

To pass: publish a new immutable tag/release built from `7188bac…` with matching
`latest.json`/checksums and deployed release identity, fix reproducible Linux
AppImage packaging, and add a 200%-reflow/narrow layout treatment. Do not reuse
or move the old v0.1.17 release.

---

# Local Live Captions — repair 13 handoff

## Outcome

**PASS.** Repair source `5a5d585503d23707cbf0fdb4a9301b9113463849` is
published as the new annotated tag `v0.1.17`. The tag, GitHub release,
`latest.json`, `SHA256SUMS`, deployed site, detected Linux download, and both
published one-line installers now identify that same source. `v0.1.16` was not
moved or reused.

Release: <https://github.com/B-Divyesh/sf-local-live-captions/releases/tag/v0.1.17>

- GitHub cross-platform release run: <https://github.com/B-Divyesh/sf-local-live-captions/actions/runs/33574273189>
  — resolve, verification, Linux, Windows, macOS universal, and manifest jobs
  all passed.
- Post-deploy installer verification: <https://github.com/B-Divyesh/sf-local-live-captions/actions/runs/33576083559>
  — release contract, real Linux installer, and Windows PowerShell checksum
  validation all passed.
- Live `/release-identity.json`: `{"tag":"v0.1.17","commit":"5a5d585503d23707cbf0fdb4a9301b9113463849"}`.
- `latest.json` has version `v0.1.17`, the same commit, and all seven package
  URLs. The published-release verifier reports seven packages plus
  `SHA256SUMS` and `latest.json`.

## Repair

The independent verifier’s exact release failure was reproduced before the
change:

```sh
RELEASE_TAG=v0.1.16 npm run build:release-site
npm run verify:published-release -- --expected-tag v0.1.16 \
  --expected-commit 80ecfa4539967d063d22cf00abce8946ac0505fd
```

Both failed because `v0.1.16` and its release resolved to
`0ecd456533c7eaac81923580e7875c381e1b50ba`, not candidate `80ecfa…`.

Changes in `5a5d585`:

- Added a precise verification-16 regression for the `80ecfa…` / `0ecd456…`
  stale release pair.
- Added `npm run deploy:release-site`, which rebuilds from the selected
  immutable tag and verifies `release-identity.json` before invoking the
  static deployer.
- Bumped package, Tauri, Cargo, and fixture versions to `0.1.17`.
- Hardened both installers to require `latest.json` tag/commit identity in
  addition to the release identity and SHA-256 check.
- Added `verify-live-installers.yml`, which checks the deployed release,
  downloads/installs the Linux AppImage, and uses Windows PowerShell
  `-VerifyOnly` to verify the published MSI/EXE checksum without opening an
  installer UI.

## Verification

Clean local verification completed after `npm ci` (66 packages, 0
vulnerabilities):

```sh
npm test
npm run typecheck
npm run lint
npm run test:browser-lifecycle
npm run test:linux-audio
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
npm run build
APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build
```

All passed. Local packaging produced the `0.1.17` Linux DEB (5,437,400
bytes), RPM (5,436,910 bytes), and AppImage (81,709,560 bytes). The native
acceptance run completed real isolated PulseAudio monitor capture, English
transcription, restart, and four German captures.

The exact tag build also passed:

```sh
RELEASE_TAG=v0.1.17 npm run build:release-site
npm run verify:published-release -- --expected-tag v0.1.17 \
  --expected-commit 5a5d585503d23707cbf0fdb4a9301b9113463849
```

Live checks passed:

- Factory URL checks at `/` and `/demo`: HTTP 200, correct title/lang, one
  `h1`, `main`, no missing image alt, unlabeled buttons, or console errors.
  Evidence: `evidence-repair-13/verify-home/` and
  `evidence-repair-13/verify-demo/`.
- Playwright axe at 390 px found zero serious/critical violations on `/`,
  `/demo`, `/privacy`, `/terms`, and the 404 route.
- Keyboard skip link focused and moved focus to `#main`; demo pause/resume
  worked; 390 px overflow was zero. Demo requests stayed same-origin only.
- A fresh controlled service-worker context reloaded `/demo` offline with the
  expected two caption ribbons and four transcript lines.
- Release-site CSP, HSTS, permissions policy, referrer policy, nosniff, and
  immutable cache header for the fingerprinted JS are live.
- A live Linux browser received a real `Download for Linux` button pointing to
  `Local.Live.Captions_0.1.17_amd64.AppImage`; no console errors occurred.
- The live `install.sh` downloaded, source-checked, checksum-checked, and
  installed that AppImage to an isolated PATH. Its SHA-256 was
  `77e4842755510cd36b09e9e090678f9b5446c681074f790c58f5e139a702946e`,
  matching `SHA256SUMS`. Windows MSI checksum published as
  `f982248e94572929441127a3c8a492afd4c38307972b483fa935fcc183f3534c`.

## Known limits / next steps

- macOS and Windows packages were built and checksum-verified on their GitHub
  runners; executing the unsigned installers still requires those operating
  systems. The Windows checksum path was executed in the hosted Windows
  verification job; it intentionally does not launch the installer.
- The planned 20-minute accessibility user pilot remains a product outcome
  measure, not a pre-release automated test.
