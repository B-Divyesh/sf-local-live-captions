import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

type StaticRoute = { route: string; headers?: Record<string, string>; rewrite?: string };

describe("release configuration regressions", () => {
  it("serves only known SPA routes and gives unknown static paths a real 404", async () => {
    const config = JSON.parse(await readFile("public/staticwebapp.config.json", "utf8"));
    expect(config.responseOverrides["404"]).toEqual({ rewrite: "/404.html" });
    const routes = config.routes as StaticRoute[];
    expect(routes.map((route) => route.route)).toEqual([
      "/demo",
      "/privacy",
      "/terms",
      "/assets/*"
    ]);
    expect(routes.some((route) => "navigationFallback" in route)).toBe(false);
  });

  it("keeps immutable cache headers on fingerprinted static assets", async () => {
    const config = JSON.parse(await readFile("public/staticwebapp.config.json", "utf8"));
    const assetRoute = (config.routes as StaticRoute[]).find((route) => route.route === "/assets/*");
    expect(assetRoute?.headers?.["Cache-Control"]).toBe("public, max-age=31536000, immutable");
  });

  it("keeps an accessible heading in the desktop caption screen", async () => {
    const source = await readFile("src/main.ts", "utf8");
    expect(source).toContain('<main id="main" class="desktop-caption">');
    expect(source).toContain('<h1 class="sr-only">Live captions</h1>');
  });

  it("keeps the native overlay resizable and able to stay on top", async () => {
    const config = JSON.parse(await readFile("src-tauri/tauri.conf.json", "utf8"));
    const source = await readFile("src-tauri/src/lib.rs", "utf8");
    expect(config.app.windows[0]).toMatchObject({ resizable: true, alwaysOnTop: false });
    expect(source).toContain("set_always_on_top");
  });

  it("isolates desktop, mobile, and per-test browser lifecycles", async () => {
    const packageJson = JSON.parse(await readFile("package.json", "utf8"));
    const runner = await readFile("scripts/run-e2e.mjs", "utf8");
    const fixtures = await readFile("tests/e2e/fixtures.ts", "utf8");
    const config = await readFile("playwright.config.ts", "utf8");

    expect(packageJson.scripts.test).toContain("node scripts/run-e2e.mjs");
    expect(packageJson.scripts["test:browser-lifecycle"]).toContain("crash-recovery");
    expect(runner).toContain('projects = requestedProject ? [requestedProject] : ["chromium", "mobile"]');
    expect(runner).toContain('`--project=${project}`');
    expect(fixtures).toContain("playwright[browserName].launch");
    expect(fixtures).toContain("The previous test browser is still connected");
    expect(config).toContain('retries: process.env.CI === "1" ? 1 : 0');
    expect(config).toContain('reuseExistingServer: process.env.CI !== "1"');
  });
});
