# Polish round 2 — review finding closure

Repair commit: `55210f7528479699539d7a2a25ac3a1559b1a8d9`. Verification date: 29 August 2026.

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Kept the supported headline, “Caption Linux calls and recordings locally.” | `tests/e2e/site.spec.ts` landing test; `npm test`. |
| F-1-2 | Kept the shipped German fixture and real multilingual monitor acceptance path. | `npm run test:linux-audio` (`@claim:german-caption-end-to-end`). |
| F-1-3 | Kept the accurate same-origin demo wording. | `@claim:private-local`; direct `/demo` request log. |
| F-1-4 | Kept checkout wording limited to the observable Dodo-through-Sociobot redirect. | `@claim:free-and-paid`. |
| F-1-5 | Kept the accessible external-checkout label. | `@claim:free-and-paid`; browser accessibility suite. |
| F-1-6 | Kept “Resizable caption overlay” as the feature heading. | Landing heading test. |
| F-1-7 | Kept “Optional $24 supporter license” as the payment heading. | Landing heading test. |
| F-1-8 | Kept the concrete privacy heading. | Route-title and Axe tests. |
| F-1-9 | Kept the real 404 with “Page not found.” | Route-title test and static 404 configuration test. |
| F-1-10 | Kept the computer-processing artwork caption. | Landing copy audit. |
| F-1-11 | Kept descriptive section names and removed decorative labels. | Landing copy audit. |
| F-1-12 | Kept the README’s product-language opening. | `.factory/copy-audit.md`. |
| F-1-13 | Kept “audio source” and defined “monitor source.” | README and landing copy audit. |
| F-1-14 | Kept the short monitor-source README sentences. | `.factory/copy-audit.md`. |
| F-1-15 | Kept the split, testable Linux acceptance explanation. | README; `npm run test:linux-audio`. |
| F-1-16 | Kept the reconciled claim inventory and updated it to 26 entries. | `tests/unit/claims-governance.test.ts`. |
| F-1-17 | Exercised both visible desktop deletion controls in the desktop renderer harness. | `@claim:storage-controls`. |
| F-2-1 | Replaced source/config-only overlay, recovery, and storage checks with a desktop renderer harness; moved local processing and audio-storage evidence to real monitor capture; reset-session and filesystem assertions now execute behavior rather than scan source. | `@claim:desktop-overlay`, `@claim:capture-recovery`, `@claim:storage-controls`, `@claim:native-local-processing`, `@claim:no-audio-storage`. |
| F-2-2 | Compacted the short-height and phone hero layouts and added assertions that every fact is inside 1280×720 and 390×844. | `desktop first screen…` and `mobile first screen…` Playwright tests. |
| F-2-3 | Changed the visible fact to “The sample works offline after your first visit.” and made the registered claim exact. | `@claim:offline-reload`. |
| F-2-4 | Routed section links through the history/focus handler and restored destination focus on Back/Forward. | `section navigation and browser history…` Playwright test. |
| F-2-5 | Added a pinned upstream whisper.cpp MIT-license copy, provenance checksum, and model-source claim test. | `@claim:model-provenance-license`. |
| F-2-6 | Added a release fixture and claim that verifies the tag/manual workflow path, macOS/Windows/Linux packages, SHA256SUMS, and latest.json. | `@claim:release-artifacts`. |
| F-2-7 | Replaced “Ask, then start” with “Confirm consent and start captions.” | Landing copy audit. |
| F-2-8 | Replaced “local model” and every SRT-only action label with plain language. | Landing and demo UI assertions in `npm test`. |

Local screenshots and live deployment checks are recorded in the final handoff after deployment.
