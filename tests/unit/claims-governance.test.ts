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
    ]) expect(ids, `missing public claim ${id}`).toContain(id);
  });

  it("runs unit-policy claims through Vitest instead of the browser-only claim filter", async () => {
    const claims = JSON.parse(await readFile(".factory/claims.json", "utf8")) as { id: string; test: string }[];
    const commandFor = (id: string) => claims.find((claim) => claim.id === id)?.test;
    for (const id of ["call-speaker-boundaries", "unsigned-installers"]) {
      expect(commandFor(id)).toBe(`npm run test:unit -- --testNamePattern @claim:${id}`);
    }
  });
});
