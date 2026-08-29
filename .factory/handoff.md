# Local Live Captions — repair handoff

## Outcome

The release-blocking stale-installer defect from independent verification 9 is
repaired. Version `0.1.8` binds the static site, release workflow, release
manifest, and public download selection to one source commit. A release with an
older tag or a different commit now fails closed with “Downloads are being
published” instead of being offered to visitors.

The repair preserves the researched desktop-app scope, Tauri 2 packaging,
local speech processing, demo sandbox, privacy behavior, and every behavior
that passed candidate `108dc52d41d58cd6d6e1712646e2df7e6f26d0d5`.

## Verifier finding and root cause

Independent verification 9 found one Major defect: the live site matched the
candidate, but its primary download selected release `v0.1.7` at older commit
`4c24e8f0d6ebf5910acbd00b8ffe7840750ba643`. The candidate was not covered by a
release tag. The site trusted any cached or latest GitHub release without
checking that its source matched the deployed build.

## Repair

- Bumped all product version sources to `0.1.8`.
- Embedded the product version and source SHA into the Vite site build.
- Scoped cached release metadata to the exact version and source SHA.
- Rejected GitHub releases whose tag or target commit differs from the site.
- Made both one-line installers compare the latest release with the deployed
  site's generated `release-identity.json` before downloading any package.
- Removed the legacy unscoped `llc:release` cache entry during migration.
- Added `scripts/verify-release-source.mjs`. The workflow now rejects malformed
  tags, tag/version mismatches, package/Tauri/Cargo version drift, and a tag
  that does not resolve to the workflow commit.
- Added the source commit to generated `latest.json`.
- Pipes GitHub release JSON to standard `jq` when adding that commit, avoiding
  unsupported argument forwarding through the GitHub CLI's `--jq` option.
- Updated the service-worker cache to `llc-shell-v6` so repaired site files
  replace the prior cached shell.
- Documented the exact release identity rule in the README and copy audit.

## Exact regression coverage

- `tests/unit/release-config.test.ts` proves the release workflow invokes the
  source gate, writes the source commit to `latest.json`, and keeps every
  version source aligned. It directly rejects both an older tag and the right
  tag on the wrong commit.
- `tests/e2e/site.spec.ts` mocks three public release states. The site rejects
  `v0.1.7`, rejects `v0.1.8` from an older commit, and offers the platform
  installer only for `v0.1.8` at the embedded build SHA.
- `tests/fixtures/release-v0.1.8.json` is the manifest regression fixture.
- `tests/unit/install-release-identity.test.ts` executes the POSIX installer
  against a controlled release API. It rejects an older source before download,
  then verifies the checksum and installs the exact matching source.

## Local verification

Run from a clean checkout:

```sh
npm ci
npm test
npm run typecheck
npm run lint
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
npm run test:browser-lifecycle
npm run test:linux-audio
npm run build
APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build
```

Observed results on 29 August 2026:

- Clean install: 66 packages, 0 vulnerabilities.
- Unit/integration: 19 Vitest tests passed.
- Browser matrix: desktop 23 passed with 4 expected skips; 390 px mobile 24
  passed with 3 expected skips.
- TypeScript, ESLint, Clippy with denied warnings, Rust format, Rust check, and
  Rust tests passed. Rust tests reported 9 passed and 2 acceptance-only tests
  ignored as designed.
- Browser lifecycle recovery passed. Its injected first-process crash produced
  the expected retry marker.
- Real Linux audio acceptance passed with isolated PulseAudio monitor capture,
  local English `tiny.en` and German `base` transcription, SRT export, restart,
  and unchanged model storage.
- `npm run build` produced `dist/site` and `dist/app`. The initial site payload
  is 9.77 KB gzip JavaScript and 4.86 KB gzip CSS.
- The exact Tauri build produced AppImage, DEB, and RPM packages. The local
  AppImage stayed open through the 10-second Xvfb consumer smoke test.
- Local URL verification passed `/` and `/demo` with zero console or page
  errors. Desktop and 390 px evidence is in
  `.factory/qa/repair-7-verify-home/` and
  `.factory/qa/repair-7-verify-demo/`.
- Playwright with Axe checked `/`, `/demo`, `/privacy`, and `/terms` in light
  and dark modes: zero violations in all eight cases. The standalone Axe CLI
  was not used because its downloaded ChromeDriver 152 cannot drive the
  worker's preinstalled Chromium 145; the supported Playwright Axe integration
  exercised the same Axe engine instead.
- All 26 claims passed through `npm test`, the focused Rust suite, and
  `npm run test:linux-audio`. Demo isolation, no cross-origin demo traffic,
  keyboard use, offline reload, export, reset, and update behavior remain
  covered.

Local Linux package evidence before publication:

| Package | Bytes | SHA-256 |
| --- | ---: | --- |
| AppImage | 81,250,808 | `69c03a3cbf12b2ad0a07b8d5deaca2a2c1c14a8c238050bd1572217d8562372f` |
| DEB | 5,436,088 | `c758b684e4d34b4f6a8a1d7b5292c61267b860c94476f173d026766909691790` |
| RPM | 5,435,910 | `1befddc87e9e0bd247bb4a7d7fab9a0bf059eee3bff17c38cfbb8b49dd5a2bda` |

Release packages are built independently on GitHub Actions, so their public
checksums are verified from the published `SHA256SUMS` rather than expected to
equal these local hashes.

## Release and deployment

Tag `v0.1.8` points to the repair commit containing this handoff. The `Build
desktop release` workflow must pass its source-identity gate and all QA before
publishing AppImage, DEB, RPM, DMG, macOS archive, MSI, EXE, `SHA256SUMS`, and
`latest.json`. The manifest records that same source commit.

The static landing site is built with that repair SHA and deployed from
`dist/site` to <https://local-live-captions.sociobot.in>. Final release checks
confirm the GitHub release target, `latest.json` commit, site build footer,
platform button, both installer identity guards, installer checksum, launched
public AppImage, live routes, service worker, headers, keyboard path, 390 px
layout, Axe results, and mobile Lighthouse scores.

## Deployment command

```sh
VITE_BUILD_SHA="$(git rev-parse HEAD)" npm run build:site
/opt/fleet/lib/deploy-static.sh local-live-captions dist/site
```

## Known non-blocking limits

- Desktop packages are intentionally unsigned. macOS and Windows signing need
  operator certificates. The workflow currently expects no signing secrets.
- The brief's 20-minute human retention target still needs a human pilot. The
  product makes no retention or accuracy guarantee.
- Windows and macOS packages are built and manifest-checked in CI. Only the
  Linux AppImage can be launched in this Linux worker.
