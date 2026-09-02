# Local Live Captions — verification 19 handoff

## Outcome: FAIL

Independent verification tested candidate
`2b4bb04b8e0d5a4cada61c395f5ff9bd97acc1dc` at
`https://local-live-captions.sociobot.in` on 2026-09-02.

The live product matches the candidate and passes its 29 claims, first-read
demo, functional flows, privacy checks, accessibility checks, performance
budgets, and clean local quality gates. It is not releasable because its
downloadable desktop release does not match the candidate.

## Release blocker

The live site identifies `v0.1.19` as candidate commit `2b4bb04b...`, while the
Git tag, GitHub Release, and published `latest.json` identify older commit
`724bcff0...`. Consequently:

- `npm run verify:published-release` fails on both commit comparisons.
- Candidate-aware `npm run verify:release-source` fails because the tag points
  to the older commit.
- The live detected-platform area has no download button and says the downloads
  are still being published.
- The live `/install.sh` exits 1 and installs nothing.
- No release workflow exists for the candidate SHA.

This is a High, release-blocking defect. Publish a new immutable version/tag
from the accepted candidate with all Linux, macOS, and Windows assets,
`SHA256SUMS`, and `latest.json`; then deploy the site from the same tag. Do not
move the existing `v0.1.19` tag.

## Verification performed

- All 29 exact `.factory/claims.json` commands: PASS after clean `npm ci`.
- `npm test`: PASS; 33 unit, 24 desktop browser, and 27 mobile browser tests.
- `npm run typecheck`, `npm run lint`, Cargo fmt, check, and tests: PASS.
- `npm run build`: PASS; produced `dist/site` and `dist/app`.
- `npm run test:browser-lifecycle` and real Linux English/German audio tests:
  PASS.
- `npm run build:linux-packages`: PASS; generated AppImage and DEB.
- Cold first-read desktop/mobile: PASS; what, audience, first action, and all
  three facts are visible. One click opens the isolated sample demo.
- Demo pause/resume, size boundaries, TXT/SRT export, reset isolation, invalid
  license recovery, offline service-worker reload, and 200% reflow: PASS.
- Desktop/mobile, light/dark, reduced-motion, and keyboard checks: PASS; zero
  serious/critical Axe findings and visible focus on 44 px targets.
- Direct demo requests are same-origin only. Security headers and cache policy
  pass. No analytics, telemetry, remote speech, CDN font, or third-party script
  request was observed.
- License API burst limit observed: 30 requests; request 31 returns 429 with
  `Retry-After: 3`.
- Mobile Lighthouse: Performance 97, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.40 s, TBT 195 ms, CLS 0.012.

The detailed record is [.factory/verification-19.md](verification-19.md), with
artifacts under `.factory/evidence-verification-19/`.

## How to reproduce

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:linux-audio
npm run build:linux-packages
npm run verify:published-release
RELEASE_TAG=v0.1.19 RELEASE_COMMIT=2b4bb04b8e0d5a4cada61c395f5ff9bd97acc1dc npm run verify:release-source
```

The last two commands reproduce the blocker and should pass after a corrected
release is published.

## Known gaps and operator action

No other release-blocking defect was found. Packages are intentionally
unsigned and the site discloses this. Future signing still requires the
operator-owned Apple and Windows certificate secrets documented by the release
workflow.
