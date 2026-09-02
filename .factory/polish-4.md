# Polish round 4 — cumulative finding ledger

This round starts from review commit
`e3e11ce221d33927555d94ae82607a741377d2a9`. The repaired desktop and site
source is release `v0.1.19` at
`724bcff0ae029269bb502b31ec88ed22c0f3cd2c`. Every report and polish ledger
from rounds 1–4 was read before this cumulative recheck.

## Finding-by-finding closure

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | The bounded headline remains “Caption Linux calls and recordings locally.” | `landing page states the job and has one heading`; cold `/` screenshot `live-first-read-390.png`. |
| F-1-2 | The shipped public-domain German fixture runs through the multilingual model four times. | `npm run test:native-claim -- german-caption-end-to-end`; four clean-clone runs passed. |
| F-1-3 | Demo privacy copy says the sample sends no data to other sites. | `npm test -- --grep @claim:private-local`; direct `/demo` request log in `live-routes.json`. |
| F-1-4 | Unsupported merchant-of-record and refund promises remain absent; checkout copy states only the observed Sociobot path. | `npm test -- --grep @claim:free-and-paid`; live `/` copy check. |
| F-1-5 | The supporter action identifies the external checkout. | `npm test -- --grep @claim:free-and-paid`; live `/` link crawl. |
| F-1-6 | The feature heading remains “Resizable caption overlay.” | `landing page states the job and has one heading`; live `/`. |
| F-1-7 | The payment section remains “Optional $24 supporter license.” | `npm test -- --grep @claim:free-and-paid`; live `/`. |
| F-1-8 | The privacy heading remains “Your audio stays on your computer.” | `routes have distinct titles and one h1`; live `/privacy`. |
| F-1-9 | The designed 404 states “Page not found.” and links home. | `routes have distinct titles and one h1`; live `/not-a-real-route` status and structure in `live-routes.json`. |
| F-1-10 | The illustration caption names the tested computer boundary directly. | `landing page states the job and has one heading`; live `/`. |
| F-1-11 | Decorative lore remains absent; every section label names its content. | `.factory/copy-audit.md`; live `/` screenshot. |
| F-1-12 | The README opens with the user job and defines SubRip (SRT) before build details. | `.factory/copy-audit.md`; clean-clone `README.md` inspection. |
| F-1-13 | “Audio source” is the selectable item; “monitor source” is defined once as the system-audio source. | `.factory/copy-audit.md`; live `/`. |
| F-1-14 | The README monitor instructions remain split into short sentences. | `.factory/copy-audit.md`; all audited sentences are at most 22 words. |
| F-1-15 | The English and German acceptance instructions remain short, direct sentences. | `.factory/copy-audit.md`; clean-clone README inspection. |
| F-1-16 | Claim documentation now reconciles to 29 registered claims. | `claims.json contains every public capability and uses one exact test command per id`; `.factory/claims.json` count is 29. |
| F-1-17 | Desktop setup retains real model-delete and license-removal controls. | `npm test -- --grep @claim:storage-controls`; live `/privacy`. |
| F-2-1 | Real PulseAudio monitor capture now runs under `strace` with isolated HOME, app-data, all XDG roots, temporary, and working directories. It rejects every successful write-open or path mutation and diffs full before/after snapshots. | `npm run test:native-claim -- no-audio-storage`; clean-clone output: zero successful path-based write opens or filesystem mutations, with every isolated root unchanged. |
| F-2-2 | All three privacy, offline, and price facts remain above the fold on desktop and 390 px mobile. | `desktop first screen keeps the full first-read content visible`; `mobile first screen keeps the three plain facts visible`; `live-first-read-390.png`. |
| F-2-3 | The offline sentence remains qualified with “after your first visit.” | `npm test -- --grep @claim:offline-reload`; cold `/demo`, then offline reload. |
| F-2-4 | History navigation focuses and announces section headings and restores route heading focus on Back. | `section navigation and browser history keep focus on the destination heading`; live history result in `live-routes.json`. |
| F-2-5 | The exact whisper.cpp model source and pinned upstream MIT text remain registered. | `npm run test:unit -- --testNamePattern @claim:model-provenance-license`. |
| F-2-6 | Release assets, checksums, manifest, source tag, and commit remain one tested contract. | `npm run test:unit -- --testNamePattern @claim:release-artifacts`; `npm run verify:published-release`. |
| F-2-7 | The third step remains “Confirm consent and start captions.” | `landing page states the job and has one heading`; live `/`. |
| F-2-8 | Interface labels use “processed on this computer” and “Export subtitle file (.srt).” | `npm test -- --grep @claim:srt-export`; live `/demo`. |
| F-3-1 | Native claims continue through the self-provisioning runner and pinned Rust 1.98.0 container. | `npm run test:unit -- --testNamePattern @claim:native-claim-environment`; all 29 declared commands passed from `/tmp/local-live-captions-polish4-clean.sfD5A9/repo`. |
| F-4-1 | Legal email links now use inline-flex 44 px hit areas. A mobile regression measures every legal link, button, input, and select. | `legal page links meet the 44px touch target`; `live-legal-mobile.png` and target rectangles in `live-routes.json`. |
| F-4-2 | The untestable funding-purpose clause was removed everywhere. Copy now says the license is optional and changes no caption feature. | `supporter copy avoids an untestable funding-purpose statement`; `.factory/copy-audit.md`; live `/` and `/terms`. |
| F-4-3 | The application MIT statement is now a registered claim tied to the canonical license and package metadata. | `npm run test:unit -- --testNamePattern @claim:project-license`. |
| F-4-4 | Native enumeration is injectable and proves that both a microphone and a PulseAudio monitor are returned. | `npm run test:native-claim -- microphone-input-listing`. |

