import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolveImplementationCommit } from "./scripts/release-identity.mjs";

const packageVersion = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")).version as string;

const buildSha = resolveImplementationCommit(fileURLToPath(new URL(".", import.meta.url)));

export default defineConfig(({ mode }) => ({
  plugins: mode === "site" ? [{
    name: "release-identity",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "release-identity.json",
        source: JSON.stringify({ tag: `v${packageVersion}`, commit: buildSha }),
      });
    },
  }] : [],
  define: {
    __APP_VERSION__: JSON.stringify(packageVersion),
    __BUILD_SHA__: JSON.stringify(buildSha),
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
