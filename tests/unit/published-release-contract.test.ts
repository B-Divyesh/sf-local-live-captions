import { describe, expect, it } from "vitest";
import { publicationErrors } from "../../scripts/verify-published-release.mjs";

const repairedCommit = "repaired-source-commit";
const verification13Candidate = "242656aeed034e3600ba3b98eafe47ea34249033";
const verification13PublishedRelease = "6b919f6a10327f48725327fd2d3ed02ddf9dcec8";
const names = [
  "Local.Live.Captions-0.1.12-1.x86_64.rpm",
  "Local.Live.Captions_0.1.12_amd64.AppImage",
  "Local.Live.Captions_0.1.12_amd64.deb",
  "Local.Live.Captions_0.1.12_universal.dmg",
  "Local.Live.Captions_0.1.12_x64-setup.exe",
  "Local.Live.Captions_0.1.12_x64_en-US.msi",
  "Local.Live.Captions_universal.app.tar.gz",
  "SHA256SUMS",
  "latest.json",
];

function publication(commit = repairedCommit, identity = { tag: "v0.1.12", commit: repairedCommit }) {
  const assets = names.map((name) => ({
    name,
    browser_download_url: `https://github.com/B-Divyesh/sf-local-live-captions/releases/download/${identity.tag}/${name}`,
  }));
  return {
    identity,
    release: { tag_name: identity.tag, target_commitish: commit, assets },
    manifest: {
      version: identity.tag,
      commit,
      assets: assets.filter((asset) => !["SHA256SUMS", "latest.json"].includes(asset.name))
        .map((asset) => ({ name: asset.name, url: asset.browser_download_url })),
    },
    checksums: assets.filter((asset) => !["SHA256SUMS", "latest.json"].includes(asset.name))
      .map((asset) => `${"a".repeat(64)}  ${asset.name}`).join("\n"),
  };
}

describe("published release contract", () => {
  it("regresses verification 13: rejects the exact stale release behind candidate 242656a", () => {
    const stale = publication(verification13PublishedRelease, { tag: "v0.1.11", commit: verification13Candidate });
    expect(publicationErrors(stale)).toEqual([
      `Latest release commit ${verification13PublishedRelease} does not match site commit ${verification13Candidate}.`,
      `latest.json commit ${verification13PublishedRelease} does not match site commit ${verification13Candidate}.`,
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
      "latest.json does not contain the published URL for Local.Live.Captions_0.1.12_amd64.AppImage.",
      "SHA256SUMS does not cover Local.Live.Captions_0.1.12_amd64.AppImage.",
    ]);
  });
});
