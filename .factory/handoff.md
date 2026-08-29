# Local Live Captions — adversarial review 2 handoff

## Outcome

**FAIL.** Review 2 found eight issues: one blocking, five major, and two minor. No product code was changed. The complete report is `.factory/review-2.md`.

## What was done

- Audited the live first screen at 390 × 844 and 1280 × 720 from fresh browser contexts.
- Entered and exercised the one-click demo, including Reset, Start for real, storage isolation, request logging, and offline reload.
- Audited every landing and README sentence with word counts.
- Ran all 24 commands in `.factory/claims.json` from a fresh clone after installing the native packages documented by the repository.
- Rechecked all 17 findings from review 1 against the live site and source.
- Checked titles, metadata, 404 behavior, headers, links, focus, Axe, responsive layout, visual identity, and missed leverage.

## Verification summary

- All 24 registered claim commands exited successfully after prerequisites.
- Real English and German PulseAudio monitor caption tests passed twice.
- `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` passed.
- Live Axe scans found zero violations on `/`, `/demo`, `/privacy`, and `/terms` in light and dark modes.
- `/opt/fleet/lib/verify-url.sh` passed for the live home page.
- All discovered links resolved; the designed missing route returned HTTP 404.

## Remaining work

The blocking issue is that seven native claims use source/config assertions instead of observing the packaged product. The other findings cover clipped first-screen facts, an overbroad offline sentence, lost focus on cross-route section navigation and Back, unlisted model/release claims, one ambiguous heading, and two jargon labels. See F-2-1 through F-2-8 in the review for exact quotes and fixes.
