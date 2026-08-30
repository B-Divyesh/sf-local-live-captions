# Local Live Captions — repair 12 handoff

## Outcome

Repaired the release-blocking finding from independent verification 14 for
candidate `003f7a396d6cf279326a9d5481ce4f1b82af43a1`.

The failure was a release identity split: the deployed site claimed
`003f7a3…`, while `v0.1.12` and its `latest.json` claimed `2db4639…`.
Downloads correctly withheld their packages, but that left the desktop app
without an installable release. The repair creates a new immutable
`v0.1.13` release source and adds a checked release-site build path so a site
cannot be built for deployment from a different checkout than its release tag.

## What changed

- Bumped package, Tauri, Cargo, lockfile, release fixture, browser fixture,
  installer fixture, and release documentation to `0.1.13` / `v0.1.13`.
- Added `npm run build:release-site`. It resolves `RELEASE_TAG`, refuses an
  untagged or mismatched checkout, verifies package/tag/source consistency,
  builds with the immutable tag commit in `VITE_BUILD_SHA`, and then checks
  the generated `dist/site/release-identity.json` before a deployable site is
  left on disk.
- Added the exact verification-14 regression: candidate
  `003f7a3…` cannot produce a site for `v0.1.12` because that tag resolves to
  `2db4639…`. The regression also checks the emitted site identity.
- Kept the existing download and one-line-installer guards. They continue to
  withhold artifacts unless the site identity, GitHub release target, and
  `latest.json` all agree.

## Verification

Performed after a clean `npm ci` (66 packages; 0 npm vulnerabilities) and
after installing the Linux/Tauri/PulseAudio prerequisite packages documented
in `.github/workflows/release.yml`:

```sh
npm run test:unit -- --testNamePattern='immutable static release builds|release configuration regressions|published release contract|one-line installer release identity'
npm run typecheck
npm test
npm run lint
npm run test:browser-lifecycle
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
npm run build
npm run test:linux-audio
APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build
```

All commands passed. The full unit/browser run has 25 Vitest tests and the
isolated Chromium desktop plus 390 px mobile suites. The intentional
browser-crash lifecycle test retried with a clean browser and passed. Rust
reports 10 passing unit tests and two hardware acceptance tests ignored by
the ordinary unit suite; the isolated PulseAudio acceptance script passed its
English monitor capture, SRT/restart checks, and all four German runs.

All 23 distinct commands in `.factory/claims.json` were invoked in manifest
order. They cover all 26 claims; the shared Linux-audio command covers the
native local-processing, German, no-audio-storage, and monitor end-to-end
claims. Every command passed.

The production Tauri build produced:

- `Local Live Captions_0.1.13_amd64.AppImage` — 81,246,712 bytes
- `Local Live Captions_0.1.13_amd64.deb` — 5,437,144 bytes
- `Local Live Captions-0.1.13-1.x86_64.rpm` — 5,436,788 bytes

The AppImage stayed open under Xvfb for 15 seconds (expected timeout status
124). The only output was normal headless EGL/ALSA/JACK device noise.

Local `verify-url.sh` checks on `/` and `/demo` passed: both routes returned
200 with correct title, `lang`, one `h1`, a main landmark, alt text, labelled
buttons, and no browser console/page errors. The project’s Playwright axe
scans passed with no serious or critical findings in desktop and 390 px
mobile coverage. The standalone `@axe-core/cli` was also attempted but this
worker has no compatible ChromeDriver for the preinstalled Playwright
headless shell; it exits at ChromeDriver session creation before scanning.

## Publish and deploy procedure

The release tag must point at this repair commit. After the GitHub Actions
release has published its packages, deploy only the tag-built output:

```sh
RELEASE_TAG=v0.1.13 npm run build:release-site
/opt/fleet/lib/deploy-static.sh local-live-captions dist/site
npm run verify:published-release
```

The final publication check must show the same `v0.1.13` tag and commit for
the deployed `/release-identity.json`, GitHub release target, and
`latest.json`. The landing download link and `install.sh` then expose only
that matching release.

## Known limits

- GitHub Actions builds macOS and Windows packages, but they cannot be run in
  this Linux worker. They remain unsigned; operator signing requires
  `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX`.
- The brief’s 75% retention target still needs its planned human pilot and is
  not claimed by the product.
