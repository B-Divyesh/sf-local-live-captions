import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

function git(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

export function deploymentIdentityErrors({ releaseTag, releaseCommit, siteIdentity }) {
  const errors = [];
  if (!/^v\d+\.\d+\.\d+$/.test(releaseTag || "")) errors.push(`Release tag ${releaseTag || "<empty>"} is not a vMAJOR.MINOR.PATCH tag.`);
  if (!siteIdentity?.tag || !siteIdentity?.commit) errors.push("The release site identity is incomplete.");
  if (siteIdentity?.tag && siteIdentity.tag !== releaseTag) errors.push(`Built site tag ${siteIdentity.tag} does not match ${releaseTag}.`);
  if (siteIdentity?.commit && siteIdentity.commit !== releaseCommit) errors.push(`Built site commit ${siteIdentity.commit} does not match ${releaseCommit}.`);
  return errors;
}

function run() {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const releaseTag = process.env.RELEASE_TAG || process.argv[2] || "";
  if (!releaseTag) throw new Error("Pass RELEASE_TAG=vMAJOR.MINOR.PATCH or a release tag argument.");

  // This is deliberately the only deploy entry point documented for the
  // static site. It rebuilds the output from the immutable tag before the
  // fleet uploader can see dist/site.
  execFileSync("npm", ["run", "build:release-site"], {
    cwd: root,
    env: { ...process.env, RELEASE_TAG: releaseTag },
    stdio: "inherit",
  });

  const releaseCommit = git(root, ["rev-list", "-n", "1", releaseTag]);
  const siteIdentity = JSON.parse(readFileSync(new URL("../dist/site/release-identity.json", import.meta.url), "utf8"));
  const errors = deploymentIdentityErrors({ releaseTag, releaseCommit, siteIdentity });
  if (errors.length) throw new Error(errors.join("\n"));

  const deployStatic = process.env.DEPLOY_STATIC_BIN || "/opt/fleet/lib/deploy-static.sh";
  execFileSync(deployStatic, ["local-live-captions", "dist/site"], { cwd: root, stdio: "inherit" });
  console.log(`Release site deployed: ${releaseTag} -> ${releaseCommit}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) run();
