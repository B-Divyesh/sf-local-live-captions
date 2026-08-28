# Demo sandbox

- URL: `https://local-live-captions.sociobot.in/demo` or local `http://127.0.0.1:4173/demo`.
- Desktop entry: choose **Load sample project** on the first-run screen.
- Sample: four caption lines from a 20-second astronomy lecture, with English and German reference text in `src/sample.ts`.
- The first demo screen is already in a capture state. It supports pause, caption sizing, TXT export, and SRT export.
- Browser demo state uses session-storage keys beginning with `demo:`. It never reads or writes the `real:` namespace or the desktop app data directory.
- **Reset demo** deletes only `demo:` session keys and restores the bundled sample.
- **Start for real** leaves the demo and discards its session state.
- The service worker includes the sample and application shell, so the demo can reload after the first visit without a connection.
- The demo makes no cross-origin requests. It never downloads a model, verifies a license, or sends audio.
