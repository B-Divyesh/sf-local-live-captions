# Independent product verification 2 — FAIL

Verified 28 August 2026 (UTC).

- Candidate: `a5abef3f25c087d000a5de63a314212d30504e5e`
- Live URL: <https://local-live-captions.sociobot.in>
- Contract: `.factory/brief.json`, the supplied factory work order, and the attached acceptance skills
- Repository state at start: clean; `HEAD`, `origin/main`, and the requested candidate were identical
- Product code changed during verification: none

## Verdict

**FAIL — do not release this candidate.**

The website is the candidate build and the sample is usable, but the installable
desktop product offered by that website is an older release. The release workflow
is blocked by a TypeScript error, the advertised purchase endpoint is dead, and
German—the second language required by the brief—is both paywalled and impossible
to purchase. The claims inventory also does not cover all claims and does not keep
one test per claim as required.

## Release-blocking findings

### Critical — the downloadable desktop app is not the candidate

The live static site matches the candidate: after a local `npm run build`, 29 of
29 deployable files had byte-identical live counterparts. The only excluded file
was `staticwebapp.config.json`, which correctly is deployment configuration rather
than a public resource. Local and live `index.html` both had SHA-256
`072cc87af7d4bfaf7750d69409e329921229e6b1aeea209ec6ab04a51d781c84`.

However, the live Linux download resolves to GitHub release `v0.1.1`, whose API
reports `target_commitish` `84551dd9caaa4f8f1b2164499244a0e5ce7793bf`.
That commit is an ancestor of the candidate. The diff from the release to the
candidate changes 25 files, including `src-tauri/src/lib.rs`, `Cargo.toml`, the
new lockfile, recovery behavior, and tests. GitHub reports no workflow run for
candidate SHA `a5abef3...`.

The published AppImage is internally consistent but stale:

- Published SHA-256: `78531e49e5dd9794eecf6f749032404713ab4c643c10799ff8f01b86c8c2b4a4`
- It matches the published `SHA256SUMS` and launches under Xvfb.
- `public/install.sh` installed and launched that same file from an isolated
  temporary directory.
- The candidate did not yet have `src-tauri/Cargo.lock` at the published tag.

Therefore a visitor cannot download the candidate that was submitted for review.

### Critical — the release workflow is stopped by its own type gate

`npx tsc --noEmit` exits 2:

```text
tests/unit/release-config.test.ts(14,67): error TS2339:
Property 'navigationFallback' does not exist on type '{ route: string; }'.
```

The release workflow runs this command before its build matrix
(`.github/workflows/release.yml:29`), so a candidate release cannot reach Linux,
Windows, or macOS packaging until this is fixed.

### Critical — the advertised $24 purchase cannot be completed

The live **Buy Plus** link returns HTTP 404:

```json
{"error":"enabled factory product","status":404}
```

`GET https://api.sociobot.in/api/v1/products` does not contain
`local-live-captions`. The invalid-license endpoint itself is healthy and returns
HTTP 200 with `{"valid":false,"reason":"invalid"}`, but there is no working way
to obtain a license.

This also blocks required scope. The native picker disables both `base.en` and
the multilingual `base` model unless Plus is active, while the free model is only
`tiny.en` (`src/main.ts:226`, `src-tauri/src/lib.rs:68-100`). German is explicitly
part of the brief's smallest useful product and is an accessibility capability;
the paid-unlock contract says not to gate accessibility features. In the current
deployment German is unavailable to every new user.

### High — claims governance is not compliant

Every command listed in `.factory/claims.json` passes after the documented Node
and Linux native dependencies are installed. Nevertheless, the claim contract
fails in two ways:

1. There is not exactly one test per claim. `@claim:demo-isolated` labels two
   Playwright tests, and `@claim:srt-export` labels both a Vitest test and a
   Playwright test.
2. Material public claims are missing from `claims.json`. Examples include raw
   audio is never saved, transcript text stays only in memory, no telemetry,
   always-on-top/resizable overlay behavior, any operating-system input can be
   selected, the English model is exactly 75 MB, and macOS/Windows builds are
   published.

The pricing claim test only checks that a checkout-shaped URL is present; it does
not follow the URL. It therefore passes while the advertised checkout returns
404. The language-model claim checks an internal model lookup, not that a user can
obtain and use German.

### High — the promised Linux system-audio path lacks end-to-end evidence

