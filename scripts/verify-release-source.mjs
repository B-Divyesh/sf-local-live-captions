import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

export function releaseSourceErrors({ releaseTag, expectedSha, tagCommit, packageVersion, tauriVersion, cargoVersion }) {
  const errors = [];
  if (!/^v\d+\.\d+\.\d+$/.test(releaseTag)) errors.push(`Release tag ${releaseTag || "<empty>"} is not a vMAJOR.MINOR.PATCH tag.`);
  if (releaseTag !== `v${packageVersion}`) errors.push(`Release tag ${releaseTag} does not match package version ${packageVersion}.`);
  if (tauriVersion !== packageVersion) errors.push(`Tauri version ${tauriVersion} does not match package version ${packageVersion}.`);
  if (cargoVersion !== packageVersion) errors.push(`Cargo version ${cargoVersion} does not match package version ${packageVersion}.`);
  if (tagCommit !== expectedSha) errors.push(`Tag ${releaseTag} resolves to ${tagCommit}, but this workflow is building ${expectedSha}.`);
  return errors;
}

function run() {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const releaseTag = process.env.RELEASE_TAG || process.argv[2] || "";
  const expectedSha = process.env.RELEASE_COMMIT || process.env.GITHUB_SHA || execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  const tagCommit = execFileSync("git", ["rev-list", "-n", "1", releaseTag], { cwd: root, encoding: "utf8" }).trim();
  const packageVersion = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;
  const tauriVersion = JSON.parse(readFileSync(new URL("../src-tauri/tauri.conf.json", import.meta.url), "utf8")).version;
  const cargo = readFileSync(new URL("../src-tauri/Cargo.toml", import.meta.url), "utf8");
  const cargoVersion = cargo.match(/^version = "([^"]+)"$/m)?.[1] || "";
  const errors = releaseSourceErrors({ releaseTag, expectedSha, tagCommit, packageVersion, tauriVersion, cargoVersion });
  if (errors.length) throw new Error(errors.join("\n"));
  console.log(`Release source verified: ${releaseTag} -> ${expectedSha}; package version ${packageVersion}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) run();
