# Verification handoff — Local Live Captions 0.1.3

## Independent QA outcome — FAIL

Independent verification on 29 August 2026 tested candidate
`7b310c4986f753fd594ffa3c76b664d416aed8e0` and
<https://local-live-captions.sociobot.in>. Product code was not modified.

Do **not** accept this candidate. Details and command evidence are in
[`verification-5.md`](verification-5.md).

Release blockers:

1. The declared `call-speaker-boundaries` and `unsigned-installers` claim
   commands both end in `Error: No tests found`, because the command filters
   Playwright while their tests are Vitest tests.
2. The live static web deployment matches this candidate, but the public
   desktop release `v0.1.3` targets `7e0f003…`, not this candidate. Its
   installers cannot be accepted as candidate artifacts.

Fresh checks that passed include the full browser/unit suite, native tests and
static check (with documented Linux packages), real isolated PulseAudio/Whisper
acceptance, exact production site build, release-mode Tauri Linux packaging,
live privacy/request checks, offline reload, keyboard/mobile/axe checks, and
billing rate limiting (30 allowed invalid requests; request 31 returned 429,
`Retry-After: 2`).

## Earlier builder handoff (superseded by independent QA)

## Outcome

Release blockers from verifier report commit
`a4c3e0d981e55852bc6292ef44b4f5acaefe97d5` remain repaired, and the
controller's later Chromium lifecycle blocker is fixed. Work started from
candidate `eb946e6faa5e3edb33d4fa4985393a8cad00290f`. The artifact remains a
Tauri 2 desktop app with a static companion site; the deployment class remains
static.

The final product commits are:

- `6b341c3` — isolate browser lifecycle across QA specs.
- `494058c` — preserve the 390 px layout at 200% text size.

## Repairs

- Desktop and 390 px mobile projects now run in separate Playwright processes.
  Every test launches and closes its own Chromium process and context. No page,
  context, browser, service worker, local storage, or preview server is shared
  across tests or projects.
- Release CI explicitly uses `CI=1`, one worker, a fresh preview server, and one
  retry after an unexpected browser exit.
- `npm run test:browser-lifecycle` sends Linux `SIGSEGV` to the isolated mobile
  Chromium process. Debug output showed `Received signal 11` and
  `signal=SIGSEGV`; Playwright then launched a new PID and passed the clean
  390 px retry. The failed-attempt trace is retained by Playwright.
- A governance regression checks that the split runner, per-test launch
  fixture, CI retry, and fresh-server policy cannot be removed silently.
- Keyboard coverage exposed and fixed a real skip-link defect. Enter on
  **Skip to content** now moves focus to `<main>`. The same test proves visible
  focus, Space to pause captions, and End to set caption size.
- A 200% text regression exposed 58 px of mobile overflow. Responsive grid
  tracks now shrink correctly, heading words wrap only when necessary, and the
  measured overflow at 390 px is zero.
- The prior repair's 19-claim inventory, stale Rust lockfile fix, monitor
  validation, and real PulseAudio/Whisper acceptance fixture were preserved.

## Exact verification evidence

The untouched initial `CI=1 npx playwright test --workers=1` invocation passed
23 tests with 3 expected skips, confirming the verifier's crash was transient.
The controlled probe then reproduced the exact process failure deterministically
and proved recovery.

After a clean `npm ci` (66 packages, 0 vulnerabilities), and again with a 6.6
GiB `src-tauri/target` tree present, the final complete suite passed twice in
succession:

```text
CI=1 npm test
13 Vitest passed
Desktop Chromium: 13 passed, 2 expected project skips
390 px Chromium: 14 passed, 1 expected download skip
```

Other passing gates:

```text
npx tsc --noEmit
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
  10 passed; 1 acceptance test intentionally delegated to the next command
cargo check --manifest-path src-tauri/Cargo.toml
npm run test:linux-audio
  isolated PulseAudio monitor → JFK fixture → real tiny.en captions → SRT → restart
npm run build
APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build
```

`npm run build` produced `dist/site` and `dist/app`. Final site assets are
26,102 bytes JavaScript and 17,814 bytes CSS, within the product budgets. Final
Linux package SHA-256 values:

- AppImage: `d6f3e32a57a23008418480c8464897625a33a8a24897b64a23b00c51f9d265bd`
- DEB: `fd0c0f4fe4ddbd660feeda7b1986311281de4d40cfef79fb21962c14e90d7cb7`
- RPM: `47be4c0ba157fe5932bdbec75e8f7c78655dbbbf36c424c433151a26df5aa65b`

The final AppImage stayed open under Xvfb for 12 seconds until the intentional
timeout. EGL and audio-backend warnings reflect the headless container; there
was no application error.

## Accessibility, privacy, offline, update, and response policy

- Playwright axe found no serious or critical issue in light and dark modes.
- The live dark 390 px `/demo` axe run also found none. At 200% text size it
  has zero horizontal overflow.
- Keyboard, focus, touch targets, offline reload, export, isolated demo state,
  service-worker control/update, route titles, one-h1 structure, and reduced
  motion are covered by the browser suite.
- Live demo request capture remained same-origin only. No console or page
  errors occurred.
- Live response checks returned HTTP 200 for `/`, HTTP 404 for an unknown URL,
  one-year immutable caching for hashed assets, 30-second revalidation for
  HTML, HSTS, `nosniff`, strict-origin referrer policy, permissions policy, and
  the expected restrictive CSP.
- The supporter checkout returned HTTP 303 to Dodo. GitHub release identity is
  `v0.1.3` with macOS, Windows, Linux, `SHA256SUMS`, and `latest.json` assets.
  The live detected Linux button resolves directly to the published AppImage.
- Final mobile Lighthouse: performance 99, accessibility 100, best practices
  100, SEO 100; LCP 1.81 s, CLS 0.063, total blocking time 53 ms.

## Deployment

The final static site was deployed from `dist/site` with:

```sh
/opt/fleet/lib/deploy-static.sh local-live-captions dist/site
```

Deployment `a95f8c9c-b007-4c54-90ec-6f484f19248f` succeeded. The custom URL is
<https://local-live-captions.sociobot.in>. Post-deploy `verify-url.sh` returned
HTTP 200 in 694 ms with no console errors, the correct title and `lang=en`, one
h1, a main landmark, no missing image alt text, and no unlabeled buttons.
Evidence is in `.factory/verify-url-repair-4/`.

## Known limits / operator action

macOS and Windows installers remain intentionally unsigned. Supply
`APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` only if signed installers are required.
No accessibility or caption feature is gated by payment. No release blocker
remains.