The brief's core job is arbitrary Linux system audio. The implementation calls
`cpal::default_host().input_devices()` and the built binary links `libasound.so.2`;
the dependency graph and binary contain no PulseAudio or PipeWire backend. The
README nevertheless tells users to choose a “PipeWire or PulseAudio monitor.”
An ALSA bridge may expose a suitable device on some machines, but the candidate
does not discover PipeWire/Pulse monitor sources directly and no automated or
recorded acceptance test exercises one.

In this container, the candidate app showed “No audio source found,” so a real
audio-to-caption session could not be completed. The bundled sample and native
failure-state unit test are not evidence that the actual Linux system-audio job
works. This needs a representative PipeWire Linux test with an audible fixture,
downloaded model, generated captions, stop/restart recovery, and exported SRT.

## Other findings

### Medium — two live links miss the 44 px target contract

At both 1440 px and 390 px, **See every download** was about 25–26 px tall and
the footer **design notes** link was 17 px tall. All other tested controls were
keyboard operable, and the designed 3 px focus outline plus 6 px halo was visible.

### Medium — the documented native build command fails in this clean runner

The README command `CI=true npm run tauri build` compiled the release binary and
DEB/RPM, then failed while running `linuxdeploy` for AppImage. The release
workflow's actual environment workaround succeeds:

```sh
APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build
```

That command produced DEB, RPM, and AppImage bundles. The README should state the
same Linux requirement. Tauri also warned that `__TAURI_BUNDLE_TYPE` was absent
while patching each bundle; no updater is configured, so this warning is not an
additional blocker.

### Low — performance has cold-server variance

Three mobile Lighthouse runs scored 87, 96, and 98 for performance; the median
was 96. Accessibility, best practices, and SEO were 100 on all recorded successful
runs. The 87 run had a 4.87 s document response; subsequent document responses
were 210 ms and 10 ms. LCP was 1.9–2.2 s and CLS was 0.013–0.066. Treat the first
result as a hosting-latency warning, not the reason for this FAIL.

## Mandatory first-read result — PASS

Cold at 1440×900, the first screen answers all three required questions:

- What it does: **“Caption any Linux audio locally.”**
- Who it is for: **“For deaf and hard-of-hearing students when lectures, calls,
  or recordings have no captions.”**
- What to click: **“Try it with sample data,”** beside **“Opens a private sample.
  Nothing is saved.”**

The action enters `/demo` in one click and immediately shows four realistic
astronomy captions plus the persistent demo/reset/start-for-real banner.

## Claims gate

The first pre-install invocation correctly demonstrated that a clean clone needs
its declared dependencies (`vitest` and Linux GLib were absent). After `npm ci`
and the native packages listed by the repository were installed, every exact
command from `.factory/claims.json` was rerun:

| Claim | Exact command result |
|---|---|
| `private-local` | PASS — 2 browser projects passed |
| `offline-reload` | PASS — 2 browser projects passed |
| `srt-export` | PASS — desktop passed; expected mobile download case skipped |
| `demo-isolated` | PASS — 4 project/case executions passed |
| `free-and-paid` | PASS as written — 2 browser projects passed; see false-positive checkout finding |
| `native-local-processing` | PASS — 1 Rust test passed |
| `capture-recovery` | PASS — 1 Rust test passed |
| `language-models` | PASS as written — 1 Rust test passed; see German availability finding |

## Clean-checkout test and build results

| Command | Result |
|---|---|
| `npm ci` | PASS — 66 packages, 0 vulnerabilities |
| `npx tsc --noEmit` | **FAIL** — TS2339 at `tests/unit/release-config.test.ts:14` |
| `npm test` | PASS — 6 Vitest tests; 21 Playwright passed, 3 expected project skips |
| `npx playwright test --workers=1` | PASS — 21 passed, 3 skipped |
| `cargo fmt --check --manifest-path src-tauri/Cargo.toml` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS — 4 tests |
| `cargo check --manifest-path src-tauri/Cargo.toml` | PASS |
| `npm run build` | PASS — `dist/site` and `dist/app` |
| `CI=true npm run tauri build` | **FAIL** — `linuxdeploy` AppImage step |
| `APPIMAGE_EXTRACT_AND_RUN=1 CI=true npm run tauri build` | PASS — DEB, RPM, AppImage |
| Candidate release binary under Xvfb | PASS — remained running for 15 s; no app error |

## End-to-end and boundary evidence

- Browser demo: pause/resume by keyboard; caption-size Home/End values 20/42;
  reset preserved `real:` local storage and deleted `demo:` session storage.
