# Local Live Captions — review 3 handoff

## Outcome

**FAIL.** Review 3 completed on 1 September 2026 against commit
`5d8a774cebafc08fd0f4b935690c7d0ec6fe0118`. No product code was changed.
The complete QA report is in `.factory/review-3.md`.

## What was checked

- Fresh public first-read checks at 390 x 844 and 1366 x 768.
- One-click demo, banner, populated sample, Reset isolation, Start-for-real
  isolation, and demo request boundary.
- Landing and README sentence audit, claim-inventory cross-check, earlier
  review/polish finding recheck, routes, metadata, focus, 404, headers,
  responsive accessibility, and visual direction.
- `npm ci`, `npm test`, `npm run typecheck`, and `npm run build` from a new
  clone. The build produced `dist/site` and `dist/app`.
- Every command listed in `.factory/claims.json` from that clone.

## Verification result

Browser and focused unit claim commands passed. The native claim commands did
not run in the clean sandbox because GLib development files and PulseAudio are
not provided by a repository-owned claim-test environment. Eight Rust claim
commands stop when `pkg-config` cannot find `glib-2.0`; four audio claim
commands stop with `Install pulseaudio before running this test.` This is
blocking finding F-3-1.

## Next step

Add a pinned, repository-owned native test environment or runner, point the
affected claim entries at it, and rerun all declared claim commands from a new
clone. No product behavior or copy repair is requested by this review.
