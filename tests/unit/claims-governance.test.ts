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
});
