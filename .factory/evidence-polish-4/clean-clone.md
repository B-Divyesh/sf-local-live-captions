# Clean-clone verification — 2 September 2026

Repository: `/tmp/local-live-captions-polish4-clean.sfD5A9/repo`

Commit: `724bcff0ae029269bb502b31ec88ed22c0f3cd2c`

## Results

- `npm ci`: pass.
- All 29 exact commands declared in `.factory/claims.json`: pass.
- `npm test`: pass — 33 Vitest tests, 24 desktop Playwright tests with six
  expected project skips, and 27 mobile Playwright tests with three expected
  project skips.
- `npm run typecheck`: pass.
- `npm run lint`: pass, including Clippy with warnings denied.
- `npm run build`: pass; `dist/site` and `dist/app` produced.
- `npm run test:browser-lifecycle`: pass after the intended first-attempt
  Chromium SIGSEGV and clean retry.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`: pass.
- `cargo test --manifest-path src-tauri/Cargo.toml`: pass — 11 passed, two
  real-audio tests intentionally ignored outside the acceptance runner.
- `cargo check --manifest-path src-tauri/Cargo.toml`: pass.

## Native acceptance observations

- English monitor audio was captured, transcribed, formatted as captions and
  SRT, stopped, and started again.
- The German monitor test completed four independent captures with the
  multilingual model.
- The no-audio-storage trace reported zero successful path-based write opens
  or filesystem mutations by capture or its child process. Full before/after
  snapshots of isolated HOME, app-data, XDG, temporary, and working roots were
  unchanged.
- The injected native enumeration returned both `Classroom USB Microphone`
  and a PulseAudio monitor source.

## Static budgets

- Site JavaScript: 29.20 kB raw, 9.90 kB gzip.
- Site CSS: 19.50 kB raw, 5.04 kB gzip.
