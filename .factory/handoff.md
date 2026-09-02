# Local Live Captions — adversarial review 4 handoff

## Outcome: FAIL

Review 4 inspected commit `8d20bc9bbd587498b6e770e3195070b54c01b7b9`
and the live product on 2 September 2026. No product code was modified.

The full report is `.factory/review-4.md`. It records five findings:

- Blocking: F-2-1 is reopened because `no-audio-storage` observes only the
  speech-model directory, not every writable location available during real
  capture.
- Major: the Privacy and Terms email links are only 20 px high on mobile.
- Major: the landing statement that supporter payments help fund updates is
  unlisted and not proved by the checkout claim.
- Major: the README's project MIT-license statement is absent from
  `claims.json`.
- Minor: the README's microphone-enumeration capability is absent from
  `claims.json` and its native monitor test.

## Verification completed

- Opened the live landing page cold at 390 × 844 and 1366 × 768 without
  scrolling. The job, audience, first action, outcome, and all three facts were
  visible.
- Entered the sample in one click. Reset and Start for real cleared only
  `demo:` session keys; seeded real keys remained. A direct demo reload worked
  offline after service-worker control, and its request log stayed same-origin.
- Cloned the repository to `/tmp/llc-review4-clean.OktoTR/repo`, ran `npm ci`,
  then ran all 27 exact commands in `.factory/claims.json`. Every command exited
  0, including real English and four-run German PulseAudio capture.
- Ran unfiltered `npm test`, `npm run typecheck`, `npm run lint`, `npm run
  build`, and `npm run verify:published-release`; all passed. The build produced
  `dist/site` and `dist/app`. The published verifier confirmed v0.1.18, commit
  `f3eb675`, seven packages, `SHA256SUMS`, and `latest.json`.
- Checked `/`, `/demo`, `/privacy`, `/terms`, and a real 404 for titles,
  metadata, landmarks, heading order, canonical/OG/favicon assets, links,
  history focus, console errors, reduced motion, 200% reflow, and Axe. All
  passed except the two legal email touch targets reported above.
- Ran `/opt/fleet/lib/verify-url.sh` successfully against the live home page.
- Read and rechecked all findings in reviews 1–3, polish reports 1–3, and the
  prior handoff. F-2-1 is reopened; every other earlier finding remains fixed.
- Completed a sentence-by-sentence landing and README audit in the review. No
  sentence exceeds 22 words and no banned marketing adjective appears.

## Next steps

Implement only the fixes named in `.factory/review-4.md`, register the two
missing capability/legal claims, remove or substantiate the funding statement,
and rerun the entire review. PASS requires zero findings and no untested claim.