## Clean-clone verification

The repository was cloned to
`/tmp/local-live-captions-polish4-clean.sfD5A9/repo`, checked out at
`724bcff0ae029269bb502b31ec88ed22c0f3cd2c`, and installed with `npm ci`.

- All 29 exact commands from `.factory/claims.json` passed separately.
- `npm test`: 33 Vitest tests passed; desktop Playwright passed 24 with six
  intentional project skips; mobile Playwright passed 27 with three
  intentional project skips.
- `npm run typecheck`, `npm run lint`, `npm run build`, `cargo fmt --check`,
  `cargo test`, and `cargo check` passed.
- `npm run test:browser-lifecycle` killed Chromium with SIGSEGV on the first
  attempt and passed on the clean retry, proving runner recovery.
- The site build is 9.90 kB JavaScript gzip and 5.04 kB CSS gzip. Both
  `dist/site` and `dist/app` were produced.

## Local browser evidence

The complete route/demo/accessibility runner passed against a production build
served locally. Evidence is under `.factory/evidence-polish-4/local/`.

- `/`, `/demo`, `/privacy`, `/terms`, and the styled fallback each had their
  expected title, one `h1`, `main`, heading order, and zero serious or critical
  Axe findings.
- The 390 px and desktop first screens kept the job, audience, first action,
  outcome, and three plain facts in view.
- Direct demo entry rendered four sample captions, made no cross-origin demo
  requests, exported four TXT lines, and preserved seeded real data through
  demo reset and exit.
- At 200% text size, horizontal overflow was zero.
- The Privacy email measured 137 × 44 px and the Terms email measured
  143 × 44 px. Every measured legal-page interactive target was at least
  44 × 44 px.

## Release and live evidence

GitHub release workflow
<https://github.com/B-Divyesh/sf-local-live-captions/actions/runs/33594819376>
completed successfully. Its resolve, verification, Linux package smoke,
Windows, universal macOS, Linux, and manifest jobs all passed.

- `npm run verify:published-release` confirmed `v0.1.19`, commit
  `724bcff0ae029269bb502b31ec88ed22c0f3cd2c`, seven packages,
  `SHA256SUMS`, and `latest.json`.
- A fresh download of `Local.Live.Captions_0.1.19_amd64.deb` matched the
  published SHA-256 value
  `e3829e2714d1a1a581347a3ea0f798907e80187373bbc9caade53cbc7d7102cd`.
- `RELEASE_TAG=v0.1.19 npm run deploy:release-site` deployed only the verified
  tagged build. Live `release-identity.json` matches the release tag and
  commit.
- `/opt/fleet/lib/verify-url.sh` loaded the cold home page in 883 ms and found
  no console errors, missing title/language/main landmark, missing image
  alternative, or unlabeled button.
- The live cumulative runner checked `/`, `/demo`, `/privacy`, `/terms`, and
  `/not-a-real-route`. Titles, language, one `h1`, one `main`, zero console
  errors, and zero serious or critical Axe findings passed on every route. The
  unknown route returned HTTP 404.
- Cold `/?demo=1` entry showed the banner and four bundled captions with zero
  cross-origin demo requests. Reset and Start for real cleared only `demo:`
  state. A separate first-visit context reloaded the same demo successfully
  after `context.setOffline(true)`.
- Live legal targets measured 137 × 44 px and 143 × 44 px for the two email
  links; every measured legal control was at least 44 × 44 px.
- Live history focus, 390 px first-screen bounds, TXT export, 200% reflow, and
  demo namespace isolation all passed in `live/live-routes.json`.
- Lighthouse 12.8.2 mobile scores are Performance 100, Accessibility 100,
  Best Practices 100, and SEO 100. LCP is 1.072 s, CLS is 0.0118, and total
  blocking time is 50 ms. The first Chromium tab exited unexpectedly; the
  clean retry passed and produced `live/lighthouse-mobile.json`.

Live screenshots and machine-readable reports are stored under
`.factory/evidence-polish-4/live/`. The live URL was opened cold after
deployment and every finding above was rechecked. No finding remains.
