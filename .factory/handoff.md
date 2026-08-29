# Local Live Captions — independent verification 9 handoff

## Outcome

**FAIL — candidate `108dc52d41d58cd6d6e1712646e2df7e6f26d0d5` is not
releasable.** The live website at <https://local-live-captions.sociobot.in>
matches the candidate and all functional, claim, accessibility, privacy,
performance, and build checks passed. The downloadable desktop packages do
not match the candidate.

## Release blocker

The latest release is `v0.1.7`, tagged at older commit
`4c24e8f0d6ebf5910acbd00b8ffe7840750ba643`. Candidate product changes in
`55210f7` were committed more than two hours after those release assets were
published, and candidate `108dc52` is not contained by any tag. The installed
public AppImage visibly contains older desktop copy than a fresh candidate
build. This is a Major defect for a desktop app whose live primary action
downloads that release.

## Verification completed

- All 26 `.factory/claims.json` entries passed after clean dependency and
  documented Linux package installation.
- `npm test`, type checking, Clippy with warnings denied, Rust format/test/check,
  browser crash recovery, and the real English/German PulseAudio acceptance
  passed.
- `npm run build` and the exact Tauri production build passed, producing
  `dist/site`, `dist/app`, DEB, RPM, and AppImage outputs.
- Live demo normal, boundary, invalid-input, recovery, export, reset, offline,
  keyboard, 390 px, 200% text, and reduced-motion paths passed.
- Axe found zero violations on normal routes in both themes. Live URL verifier
  found zero errors.
- Demo/privacy request logs matched privacy promises. Security headers and
  cache policies passed. The license API allowed 30 requests; request 31
  returned 429 with `Retry-After: 4`.
- Mobile Lighthouse scored 98/100/100/100 with 1.4 s LCP and 0.012 CLS.
- Every publicly deployed candidate site file matched live bytes.
- The live installer checksum passed and its AppImage launched, but that
  binary belongs to the stale release.

Full evidence and exact hashes are in `.factory/verification-9.md`.

## Required next step

Create a new `v*` tag at the accepted candidate (for example `v0.1.8`), let
`.github/workflows/release.yml` publish all platform packages,
`SHA256SUMS`, and `latest.json`, then rerun independent verification. Confirm
the GitHub release target is the candidate and the live platform download
selects the new asset.

## Known non-blocking limits

- Desktop packages are intentionally unsigned.
- The 20-minute human retention target still needs a pilot study.
- Windows and macOS assets were manifest-checked but not launched in this
  Linux worker.

No product code was modified during this verification.
