# Polish round 3 — complete finding ledger

This round starts from `6a82d399e8cd9515f799972596f8aabbb875b439`.
The remaining release blocker, F-3-1, is repaired in release `v0.1.16`
(`0ecd456533c7eaac81923580e7875c381e1b50ba`) by the repository-owned native
runner. The final checks named below ran from a new clone. The release matrix
passed at <https://github.com/B-Divyesh/sf-local-live-captions/actions/runs/33563915326>.
Live screenshots, route checks, and Lighthouse output are recorded under
`.factory/evidence-polish-3/` after deployment.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the bounded headline, “Caption Linux calls and recordings locally.” | `landing page states the job and has one heading`; live `/`, `live-first-read-390.png`. |
| F-1-2 | Kept the shipped German fixture and four-run multilingual monitor regression. | `npm run test:native-claim -- german-caption-end-to-end`; live `/` model copy check. |
| F-1-3 | Kept the accurate demo privacy boundary: data is sent to no other sites. | `@claim:private-local`; live `/demo`, `live-demo-390.png`. |
| F-1-4 | Kept only the verifiable Sociobot checkout wording; unsupported merchant and refund statements are absent. | `@claim:free-and-paid`; live `/`. |
| F-1-5 | Kept the external-checkout disclosure on the supporter action. | `@claim:free-and-paid`; live `/`. |
| F-1-6 | Kept the descriptive “Resizable caption overlay” section heading. | `landing page states the job and has one heading`; live `/`. |
| F-1-7 | Kept the descriptive “Optional $24 supporter license” section heading. | `@claim:free-and-paid`; live `/`. |
| F-1-8 | Kept “Your audio stays on your computer” as the privacy heading. | `routes have distinct titles and one h1`; live `/privacy`. |
| F-1-9 | Kept the designed real 404 with “Page not found.” | `routes have distinct titles and one h1`; live `/not-a-real-route`, `live-routes.json`. |
| F-1-10 | Kept the direct computer-processing figure caption. | `landing page states the job and has one heading`; live `/`. |
| F-1-11 | Kept descriptive headings and removed decorative section lore. | `.factory/copy-audit.md`; live `/`, `live-first-read-390.png`. |
| F-1-12 | Kept the product-language README opening and defined SubRip on first use. | `.factory/copy-audit.md`; `README.md` inspection from the clean clone. |
| F-1-13 | Kept “audio source” as the selectable item and defined “monitor source” once. | `.factory/copy-audit.md`; live `/`. |
| F-1-14 | Kept the monitor-source explanation split into short sentences. | `.factory/copy-audit.md`; clean-clone README audit. |
| F-1-15 | Kept short English and German acceptance-test documentation. | `npm run test:native-claim -- linux-monitor-end-to-end`; clean-clone README audit. |
| F-1-16 | Reconciled the inventory and handoff to 27 claims. | `claim governance`; `.factory/claims.json` count. |
| F-1-17 | Kept visible desktop controls for deleting a downloaded model and removing a local license. | `@claim:storage-controls`; live `/privacy`. |
| F-2-1 | Kept observable renderer harnesses and real monitor capture checks instead of source-only browser assertions. | `@claim:desktop-overlay`, `@claim:capture-recovery`, `@claim:storage-controls`, and native claim commands. |
| F-2-2 | Kept all three plain facts above the fold at required desktop and phone sizes. | `desktop first screen keeps the full first-read content visible`; `mobile first screen keeps the three plain facts visible`; `live-first-read-390.png`. |
| F-2-3 | Kept the qualified offline sentence, “after your first visit.” | `@claim:offline-reload`; live `/`. |
| F-2-4 | Kept history routing that restores destination heading focus. | `section navigation and browser history keep focus on the destination heading`; live `/privacy` → `/#how` → Back. |
| F-2-5 | Kept the pinned whisper.cpp source and MIT-license provenance claim. | `@claim:model-provenance-license`. |
| F-2-6 | Kept the release-artifact inventory and immutable-release test. | `@claim:release-artifacts`; live `release-identity.json` and published release check. |
| F-2-7 | Kept “Confirm consent and start captions” as the third step heading. | `landing page states the job and has one heading`; live `/`. |
| F-2-8 | Kept plain-language processing and subtitle-export labels. | `@claim:srt-export`; live `/demo`. |
| F-3-1 | Native claims now enter through `scripts/run-native-claim.sh`, which uses a pinned Ubuntu image when Docker exists or installs its explicit GLib, Tauri, ALSA, and PulseAudio prerequisites before testing. This round adds direct `libglib2.0-dev` declarations and pins Rust 1.98.0 in the container so Docker and the GitHub Linux runner accept the locked dependency graph. | `@claim:native-claim-environment`; all 27 commands in `.factory/claims.json` passed from a clean clone (`/tmp/local-live-captions-polish3-final2-dRqZKL/all-claims.log`); the tagged GitHub `npm run test:linux-audio` Docker stage passed in release run `33563915326`. |

## Final live regression set

- Cold desktop and 390 px phone first screens: `live-first-read-desktop.png` and `live-first-read-390.png`.
- Direct `?demo=1`, banner, reset, start-for-real, exports, and 200% mobile layout: `live-demo-390.png` and `live-routes.json` (four bundled captions, zero external demo requests, TXT export, reset/start-for-real namespace assertions, zero horizontal overflow).
- `/`, `/demo`, `/privacy`, `/terms`, and a real 404: `live-routes.json`.
- Console, title, language, main landmark, and image alternatives: `verify-live/verify.json`.
- Serious and critical Axe findings: zero on the five checked live routes, recorded in `live-routes.json`.
- History focus is true for the How-it-works heading and the restored Privacy heading in `live-routes.json`.
- Lighthouse mobile: Performance 100 and Accessibility 100, LCP 1.36 s, CLS 0.012: `lighthouse-mobile.json`.

## Final status

Every review 1, 2, and 3 finding is closed. The live URL
<https://local-live-captions.sociobot.in> was opened from a cold browser after
deployment of `v0.1.16`; no unaddressed finding remains.
