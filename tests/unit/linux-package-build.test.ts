import { describe, expect, it } from "vitest";
import { linuxPackageErrors } from "../../scripts/build-linux-packages.mjs";

describe("Linux AppImage packaging", () => {
  const version = "0.1.18";
  const artifacts = [
    { name: `Local Live Captions_${version}_amd64.AppImage`, bytes: 81_000_000 },
    { name: `Local Live Captions_${version}_amd64.deb`, bytes: 5_400_000 },
  ];

  it("regresses verification 17: builds AppImage through linuxdeploy extraction and requires both usable artifacts", () => {
    expect(linuxPackageErrors({ appImageExtractAndRun: "1", ci: "true", version, artifacts })).toEqual([]);
    expect(linuxPackageErrors({ appImageExtractAndRun: undefined, ci: "true", version, artifacts })).toEqual([
      "Linux AppImage builds must set APPIMAGE_EXTRACT_AND_RUN=1 so linuxdeploy does not require FUSE.",
    ]);
    expect(linuxPackageErrors({ appImageExtractAndRun: "1", ci: "1", version, artifacts })).toEqual([
      "Linux package builds must pass CI=true because the Tauri CLI rejects CI=1.",
    ]);
  });

  it("does not accept a partial AppDir or empty package as a release artifact", () => {
    expect(linuxPackageErrors({ appImageExtractAndRun: "1", ci: "true", version, artifacts: [{ name: `Local Live Captions_${version}_amd64.AppImage`, bytes: 12 }] })).toEqual([
      `Linux AppImage package Local Live Captions_${version}_amd64.AppImage is unexpectedly small.`,
      `Linux DEB package Local Live Captions_${version}_amd64.deb was not produced.`,
    ]);
  });
});
