# Repair handoff — Local Live Captions 0.1.4

## Outcome

All release blockers in independent verification 5 (`d0d32f2`) are repaired.
The repair is `f603ae358559c88134ced0139c936d3c1dac695b`, a descendant of the
verified candidate `7b310c4986f753fd594ffa3c76b664d416aed8e0`. It is published as
GitHub release `v0.1.4` and the static companion site remains deployed as a
static site. The product remains a Tauri 2 desktop app; no scope or product
behavior that previously passed was removed.

## Repairs

- The two policy claims that live in Vitest now invoke Vitest directly:
  `call-speaker-boundaries` and `unsigned-installers` use
  `npm run test:unit -- --testNamePattern @claim:<id>`. They no longer append
  Playwright's `--grep` to `npm test`, which was the root cause of the
  verifier's `Error: No tests found` failures.
- Added a claim-governance regression that pins both commands to their exact
  Vitest form. The existing tagged source-policy tests remain the single
  regression test for each claim.
- Bumped the desktop, Tauri, npm, lockfile, and visible site build versions to
  `0.1.4`; tag `v0.1.4` therefore identifies the repaired desktop artifact.

## Verification

### Clean install and claims

```text
npm ci
  66 packages, 0 vulnerabilities
```

All 19 commands in `.factory/claims.json` were executed verbatim and passed.
This includes both repaired commands, each finding exactly one Vitest test;
the demo privacy/offline/export/license claims in isolated browser contexts;
nine native policy and behavior claims; and the real isolated PulseAudio
monitor → tiny.en Whisper → SRT → restart acceptance path.

```text
npx tsc --noEmit
CI=1 npm test
  14 Vitest tests passed
  Desktop Chromium: 13 passed, 2 expected skips
  390 px Chromium: 14 passed, 1 expected download skip
CI=1 npm run test:browser-lifecycle
  intentional first SIGSEGV retried cleanly; 1 flaky (expected)
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
  10 passed, 1 delegated to the isolated Linux-audio acceptance test
cargo check --manifest-path src-tauri/Cargo.toml
npm run build
```

All commands above passed. `npm run build` produced `dist/site` and `dist/app`.
The release-mode local package run also passed:

```text
APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build
```

It generated an AppImage, DEB, and RPM. Local SHA-256 values were
`840ebf3901b070236e49c6e969d6a481c2a168042ce089c1b038198ac02ee7a1`
(AppImage), `61b28f9c0d4631fabfc9c34a934dfa30fdd6f6f658651fac580ea366ad80fbe5`
(DEB), and `35ac8f649b6e41eae56f3c5d6654ad81a665a6fdd8c08adabcaefee3333d871d`
(RPM). `dpkg-deb -I` confirms the DEB consumer metadata is version `0.1.4`.
The AppImage stayed open under Xvfb for 12 seconds until the intentional
timeout; container-only EGL/audio-backend warnings did not report an
application error.

GitHub Actions run
[`33247834960`](https://github.com/B-Divyesh/sf-local-live-captions/actions/runs/33247834960)
passed its clean verify job, macOS universal build, Windows build, Ubuntu
build, and manifest job. The public `v0.1.4` release targets exactly
`f603ae358559c88134ced0139c936d3c1dac695b`; it contains the DMG, EXE, MSI,
AppImage, DEB, RPM, `SHA256SUMS`, and valid `latest.json`. A fresh public DEB
download matched the published checksum:

```text
cc196cb9401baca1e002a7824f779941dd385e5c09fe679426e426f872973bf2
Local.Live.Captions_0.1.4_amd64.deb
```

### Browser, accessibility, privacy, offline, and response policy

- Playwright Axe in the full desktop and 390 px suites found zero serious or
  critical violations. Keyboard tests prove Skip to content, visible focus,
  Space pause/resume, and range End behavior. Mobile at 200% text has zero
  horizontal overflow.
- Live browser smoke checks prove the service-worker-controlled `/demo` reloads
  offline after its first visit, can resume captions, makes no external
  requests in demo mode, and has no page or console errors. The live 390 px
  demo has zero overflow at 200% text.
- Factory `verify-url.sh` against the deployed site returned HTTP 200 in
  894 ms with zero console errors, title/lang, one `h1`, a main landmark, no
  missing image alt text, and no unlabeled buttons. Evidence is in
  `.factory/verify-url-repair-5/`.
- Live response checks returned HTTP 200 for `/`, HTTP 404 for an unknown
  path, 30-second revalidation for HTML, immutable one-year caching for hashed
  assets, HSTS, `nosniff`, strict-origin referrer policy, restrictive
  permissions policy, and CSP allowing only self, GitHub's release API, and
  Sociobot's billing API as needed.
- The fresh Linux download button resolves to
  `v0.1.4/Local.Live.Captions_0.1.4_amd64.AppImage` with no console errors.
- Live mobile Lighthouse: performance 97, accessibility 100, best practices
  100, SEO 100; LCP 2.30 s, CLS 0.063, TBT 0 ms. Initial site JavaScript is
  26,102 bytes (9.23 KB gzip) and CSS is 17,805 bytes (4.69 KB gzip).

## Deployment

The verified `dist/site` was deployed with:

```sh
/opt/fleet/lib/deploy-static.sh local-live-captions dist/site
```

Deployment `bdaec42f-a997-4d16-8577-cd2efcc3feba` succeeded. The custom URL
is <https://local-live-captions.sociobot.in>.

## Known limits and operator action

macOS and Windows installers are intentionally unsigned, as disclosed and
covered by the public claim. If signed installers are required later, provide
`APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` to the release workflow and update
the unsigned-build claim and copy together. There are no remaining release
blockers.
