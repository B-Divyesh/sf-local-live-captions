import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("release configuration regressions", () => {
  it("serves only known SPA routes and gives unknown static paths a real 404", async () => {
    const config = JSON.parse(await readFile("public/staticwebapp.config.json", "utf8"));
    expect(config.responseOverrides["404"]).toEqual({ rewrite: "/404.html" });
    expect(config.routes.map((route: { route: string }) => route.route)).toEqual([
      "/demo",
      "/privacy",
      "/terms",
      "/assets/*"
    ]);
    expect(config.routes.some((route: { route: string }) => route.navigationFallback)).toBe(false);
  });

  it("keeps immutable cache headers on fingerprinted static assets", async () => {
    const config = JSON.parse(await readFile("public/staticwebapp.config.json", "utf8"));
    const assetRoute = config.routes.find((route: { route: string }) => route.route === "/assets/*");
    expect(assetRoute.headers["Cache-Control"]).toBe("public, max-age=31536000, immutable");
  });

  it("keeps an accessible heading in the desktop caption screen", async () => {
    const source = await readFile("src/main.ts", "utf8");
    expect(source).toContain('<main id="main" class="desktop-caption">');
    expect(source).toContain('<h1 class="sr-only">Live captions</h1>');
  });
});
