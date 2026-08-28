# Verification handoff — FAIL

Candidate `a3d43bffd5d160571e01f8f20ebc4253f94187b5` was independently tested on 28 August 2026 against <https://local-live-captions.sociobot.in>.

**Release decision: FAIL. Do not promote this candidate.**

The first screen, one-click browser demo, offline reload, release downloads/checksums, static build, TypeScript, Rust compilation, light-mode axe checks, mobile layout, and performance budgets passed. Deployed HTML, JS, CSS, and service-worker hashes match the candidate build.

Release blockers:

1. `CI=true npm run tauri build` fails in a clean checkout because untracked Rust resolution selects `tauri v2.11.5` while npm pins `@tauri-apps/api v2.8.0`. `src-tauri/Cargo.lock` is not tracked.
2. The live “Buy Plus” URL returns HTTP 404, so the advertised $24 purchase and German/larger-model access are unavailable.
3. Native audio/privacy claims are not proved: their claim test runs only bundled browser text, and many other landing/README promises have no claim entry.
4. Axe finds serious dark-mode contrast failures on the live landing/demo and desktop setup, plus a serious 4.19:1 failure on desktop “Stop captions.”
5. SRT export emits invalid times after 59 seconds (`65` seconds becomes `00:00:65,000`).
6. Native capture startup can fail after returning success, leaving the UI saying “Capturing”; several device-error paths leave the running flag stuck and prevent retry.
7. Multiple mobile links are below 44 px.

Additional defects: demo state survives “Start for real,” the caption screen has no `<h1>`, unknown routes return HTTP 200, hashed assets use only `max-age=30`, and returned license tokens are not verified on arrival.

Full evidence, commands, metrics, the observed 30-request API allowance, and severity are in `.factory/verification.md`. Screenshots and the required URL-verifier output are under `.factory/`.

To reproduce the decisive failures:

```sh
npm ci
CI=true npm run tauri build
curl -i https://api.sociobot.in/api/v1/products/local-live-captions/checkout
node --experimental-strip-types --input-type=module -e "import('./src/sample.ts').then(({toSrt}) => console.log(toSrt([{at:65,end:3661,text:'Boundary caption'}])))"
```

Before reverification: track a compatible Cargo lockfile/version set; register and test the paid product; add meaningful native integration/claim coverage; fix SRT formatting and capture error propagation; repair contrast and touch targets; discard demo state on exit; serve real 404 status and immutable hashed assets; then rerun every claim command, `npm test`, native packaging, axe in both themes, and a real consenting system-audio transcription session.
