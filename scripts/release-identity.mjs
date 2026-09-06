import { execFileSync } from "node:child_process";

const REPORT_ONLY_PATHS = [
  ":(exclude).factory/**",
  ":(exclude).graphify/**",
  ":(exclude)graphify/**",
];

export function resolveImplementationCommit(root, environment = process.env) {
  if (environment.VITE_BUILD_SHA) return environment.VITE_BUILD_SHA;
  try {
    return execFileSync(
      "git",
      ["log", "-1", "--format=%H", "--", ".", ...REPORT_ONLY_PATHS],
      { cwd: root, encoding: "utf8" },
    ).trim();
  } catch {
    return "development";
  }
}
