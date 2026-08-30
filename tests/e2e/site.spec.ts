import { test, expect } from "./fixtures";
import AxeBuilder from "@axe-core/playwright";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const buildSha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();

test("landing page states the job and has one heading", async ({ page }) => {
  await page.route("https://api.github.com/**", (route) => route.fulfill({ status: 404, body: "{}" }));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Caption Linux calls and recordings locally");
  await expect(page.getByRole("link", { name: /Try it with sample data/ })).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main")).toHaveCount(1);
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""))).toEqual([]);
});

test("desktop first screen keeps the full first-read content visible at ordinary viewport sizes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "desktop Chromium only");
  await page.route("https://api.github.com/**", (route) => route.fulfill({ status: 404, body: "{}" }));

  for (const viewport of [{ width: 1280, height: 720 }, { width: 1366, height: 768 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    for (const locator of [
      page.locator(".dek"),
      page.getByRole("link", { name: /Try it with sample data/ }),
      page.locator(".hero-action > span"),
      ...await page.locator(".facts li").all(),
    ]) {
      const box = await locator.boundingBox();
      expect(box, `${await locator.textContent()} at ${viewport.width}x${viewport.height}`).not.toBeNull();
      expect(box!.y, `${await locator.textContent()} starts above ${viewport.width}x${viewport.height}`).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height, `${await locator.textContent()} ends below ${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(viewport.height);
    }
  }
});

test("mobile first screen keeps the three plain facts visible", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile project only");
  await page.route("https://api.github.com/**", (route) => route.fulfill({ status: 404, body: "{}" }));
  await page.goto("/");
  for (const fact of await page.locator(".facts li").all()) {
    const box = await fact.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  }
});

test("download refuses a stale release and selects the exact site build", async ({ page }) => {
  await page.addInitScript(() => { Reflect.deleteProperty(Navigator.prototype, "serviceWorker"); });
  const assets = [
    { name: "Local.Live.Captions_0.1.13_amd64.AppImage", browser_download_url: "https://github.com/B-Divyesh/sf-local-live-captions/releases/download/v0.1.13/Local.Live.Captions_0.1.13_amd64.AppImage" },
    { name: "Local.Live.Captions_0.1.13_x64_en-US.msi", browser_download_url: "https://github.com/B-Divyesh/sf-local-live-captions/releases/download/v0.1.13/Local.Live.Captions_0.1.13_x64_en-US.msi" },
  ];
  let release = { tag_name: "v0.1.7", target_commitish: "older-sha", assets };
  await page.route("https://api.github.com/**", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify([release]),
  }));
  await page.goto("/");
  await expect(page.getByText("Downloads are being published.")).toBeVisible();
  await expect(page.getByRole("link", { name: /^Download for/ })).toHaveCount(0);

  release = { tag_name: "v0.1.13", target_commitish: "older-sha", assets };
  await page.reload();
  await expect(page.getByText("Downloads are being published.")).toBeVisible();
  await expect(page.getByRole("link", { name: /^Download for/ })).toHaveCount(0);

  release = { tag_name: "v0.1.13", target_commitish: buildSha, assets };
  await page.reload();
  await expect(page.getByRole("link", { name: /^Download for/ })).toHaveAttribute("href", /\/releases\/download\/v0\.1\.13\//);
});

test("Android visitors get a desktop explanation instead of a Linux package", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "userAgent", {
    configurable: true,
    value: "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/140.0.0.0 Mobile Safari/537.36",
  }));
  let releaseRequests = 0;
  await page.route("https://api.github.com/**", (route) => {
    releaseRequests += 1;
    return route.abort();
  });
  await page.goto("/");
  await expect(page.getByText("Open this page on a Linux, macOS, or Windows computer to download the desktop app.")).toBeVisible();
  await expect(page.getByRole("link", { name: /^Download for/ })).toHaveCount(0);
  expect(releaseRequests).toBe(0);
});

test("dark pages have no serious or critical contrast violations", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  for (const route of ["/", "/demo"]) {
    await page.goto(route);
    const accessibility = await new AxeBuilder({ page }).analyze();
    expect(accessibility.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""))).toEqual([]);
  }
});

test("routes have distinct titles and one h1", async ({ page }) => {
  for (const [path, title] of [["/demo", "Demo — Local Live Captions"], ["/privacy", "Privacy — Local Live Captions"], ["/terms", "Terms — Local Live Captions"], ["/missing", "Page not found — Local Live Captions"]]) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator("h1")).toHaveCount(1);
  }
});

test("mobile layout fits 390px", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile project only");
  await page.goto("/demo");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  const resizedOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(resizedOverflow).toBeLessThanOrEqual(1);
});

test("one click demo query opens an isolated sample with reset controls", async ({ page }) => {
  await page.goto("/?demo=1");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("See live captions before installing");
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reset demo" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Start for real" })).toBeVisible();
});

test("mobile navigation and footer links meet the 44px target", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile project only");
  await page.goto("/");
  const sizes = await page.locator("nav a, .footer-links a, .wordmark").evaluateAll((elements) => elements.map((element) => {
    const box = element.getBoundingClientRect();
    return { width: box.width, height: box.height };
  }));
  expect(sizes).not.toHaveLength(0);
  expect(sizes.every((size) => size.width >= 44 && size.height >= 44)).toBe(true);
});

test("mobile demo banner actions meet the 44px touch target", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile project only");
  await page.goto("/demo");
  for (const name of ["Reset demo", "Start for real"]) {
    const box = await page.getByRole(name === "Reset demo" ? "button" : "link", { name }).boundingBox();
    expect(box, name).not.toBeNull();
    expect(box!.width, name).toBeGreaterThanOrEqual(44);
    expect(box!.height, name).toBeGreaterThanOrEqual(44);
  }
});

test("keyboard users reach the skip link first, then pause and resize captions", async ({ page }) => {
  await page.goto("/demo");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  await skipLink.press("Enter");
  await expect(page.locator("#main")).toBeFocused();

  const pause = page.getByRole("button", { name: "Pause captions" });
  await pause.focus();
  const focusStyle = await pause.evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(focusStyle).not.toBe("none");
  await pause.press("Space");
  await expect(page.getByRole("button", { name: "Resume captions" })).toBeVisible();

  const size = page.getByLabel("Caption size");
  await size.focus();
  await size.press("End");
  await expect(size).toHaveValue("42");
});

test("client-side route changes move focus to the new heading", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Demo", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
});

test("section navigation and browser history keep focus on the destination heading", async ({ page }) => {
  await page.goto("/privacy");
  await page.getByRole("link", { name: "How it works" }).click();
  await expect(page).toHaveURL(/\/#how$/);
  await expect(page.getByRole("heading", { name: "How it works" })).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await page.goForward();
  await expect(page.getByRole("heading", { name: "How it works" })).toBeFocused();
});

test("reduced motion removes interface transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const duration = await page.getByRole("link", { name: /Try it with sample data/ })
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(parseFloat(duration)).toBeLessThanOrEqual(0.00001);
});

test("@claim:desktop-overlay desktop renderer loads sample captions and changes its keep-on-top window state", async ({ page }) => {
  const commands: { command: string; args?: Record<string, unknown> }[] = [];
  await page.addInitScript(() => {
    window.__LLC_INVOKE__ = async (command, args) => {
      (window as unknown as { __commands: { command: string; args?: Record<string, unknown> }[] }).__commands ??= [];
      (window as unknown as { __commands: { command: string; args?: Record<string, unknown> }[] }).__commands.push({ command, args });
      if (command === "list_audio_devices") return ["pulse:classroom.monitor"] as never;
      if (command === "set_always_on_top") return undefined as never;
      return [] as never;
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Load sample project" }).click();
  await expect(page.getByRole("heading", { name: "Live captions" })).toBeVisible();
  const pin = page.getByRole("button", { name: "Keep on top" });
  await pin.click();
  await expect(page.getByRole("button", { name: "Allow behind" })).toHaveAttribute("aria-pressed", "false");
  commands.push(...await page.evaluate(() => (window as unknown as { __commands: { command: string; args?: Record<string, unknown> }[] }).__commands));
  expect(commands).toContainEqual({ command: "set_always_on_top", args: { enabled: false } });
});

test("@claim:capture-recovery desktop renderer shows a capture error and starts again", async ({ page }) => {
  await page.addInitScript(() => {
    let starts = 0;
    window.__LLC_INVOKE__ = async (command) => {
      if (command === "list_audio_devices") return ["pulse:classroom.monitor"] as never;
      if (command === "start_capture") {
        starts += 1;
        if (starts === 1) throw new Error("The selected audio source stopped.");
        return undefined as never;
      }
      if (command === "capture_status") return { active: true, error: null } as never;
      if (command === "get_transcript") return [] as never;
      return undefined as never;
    };
  });
  await page.goto("/");
  await page.getByLabel("Everyone has agreed to captions").check();
  await page.getByRole("button", { name: "Start captions" }).click();
  await expect(page.getByRole("alert")).toContainText("Captions did not start");
  await page.getByRole("button", { name: "Start captions" }).click();
  await expect(page.getByRole("heading", { name: "Live captions" })).toBeVisible();
});

test("@claim:storage-controls desktop renderer deletes the selected model and removes the local license", async ({ page }) => {
  const commands: { command: string; args?: Record<string, unknown> }[] = [];
  await page.addInitScript(() => {
    localStorage.setItem("sb_license:local-live-captions", "sample-license");
    localStorage.setItem("sb_license:local-live-captions:verified", "1");
    window.__LLC_INVOKE__ = async (command, args) => {
      (window as unknown as { __commands: { command: string; args?: Record<string, unknown> }[] }).__commands ??= [];
      (window as unknown as { __commands: { command: string; args?: Record<string, unknown> }[] }).__commands.push({ command, args });
      if (command === "list_audio_devices") return ["pulse:classroom.monitor"] as never;
      if (command === "delete_model") return "The downloaded model was deleted from this computer." as never;
      return undefined as never;
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Delete downloaded model" }).click();
  await expect(page.getByText("The downloaded model was deleted from this computer.")).toBeVisible();
  await page.getByRole("button", { name: "Remove supporter license" }).click();
  await expect(page.getByText("The supporter license was removed from this computer.")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("sb_license:local-live-captions"))).toBeNull();
  commands.push(...await page.evaluate(() => (window as unknown as { __commands: { command: string; args?: Record<string, unknown> }[] }).__commands));
  expect(commands).toContainEqual({ command: "delete_model", args: { model: "tiny.en" } });
});

test("@claim:private-local demo sends no data elsewhere", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (request) => { if (new URL(request.url()).origin !== "http://127.0.0.1:4173") external.push(request.url()); });
  await page.goto("/demo");
  await page.getByRole("button", { name: "Pause captions" }).click();
  await page.getByLabel("Caption size").fill("36");
  expect(external).toEqual([]);
});

test("@claim:no-telemetry-trackers privacy page makes no advertising or telemetry request", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== "http://127.0.0.1:4173") external.push(request.url());
  });
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your audio stays on your computer");
  expect(external).toEqual([]);
});

test("@claim:offline-reload sample remains usable offline", async ({ page, context }) => {
  await page.goto("/demo");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("See live captions before installing");
  await page.getByRole("button", { name: "Pause captions" }).click();
  await expect(page.getByRole("button", { name: "Resume captions" })).toBeVisible();
});

test("@claim:srt-export exports every sample caption", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "download path is covered in desktop Chromium");
  await page.goto("/demo");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export subtitle file (.srt)" }).last().click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("sample-captions.srt");
  const path = await download.path();
  const body = await readFile(path!, "utf8");
  expect(body.match(/-->/g)).toHaveLength(4);
  expect(body).toContain("Gravity pulls the cloud inward");
});

test("@claim:txt-export exports every sample caption as plain text", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "download path is covered in desktop Chromium");
  await page.goto("/demo");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export TXT" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("sample-transcript.txt");
  const path = await download.path();
  const body = await readFile(path!, "utf8");
  expect(body.trim().split("\n")).toHaveLength(4);
  expect(body).toContain("Gravity pulls the cloud inward");
});

test("@claim:live-caption-sizing changes running captions without stopping them", async ({ page }) => {
  await page.goto("/demo");
  const size = page.getByLabel("Caption size");
  await size.fill("42");
  await expect(size).toHaveValue("42");
  await expect(page.locator(".caption-stack")).toHaveCSS("font-size", "42px");
  await expect(page.getByText("Capturing sample", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause captions" })).toBeVisible();
});

test("@claim:demo-isolated reset and exit clear only demo settings", async ({ page }) => {
  await page.goto("/demo");
  await page.evaluate(() => { localStorage.setItem("real:keep", "yes"); sessionStorage.setItem("demo:caption-size", "40"); });
  await page.getByRole("button", { name: "Reset demo" }).click();
  const exitValues = await page.evaluate(() => ({ real: localStorage.getItem("real:keep"), demo: sessionStorage.getItem("demo:caption-size") }));
  expect(exitValues).toEqual({ real: "yes", demo: null });
  await page.evaluate(() => sessionStorage.setItem("demo:caption-size", "40"));
  await page.getByRole("link", { name: "Start for real" }).click();
  await expect(page).toHaveURL(/\/$/);
  const values = await page.evaluate(() => ({ real: localStorage.getItem("real:keep"), demo: sessionStorage.getItem("demo:caption-size") }));
  expect(values).toEqual({ real: "yes", demo: null });
});

test("returned licenses are verified immediately", async ({ page }) => {
  await page.addInitScript(() => { Reflect.deleteProperty(Navigator.prototype, "serviceWorker"); });
  await page.route("https://api.github.com/**", (route) => route.fulfill({ status: 404, body: "{}" }));
  let verifyRequests = 0;
  await page.route(/https:\/\/api\.sociobot\.in\/api\/v1\/products\/local-live-captions\/verify\?license=returned-token/, (route) => {
    verifyRequests += 1;
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ valid: true }) });
  });
  await page.goto("/?license=returned-token");
  await expect(page.getByText("Supporter license is active on this browser.")).toBeVisible();
  expect(verifyRequests).toBe(1);
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("sb_license:local-live-captions:verified"))).not.toBeNull();
});

test("@claim:supporter-license-restore verifies and stores a pasted license", async ({ page }) => {
  await page.addInitScript(() => { Reflect.deleteProperty(Navigator.prototype, "serviceWorker"); });
  await page.route("https://api.github.com/**", (route) => route.fulfill({ status: 404, body: "{}" }));
  let verifyRequests = 0;
  await page.route(/https:\/\/api\.sociobot\.in\/api\/v1\/products\/local-live-captions\/verify\?license=restored-token/, (route) => {
    verifyRequests += 1;
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ valid: true }) });
  });
  await page.goto("/");
  await page.getByLabel("License token").fill("restored-token");
  await page.getByRole("button", { name: "Verify license" }).click();
  await expect(page.getByText("Supporter license is active on this browser.")).toBeVisible();
  expect(verifyRequests).toBe(1);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("sb_license:local-live-captions"))).toBe("restored-token");
  await expect.poll(() => page.evaluate(() => Number(localStorage.getItem("sb_license:local-live-captions:verified")))).toBeGreaterThan(0);
});

test("@claim:free-and-paid supporter checkout link is fail-soft and caption features stay free", async ({ page }) => {
  await page.route("https://api.github.com/**", (route) => route.fulfill({ status: 404, body: "{}" }));
  await page.goto("/");
  await expect(page.getByText("English and German speech models, size controls, and transcript export stay free.", { exact: false })).toBeVisible();
  await expect(page.getByText("$24", { exact: true })).toBeVisible();
  const checkout = page.getByRole("link", { name: /Buy supporter license/ });
  await expect(checkout).toHaveAttribute("href", /api\.sociobot\.in\/api\/v1\/products\/local-live-captions\/checkout/);
  await expect(checkout).toHaveAttribute("target", "_blank");
  await expect(checkout).toHaveAttribute("rel", /noopener/);
  await expect(page.getByText("If it does not open, try again later. Captions stay free.")).toBeVisible();
});
