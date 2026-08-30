# Local Live Captions — independent verification 11 handoff

## Outcome

**FAIL — release blocked.** Candidate
`f81f6c0eb051326dee835280bd25818c8a3d2b15` was independently tested on
30 August 2026 against <https://local-live-captions.sociobot.in>.

The product, demo, candidate-built Linux package, claims, accessibility,
privacy, offline behavior, performance, and static deployment pass. The live
site nevertheless has no usable platform download because its build identity
is the candidate while the published `v0.1.9` artifacts identify older commit
`6ec51c0352298721e6ef7905da7c1485ce526fab`.

Full evidence and command results are in `.factory/verification-11.md`.

## Release blocker

- Live `release-identity.json`: `v0.1.9`, commit `f81f6c0...`.
- Annotated tag, release target, and published `latest.json`: commit
  `6ec51c0...`.
- GitHub Actions runs for the candidate SHA: 0.
- Linux, Windows, and macOS user agents receive “Downloads are being
  published” and no package link.
- The live `install.sh` exits 1 in an empty consumer directory and installs
  nothing.

Publish exact-candidate artifacts and a matching manifest/tag, then verify all
three platform links and both one-line installers. Do not weaken the existing
identity check.

## Verification summary

- All 26 commands in `.factory/claims.json` passed after the documented clean
  install and Ubuntu prerequisites. The real Linux-audio command was run once
  per each of its four claim entries.
- `npm test`, typecheck, lint, browser lifecycle recovery, Rust format/tests/
  check, Linux audio acceptance, `npm run build`, and the exact Tauri
  production build passed.
- The first screen passes at 1280 × 720, 1366 × 768, 1440 × 900, and
  390 × 844. One click opens the isolated sample.
- Candidate and published AppImages both launched under Xvfb. The native
  390 px UI is keyboard operable and the sample overlay works.
- Axe found zero serious/critical findings on all routes in both themes.
  Keyboard, focus, touch targets, 200% text, reduced motion, 404, links, and
  console checks passed.
- Demo and privacy traffic stayed same-origin. Offline reload worked from
  `llc-shell-v7`. License verification allowed 30 requests; request 31
  returned 429 with `Retry-After: 4`.
- All 30 deployable site files byte-match live. Lighthouse scored 90/100/100/
  100; LCP 1.51 s, CLS 0.0031, transfer 113,151 bytes. JS/CSS/font/image budgets
  pass.
- Published AppImage checksum matches `SHA256SUMS`, but it belongs to the old
  SHA and therefore cannot satisfy this candidate.

## How to verify

Install the packages listed in `.github/workflows/release.yml`, then run:

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
```

## Known limits and operator action

- A human 20-minute pilot is still needed to evaluate the brief's 75%
  retention success measure.
- Packages remain intentionally unsigned. Future signing requires operator
  certificates and the `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets.
- Only Linux packages can be launched in this worker; Windows and macOS were
  checked through workflow and release metadata.
- Operator must create and publish a new exact-candidate release. Verification
  did not alter releases, tags, deployment, product code, DNS, or billing.
