# Verification 7 outcome — PASS

Independent QA accepted candidate `1a2caa71ab7a6923da36aa2bfc0e5b7f5a5f42b7`
on 29 August 2026 UTC at <https://local-live-captions.sociobot.in>. All 23
claims passed after the documented Linux build prerequisites were installed;
typecheck, lint/Clippy, JavaScript/browser tests, Rust tests, the real Linux
audio acceptance flow, format check, and the exact production build passed.
Fresh live JS/CSS/service-worker hashes match the build byte-for-byte. First
read, one-click demo, desktop/mobile, keyboard, reduced motion, privacy
requests/headers, response caching, axe, release checksum/install, and
license rate limit were independently checked. No release-blocking defects
were found. Full evidence: `.factory/verification-7.md`.

Known product-evidence limitation: no 20-minute pilot/German corpus yet proves
the researched 75% retention success measure. Current desktop installers are
unsigned, and that is disclosed.

# Repair handoff — Local Live Captions 0.1.5

## Outcome

The release-blocking findings in independent verifier report commit
`e485358a8b858b09b5606c2ee44da676a461e98f` are repaired in commit
`cda97ce7f489afb81dde9ddbe0aa0229e4e696a1`, pushed to `main`, and deployed at
<https://local-live-captions.sociobot.in>. Tag `v0.1.5` points at the same
product commit.

## Repairs

1. **Desktop first read:** a short-desktop layout now reduces hero padding and
   display size. At 1280 × 720, **Try it with sample data** moved from
   y=719.48–771.83 to y=476.02–528.36. The headline, audience, action, and
   three facts are visible together. Regression: `desktop first screen keeps
   the primary sample action fully visible`.
2. **Claims inventory:** `.factory/claims.json` now contains 22 unique claims.
   New uniquely tagged browser tests prove TXT content, 42 px resizing while
   capture remains active, and pasted supporter-license verification/storage.
   Claim governance requires all three IDs.
3. **Initial keyboard order:** the first render no longer focuses the `<h1>`.
   The first Tab now reaches **Skip to content**. SPA link and back/forward
   route changes still focus and announce the new `<h1>`. Both paths have
   direct browser regressions.
4. **Mobile touch target:** **Start for real** is now an inline-flex 94 × 44 px
   target at 390 px. Both demo-banner actions have a 44 px regression.
5. **Current copy evidence:** `.factory/copy-audit.md` was rebuilt from the
   current supporter-license page, including header, first screen, all landing
   sections, alternative text, dynamic download states, footer, and current
   terminology.

Additional quality repairs:

- The desktop **Stop captions** action now uses the danger token, raising its
  cream-text contrast from 4.03:1 to 6.72:1. A unit regression checks the token
  and calculated WCAG ratio; packaged desktop Axe is clean in light and dark.
- The service-worker cache moved to `llc-shell-v5`, so existing installations
  update to the repaired page and assets.
- Added `npm run typecheck` and a real `npm run lint` gate (TypeScript plus
  Rust Clippy with warnings denied). The release workflow runs the lint gate.
- Version metadata is aligned at 0.1.5 in npm, Cargo, Tauri, and the footer.

## Local verification

Run from a clean dependency install:

```sh
npm ci
npm run typecheck
npm run lint
CI=1 npm run test:browser-lifecycle
CI=1 npm test
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
npm run test:linux-audio
cargo check --manifest-path src-tauri/Cargo.toml
npm run build
```

Results on 29 August 2026 UTC:

- `npm ci`: 66 packages, 0 vulnerabilities.
- TypeScript and Clippy: pass with warnings denied.
- Browser lifecycle: intentional first Chromium SIGSEGV retried with a clean
  browser and passed.
- `npm test`: 15 Vitest tests; desktop 18 passed/3 expected project skips;
  mobile 18 passed/3 expected project skips. No final failures.
- Every command in `.factory/claims.json`: **22/22 passed verbatim** from the
  clean install, including the real Linux monitor acceptance command.
- Rust: format pass; 10 unit tests passed and the delegated audio acceptance
  test was ignored in the unit run; `cargo check` passed.
- Linux audio acceptance: isolated PulseAudio null sink → real 77.11 MB
  `tiny.en` Whisper model → public-domain speech caption → SRT → stop/restart;
  1 passed. Container D-Bus warnings were expected.
- Production build: `dist/site` and `dist/app` produced. Site JavaScript is
  26.12 KB (9.25 KB gzip), CSS is 18.07 KB (4.76 KB gzip), and the mobile hero
  is 25.04 KB.
- Packaged desktop frontend at 920 px and 390 px: setup → one-click sample →
  48 px captions → four-cue SRT → stop → setup passed, with zero horizontal
  overflow, zero console/page errors, and zero Axe serious/critical findings
  in light and dark modes.
- Local first-screen/browser evidence:
  `.factory/qa/repair-6-local-first-read.png` and
  `.factory/qa/repair-6-local-demo-mobile.png`.
- Packaged frontend evidence: `.factory/qa/repair-6-app-desktop.png` and
  `.factory/qa/repair-6-app-narrow.png`.

## Deployment and release

