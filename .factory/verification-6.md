# Independent verification 6 — FAIL

Verified 29 August 2026 (UTC) from candidate
`56ec6a002df31b82550fe88cbf0f6aca1fe94686` against
<https://local-live-captions.sociobot.in>.

## Verdict

**FAIL — do not accept or release this candidate.**

The product implementation, native audio path, published installers, privacy
boundary, offline demo, build, and automated suites are healthy. The candidate
still fails the explicit first-read acceptance gate on a normal desktop
viewport. It also has an incomplete claims inventory and two keyboard/touch
accessibility defects.

No product code was changed during this verification. Fresh evidence is under
`.factory/qa/`.

## Release-blocking findings

### High — desktop first screen hides the primary action

On a cold 1280 × 720 Chromium visit, the page clearly states:

- What it does: “Caption any Linux audio locally”.
- Who it is for: “For deaf and hard-of-hearing students when lectures, calls,
  or recordings have no captions.”

But it does not show what to click first. The **Try it with sample data** link
starts at y=719.48 px and is 52.34 px tall, so it is below the 720 px viewport.
The screenshot contains no visible primary action. This directly fails the
work order's mandatory first-read rule. The same action is visible at 390 ×
844, and one click does open `/demo`, but mobile success does not repair the
desktop failure.

Evidence:

- `.factory/qa/live-first-read-1280x720.png`
- `.factory/qa/live-first-read-390x844.png`
- `.factory/qa/live-qa.json`

### High — public capabilities are missing from `claims.json`

All 19 listed claim commands pass after the documented dependencies are
installed, but the inventory is incomplete. Public, user-reliable behaviors
without a `.factory/claims.json` entry and a uniquely tagged claim test include:

- **Export TXT**, shown as a demo action and promised by `.factory/demo.md`.
- Caption sizing while captions are running, shown by the slider and promised
  as “Adjust the words without stopping captions.”
- Restore and verify a supporter license, shown as a public form and action.

There are ordinary unit/browser tests around some of these behaviors, and the
fresh manual flow succeeded. That does not satisfy the claims contract, which
requires each public claim to be inventoried and tagged. An unlisted claim is
explicitly a failed review condition.

Relevant source: `src/main.ts` lines 50, 65, 72, and 79; `.factory/demo.md`
line 6.

## Other findings

### Medium — initial focus bypasses the skip link and header navigation

The renderer focuses the `<h1>` on initial load. In a fresh keyboard-only
visit to `/demo`, the first Tab therefore focused **Pause captions** at y=897
instead of the skip link. It skipped the skip link and every header link in the
forward tab order. The focused control itself had a visible 3 px cobalt outline
and 6 px acid halo, so the defect is focus order, not focus visibility.

The repository test directly calls `skipLink.focus()`, so it does not catch the
real first-Tab behavior. Evidence: `.factory/qa/live-keyboard-skip-focus.png`.

### Medium — one mobile action is below the 44 px touch-target minimum

At 390 px, the persistent demo banner's **Start for real** action measured
86 × 24.8 CSS px. Other tested navigation, buttons, and controls met the
minimum. This action does not meet the contract's 44 × 44 px target.

### Medium — the required copy audit is stale

`.factory/copy-audit.md` does not audit the shipped page. It still says
“English is free”, “Plus costs $24 once”, “Plus adds German and larger English
models”, and defines the paid tier as “Plus”. The live page now says English
and German remain free and sells a supporter license that unlocks no caption
feature. Current landing sentences are missing as well. The required
plain-words audit therefore is not valid evidence for this candidate.

### Coverage gap — researched success measure is not demonstrated

The native acceptance test proves a real English PulseAudio monitor → Whisper
→ SRT → restart flow on a short public-domain fixture. The repository has no
20-minute pilot set, German speech fixture, or evidence that 75% of pilot
recordings remain useful for a full session. That researched success measure
remains unverified and should be stated as a known gap.

## Mandatory claims gate

The commands were first invoked on the untouched clone, before installation as
ordered. JavaScript commands could not start without `node_modules`, native
commands could not compile without GLib development files, and the audio test
reported missing PulseAudio. After `npm ci` and the exact native packages from
the release workflow were installed, every command was rerun verbatim and
passed. These are the authoritative post-install results:

| Claim | Result | Evidence |
| --- | --- | --- |
| `private-local` | PASS | Fresh `/demo`; only same-origin requests |
| `offline-reload` | PASS | SW-controlled reload and control use offline |
| `srt-export` | PASS | Four downloaded cues; minute/hour boundary unit test passed |
| `demo-isolated` | PASS | Reset cleared `demo:` and preserved `real:` |
| `free-and-paid` | PASS | Free copy, $24 price, checkout 303 to Dodo |
| `native-local-processing` | PASS | Native policy test |
| `capture-recovery` | PASS | Native recovery/lock test |
| `language-models` | PASS | Exact English/German-capable catalog test |
| `linux-system-audio` | PASS | Pulse monitor parsing test |
| `desktop-overlay` | PASS | Resizable config and always-on-top command test |
| `no-audio-storage` | PASS | Native storage policy test |
| `session-transcript` | PASS | Runtime-only transcript policy test |
| `no-telemetry-trackers` | PASS | Source policy plus fresh request log |
| `consent-before-capture` | PASS | Native consent guard test |
| `local-model-storage` | PASS | App-data model path test |
| `source-start-validation` | PASS | Unavailable-monitor guard test |
| `call-speaker-boundaries` | PASS | Exactly one matching Vitest test |
| `unsigned-installers` | PASS | Exactly one matching Vitest test |
| `linux-monitor-end-to-end` | PASS | Real tiny.en transcription, SRT, stop/restart |

