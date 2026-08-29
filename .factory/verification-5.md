# Independent verification 5 — FAIL

Verified 29 August 2026 (UTC) from clean candidate
`7b310c4986f753fd594ffa3c76b664d416aed8e0` against
<https://local-live-captions.sociobot.in>.

## Verdict

**FAIL — do not accept or release this candidate.**

The deployed static site is the candidate and the core browser/native checks
are otherwise strong. Two release-blocking defects remain: two mandatory claim
commands fail, and the downloadable desktop release does not identify this
candidate commit.

## Mandatory first read — PASS

A new, uncached desktop browser visit showed:

- **What it does:** “Caption any Linux audio locally”.
- **Who it is for:** “For deaf and hard-of-hearing students when lectures,
  calls, or recordings have no captions.”
- **What to do first:** the one-click **Try it with sample data** action,
  explicitly saying “Opens a private sample. Nothing is saved.”

The action opens `/demo`, immediately shows an astronomy-caption sample, and
has the persistent **Demo — sample data, nothing is saved** banner with Reset
demo and Start for real. This first-read requirement passes.

## Release-blocking defects

### High — two declared claim tests cannot run

`.factory/claims.json` declares these commands:

```text
npm test -- --grep @claim:call-speaker-boundaries
npm test -- --grep @claim:unsigned-installers
```

Both were run from the candidate and end with `Error: No tests found` (exit 1).
The tagged tests exist in `tests/unit/public-claims.test.ts`, but `npm test`
runs `vitest run && node scripts/run-e2e.mjs`; the appended `--grep` reaches
only the Playwright command. Playwright has no matching tests. This violates
the required “every claim has exactly one runnable test” gate; the user-facing
claims are therefore not verified by the declared sandbox commands.

### High — public desktop download is an older commit, not the candidate

The live website assets match a local build of this candidate exactly:
`index-DpF_O75I.js`, `index-BUM5e5ek.css`, and the local SHA-256 values are
identical. However, GitHub’s current `v0.1.3` desktop release reports
`target_commitish` `7e0f003eda0105dd1d3082e668e933e6ba155908`, not the tested
`7b310c4986f753fd594ffa3c76b664d416aed8e0`. The commits in between include
native capture, test, workflow, and app changes. The landing page’s Linux
download therefore serves an installer that cannot be established as the
candidate desktop product. A desktop-app release must publish artifacts for
the accepted commit.

## Claims gate

All 19 exact `claims.json` commands were run first after `npm ci`.

| Claim groups | Result |
| --- | --- |
| `private-local`, `offline-reload`, `srt-export`, `demo-isolated`, `free-and-paid`, `desktop-overlay`, `no-telemetry-trackers` | PASS |
| Nine native Rust source-policy/behavior claims | The first clean invocation could not compile because the base container lacked `glib-2.0` development files. After installing the exact packages from `.github/workflows/release.yml`, the full native suite passed: 10 passed, 1 intentionally delegated. |
| `linux-monitor-end-to-end` | The first command correctly reported missing PulseAudio. After the documented PulseAudio packages were installed, it passed against its isolated null sink, bundled JFK fixture, real cached/downloaded `tiny.en` model, SRT path, and restart. |
| `call-speaker-boundaries` | **FAIL** — `Error: No tests found`. |
| `unsigned-installers` | **FAIL** — `Error: No tests found`. |

The documented native package prerequisites explain the initial environment
errors, but do not mitigate the two failing declared claim commands above.

## Local candidate checks

After installing the workflow’s Linux packages:

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 66 packages, 0 vulnerabilities |
| `npm test` | PASS — 13 Vitest tests and complete desktop/mobile Playwright suite |
| `npm run test:browser-lifecycle` | PASS (one expected intentional SIGSEGV retry, reported as flaky) |
| `npx tsc --noEmit` | PASS |
| `cargo fmt --check --manifest-path src-tauri/Cargo.toml` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS — 10 passed, 1 delegated/ignored acceptance test |
| `cargo check --manifest-path src-tauri/Cargo.toml` | PASS |
| `npm run test:linux-audio` | PASS — isolated PulseAudio monitor through real Whisper captioning and recovery |
| `npm run build` | PASS — `dist/site` and `dist/app` |
| `APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build` | PASS — candidate AppImage (81,242,616 bytes), DEB, and RPM |

## Live product QA

- Desktop and 390 px mobile: no horizontal overflow; sample pause/resume,
  caption size 42, reset, Start for real, and blank license recovery all work.
- Keyboard-only: skip link focuses `main`; focus outline is a visible 3 px
  cobalt ring; Space pauses captions and End sets size to 42.
- Reduced motion: primary-action transition is `1e-05s`.
- Axe on live desktop and mobile had **zero serious/critical violations**;
  there were no page errors or console errors.
- A fresh live `/demo` made only same-origin requests. `/` additionally made
  the documented GitHub release API request. No tracker request was seen.
- PWA: the live service worker controlled `/demo`; after first load, offline
  reload displayed the demo heading and pause control.
- Headers include HSTS, `nosniff`, strict-origin referrer policy, a restrictive
  permissions policy, and CSP limiting connections to self, GitHub, and
  Sociobot. HTML and service worker use 30-second revalidation; hashed JS is
  `public, max-age=31536000, immutable`.
- Budget evidence: initial JS is 26,102 bytes / 9.24 KB gzip; CSS is 17,805
  bytes / 4.69 KB gzip; mobile hero image is 25,040 bytes — within budget.
- Billing verifier rate limiting was freshly exercised with invalid tokens:
  requests 1–30 returned HTTP 200; request 31 returned **429** with
  `Retry-After: 2`. No sign-in is used, so Entra validation is inapplicable.
- Current release metadata does include macOS, Windows, and Linux assets plus
  `SHA256SUMS` and `latest.json`; a freshly downloaded Linux DEB matched its
  published SHA-256 (`a57bd1ff…025390ee`). This validates the old release,
  not this candidate.

## Required remediation

1. Make both failing claim commands target Vitest (or move their tests to the
   runner the command invokes), then run every claim command successfully.
2. Tag and publish a new desktop release from `7b310c4986f753fd594ffa3c76b664d416aed8e0`
   (or its approved descendant), with refreshed checksums/manifest. Re-verify
   that the landing-page download resolves to that release.
