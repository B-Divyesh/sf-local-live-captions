# Polish round 1 — review finding closure

Repair source commits: `6e5c0ddabddc9375a6713b79da8425ef12c76123`,
`17d47c8ee4494f6cd3f1c3ecd643d1f6557c64fc`, and
`8deb0c33b78c40164717a60a5b77d49c46c3075f`.
Live verification: <https://local-live-captions.sociobot.in> on 29 August 2026.

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Replaced “any Linux audio” with “Caption Linux calls and recordings locally.” | Live first screen: `.factory/qa/polish-1-live-first-read.png`; live `/` heading check. |
| F-1-2 | Added original German fixture, a real multilingual base-model monitor test, and a claim entry. The assertion accepts varied real German output only when at least three recognized German markers are present. | `npm run test:linux-audio`; `@claim:german-caption-end-to-end` auto-detected German and returned German words. |
| F-1-3 | Replaced “no network requests” with “sends no data to other sites.” | `@claim:private-local`; final cold live `/?demo=1` request log had `external: []` and no console errors. |
| F-1-4 | Replaced untestable merchant/refund assertions with accurate Dodo-through-Sociobot checkout wording. | `@claim:free-and-paid`; live `/` copy check. |
| F-1-5 | Labeled the payment action as an external checkout for assistive technology. | Live `/` accessible-link check; `@claim:free-and-paid`. |
| F-1-6 | Renamed the overlay section “Resizable caption overlay.” | Live `/` and `.factory/qa/polish-1-live-first-read.png`. |
| F-1-7 | Renamed the payment section “Optional $24 supporter license.” | Live `/` copy check. |
| F-1-8 | Renamed the privacy heading “Your audio stays on your computer.” | Live `/privacy` title and heading check. |
| F-1-9 | Replaced the 404 mood copy with “Page not found.” | Live `/not-a-real-route` returned HTTP 404 with the new heading. |
| F-1-10 | Replaced the hero metaphor with the computer-processing description. | Live `/` artwork caption check. |
| F-1-11 | Removed numbered/lore labels and used descriptive section headings. | Live `/` screenshot and heading inspection. |
| F-1-12 | Rewrote the README opening in plain language; implementation terms now appear in development context. | `README.md`; `.factory/copy-audit.md`. |
| F-1-13 | Standardized the selectable item as “audio source” and defined “monitor source” once. | `README.md`, landing steps, and terminology table. |
| F-1-14 | Split the README monitor-source explanation into short sentences. | `.factory/copy-audit.md`. |
| F-1-15 | Split the Linux acceptance explanation into short sentences and added the German flow. | `README.md`; `npm run test:linux-audio`. |
| F-1-16 | Replaced the contradictory historical handoff with this consistent 24-claim inventory. | `.factory/claims.json`; `.factory/handoff.md`. |
| F-1-17 | Added visible desktop controls to delete the selected model and remove the locally stored license. | `cargo test --manifest-path src-tauri/Cargo.toml claim_storage_controls`; `/privacy` control instructions. |

Additional acceptance work: primary action now opens `/?demo=1`; the demo has
the required banner, Reset demo, and Start for real controls. The site updates
route-specific metadata, moves focus on SPA route changes, has a designed real
404 response, and keeps mobile layout free of horizontal overflow.

Final URL-verifier evidence: `.factory/verify-url-polish-1-live-017/verify.json`.

Evidence images: `.factory/qa/polish-1-live-first-read.png`,
`.factory/qa/polish-1-live-demo-desktop.png`,
`.factory/qa/polish-1-live-demo-mobile.png`,
`.factory/qa/polish-1-local-first-read.png`, and
`.factory/qa/polish-1-local-demo-mobile.png`. URL-verifier evidence is in
`.factory/verify-url-polish-1-live/`.
