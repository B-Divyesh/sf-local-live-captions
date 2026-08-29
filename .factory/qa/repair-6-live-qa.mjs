import { writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const base = "https://local-live-captions.sociobot.in";
const report = { testedAt: new Date().toISOString(), base, scenarios: {} };

function instrument(page) {
  const consoleErrors = [];
  const pageErrors = [];
  const requests = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("request", (request) => requests.push(request.url()));
  return { consoleErrors, pageErrors, requests };
}

async function seriousAxe(page) {
  const result = await new AxeBuilder({ page }).analyze();
  return result.violations
    .filter((item) => ["serious", "critical"].includes(item.impact || ""))
    .map((item) => ({ id: item.id, nodes: item.nodes.length }));
}

const browser = await chromium.launch({ headless: true });

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, acceptDownloads: true });
  const page = await context.newPage();
  const events = instrument(page);
  const response = await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(100);
  const action = page.getByRole("link", { name: /Try it with sample data/ });
  const actionBox = await action.boundingBox();
  const initialFocus = await page.evaluate(() => document.activeElement?.tagName);
  await page.keyboard.press("Tab");
  const firstTab = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    text: document.activeElement?.textContent?.trim(),
  }));
  await page.screenshot({ path: ".factory/qa/repair-6-live-first-read.png" });
  await action.click();
  await page.getByRole("button", { name: "Pause captions" }).click();
  await page.getByRole("button", { name: "Resume captions" }).click();
  await page.getByLabel("Caption size").fill("42");
  const captionSize = await page.locator(".caption-stack").evaluate((element) => getComputedStyle(element).fontSize);
  const txtPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export TXT" }).click();
  const txt = await txtPromise;
  const txtBody = await (await import("node:fs/promises")).readFile(await txt.path(), "utf8");
  const srtPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export SRT" }).last().click();
  const srt = await srtPromise;
  const srtBody = await (await import("node:fs/promises")).readFile(await srt.path(), "utf8");
  await page.evaluate(() => {
    localStorage.setItem("real:repair-6", "keep");
    sessionStorage.setItem("demo:repair-6", "clear");
  });
  await page.getByRole("button", { name: "Reset demo" }).click();
  const reset = await page.evaluate(() => ({
    real: localStorage.getItem("real:repair-6"),
    demo: sessionStorage.getItem("demo:repair-6"),
  }));
  report.scenarios.desktop = {
    status: response?.status(),
    actionBox,
    actionFullyVisible: Boolean(actionBox && actionBox.y >= 0 && actionBox.y + actionBox.height <= 720),
    initialFocus,
    firstTab,
    transcriptRows: await page.locator("#transcript-list li").count(),
    captionSize,
    txt: { filename: txt.suggestedFilename(), lines: txtBody.trim().split("\n").length },
    srt: { filename: srt.suggestedFilename(), cues: (srtBody.match(/-->/g) || []).length },
    reset,
    axe: await seriousAxe(page),
    events,
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const events = instrument(page);
  await page.goto(`${base}/demo`, { waitUntil: "networkidle" });
  const targets = {};
  for (const [role, name] of [["button", "Reset demo"], ["link", "Start for real"]]) {
    targets[name] = await page.getByRole(role, { name }).boundingBox();
  }
  const axe = await seriousAxe(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  const overflowAt200 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.screenshot({ path: ".factory/qa/repair-6-live-demo-mobile-200pct.png", fullPage: true });
  report.scenarios.mobile = { targets, overflow, overflowAt200, axe, events };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, colorScheme: "dark", reducedMotion: "reduce" });
  const page = await context.newPage();
  const events = instrument(page);
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  const landingAxe = await seriousAxe(page);
  const transition = await page.getByRole("link", { name: /Try it with sample data/ })
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  await page.goto(`${base}/demo`, { waitUntil: "networkidle" });
  report.scenarios.darkReducedMotion = {
    transition,
    landingAxe,
    demoAxe: await seriousAxe(page),
    events,
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const events = instrument(page);
  await page.goto(`${base}/demo`, { waitUntil: "networkidle" });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const update = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return {
      state: registration.active?.state,
      scriptURL: registration.active?.scriptURL,
      caches: await caches.keys(),
    };
  });
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Pause captions" }).click();
  report.scenarios.offlineUpdate = {
    update,
    heading: await page.getByRole("heading", { level: 1 }).textContent(),
    resumeVisible: await page.getByRole("button", { name: "Resume captions" }).isVisible(),
    events,
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const events = instrument(page);
  let verifyStatus = null;
  page.on("response", (response) => {
    if (response.url().includes("/local-live-captions/verify?license=")) verifyStatus = response.status();
  });
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.getByLabel("License token").fill(`repair-6-invalid-${Date.now()}`);
  await page.getByRole("button", { name: "Verify license" }).click();
  await page.waitForFunction(() => !document.querySelector("#license-result")?.textContent?.includes("Checking"));
  report.scenarios.licenseResponse = {
    verifyStatus,
    message: await page.locator("#license-result").textContent(),
    events,
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const routes = [];
  const hrefs = new Set();
  for (const path of ["/", "/demo", "/privacy", "/terms", "/missing-repair-6"]) {
    const page = await context.newPage();
    const events = instrument(page);
    const response = await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
    for (const href of await page.locator("a[href]").evaluateAll((links) => links.map((link) => link.href))) {
      hrefs.add(href);
    }
    routes.push({
      path,
      status: response?.status(),
      title: await page.title(),
      lang: await page.locator("html").getAttribute("lang"),
      h1: await page.locator("h1").count(),
      main: await page.locator("main").count(),
      header: await page.locator("header").count(),
      footer: await page.locator("footer").count(),
      axe: await seriousAxe(page),
      consoleErrors: events.consoleErrors,
      pageErrors: events.pageErrors,
    });
    await page.close();
  }
  const links = [];
  for (const href of [...hrefs].sort()) {
    if (href.startsWith("mailto:") || href.includes("/releases/download/")) continue;
    const response = await context.request.get(href, { failOnStatusCode: false, maxRedirects: 0 });
    links.push({ href, status: response.status() });
  }
  report.scenarios.routesAndLinks = { routes, links };
  await context.close();
}

await browser.close();

const failures = [];
const desktop = report.scenarios.desktop;
if (desktop.status !== 200 || !desktop.actionFullyVisible) failures.push("desktop first read");
if (desktop.initialFocus !== "BODY" || desktop.firstTab.text !== "Skip to content") failures.push("keyboard order");
if (desktop.captionSize !== "42px" || desktop.txt.lines !== 4 || desktop.srt.cues !== 4) failures.push("demo actions");
if (desktop.reset.real !== "keep" || desktop.reset.demo !== null) failures.push("demo isolation");
const mobile = report.scenarios.mobile;
if (Object.values(mobile.targets).some((box) => !box || box.width < 44 || box.height < 44)) failures.push("mobile targets");
if (mobile.overflow > 1 || mobile.overflowAt200 > 1) failures.push("mobile overflow");
if (!report.scenarios.offlineUpdate.update.caches.includes("llc-shell-v5") || !report.scenarios.offlineUpdate.resumeVisible) failures.push("offline update");
if (report.scenarios.licenseResponse.verifyStatus !== 200 || !report.scenarios.licenseResponse.message.includes("not active")) failures.push("license response");
const routesAndLinks = report.scenarios.routesAndLinks;
if (routesAndLinks.routes.some((route) => route.status !== (route.path.startsWith("/missing") ? 404 : 200)
  || route.lang !== "en" || route.h1 !== 1 || route.main !== 1 || route.header !== 1 || route.footer !== 1
  || route.axe.length || (!route.path.startsWith("/missing") && route.consoleErrors.length)
  || route.pageErrors.length)) failures.push("routes");
if (new Set(routesAndLinks.routes.map((route) => route.title)).size !== routesAndLinks.routes.length) failures.push("route titles");
if (routesAndLinks.links.some((link) => (link.status < 200 || link.status >= 400)
  && !link.href.includes("/missing-repair-6"))) failures.push("links");
for (const scenario of Object.values(report.scenarios)) {
  if (scenario.axe?.length || scenario.landingAxe?.length || scenario.demoAxe?.length) failures.push("axe");
  if (scenario.events?.consoleErrors.length || scenario.events?.pageErrors.length) failures.push("browser errors");
}
report.failures = [...new Set(failures)];
await writeFile(".factory/qa/repair-6-live-qa.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
process.exit(report.failures.length ? 1 : 0);
