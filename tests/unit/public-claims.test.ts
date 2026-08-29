import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";

test("site-source policy rejects telemetry endpoints", async () => {
  const source = await readFile("src/main.ts", "utf8");
  expect(source).toContain("This site has no advertising trackers.");
  expect(source).not.toMatch(/google-analytics|segment\.io|mixpanel|sentry\.io/i);
  expect(source).toContain("https://api.github.com/repos/B-Divyesh/sf-local-live-captions/releases?per_page=1");
});

test("@claim:call-speaker-boundaries desktop commands do not join calls or identify speakers", async () => {
  const source = await readFile("src-tauri/src/lib.rs", "utf8");
  expect(source).not.toMatch(/zoom|teams|meet\.google|speaker.?id|diariz/i);
  expect(source).toContain("fn start_capture(");
  expect(source).toContain("fn transcribe(");
});

test("@claim:unsigned-installers landing disclosure matches the unsigned release workflow", async () => {
  const [landing, workflow] = await Promise.all([
    readFile("src/main.ts", "utf8"),
    readFile(".github/workflows/release.yml", "utf8"),
  ]);
  expect(landing).toContain("Current builds are unsigned.");
  expect(workflow).not.toMatch(/codesign|signtool|APPLE_CERTIFICATE|WINDOWS_CERT_PFX/i);
  expect(workflow).toContain("Unsigned desktop builds.");
});