The Linux audio run emitted expected container D-Bus/audio-backend warnings,
then passed the isolated null-sink monitor test using the real 77.11 MB model.

## Clean build and repository checks

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 66 packages, 0 vulnerabilities |
| `npx tsc --noEmit` | PASS |
| `CI=1 npm run test:browser-lifecycle` | PASS — intentional first SIGSEGV retried; reported flaky as designed |
| `CI=1 npm test` | PASS — 14 Vitest; desktop 13 pass/2 expected skips; mobile 14 pass/1 expected skip |
| `cargo fmt --check --manifest-path src-tauri/Cargo.toml` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS — 10 pass, 1 delegated/ignored acceptance test |
| `npm run test:linux-audio` | PASS |
| `cargo check --manifest-path src-tauri/Cargo.toml` | PASS |
| `npm run build` | PASS — created `dist/site` and `dist/app` |
| Lint | Not available — no lint script/configuration is declared |

The packaged frontend's first-run flow was also served independently at 920
px and 390 px: start remained disabled without consent/source, **Load sample
project** worked in one click, captions resized to 48 px, SRT downloaded, Stop
returned to setup, there was no horizontal overflow, and Axe found no serious
or critical issue.

## Live functional, accessibility, privacy, and error checks

- `/demo` opens in one click, immediately shows four astronomy captions, and
  keeps the persistent sample-data banner.
- Pause/resume, maximum caption size, TXT/SRT downloads, reset, and leaving the
  demo all worked. Reset preserved a seeded `real:` key and cleared `demo:`.
- Blank license input produced “Enter the license token from your receipt.” An
  invalid token produced a clear inactive-license recovery message.
- Desktop, 390 px mobile, dark mode, and reduced motion produced zero Axe
  serious/critical findings. Mobile had zero overflow at normal size and 200%
  text. Reduced-motion transition duration was 0.01 ms.
- Normal routes had one `<h1>`, one `<main>`, header/footer, correct distinct
  titles, and no console or page errors. The designed unknown route returned
  HTTP 404 with its 404 title and recovery link.
- All discovered links returned 200 or the documented redirect, except the
  intentionally tested missing route. Mail links were not fetched.
- A fresh direct demo visit made same-origin requests only. Landing made the
  documented GitHub release API request. License verification added only the
  documented Sociobot request. No analytics, advertising, Azure OpenAI, or
  other origin was observed.
- The service worker was activated, `registration.update()` completed, and a
  subsequent offline `/demo` reload remained operable.
- Browser response headers included HSTS, `nosniff`, strict-origin referrer
  policy, camera/microphone/geolocation denial, and a restrictive CSP. HTML and
  `sw.js` revalidate after 30 seconds; hashed assets use one-year immutable
  caching.

This product has no sign-in and no product-owned backend, so Entra identity,
backend concurrency, health/build endpoints, and server persistence checks are
not applicable.

## Billing request allowance

A fresh single-client burst to the documented license verification endpoint
returned HTTP 200 for requests 1–30 and HTTP 429 for request 31. The throttled
response included `Retry-After: 2`; a request after the cooldown returned 200.
Observed allowance: **30 requests per short window per client**.

## Deployment and installer identity

- Candidate HEAD is exactly `56ec6a002df31b82550fe88cbf0f6aca1fe94686`.
- Live JS, CSS, and `sw.js` SHA-256 values exactly matched the candidate's
  freshly generated `dist/site` files.
- Release `v0.1.4` targets `f603ae358559c88134ced0139c936d3c1dac695b`.
  Candidate `56ec6a0` differs from that tag only by prior handoff/verification
  evidence; there is no product-code difference.
- GitHub Actions run `33247834960` for `f603ae3` completed successfully.
- The release has universal macOS, Windows EXE/MSI, Linux AppImage/DEB/RPM,
  `SHA256SUMS`, and valid `latest.json` assets.
- A fresh DEB download matched its published SHA-256 exactly:
  `cc196cb9401baca1e002a7824f779941dd385e5c09fe679426e426f872973bf2`.
- `dpkg-deb` reported package `local-live-captions`, version `0.1.4`, amd64.
- The live `install.sh` verified and installed a stripped x86-64 AppImage into
  a clean temporary bin directory. Under Xvfb it stayed open until the
  intentional 12-second timeout; only expected container EGL/audio warnings
  appeared.
- The three referenced Hugging Face model files exist in the `ggerganov/whisper.cpp`
  model repository, whose API metadata identifies the license as MIT.

The deployed product artifacts therefore match the candidate's product code.

## Performance

Fresh mobile Lighthouse against the live landing page:

- Performance 93; accessibility 100; best practices 100; SEO 100.
- FCP 1.20 s; LCP 2.30 s; CLS 0.063; total blocking time 230 ms.
- Total transferred bytes 115,819.

Built site assets are within the contract budgets: JavaScript 26,102 bytes
(9.23 KB gzip), CSS 17,805 bytes (4.69 KB gzip), and mobile hero 25,040 bytes.
The initial Latin font requests total about 71 KB.

## Required remediation

1. Keep the primary sample action fully visible on a 1280 × 720 first screen.
2. Add claims and uniquely tagged sandbox tests for every public capability,
   at minimum TXT export, live caption sizing, and license restore/verify.
3. Do not move focus to the `<h1>` on the initial page load; preserve the skip
   link as the first keyboard stop while retaining route-change focus behavior.
4. Give **Start for real** a 44 px minimum mobile touch height.
5. Regenerate `.factory/copy-audit.md` from the current shipped copy and record
   the unverified 20-minute/German pilot gap in handoff documentation.
