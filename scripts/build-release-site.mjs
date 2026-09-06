import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolveImplementationCommit } from "./release-identity.mjs";

function siteIdentityErrors({ releaseTag, releaseCommit, implementationCommit, siteIdentity }) {
  const errors = [];
  if (!/^v\d+\.\d+\.\d+$/.test(releaseTag || "")) {
    errors.push(`Release tag ${releaseTag || "<empty>"} is not a vMAJOR.MINOR.PATCH tag.`);
  }
  if (implementationCommit !== releaseCommit) {
    errors.push(`Static release must use implementation ${releaseCommit}, but the checkout contains implementation ${implementationCommit}.`);
  }
  if (siteIdentity && siteIdentity.tag !== releaseTag) {
    errors.push(`Built site tag ${siteIdentity.tag || "<missing>"} does not match ${releaseTag}.`);
  }
  if (siteIdentity && siteIdentity.commit !== releaseCommit) {
    errors.push(`Built site commit ${siteIdentity.commit || "<missing>"} does not match ${releaseCommit}.`);
  }
  return errors;
}

function git(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function run() {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const releaseTag = process.env.RELEASE_TAG || process.argv[2] || "";
  if (!releaseTag) throw new Error("Pass RELEASE_TAG=vMAJOR.MINOR.PATCH or a release tag argument.");

  const releaseCommit = git(root, ["rev-list", "-n", "1", releaseTag]);
  const implementationCommit = resolveImplementationCommit(root);
  const sourceErrors = siteIdentityErrors({ releaseTag, releaseCommit, implementationCommit });
  if (sourceErrors.length) throw new Error(sourceErrors.join("\n"));

  const releaseEnv = {
    ...process.env,
    RELEASE_TAG: releaseTag,
    RELEASE_COMMIT: releaseCommit,
    VITE_BUILD_SHA: releaseCommit,
  };
  execFileSync("npm", ["run", "verify:release-source"], { cwd: root, env: releaseEnv, stdio: "inherit" });
  execFileSync("npm", ["run", "build:site"], { cwd: root, env: releaseEnv, stdio: "inherit" });

  const siteIdentity = JSON.parse(readFileSync(new URL("../dist/site/release-identity.json", import.meta.url), "utf8"));
  const outputErrors = siteIdentityErrors({ releaseTag, releaseCommit, implementationCommit, siteIdentity });
  if (outputErrors.length) throw new Error(outputErrors.join("\n"));
  console.log(`Release site built: ${releaseTag} -> ${releaseCommit}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) run();

export { siteIdentityErrors };
