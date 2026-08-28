# Independent verification status — FAIL (28 August 2026)

Candidate `491726b573aabbc95079cc5e3e24f8d54e9e822c` is **not accepted**.
See `.factory/verification-3.md` for the complete independent evidence. The
live site matches the tested static build, all listed claims and quality commands
pass, and production Linux packaging succeeds; however, material public claims
remain unlisted/untested and actual PipeWire/PulseAudio monitor-to-caption flow
has no independent end-to-end evidence. The committed Cargo lockfile also still
names the root package as 0.1.2. Do not release until the three required next
steps in the verification report are complete.

# Repair handoff — Local Live Captions 0.1.3

Repaired the release blockers documented in `.factory/verification-2.md` for candidate `a5abef3f25c087d000a5de63a314212d30504e5e`. The artifact remains a Tauri 2 desktop application with its static companion site.

## Repairs

- Fixed the release TypeScript gate by typing static-web-app routes correctly.
- Bumped the product to `0.1.2`; `Cargo.lock` locks the Linux PulseAudio bindings.
- Added direct PulseAudio-compatible monitor capture for Linux. PipeWire's PulseAudio server exposes monitor sources through `pactl`; these sources are listed as system-audio monitors and are opened with `libpulse-simple` at 16 kHz. ALSA input capture remains available.
- Added `libpulse-dev` and `pulseaudio-utils` to the release runner's Linux dependencies.
- Made English and the multilingual German-capable `base` model free. The $24 Dodo product is accurately described as an optional supporter license; no caption, export, sizing, or overlay accessibility behavior is paid.
- Confirmed the registered checkout endpoint returns HTTP 303 to a live Dodo checkout, and made that redirect an end-to-end regression test.
- Reworked claims so each has exactly one tagged regression test. The suite enforces that invariant and covers demo isolation, checkout, free German, direct monitor discovery, local processing, capture recovery, and the resizable/always-on-top overlay.
- Raised remaining release/download and footer link targets to 44 px. Updated the README Linux package command to include `APPIMAGE_EXTRACT_AND_RUN=1`.
- Set Playwright to one worker. A release build filled the disposable container and Chromium could SIGSEGV while making a second context; after clearing generated `target/` output, the serial full browser suite passed.

## Verification

Passed from a clean Node install (`npm ci`):

```sh
npx tsc --noEmit
npm test                         # 8 Vitest; 21 Playwright passed, 3 intentional skips
npx playwright test --workers=1 # desktop + 390 px coverage
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml  # 5 native tests
cargo check --manifest-path src-tauri/Cargo.toml
npm run build                    # dist/site and dist/app
APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build
```

Every exact command in `.factory/claims.json` passed. The checkout test asserted a live HTTP 303 to `checkout.dodopayments.com`; no payment was made.

The local Tauri package build produced before the final workflow-only browser-provisioning update:

- `Local Live Captions_0.1.2_amd64.AppImage` — SHA-256 `ede08e9b44580c09db5fc3c8d3138c7e96defa5340a9f4f809cb5856d77dddf0`
- `Local Live Captions_0.1.2_amd64.deb` — SHA-256 `36591aa6af39ae4ba4fc0d9f73b1587d266d39529952e85ae9fafdb836f16186`
- `Local Live Captions-0.1.2-1.x86_64.rpm` — SHA-256 `85d7212413e215e1180c10e99a9e49b7a0e569c5e37f9892535267a83bc9fb84`

The packaged Linux app remained running under Xvfb for 12 seconds until the intentional timeout. Local static verification at `http://127.0.0.1:4173` returned 200 in 671 ms with no console errors, a title, `lang=en`, one `h1`, a `main` landmark, and no missing image alt text. Browser Axe coverage passes serious/critical checks in light and dark at desktop and 390 px.

## Linux-audio evidence and limit

The native code now uses the direct local PulseAudio protocol for a selected monitor source; the source parser and capture startup path are regression covered. This disposable container has no running user PipeWire/PulseAudio server or consented audible fixture, so it cannot honestly provide a physical speech-to-caption transcript. On a Linux desktop, verify with a monitor visible from `pactl list short sources`, download a model, play a consented fixture, then confirm captions and SRT export. The app reports a recoverable error if the monitor cannot open or stops.

## Release and deploy

GitHub Actions run `33212013462` passed verification, universal macOS, Linux, Windows, and manifest publication for release [`v0.1.3`](https://github.com/B-Divyesh/sf-local-live-captions/releases/tag/v0.1.3). Its `target_commitish` is `7e0f003eda0105dd1d3082e668e933e6ba155908`.

Published release assets include AppImage, DEB, RPM, universal DMG, macOS app archive, Windows EXE/MSI, `SHA256SUMS`, and valid `latest.json`. The published AppImage SHA-256 is `1c355e35a3d36a0987a84076e4670863a9cae34777ec4a275ed273b946e67895`; `public/install.sh` installed that exact 80 MB artifact into an isolated consumer directory after checksum verification.

The static site was deployed with `/opt/fleet/lib/deploy-static.sh local-live-captions dist/site`. The live URL is <https://local-live-captions.sociobot.in>; it byte-matches the final `dist/site/index.html`, loads in 714 ms with no browser console errors, and has title/lang/one-h1/main/alt checks passing. The live hashed JS has `Cache-Control: public, max-age=31536000, immutable`; an unknown route returns HTTP 404.

macOS/Windows signing remains optional operator work: provide `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` only if signed installers are required.
