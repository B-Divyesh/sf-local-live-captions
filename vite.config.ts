import { defineConfig } from "vite";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const packageVersion = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")).version as string;

function buildCommit(): string {
  if (process.env.VITE_BUILD_SHA) return process.env.VITE_BUILD_SHA;
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return "development";
  }
}

export default defineConfig(({ mode }) => ({
  define: {
    __APP_VERSION__: JSON.stringify(packageVersion),
    __BUILD_SHA__: JSON.stringify(buildCommit()),
    __DESKTOP__: JSON.stringify(mode === "desktop"),
  },
  build: {
    outDir: mode === "desktop" ? "dist/app" : "dist/site",
    target: "es2022",
    sourcemap: true,
    assetsInlineLimit: 2048,
    rollupOptions: { output: { manualChunks: undefined } }
  },
  server: { host: "127.0.0.1", port: 4173, strictPort: true },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true }
}));
