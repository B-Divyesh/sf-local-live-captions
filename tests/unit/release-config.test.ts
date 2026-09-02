import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { releaseSourceErrors } from "../../scripts/verify-release-source.mjs";

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
      "/release-identity.json",
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

  it("keeps the desktop stop action above the WCAG text contrast threshold", async () => {
    const styles = await readFile("src/styles.css", "utf8");
    expect(styles).toContain(".stop-button { background: var(--danger) !important; color: var(--cream) !important;");
    const luminance = (hex: string) => {
      const channels = hex.match(/[a-f\d]{2}/gi)!.map((value) => parseInt(value, 16) / 255)
        .map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };
    const foreground = luminance("#fffaf0");
    const background = luminance("#a52d25");
    expect((foreground + 0.05) / (background + 0.05)).toBeGreaterThanOrEqual(4.5);
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

  it("@claim:release-artifacts publishes the documented desktop packages and integrity files", async () => {
    const [workflow, fixture, packageText, tauriText, cargoText, shellInstaller, windowsInstaller, viteConfig, releaseBuilder, deployer] = await Promise.all([
      readFile(".github/workflows/release.yml", "utf8"),
      readFile("tests/fixtures/release-v0.1.17.json", "utf8"),
      readFile("package.json", "utf8"),
      readFile("src-tauri/tauri.conf.json", "utf8"),
      readFile("src-tauri/Cargo.toml", "utf8"),
      readFile("public/install.sh", "utf8"),
      readFile("public/install.ps1", "utf8"),
      readFile("vite.config.ts", "utf8"),
      readFile("scripts/build-release-site.mjs", "utf8"),
      readFile("scripts/deploy-release-site.mjs", "utf8"),
    ]);
    const assets = JSON.parse(fixture).assets as string[];
    const packageVersion = JSON.parse(packageText).version as string;
    const tauriVersion = JSON.parse(tauriText).version as string;
    const cargoVersion = cargoText.match(/^version = "([^"]+)"$/m)?.[1];
    expect(workflow).toContain("tauri-apps/tauri-action@v0");
    expect(workflow).toContain("tags: [\"v*\"]");
    expect(workflow).toContain("workflow_dispatch");
    expect(workflow).toContain("sha256sum * > SHA256SUMS");
    expect(workflow).toContain("latest.json");
    expect(workflow).toContain("npm run verify:release-source");
    expect(workflow).toContain("node scripts/verify-published-release.mjs");
    expect(workflow).toContain("Resolve immutable release source");
    expect(workflow).toContain('ref: ${{ needs.resolve.outputs.tag }}');
    expect(workflow).toContain('--expected-tag "$RELEASE_TAG" --expected-commit "$RELEASE_COMMIT"');
    expect(workflow).toContain('--json tagName,assets | jq --arg commit "$RELEASE_COMMIT"');
    expect(workflow).not.toContain("--jq --arg");
    expect(workflow).toContain("commit:$commit");
    expect(shellInstaller).toContain("release-identity.json");
    expect(shellInstaller).toContain('release_commit" != "$expected_commit');
    expect(shellInstaller).toContain('manifest_commit" != "$expected_commit');
    expect(windowsInstaller).toContain("$release.target_commitish -ne $identity.commit");
    expect(windowsInstaller).toContain("$manifest.commit -ne $identity.commit");
    expect(windowsInstaller).toContain("param([switch]$VerifyOnly)");
    expect(windowsInstaller).toContain("Get-FileHash -Algorithm SHA256");
    expect(viteConfig).toContain('fileName: "release-identity.json"');
    expect(releaseBuilder).toContain("Static release must be built from");
    expect(releaseBuilder).toContain("VITE_BUILD_SHA: releaseCommit");
    expect(deployer).toContain('npm", ["run", "build:release-site"]');
    expect(deployer).toContain('"/opt/fleet/lib/deploy-static.sh"');
    expect(JSON.parse(fixture).tag_name).toBe(`v${packageVersion}`);
    expect(tauriVersion).toBe(packageVersion);
    expect(cargoVersion).toBe(packageVersion);
    for (const pattern of [/\.dmg$/i, /\.(msi|exe)$/i, /\.(AppImage|deb)$/i, /^SHA256SUMS$/, /^latest\.json$/]) {
      expect(assets.some((asset) => pattern.test(asset)), String(pattern)).toBe(true);
    }
  });

  it("rejects stale release tags and source commits before packaging", () => {
    const valid = {
      releaseTag: "v0.1.17",
      expectedSha: "candidate-sha",
      tagCommit: "candidate-sha",
      packageVersion: "0.1.17",
      tauriVersion: "0.1.17",
      cargoVersion: "0.1.17",
    };
    expect(releaseSourceErrors(valid)).toEqual([]);
    expect(releaseSourceErrors({ ...valid, releaseTag: "v0.1.16" })).toContain("Release tag v0.1.16 does not match package version 0.1.17.");
    expect(releaseSourceErrors({ ...valid, tagCommit: "older-sha" })).toContain("Tag v0.1.17 resolves to older-sha, but this workflow is building candidate-sha.");
  });
});
