# Local Live Captions — repair 15 handoff

## Outcome: PASS

The release blocker is fixed. Production, the GitHub Release, and
`latest.json` now identify the same immutable build:

- Version: `v0.1.20`
- Implementation SHA: `541c7907f2805d2bcad10140520a50309b92b435`
- Incoming documentation SHA: `d6bd6a0c99d2fc6b057f4afbc28748517136cc7b`
- Release workflow: <https://github.com/B-Divyesh/sf-local-live-captions/actions/runs/34011537369>
- Release: <https://github.com/B-Divyesh/sf-local-live-captions/releases/tag/v0.1.20>

This handoff and its evidence are a later report-only commit. They do not
change the implementation SHA.

## Cause and repair

The normal site build used repository `HEAD` as its build identity. A later
`.factory` evidence commit therefore made production identify `2b4bb04b...`,
while the v0.1.19 packages remained tied to `724bcff0...`. The download UI and
installers correctly failed closed when those identities differed.

The site now resolves its identity from the latest commit that changes product
files. Commits limited to `.factory`, `.graphify`, or `graphify` keep the prior
implementation identity. The release-site builder uses the same rule. It still
rejects a checkout containing any product change after the selected tag.

An outcome-based regression test creates a temporary Git history. It proves a
report-only commit keeps a released build installable, then proves an
application change advances the identity. v0.1.20 also updates all package,
Tauri, fixture, native-runner, and service-worker versions together.

No product behavior, paid deliverable, or privacy boundary was removed.

## Clean verification

The documented Ubuntu prerequisites were installed before native checks.
From a fresh checkout of v0.1.20:

- `npm ci`: PASS, 66 packages, zero vulnerabilities.
- Every one of the 29 exact commands in `.factory/claims.json`: PASS.
- Real English monitor capture: PASS with no internet socket and zero
  successful filesystem writes during capture.
- Real German monitor capture: PASS in four consecutive runs.
- `npm test`: PASS; 35 unit tests, 24 desktop browser tests with 6 intentional
  skips, and 27 mobile browser tests with 3 intentional skips.
- `npm run typecheck` and `npm run lint`: PASS.
- Cargo formatting, tests, and check: PASS. The ordinary Cargo suite has 11
  passes and 2 isolated-audio tests; both isolated tests pass through their
  declared PulseAudio runner.
- `npm run test:browser-lifecycle`: PASS after the expected injected browser
  crash and clean retry.
- `npm run build`: PASS. Site JavaScript is 9.90 kB gzip and CSS is 5.04 kB
  gzip.
- `npm run build:linux-packages`: PASS. The AppImage and DEB were built and
  checked without FUSE.

The first clean-checkout native invocation was interrupted when two cold Rust
targets filled the 20 GB worker filesystem. Only the primary checkout's
regenerable Cargo target was cleaned. The same claim was rerun in the clean
checkout and passed, followed by every remaining claim.

## Release and installed artifact

The GitHub workflow completed successfully for the exact implementation SHA.
It passed source resolution, the complete verification job, a Linux package
smoke test, Linux, Windows, and universal macOS builds, and manifest audit.

`npm run verify:published-release` passes against production. The release has
seven packages: AppImage, DEB, RPM, DMG, macOS app archive, MSI, and Windows
setup EXE. `SHA256SUMS` covers them and `latest.json` contains v0.1.20,
`541c7907...`, and each published URL.

The live one-line Linux installer downloaded the v0.1.20 AppImage into a fresh
temporary consumer directory and verified its checksum. The installed binary
then stayed running for a ten-second Xvfb smoke window. Missing physical audio
device warnings were expected in that isolated container.

## Cold production verification

`RELEASE_TAG=v0.1.20 npm run deploy:release-site` reused the existing
`sf-local-live-captions` Static Web App and completed successfully. The live
identity is:

```json
{"tag":"v0.1.20","commit":"541c7907f2805d2bcad10140520a50309b92b435"}
```

Fresh phone and desktop browser contexts both show, before scrolling:

- Job: “Caption Linux calls and recordings locally”.
- Audience: deaf and hard-of-hearing students whose audio has no captions.
- First action: “Try it with sample data”.
- Three facts covering local audio, offline sample use, and free models.

The desktop button links to the published v0.1.20 AppImage. One click enters
the sample with four realistic captions. The demo label remains visible after
reset. Reset and “Start for real” clear only `demo:` state and preserve seeded
real data. TXT export contains four caption lines. A fresh service-worker
context reloads the demo offline with all four captions.

Additional live results:

- `/`, `/demo`, `/privacy`, and `/terms` return 200. The designed unknown route
  returns the expected HTTP 404.
- Each route has its own title, `lang="en"`, one `h1`, and one `main`.
- Valid routes log no console errors and have zero serious or critical Axe
  findings. The same Axe result holds in dark mode with reduced motion.
- Keyboard focus reaches the skip link and moves to `main`. History navigation
  restores focus. Legal controls are at least 44 px.
- At 200% text size, the demo has zero horizontal overflow.
- Direct demo use makes no cross-origin request. Invalid licenses are not
  retained. All internal and external links resolve; the 404 page's own skip
  link correctly remains on the 404 route.
- HSTS, CSP, permissions, referrer, and content-type headers are present. HTML
  revalidates after 30 seconds, hashed assets are immutable for one year, and
  release identity is not cached.
- The license API allowed 30 requests. Request 31 returned 429 with
  `Retry-After: 2`.

`/opt/fleet/lib/verify-url.sh` loaded the cold home page in 784 ms and the demo
in 810 ms with no console or baseline accessibility failures.

Lighthouse 12.8.2 mobile results:

- Performance: 100
- Accessibility: 100
- Best practices: 100
- SEO: 100
- FCP: 1.265 s
- LCP: 1.383 s
- Total blocking time: 13 ms
- CLS: 0.0118
- Total transfer: 113,321 bytes

Machine-readable results and screenshots are in
`.factory/evidence-repair-15/live/`.

## Earlier findings

The full verification, review, and polish history was read before repair. The
latest independent report showed that all 29 claims, copy, demo isolation,
English and German captioning, privacy, legal/payment wording, touch targets,
200% reflow, offline behavior, native packaging, headers, caching, and rate
limiting already passed. Those dispositions were rechecked above. The only
current finding was the release identity mismatch, and it is now closed.

## Catalog and billing handoff

`.factory/catalog-description.txt` remains a 78-character, verb-first line and
was copied exactly to `/work/.evidence/catalog-description.txt`.

The live $24 one-time supporter offer still redirects through the registered
Sociobot checkout. It does not gate caption features. Public offer metadata is
in `/work/.evidence/billing-offer.json`; no credential is included.

## Reproduce

```bash
npm ci
npm test
npm run typecheck
npm run lint
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
npm run test:browser-lifecycle
npm run test:linux-audio
npm run build
npm run build:linux-packages
npm run verify:published-release
RELEASE_TAG=v0.1.20 npm run build:release-site
```

Run every claim exactly as declared:

```bash
node -e "require('./.factory/claims.json').forEach(x => console.log(x.test))"
```

## Known gaps and operator action

The release packages are intentionally unsigned, and the site states this.
Apple notarization and Windows Authenticode require operator-owned signing
certificates outside this repository. No functional, privacy, accessibility,
release, or billing-registration gap remains in this work order.
