import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright-core";
import { writeFile } from "node:fs/promises";

const base = process.env.QA_BASE || "https://local-live-captions.sociobot.in";
const output = process.env.QA_OUTPUT || ".factory/qa/repair-8-live-qa.json";
const isLive = base.startsWith("https://");
const evidencePrefix = process.env.QA_EVIDENCE_PREFIX || (isLive ? "repair-8-live" : "repair-8-local");
const report = { testedAt: new Date().toISOString(), base, scenarios: {} };
const failures = [];

function watch(page) {
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  return { consoleErrors, pageErrors };
}

async function axe(page) {
  const result = await new AxeBuilder({ page }).analyze();
  return result.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.length }));
}

function fullyVisible(box, height) {
  return Boolean(box && box.y >= 0 && box.y + box.height <= height);
}

const browser = await chromium.launch({ headless: true });

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
]) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const events = watch(page);
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  const names = ["audience", "action", "explanation", "private", "offline", "free"];
  const locators = [
    page.locator(".dek"),
    page.getByRole("link", { name: /Try it with sample data/ }),
    page.locator(".hero-action > span"),
    ...await page.locator(".facts li").all(),
  ];
  const bounds = {};
  for (let index = 0; index < locators.length; index += 1) {
    const box = await locators[index].boundingBox();
    bounds[names[index]] = { box, fullyVisible: fullyVisible(box, viewport.height) };
    if (!fullyVisible(box, viewport.height)) failures.push(`first read ${names[index]} at ${viewport.width}x${viewport.height}`);
  }
  if (viewport.width === 1366) {
    await page.screenshot({ path: `.factory/qa/${evidencePrefix}-first-read-1366x768.png` });
  }
  report.scenarios[`firstRead${viewport.width}x${viewport.height}`] = { bounds, events };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const events = watch(page);
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  const firstReadBottom = await page.locator(".facts").evaluate((element) => element.getBoundingClientRect().bottom);
  const targets = await page.locator("a:visible, button:visible, input:visible").evaluateAll((elements) => elements.map((element) => {
    const box = element.getBoundingClientRect();
    return { name: element.getAttribute("aria-label") || element.textContent?.trim() || element.getAttribute("name"), width: box.width, height: box.height };
  }));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  const overflowAt200 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.screenshot({ path: `.factory/qa/${evidencePrefix}-mobile-200pct.png`, fullPage: true });
  report.scenarios.mobile = { firstReadBottom, targets, overflow, overflowAt200, events };
  if (firstReadBottom > 844) failures.push("mobile first read");
  if (targets.some(({ width, height }) => width < 44 || height < 44)) failures.push("mobile target size");
  if (overflow > 1 || overflowAt200 > 1) failures.push("mobile overflow");
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const events = watch(page);
  await page.goto(`${base}/demo`, { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  const firstFocus = await page.evaluate(() => document.activeElement?.textContent?.trim());
  await page.keyboard.press("Enter");
  const mainFocused = await page.locator("#main").evaluate((element) => document.activeElement === element);
  const pause = page.getByRole("button", { name: "Pause captions" });
  await pause.focus();
  await pause.press("Space");
  const resumed = await page.getByRole("button", { name: "Resume captions" }).isVisible();
  const size = page.getByLabel("Caption size");
  await size.focus();
  await size.press("Home");
  const minimum = await size.inputValue();
  await size.press("End");
  const maximum = await size.inputValue();
  report.scenarios.keyboard = { firstFocus, mainFocused, resumed, minimum, maximum, events };
  if (firstFocus !== "Skip to content" || !mainFocused || !resumed || minimum !== "20" || maximum !== "42") failures.push("keyboard operation");
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: "reduce" });
  const routes = [];
  for (const colorScheme of ["light", "dark"]) {
    await context.setDefaultTimeout(10_000);
    for (const path of ["/", "/demo", "/privacy", "/terms", "/missing-repair-8"]) {
      const page = await context.newPage();
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      const events = watch(page);
      const response = await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
      const violations = await axe(page);
      const structure = {
        lang: await page.locator("html").getAttribute("lang"),
        h1: await page.locator("h1").count(),
        main: await page.locator("main").count(),
        header: await page.locator("header").count(),
        footer: await page.locator("footer").count(),
      };
      routes.push({ colorScheme, path, status: response?.status(), title: await page.title(), structure, violations, events });
      if (violations.length || Object.values(structure).some((value) => value !== 1 && value !== "en")) failures.push(`accessibility ${colorScheme} ${path}`);
      if (events.pageErrors.length || (!path.startsWith("/missing") && events.consoleErrors.length)) failures.push(`browser error ${colorScheme} ${path}`);
      if (isLive && response?.status() !== (path.startsWith("/missing") ? 404 : 200)) failures.push(`response policy ${path}`);
      await page.close();
    }
  }
  const page = await context.newPage();
  await page.goto(`${base}/`);
  const transition = await page.getByRole("link", { name: /Try it with sample data/ }).evaluate((element) => getComputedStyle(element).transitionDuration);
  report.scenarios.accessibility = { routes, reducedMotionTransition: transition };
  if (parseFloat(transition) > 0.00001) failures.push("reduced motion");
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto(`${base}/demo`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Pause captions" }).click();
  await page.getByLabel("Caption size").fill("42");
  const external = requests.filter((url) => new URL(url).origin !== new URL(base).origin);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const caches = await page.evaluate(() => globalThis.caches.keys());
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Pause captions" }).click();
  const offlineResume = await page.getByRole("button", { name: "Resume captions" }).isVisible();
  report.scenarios.privacyOffline = { external, caches, offlineResume };
  if (external.length) failures.push("demo external requests");
  if (!caches.includes("llc-shell-v7") || !offlineResume) failures.push("offline update");
  await context.close();
}

{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/140.0.0.0 Mobile Safari/537.36",
  });
  const page = await context.newPage();
  const githubRequests = [];
  page.on("request", (request) => {
    if (request.url().startsWith("https://api.github.com/")) githubRequests.push(request.url());
  });
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  const explanation = await page.getByText("Open this page on a Linux, macOS, or Windows computer to download the desktop app.").isVisible();
  const packageLinks = await page.getByRole("link", { name: /^Download for/ }).count();
  report.scenarios.android = { explanation, packageLinks, githubRequests };
  if (!explanation || packageLinks || githubRequests.length) failures.push("Android download handling");
  await context.close();
}

await browser.close();
report.failures = [...new Set(failures)];
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
process.exit(report.failures.length ? 1 : 0);
