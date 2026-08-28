import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

test("landing page states the job and has one heading", async ({ page }) => {
  await page.route("https://api.github.com/**", (route) => route.fulfill({ status: 404, body: "{}" }));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Caption any Linux audio locally");
  await expect(page.getByRole("link", { name: /Try it with sample data/ })).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main")).toHaveCount(1);
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""))).toEqual([]);
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

test("@claim:private-local demo sends no data elsewhere", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (request) => { if (new URL(request.url()).origin !== "http://127.0.0.1:4173") external.push(request.url()); });
  await page.goto("/demo");
  await page.getByRole("button", { name: "Pause captions" }).click();
  await page.getByLabel("Caption size").fill("36");
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
  await page.getByRole("button", { name: "Export SRT" }).last().click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("sample-captions.srt");
  const path = await download.path();
  const body = await readFile(path!, "utf8");
  expect(body.match(/-->/g)).toHaveLength(4);
  expect(body).toContain("Gravity pulls the cloud inward");
});

test("@claim:demo-isolated reset clears only demo settings", async ({ page }) => {
  await page.goto("/demo");
  await page.evaluate(() => { localStorage.setItem("real:keep", "yes"); sessionStorage.setItem("demo:caption-size", "40"); });
  await page.getByRole("button", { name: "Reset demo" }).click();
  const values = await page.evaluate(() => ({ real: localStorage.getItem("real:keep"), demo: sessionStorage.getItem("demo:caption-size") }));
  expect(values).toEqual({ real: "yes", demo: null });
});

test("@claim:demo-isolated leaving the demo discards only demo settings", async ({ page }) => {
  await page.goto("/demo");
  await page.evaluate(() => { localStorage.setItem("real:keep", "yes"); sessionStorage.setItem("demo:caption-size", "40"); });
  await page.getByRole("link", { name: "Start for real" }).click();
  await expect(page).toHaveURL(/\/$/);
  const values = await page.evaluate(() => ({ real: localStorage.getItem("real:keep"), demo: sessionStorage.getItem("demo:caption-size") }));
  expect(values).toEqual({ real: "yes", demo: null });
});

test("returned licenses are verified immediately", async ({ page }) => {
  await page.route("https://api.github.com/**", (route) => route.fulfill({ status: 404, body: "{}" }));
  let verifyRequests = 0;
  await page.route("https://api.sociobot.in/api/v1/products/local-live-captions/verify?license=returned-token", (route) => {
    verifyRequests += 1;
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ valid: true }) });
  });
  await page.goto("/?license=returned-token");
  await expect(page.getByText("Plus is active on this browser.")).toBeVisible();
  expect(verifyRequests).toBe(1);
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("sb_license:local-live-captions:verified"))).not.toBeNull();
});

test("@claim:free-and-paid pricing stays explicit", async ({ page }) => {
  await page.route("https://api.github.com/**", (route) => route.fulfill({ status: 404, body: "{}" }));
  await page.goto("/");
  await expect(page.getByText("English captions, size controls, and transcript export stay free.", { exact: false })).toBeVisible();
  await expect(page.getByText("$24", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Buy Plus/ })).toHaveAttribute("href", /api\.sociobot\.in\/api\/v1\/products\/local-live-captions\/checkout/);
});
