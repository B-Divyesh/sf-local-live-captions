import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";

test("site-source policy rejects telemetry endpoints", async () => {
  const source = await readFile("src/main.ts", "utf8");
  expect(source).toContain("The website makes no advertising or telemetry request.");
  expect(source).not.toMatch(/google-analytics|segment\.io|mixpanel|sentry\.io/i);
  expect(source).toContain("https://api.github.com/repos/B-Divyesh/sf-local-live-captions/releases?per_page=1");
});

test("supporter copy makes no unprovable funding-use promise", async () => {
  const source = await readFile("src/main.ts", "utf8");
  expect(source).not.toContain("helps fund updates");
  expect(source).toContain("A supporter license is optional; it does not unlock caption features.");
});

test("@claim:model-provenance-license pins model sources and their shipped MIT license", async () => {
  const [native, license, provenance] = await Promise.all([
    readFile("src-tauri/src/lib.rs", "utf8"),
    readFile("third_party/whisper.cpp-LICENSE", "utf8"),
    readFile("third_party/whisper.cpp-LICENSE.provenance", "utf8"),
  ]);
  expect(native.match(/https:\/\/huggingface\.co\/ggerganov\/whisper\.cpp\/resolve\/main\//g)).toHaveLength(3);
  expect(license).toMatch(/^MIT License\n/);
  expect(provenance).toContain("c4ac0012a8f5a2082dfca6aad4ddfd8b2c02b337");
  expect(provenance).toContain("94f29bbed6a22c35b992c5c6ebf0e7c92f13b836b90f36f461c9cf2f0f1d010d");
});

test("@claim:project-license keeps the application under the MIT License", async () => {
  const [license, readme, packageJson, cargo] = await Promise.all([
    readFile("LICENSE", "utf8"),
    readFile("README.md", "utf8"),
    readFile("package.json", "utf8"),
    readFile("src-tauri/Cargo.toml", "utf8"),
  ]);
  expect(license).toMatch(/^Copyright \(c\) 2026 Sociobot \(Param Factory\)\n/);
  expect(license).toContain("Permission is hereby granted, free of charge");
  expect(license).toContain('THE SOFTWARE IS PROVIDED "AS IS"');
  expect(readme).toContain("The source is available under the [MIT License](LICENSE).");
  expect(await readFile("src/main.ts", "utf8")).toContain("The app is provided under the MIT License, without warranty.");
  expect(JSON.parse(packageJson).license).toBe("MIT");
  expect(cargo).toMatch(/^license = "MIT"$/m);
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
