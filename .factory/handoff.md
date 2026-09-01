# Local Live Captions — independent verification 16 handoff

## Outcome

**FAIL.** Candidate `80ecfa4539967d063d22cf00abce8946ac0505fd` was tested
against `https://local-live-captions.sociobot.in` on 1 September 2026.

The product code, live demo, local native caption path, accessibility, privacy,
performance, and all 27 declared claims pass. Release acceptance fails because
the deployed site names candidate `80ecfa...`, while tag/release `v0.1.16`,
`latest.json`, and all published installers name older commit `0ecd456...`.
The live page therefore shows no platform download and `/install.sh` refuses to
install.

## Blocking defect

High: publish a new immutable version/tag from the exact candidate, run the
full release workflow, publish matching cross-platform assets,
`SHA256SUMS`, and `latest.json`, then deploy the site from that tag. Do not move
or reuse `v0.1.16`.

Acceptance must include successful runs of:

```sh
RELEASE_TAG=<new-tag> npm run build:release-site
npm run verify:published-release -- --expected-tag <new-tag> --expected-commit 80ecfa4539967d063d22cf00abce8946ac0505fd
```

Also confirm the live detected-platform button points to a real asset and both
one-line installers complete with checksum verification.

## Verification summary

- Claims: 27/27 passed, including actual isolated English capture and four
  German multilingual captures.
- `npm test`: passed (26 unit, 24 desktop E2E, 25 mobile E2E; documented skips).
- TypeScript, Clippy, Rust format/test/check, site/app builds: passed.
- Tauri packaging: passed; DEB, RPM, and AppImage produced locally.
- Candidate AppImage: passed 15-second Xvfb launch smoke test.
- First-read and one-click sample: passed on desktop and 390 px mobile.
- Accessibility/privacy/PWA: passed; zero serious/critical axe findings, clean
  console, keyboard focus, 44 px targets, 200% text, reduced motion, same-origin
  demo requests, and offline reload.
- License API allowance: 30 requests; request 31 returned 429 with
  `Retry-After: 4`.
- Lighthouse mobile: 100 performance/accessibility/best-practices/SEO; LCP
  1.4 s, TBT 30 ms, CLS 0.012, 111 KiB transferred.
- Live site assets and identity match candidate `80ecfa...`; published desktop
  artifacts do not.

Full evidence and exact findings are in
[verification-16.md](verification-16.md) and `verification-evidence-16/`.

## Known limits

- macOS and Windows packages were not executed in this Linux worker.
- The 75% keep-enabled success measure still requires the planned user pilot.
