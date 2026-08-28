import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  define: { __DESKTOP__: JSON.stringify(mode === "desktop") },
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
