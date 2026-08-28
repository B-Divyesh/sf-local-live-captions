# Repair handoff — Local Live Captions 0.1.3

Repaired every release blocker from `.factory/verification-3.md` for candidate
`491726b573aabbc95079cc5e3e24f8d54e9e822c`. The artifact remains a Tauri 2
desktop app with its static companion site and static deployment class.

## Repairs

- Regenerated `src-tauri/Cargo.lock`; the root package is now correctly locked
  at `0.1.3`, so normal Cargo commands leave a clean checkout.
- Expanded `.factory/claims.json` from 10 to 19 public claims. Every claim has
  exactly one tagged regression test. The new inventory covers raw-audio
  storage, in-memory transcripts, telemetry/trackers, consent, local model
  storage, monitor validation, call/speaker boundaries, unsigned installers,
  and the full Linux monitor job.
- Moved model downloading into a reusable local-data-directory helper and
  added an explicit monitor-availability check immediately before PulseAudio or
  PipeWire monitor capture starts.
- Added `npm run test:linux-audio`: it starts an isolated PulseAudio null sink,
  plays the shipped public-domain JFK speech fixture, downloads the real
  `tiny.en` model into ignored test cache, captures from the monitor, asserts
  Whisper output, validates SRT formatting, then opens a second capture after
  the first stops. The release workflow installs PulseAudio and runs this gate.
- Added fixture provenance in `tests/fixtures/README.md`. `jfk.wav` SHA-256:
  `59dfb9a4acb36fe2a2affc14bacbee2920ff435cb13cc314a08c13f66ba7860e`.

## Verification

Ran from a clean Node install with the release workflow's Linux dependencies:

```sh
npm ci
npx tsc --noEmit
npm test                         # 12 Vitest; 23 Playwright passed, 3 expected skips
npx playwright test --project=chromium --workers=1 # 11 passed, 2 expected skips
npx playwright test --project=mobile --workers=1   # 12 passed, 1 expected skip
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml    # 10 passed, one acceptance test intentionally delegated below
cargo check --manifest-path src-tauri/Cargo.toml
npm run test:linux-audio          # isolated monitor → real model → captions → SRT → restart
npm run build                      # dist/site and dist/app
APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build
```

The Linux audio acceptance run passed with the captured phrase “ask not what
your country …”; it uses no host audio device. The produced installers are:

- `Local Live Captions_0.1.3_amd64.AppImage` — SHA-256
  `e02e0f7e49d551f9805edd6076ca301c43586caa96cf6ea4f8985179fda326ec`
- `Local Live Captions_0.1.3_amd64.deb` — SHA-256
  `374caa96ce4690fe6958fbd252eb705a4affe44e5bd1d67805ed64c548b4a629`
- `Local Live Captions-0.1.3-1.x86_64.rpm` — SHA-256
  `c84f7902511213013a5a090831ca6b864a53abbf80d40e06b4fadaf76bb1931e`

The AppImage stayed running under Xvfb for 12 seconds until the intentional
timeout. Its audio-backend messages only reflect that Xvfb has no host audio
device; the app emitted no application error.

## Deployment

The static site is deployed from `dist/site` with:

```sh
/opt/fleet/lib/deploy-static.sh local-live-captions dist/site
```

Post-deploy URL evidence is recorded with:

```sh
/opt/fleet/lib/verify-url.sh https://local-live-captions.sociobot.in .factory/verify-url-repair
```

## Known limits / operator action

macOS and Windows installers remain intentionally unsigned. Supply
`APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` to the release workflow only if
signed installers are required. No product behavior is gated on a supporter
license.
