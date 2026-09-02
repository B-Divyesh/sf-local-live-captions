# Local Live Captions — verification 18 handoff

## Outcome: PASS

Independent verification passed for candidate commit
`f3eb6758089380a103f0882de6db87c3ada09f91` and the live product at
<https://local-live-captions.sociobot.in> on 2 September 2026.

The deployed release identity, GitHub release, `latest.json`, and checksums
all identify `v0.1.18` from this exact commit. The downloadable Linux DEB
matches `SHA256SUMS` and reports package `local-live-captions` version
`0.1.18`, architecture `amd64`.

## How verified

- `npm ci` completed with 66 packages and zero reported vulnerabilities.
- Every one of the 27 exact commands in `.factory/claims.json` was run from
  the demo entry point. All passed, including real isolated English and German
  PulseAudio transcription, offline/demo/browser checks, and native consent,
  storage, model, and capture-recovery checks.
- `npm test` passed: 30 unit tests and 29 browser tests.
- `npm run typecheck`, `npm run lint`, and `npm run build` passed. The site
  output is `dist/site`; its initial JavaScript is 29,233 bytes (10,037 bytes
  gzip) and CSS is 19,431 bytes (5,025 bytes gzip).
- The documented Linux release gate, `npm run build:linux-packages`, passed
  from a clean generated native target. It produced a 81,709,560-byte AppImage
  and a 5,437,690-byte DEB. The AppImage stayed running for 12 seconds under
  Xvfb in this audio-less worker.
- `npm run verify:published-release` passed and confirmed `v0.1.18` →
  `f3eb6758089380a103f0882de6db87c3ada09f91`, seven desktop packages,
  `SHA256SUMS`, and `latest.json`.
- Live desktop and 390 px mobile checks had no console or page errors. The
  direct demo has a visible sample-data banner, no horizontal overflow at
  195 CSS px (200% reflow), keyboard skip-link focus, reduced-motion fallback,
  service-worker update, and offline reload.
- Axe 4.11.1 found zero serious or critical findings on `/`, `/demo`,
  `/privacy`, and `/terms`. Live demo requests stayed same-origin; the landing
  page's only documented third-party request was the GitHub release API.

## Release notes and limits

The supported FUSE-less Linux production command is
`npm run build:linux-packages`; it sets `APPIMAGE_EXTRACT_AND_RUN=1` and
verifies both package outputs. A bare `env -u CI npx tauri build --bundles
appimage,deb` still fails at `linuxdeploy` in this FUSE-less worker and is not
the release workflow command. The release gate above is the command used by
the repository workflow and passed.

macOS and Windows builds are intentionally unsigned. The app starts but cannot
find an audio source in this headless worker; the isolated PulseAudio native
claims exercised actual local English and German captioning instead.

## Run it

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run build:linux-packages
npm run verify:published-release
```

Use `/demo` for the one-click isolated sample. It keeps its browser values in
the `demo:` session-storage namespace and clears them on reset or exit.
