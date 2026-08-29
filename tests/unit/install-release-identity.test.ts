import { execFileSync, spawnSync } from "node:child_process";
import { chmod, mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const commit = "43d108fefc83de10a59f39a7c6d5fb90fc67eb62";

describe("one-line installer release identity", () => {
  it("rejects an older release and installs only the exact site build", async () => {
    const root = await mkdtemp(join(tmpdir(), "llc-installer-"));
    const fakeBin = join(root, "fake-bin");
    const installDir = join(root, "installed");
    const identity = join(root, "identity.json");
    const release = join(root, "release.json");
    const asset = join(root, "caption.AppImage");
    await mkdir(fakeBin);
    await writeFile(identity, JSON.stringify({ tag: "v0.1.8", commit }));
    await writeFile(asset, "exact release package\n");
    await writeFile(join(fakeBin, "curl"), `#!/bin/bash
set -eu
out=""
url=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    -o) out="$2"; shift 2 ;;
    -H) shift 2 ;;
    -*) shift ;;
    *) url="$1"; shift ;;
  esac
done
case "$url" in
  */release-identity.json) cat "$MOCK_IDENTITY" ;;
  */releases/latest) cat "$MOCK_RELEASE" ;;
  */caption.AppImage) cp "$MOCK_ASSET" "$out" ;;
  */SHA256SUMS) printf '%s  caption.AppImage\\n' "$(sha256sum "$MOCK_ASSET" | cut -d ' ' -f 1)" > "$out" ;;
  *) exit 22 ;;
esac
`);
    await chmod(join(fakeBin, "curl"), 0o755);
    const env = {
      ...process.env,
      HOME: root,
      XDG_BIN_HOME: installDir,
      PATH: `${fakeBin}:${process.env.PATH}`,
      MOCK_IDENTITY: identity,
      MOCK_RELEASE: release,
      MOCK_ASSET: asset,
    };
    const releaseData = (target: string) => JSON.stringify({
      tag_name: "v0.1.8",
      target_commitish: target,
      assets: [
        { browser_download_url: "https://downloads.invalid/caption.AppImage" },
        { browser_download_url: "https://downloads.invalid/SHA256SUMS" },
      ],
    }, null, 2);

    await writeFile(release, releaseData("older-source"));
    const stale = spawnSync("sh", ["public/install.sh"], { cwd: process.cwd(), env, encoding: "utf8" });
    expect(stale.status).toBe(1);
    expect(stale.stderr).toContain("still being published");

    await writeFile(release, releaseData(commit));
    execFileSync("sh", ["public/install.sh"], { cwd: process.cwd(), env });
    expect(await readFile(join(installDir, "local-live-captions"), "utf8")).toBe("exact release package\n");
  });
});
