import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveImplementationCommit } from "../../scripts/release-identity.mjs";

function git(root: string, args: string[]): string {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

describe("release identity", () => {
  it("keeps a released implementation installable after report-only commits", async () => {
    const root = await mkdtemp(join(tmpdir(), "llc-release-identity-"));
    git(root, ["init", "--initial-branch=main"]);
    git(root, ["config", "user.name", "Release identity test"]);
    git(root, ["config", "user.email", "release-test@example.invalid"]);

    await writeFile(join(root, "app.txt"), "released application\n");
    git(root, ["add", "app.txt"]);
    git(root, ["commit", "-m", "release application"]);
    const releasedCommit = git(root, ["rev-parse", "HEAD"]);

    await mkdir(join(root, ".factory"));
    await writeFile(join(root, ".factory", "verification.md"), "Verified.\n");
    git(root, ["add", ".factory/verification.md"]);
    git(root, ["commit", "-m", "docs: record verification"]);
    const documentationCommit = git(root, ["rev-parse", "HEAD"]);

    expect(documentationCommit).not.toBe(releasedCommit);
    expect(resolveImplementationCommit(root, {})).toBe(releasedCommit);

    await writeFile(join(root, "app.txt"), "changed application\n");
    git(root, ["add", "app.txt"]);
    git(root, ["commit", "-m", "change application"]);
    expect(resolveImplementationCommit(root, {})).toBe(git(root, ["rev-parse", "HEAD"]));
  });

  it("uses the immutable release commit when the release builder supplies it", () => {
    expect(resolveImplementationCommit("/path/does/not/matter", { VITE_BUILD_SHA: "release-source" })).toBe("release-source");
  });
});
