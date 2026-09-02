# Local Live Captions — repair 14 handoff

## Outcome

Repair source is version `0.1.18`. It addresses every release blocker in
independent verification 17 for candidate
`7188bacd897b1040d81772938c59afcb3a4d2384`:

- A new immutable `v0.1.18` release workflow source will build all desktop
  platforms from one tag commit, then generate `latest.json` and `SHA256SUMS`
  from the assets GitHub actually published. The static deploy command builds
  the site only from that same immutable tag, including `release-identity.json`.
- Linux packaging no longer relies on FUSE. `npm run build:linux-packages`
  normalizes Tauri's required `CI=true`, sets
  `APPIMAGE_EXTRACT_AND_RUN=1`, builds the AppImage and DEB, and rejects a
  partial, empty, or missing package. The release workflow runs this as a
  required Linux package gate before the full platform matrix.
- The demo has a real 200%-reflow layout at 195 CSS px: navigation, demo
  actions, caption controls, exports, and transcript stack to one column with
  no document horizontal overflow.

## Reproduction and repair evidence

The verifier's exact raw package command was reproduced after `npm ci`:

```sh
env -u CI npx tauri build --bundles appimage,deb
```

It left only `Local Live Captions.AppDir`, matching the reported failed
`linuxdeploy` path. The repaired production command completed:

```sh
npm run build:linux-packages
```

It produced local Linux artifacts for `0.1.18`:

- `Local Live Captions_0.1.18_amd64.AppImage` — 81,709,560 bytes,
  SHA-256 `e4db982fd7456617ee3303c1a4365003918e8f0b1b6c40e4da8b3e59311fd765`
- `Local Live Captions_0.1.18_amd64.deb` — 5,437,696 bytes,
  SHA-256 `cdf2db800dbb14ab74bf08476e70bf41d016a10a0b0ea4ecbb4028abd62747c5`

The DEB metadata reports package version `0.1.18` and architecture `amd64`.
The unit regression rejects both the missing extraction environment and a
partial AppDir/undersized package. The workflow also installs
`libglib2.0-dev`, which the clean native compiler requires.

## Verification

Completed locally after a clean `npm ci`:

```sh
npm test
npm run typecheck
npm run lint
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
npm run build
npm run build:linux-packages
npx playwright test --project=mobile --grep '200% reflow uses a narrow demo layout'
npx playwright test --project=chromium --grep 'dark pages have no serious or critical contrast violations'
```

`npm test` completed all 30 unit tests and isolated Chromium/mobile browser
projects. The new 200%-reflow regression uses a 195 × 844 viewport, asserts no
horizontal overflow, and confirms Reset demo, Start for real, Pause captions,
and Export TXT remain visible in the viewport.

`/opt/fleet/lib/verify-url.sh` passed for local `/demo`: HTTP 200, title
`Demo — Local Live Captions`, `lang=en`, exactly one h1, main landmark, no
missing image alt text, no unlabeled button, and no console error. Its captured
output is in [`repair-14-verify-demo`](repair-14-verify-demo/). The existing
Playwright Axe integration passed dark landing/demo with no serious or critical
violations.

## Release and deployment procedure

Create the annotated `v0.1.18` tag from this exact commit and push it. The
release workflow resolves the tag commit before testing and packaging; its
manifest job verifies the live GitHub release contract, every required desktop
asset, every manifest URL, and every checksum. After that succeeds, deploy:

```sh
RELEASE_TAG=v0.1.18 npm run deploy:release-site
npm run verify:published-release -- --expected-tag v0.1.18 --expected-commit <tag-commit>
```

The site must not be deployed from a later checkout. `deploy:release-site`
fails before upload if the tag, checkout, or generated release identity differ.

## Known limits

- macOS and Windows packages are unsigned. Their builds and checksums are
  produced on their native GitHub runners; opening those installers still needs
  those operating systems.
- The planned 20-minute accessibility pilot remains a product outcome measure,
  not a release-gate automation.