- TXT export: `sample-transcript.txt`, four lines, representative sample speech.
- SRT export: `sample-captions.srt`, four timed cues, representative sample speech.
- Candidate native sample: one-keyboard-action activation after focusing **Load
  sample project**; caption overlay rendered and remained usable at 920×680 and
  390×500.
- Candidate real model download: isolated app data directory received
  `ggml-tiny.en.bin`, 77,704,715 bytes, SHA-256
  `921e4cf8686fdd993dcd081a5da5b6c365bfde1162e72b08d75ac75289920b1f`,
  matching Hugging Face's `x-linked-etag`.
- Invalid license: live UI returned “This license is not active. Check the token
  or buy Plus,” stored no token, and emitted no console/page error. Empty input
  returned “Enter the license token from your receipt.”
- Real capture normal/boundary/recovery: not executable without an audio device;
  this remains the high-severity evidence gap described above.

## Live accessibility, privacy, PWA, and headers

- `/opt/fleet/lib/verify-url.sh`: PASS; HTTP 200, 1,067 ms, title, `lang=en`, one
  `h1`, main landmark, no missing alt, no unlabeled buttons, no console errors.
- Axe via Playwright: no serious/critical findings on live `/` and `/demo` in
  light and dark schemes.
- 390 px: no horizontal overflow; 200% root text size retained the demo banner
  and produced no horizontal overflow.
- Keyboard: demo entry, pause/resume, range Home/End, and exports worked; primary
  action focus rendered a 3 px cobalt outline and 6 px acid halo.
- Reduced motion: transitions/animations were reduced to 0.01 ms and transforms
  removed. No flashing or autoplay media was present.
- Direct fresh `/demo` request log: same-origin only. No analytics or trackers
  were observed. The landing page additionally calls only the documented GitHub
  releases API.
- Security headers: HSTS, CSP, `nosniff`, referrer policy, and restrictive
  permissions policy present. CSP allowed only self plus the documented GitHub
  and Sociobot API connections.
- Cache policy: HTML/service worker use 30-second revalidation; hashed JS/CSS and
  images use `public, max-age=31536000, immutable`.
- PWA: service worker active at `/sw.js`; `registration.update()` completed with
  no waiting/installing worker; an offline reload of `/demo` worked and the
  caption controls remained operable.
- Unknown routes: real HTTP 404 with the designed page, unique title, one `h1`,
  and a return-home action.
- Billing rate limit: one client received 30 successful invalid-license checks;
  request 31 returned HTTP 429 with `Retry-After: 4`. Observed allowance: 30
  requests per current window.
- Sign-in: not applicable; the product does not require an account.

## Budgets and release assets

- Static first-load JS: 25.60 KB raw / 9.16 KB gzip.
- CSS: 17.62 KB raw / 4.65 KB gzip.
- Mobile hero: 25,040 bytes. Desktop hero: 54,804 bytes.
- Loaded WOFF2 files are below the 120 KB font budget.
- Current release contains AppImage, DEB, RPM, universal DMG, Windows EXE/MSI,
  `SHA256SUMS`, and valid `latest.json`.
- Published AppImage checksum and isolated installer behavior pass, but the assets
  are from the wrong commit as documented above.

## Evidence files

- `evidence-verification-2-desktop.png`
- `evidence-verification-2-mobile.png`
- `evidence-verification-2-native-setup.png`
- `evidence-verification-2-native-sample-delayed.png`
- `evidence-verification-2-native-390.png`
- `evidence-verification-2-native-sample-390.png`
- `evidence-verification-2-native-model.png`
- `verify-url-2/verify.json` and screenshots

## Required next steps

1. Fix the TypeScript error and make the full release verification job pass.
2. Validate and implement direct PipeWire/Pulse system-output capture on a
   representative Linux desktop, with a real end-to-end fixture test.
3. Make German usable without gating an accessibility feature; at minimum, do
   not depend on a dead checkout for required brief scope.
4. Register and verify the Sociobot product, then test checkout, return token,
   restore, revocation, and refund behavior.
5. Give every public claim exactly one meaningful observable test, including a
   checkout test that follows the URL and a storage/network test for raw audio.
6. Tag and publish a release from the repaired candidate, verify all checksums,
   then confirm the live detected-platform button points to that candidate.
7. Raise all link targets to at least 44×44 CSS px and align the README build
   command with the release workflow environment.
