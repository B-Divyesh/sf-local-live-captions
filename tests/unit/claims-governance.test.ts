import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

async function testFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => entry.isDirectory()
    ? testFiles(join(directory, entry.name))
    : entry.name.endsWith(".ts") ? [join(directory, entry.name)] : []));
  return nested.flat();
}

describe("claim governance", () => {
  it("gives every listed public claim exactly one regression test", async () => {
    const claims = JSON.parse(await readFile(".factory/claims.json", "utf8")) as { id: string }[];
    const files = await testFiles("tests");
    const source = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n")
      + "\n" + await readFile("src-tauri/src/lib.rs", "utf8");
    for (const claim of claims) {
      const tag = `@claim:${claim.id}`;
      expect(source.split(tag).length - 1, tag).toBe(1);
    }
  });

  it("inventories the public privacy, consent, capture, and installer promises", async () => {
    const claims = JSON.parse(await readFile(".factory/claims.json", "utf8")) as { id: string }[];
    const ids = new Set(claims.map((claim) => claim.id));
    for (const id of [
      "no-audio-storage",
      "session-transcript",
      "no-telemetry-trackers",
      "consent-before-capture",
      "local-model-storage",
      "source-start-validation",
      "call-speaker-boundaries",
      "unsigned-installers",
      "linux-monitor-end-to-end",
      "txt-export",
      "live-caption-sizing",
      "supporter-license-restore",
      "german-caption-end-to-end",
      "storage-controls",
      "native-claim-environment",
    ]) expect(ids, `missing public claim ${id}`).toContain(id);
  });

  it("runs unit-policy claims through Vitest instead of the browser-only claim filter", async () => {
    const claims = JSON.parse(await readFile(".factory/claims.json", "utf8")) as { id: string; test: string }[];
    const commandFor = (id: string) => claims.find((claim) => claim.id === id)?.test;
    for (const id of ["call-speaker-boundaries", "unsigned-installers"]) {
      expect(commandFor(id)).toBe(`npm run test:unit -- --testNamePattern @claim:${id}`);
    }
  });

  it("@claim:native-claim-environment routes every native claim through a self-provisioning runner", async () => {
    const claims = JSON.parse(await readFile(".factory/claims.json", "utf8")) as { id: string; test: string }[];
    const runner = await readFile("scripts/run-native-claim.sh", "utf8");
    const container = await readFile("tests/native/Dockerfile", "utf8");
    const commandFor = (id: string) => claims.find((claim) => claim.id === id)?.test;
    const nativeIds = [
      "native-local-processing",
      "no-audio-storage",
      "linux-monitor-end-to-end",
      "german-caption-end-to-end",
      "language-models",
      "linux-system-audio",
      "session-transcript",
      "consent-before-capture",
      "local-model-storage",
      "source-start-validation",
    ];
    for (const id of nativeIds) expect(commandFor(id)).toBe(`npm run test:native-claim -- ${id}`);
    expect(runner).toContain("ensure_native_packages");
    expect(runner).toContain("apt-get install --yes --no-install-recommends");
    expect(runner).toContain("docker build --pull");
    expect(container).toMatch(/^FROM ubuntu:22\.04@sha256:[a-f0-9]{64}$/m);
  });
});
