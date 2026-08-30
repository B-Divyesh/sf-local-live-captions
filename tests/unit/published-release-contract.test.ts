import { describe, expect, it } from "vitest";
import { publicationErrors } from "../../scripts/verify-published-release.mjs";

const siteCommit = "f81f6c0eb051326dee835280bd25818c8a3d2b15";
const olderCommit = "6ec51c0352298721e6ef7905da7c1485ce526fab";
const names = [
  "Local.Live.Captions-0.1.10-1.x86_64.rpm",
  "Local.Live.Captions_0.1.10_amd64.AppImage",
  "Local.Live.Captions_0.1.10_amd64.deb",
  "Local.Live.Captions_0.1.10_universal.dmg",
  "Local.Live.Captions_0.1.10_x64-setup.exe",
  "Local.Live.Captions_0.1.10_x64_en-US.msi",
  "Local.Live.Captions_universal.app.tar.gz",
  "SHA256SUMS",
  "latest.json",
];

function publication(commit = siteCommit) {
  const assets = names.map((name) => ({
    name,
    browser_download_url: `https://github.com/B-Divyesh/sf-local-live-captions/releases/download/v0.1.10/${name}`,
  }));
  return {
    identity: { tag: "v0.1.10", commit: siteCommit },
    release: { tag_name: "v0.1.10", target_commitish: commit, assets },
    manifest: {
      version: "v0.1.10",
      commit,
      assets: assets.filter((asset) => !["SHA256SUMS", "latest.json"].includes(asset.name))
        .map((asset) => ({ name: asset.name, url: asset.browser_download_url })),
    },
    checksums: assets.filter((asset) => !["SHA256SUMS", "latest.json"].includes(asset.name))
      .map((asset) => `${"a".repeat(64)}  ${asset.name}`).join("\n"),
  };
}

describe("published release contract", () => {
  it("regresses verification 11: rejects the exact stale release behind the candidate site", () => {
    const stale = publication(olderCommit);
    expect(publicationErrors(stale)).toEqual([
      `Latest release commit ${olderCommit} does not match site commit ${siteCommit}.`,
      `latest.json commit ${olderCommit} does not match site commit ${siteCommit}.`,
    ]);
  });

  it("accepts one exact source identity with every platform package and checksum", () => {
    expect(publicationErrors(publication())).toEqual([]);
  });

  it("rejects a package omitted from the manifest or checksums", () => {
    const incomplete = publication();
    incomplete.manifest.assets = incomplete.manifest.assets.filter((asset) => !asset.name.endsWith(".AppImage"));
    incomplete.checksums = incomplete.checksums.split("\n").filter((line) => !line.endsWith(".AppImage")).join("\n");
    expect(publicationErrors(incomplete)).toEqual([
      "latest.json does not contain the published URL for Local.Live.Captions_0.1.10_amd64.AppImage.",
      "SHA256SUMS does not cover Local.Live.Captions_0.1.10_amd64.AppImage.",
    ]);
  });
});
