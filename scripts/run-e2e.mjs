import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const supportedProjects = ["chromium", "mobile", "crash-recovery"];
const arguments_ = process.argv.slice(2);
const requestedProject = supportedProjects.includes(arguments_[0]) ? arguments_.shift() : undefined;
const projects = requestedProject ? [requestedProject] : ["chromium", "mobile"];
const playwrightCli = fileURLToPath(new URL("../node_modules/@playwright/test/cli.js", import.meta.url));

for (const project of projects) {
  const result = spawnSync(
    process.execPath,
    [playwrightCli, "test", `--project=${project}`, ...arguments_],
    { cwd: fileURLToPath(new URL("..", import.meta.url)), env: process.env, stdio: "inherit" },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
