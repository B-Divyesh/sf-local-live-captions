# Independent verification 7 — PASS

Verified 29 August 2026 (UTC) from clean checkout commit
`1a2caa71ab7a6923da36aa2bfc0e5b7f5a5f42b7` against
<https://local-live-captions.sociobot.in>.

## Verdict

**PASS — accept the candidate.** No release-blocking defect was found. This
commit is documentation-only relative to release commit `cda97ce`; a fresh
production build's deployed JS, CSS, and service worker matched byte-for-byte.
The live product therefore matches the candidate's shipped runtime.

No product code was modified during this verification.

## First-read result

Cold 1280 x 720 Chromium:

- It does: **“Caption any Linux audio locally.”**
- It is for: **“deaf and hard-of-hearing students”** when lectures, calls, or
  recordings have no captions.
- Click first: **“Try it with sample data”**, which says it opens a private
  sample and saves nothing.

The action was fully visible at x=64, y=476.02, 250.25 x 52.34 CSS px. The
one-click `/demo` sandbox starts in a realistic astronomy-caption state.

## Mandatory claims gate

`.factory/claims.json` exists with 23 claims. Every listed command was run
verbatim after `npm ci` and the native prerequisites declared in
`.github/workflows/release.yml`; all **23/23 passed**. The first native run on
the otherwise clean container could not compile because `glib-2.0.pc` was not
installed. That is an environment prerequisite, not an application test
failure; the exact workflow package set resolved it and the complete fresh
rerun passed.

Highlights: same-origin `/demo` privacy requests, offline reload, SRT/TXT
exports, live caption sizing, isolated demo storage, $24 checkout and license
restore, native local-processing/storage/consent checks, English/German
models, Linux monitor-source validation, and real PulseAudio monitor ->
downloaded Whisper tiny.en -> captions -> SRT -> stop/restart.

Evidence: `.factory/qa/verify-7/claims-post-prereqs.txt` and its per-command
logs.

## Local quality gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 66 packages, 0 vulnerabilities |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 15 unit tests; desktop 18 passed/3 expected skips; mobile 18 passed/3 expected skips |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS — 10 passed, 1 delegated audio test ignored (and separately passed) |
| `cargo fmt --check --manifest-path src-tauri/Cargo.toml` | PASS |
| `npm run lint` | PASS — TypeScript and `cargo clippy --all-targets -D warnings` |
| `npm run build` | PASS — `dist/site` and `dist/app` produced |

The production site JS is 26.12 KB raw / 9.25 KB gzip, CSS is 18.07 KB raw /
4.76 KB gzip, and the mobile hero image is 25.04 KB. These are below the
applicable static-product budgets.

## Live product QA

- `/`, `/demo`, `/privacy`, and `/terms` returned 200; the designed unknown
  route returned 404. Every tested route has one `h1`, one `main`, `lang=en`,
  a route-specific title, header/footer, and no horizontal overflow at desktop
  or 390 px mobile width.
- `/opt/fleet/lib/verify-url.sh` passed (title, language, main landmark, image
  alternatives, named buttons, and no console errors).
- Axe found **zero serious or critical** violations on landing, demo, privacy,
  terms, and 404 at desktop and 390 px. Normal routes had no console or page
  errors; the 404's expected failed-resource console entry was excluded from
  the normal-route result.
- Browser request logs show `/demo` uses only its own origin. Landing also
  calls only the documented GitHub release API; no analytics, ad trackers,
  Azure/OpenAI endpoints, or unexpected third parties appeared. The CSP
  permits only self, GitHub release metadata, and Sociobot licensing.
- Headers include HSTS, `nosniff`, strict-origin referrer policy,
  camera/microphone/geolocation denial, and `frame-ancestors 'none'`. HTML and
  service worker revalidate after 30 seconds; hashed assets are immutable for
  one year.
- Service-worker/claim tests cover offline `/demo` reload and update behavior.
  The live demo has visible focus treatment, a skip link, reduced-motion CSS,
  44 px demo-banner controls, reset/real-data isolation, and responsive
  390 px layout.
- The Sociobot license endpoint has a fresh observed allowance of **30**
  requests from one client; request 31 returned **429** with `Retry-After: 2`.
- Release `v0.1.5` targets `cda97ce`, contains Linux, macOS, and Windows
  assets plus SHA256SUMS/latest.json. The downloaded DEB checksum matched and
  identifies as `local-live-captions` 0.1.5 amd64. The live shell installer
  verified the 83.8 MB AppImage checksum and the installed app remained open
  under Xvfb until the intentional 12-second timeout.

## Deployment identity

Fresh build/live SHA-256 values:

| Asset | SHA-256 |
| --- | --- |
| `index-BTdooB_h.js` | `988a9f82d55238054cedfb824b455042657cffb8bcac45220cc921c082ef3af1` |
| `index-BM74oma7.css` | `049a7e819bb5be3da3aee111a1567fc0aa78d6cb4aea5236a2d0ca327c5b6a2b` |
| `sw.js` | `7c443d5150e0561b672cc0d06c903dd1c75e501cdd29003250f3f6026079c109` |

## Defects by severity

None found.

## Known evidence limits

The researched success measure (75% of 20-minute pilot recordings kept
enabled) has not been measured: this repository has a short public-domain
English fixture, not a 20-minute pilot corpus or German pilot recordings. The
product makes no accuracy promise. Published desktop installers remain
unsigned, as clearly disclosed on the site and in the README.

## Evidence locations

`.factory/qa/verify-7/` contains command logs, first-read screenshots, live
headers, Axe output, rate-limit headers, release metadata, installer output,
and byte-comparison inputs. `.factory/verify-url-7/verify.json` is the
standard URL-verifier result.
