import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const MIN_PACKAGE_BYTES = 1_000_000;

function packageFiles(directory) {
  try {
    return readdirSync(directory).map((name) => {
      const path = join(directory, name);
      return { name, bytes: statSync(path).size };
    });
  } catch {
    return [];
  }
}

export function linuxPackageErrors({ appImageExtractAndRun, ci, version, artifacts }) {
  const errors = [];
  if (ci !== "true") {
    errors.push("Linux package builds must pass CI=true because the Tauri CLI rejects CI=1.");
  }
  if (appImageExtractAndRun !== "1") {
    errors.push("Linux AppImage builds must set APPIMAGE_EXTRACT_AND_RUN=1 so linuxdeploy does not require FUSE.");
  }
  for (const [kind, name] of [["AppImage", `Local Live Captions_${version}_amd64.AppImage`], ["DEB", `Local Live Captions_${version}_amd64.deb`]]) {
    const artifact = artifacts.find((item) => item.name === name);
    if (!artifact) errors.push(`Linux ${kind} package ${name} was not produced.`);
    else if (artifact.bytes < MIN_PACKAGE_BYTES) errors.push(`Linux ${kind} package ${name} is unexpectedly small.`);
  }
  return errors;
}

function run() {
  if (process.platform !== "linux") throw new Error("Linux packages can only be built on Linux.");
  const root = fileURLToPath(new URL("..", import.meta.url));
  const { version } = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  // Tauri parses CI as a boolean option. GitHub-style CI=1 is common in
  // runners but is rejected by the CLI, so make this command self-contained.
  const environment = { ...process.env, CI: "true", APPIMAGE_EXTRACT_AND_RUN: "1" };
  execFileSync("npx", ["tauri", "build", "--bundles", "appimage,deb"], { cwd: root, env: environment, stdio: "inherit" });

  const artifacts = [
    ...packageFiles(join(root, "src-tauri", "target", "release", "bundle", "appimage")),
    ...packageFiles(join(root, "src-tauri", "target", "release", "bundle", "deb")),
  ];
  const errors = linuxPackageErrors({ appImageExtractAndRun: environment.APPIMAGE_EXTRACT_AND_RUN, ci: environment.CI, version, artifacts });
  if (errors.length) throw new Error(errors.join("\n"));
  console.log(`Linux AppImage and DEB packages verified for ${version}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) run();