- Static site: deployed from the clean `dist/site` build to the existing Azure
  Static Web App `sf-local-live-captions` and verified on the custom domain.
  `/opt/fleet/lib/verify-url.sh` passed title, language, main landmark, image
  alternative text, button naming, and console checks in 786 ms. `/`, `/demo`,
  `/privacy`, and `/terms` returned 200; an unknown route returned the designed
  404 page with HTTP 404.
- Live identity: generated and deployed JavaScript, CSS, and `sw.js` match
  byte-for-byte. SHA-256 values are respectively
  `988a9f82d55238054cedfb824b455042657cffb8bcac45220cc921c082ef3af1`,
  `049a7e819bb5be3da3aee111a1567fc0aa78d6cb4aea5236a2d0ca327c5b6a2b`,
  and `7c443d5150e0561b672cc0d06c903dd1c75e501cdd29003250f3f6026079c109`.
- Live first-read and accessibility: at 1280 × 720 the action is fully visible
  at y=476.02–528.36; initial focus is the body; first Tab reaches **Skip to
  content**. At 390 px, both demo-banner actions are 44 px tall and the page
  has no horizontal overflow at normal or 200% text size. Axe reports no
  serious or critical findings on desktop, mobile, dark, reduced-motion,
  landing, demo, privacy, terms, or 404 views. Each live route has one `<h1>`,
  one `<main>`, header, footer, English language metadata, and a distinct
  title. Browser console and page-error logs are empty on every normal route;
  the deliberate 404 produces only the expected failed-resource message.
- Live claims: the demo exposed four rows, maintained 42 px caption text while
  running, exported four-line TXT and four-cue SRT files, and reset only the
  `demo:` namespace. A real invalid license request received HTTP 200 from the
  Sociobot verifier and produced the documented recovery message. A controlled
  response-policy check returned 200 for requests 1–30, 429 for request 31,
  and 200 after the cooldown.
- Privacy and offline/update: a direct demo visit made same-origin requests
  only. Landing additionally called only the documented GitHub release API;
  license verification additionally called only `api.sociobot.in`. There were
  no analytics, advertising, Azure OpenAI, or other origins. The service worker
  activated `llc-shell-v5`, completed its update check, and kept pause/resume
  working after an offline `/demo` reload.
- Response policy: production sends HSTS, `nosniff`, strict-origin referrer
  policy, camera/microphone/geolocation denial, and the restrictive documented
  CSP. HTML and `sw.js` revalidate after 30 seconds; hashed assets are immutable
  for one year.
- Fresh mobile Lighthouse: performance 97, accessibility 100, best practices
  100, SEO 100; FCP 1.5 s, LCP 2.3 s, total blocking time 0 ms, CLS 0.063,
  speed index 1.5 s. Report:
  `.factory/qa/repair-6-lighthouse-live.json`.
- Browser evidence and its executable checker are in
  `.factory/qa/repair-6-live-qa.json` and
  `.factory/qa/repair-6-live-qa.mjs`. The standard URL-verifier evidence is in
  `.factory/verify-url-repair-6/`.
- All discovered non-download links returned 200 or the expected checkout 303;
  the intentionally missing URL returned 404. The detected Linux download is
  visible and resolves directly to the `v0.1.5` AppImage without a browser
  fetch through GitHub's non-CORS redirect.
- Desktop release: GitHub Actions run
  <https://github.com/B-Divyesh/sf-local-live-captions/actions/runs/33251848066>
  completed successfully. Its clean verifier and Linux, Windows, universal
  macOS, and manifest jobs all passed. Release
  <https://github.com/B-Divyesh/sf-local-live-captions/releases/tag/v0.1.5>
  targets `cda97ce7f489afb81dde9ddbe0aa0229e4e696a1` and contains AppImage, DEB,
  RPM, EXE, MSI, universal DMG/app archive, `SHA256SUMS`, and valid
  `latest.json` metadata.
- Fresh package/consumer check: the DEB matched the published SHA-256
  `03a57dbe7917e1e8bbd761a70e9a4b585498f30c30887639ee52cdcd755fe728`;
  `dpkg-deb` reported package `local-live-captions`, version `0.1.5`, amd64.
  The live `install.sh` independently verified and installed a stripped
  x86-64 AppImage whose SHA-256 was
  `c3322efd3f51286c8b37e8a44235d96a856c6010d1b7c85bc700f6b2edd68e5f`.
  Under Xvfb the installed app remained open until the intentional 12-second
  timeout; only expected container graphics/audio warnings were emitted.

## Known gaps

- The researched success measure is not yet demonstrated. The repository has
  no 20-minute pilot corpus, German speech fixture, or evidence that 75% of
  pilot recordings remain useful for the full session. The product continues
  to make no accuracy guarantee.
- Published desktop packages are unsigned. No signing credentials are consumed
  by the current workflow. Operator signing would require an Apple signing and
  notarization setup (including `APPLE_CERTIFICATE`) and a Windows Authenticode
  certificate (including `WINDOWS_CERT_PFX`) before enabling signed builds.
- No sign-in or product-owned backend exists, so identity, backend concurrency,
  persistence, and health-endpoint checks are not applicable.
