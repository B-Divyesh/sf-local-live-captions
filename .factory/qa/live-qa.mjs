import { writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const base = "https://local-live-captions.sociobot.in";
const report = { testedAt: new Date().toISOString(), base, scenarios: {} };

async function seriousAxe(page) {
  const result = await new AxeBuilder({ page }).analyze();
  return result.violations
    .filter((item) => ["serious", "critical"].includes(item.impact || ""))
    .map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.length }));
}

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

const browser = await chromium.launch({ headless: true });

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, acceptDownloads: true });
  const page = await context.newPage();
  const events = instrument(page);
  const response = await page.goto(`${base}/`, { waitUntil: "networkidle" });
  const action = page.getByRole("link", { name: /Try it with sample data/ });
  const actionBox = await action.boundingBox();
  const firstRead = {
    status: response?.status(),
    responseHeaders: response ? await response.allHeaders() : {},
    title: await page.title(),
    h1: await page.locator("h1").allTextContents(),
    audience: await page.locator(".dek").textContent(),
    actionText: await action.textContent(),
    actionBox,
    actionFullyInViewport: Boolean(actionBox && actionBox.y >= 0 && actionBox.y + actionBox.height <= 720),
    mainCount: await page.locator("main").count(),
    htmlLang: await page.locator("html").getAttribute("lang"),
    axe: await seriousAxe(page),
  };
  await page.screenshot({ path: ".factory/qa/live-first-read-1280x720.png" });
  await action.click();
  await page.waitForLoadState("networkidle");
  const demoInitial = {
    url: page.url(),
    banner: await page.getByText("Demo — sample data, nothing is saved").isVisible(),
    heading: await page.locator("h1").textContent(),
    transcriptRows: await page.locator("#transcript-list li").count(),
  };
  await page.getByRole("button", { name: "Pause captions" }).click();
  const paused = await page.getByRole("button", { name: "Resume captions" }).isVisible();
  await page.getByRole("button", { name: "Resume captions" }).click();
  await page.getByLabel("Caption size").press("End");
  const maxSize = await page.getByLabel("Caption size").inputValue();
  const txtPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export TXT" }).click();
  const txtDownload = await txtPromise;
  const txtBody = await (await import("node:fs/promises")).readFile(await txtDownload.path(), "utf8");
  const srtPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export SRT" }).last().click();
  const srtDownload = await srtPromise;
  const srtBody = await (await import("node:fs/promises")).readFile(await srtDownload.path(), "utf8");
  await page.evaluate(() => {
    localStorage.setItem("real:qa-keep", "yes");
    sessionStorage.setItem("demo:qa-reset", "yes");
  });
  await page.getByRole("button", { name: "Reset demo" }).click();
  const resetState = await page.evaluate(() => ({
    real: localStorage.getItem("real:qa-keep"),
    demo: sessionStorage.getItem("demo:qa-reset"),
  }));
  const skip = page.getByRole("link", { name: "Skip to content" });
  await skip.focus();
  const skipOutline = await skip.evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor };
  });
  await skip.press("Enter");
  const mainFocused = await page.locator("#main").evaluate((element) => document.activeElement === element);
  await page.screenshot({ path: ".factory/qa/live-demo-desktop.png", fullPage: true });
  report.scenarios.desktop = {
    firstRead,
    demoInitial,
    paused,
    maxSize,
    txt: { filename: txtDownload.suggestedFilename(), lines: txtBody.trim().split(/\n/).length, hasGravity: txtBody.includes("Gravity pulls the cloud inward") },
    srt: { filename: srtDownload.suggestedFilename(), cues: (srtBody.match(/-->/g) || []).length, hasGravity: srtBody.includes("Gravity pulls the cloud inward") },
    resetState,
    skipOutline,
    mainFocused,
    demoAxe: await seriousAxe(page),
    events,
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const events = instrument(page);
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  const action = page.getByRole("link", { name: /Try it with sample data/ });
  const actionBox = await action.boundingBox();
  await page.screenshot({ path: ".factory/qa/live-first-read-390x844.png" });
  const landing = {
    actionBox,
    actionFullyInViewport: Boolean(actionBox && actionBox.y >= 0 && actionBox.y + actionBox.height <= 844),
    overflow: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    axe: await seriousAxe(page),
  };
  await action.click();
  await page.waitForLoadState("networkidle");
  const demoAxe = await seriousAxe(page);
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  const overflowAt200 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.screenshot({ path: ".factory/qa/live-demo-mobile-200pct.png", fullPage: true });
  report.scenarios.mobile = { landing, demoAxe, overflowAt200, events };
  await context.close();
}

{
  const context = await browser.newContext({ reducedMotion: "reduce", colorScheme: "dark", viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const events = instrument(page);
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  const transition = await page.getByRole("link", { name: /Try it with sample data/ }).evaluate((element) => getComputedStyle(element).transitionDuration);
  const landingAxe = await seriousAxe(page);
  await page.goto(`${base}/demo`, { waitUntil: "networkidle" });
  const demoAxe = await seriousAxe(page);
  report.scenarios.darkReducedMotion = { transition, landingAxe, demoAxe, events };
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
    return { scope: registration.scope, scriptURL: registration.active?.scriptURL, state: registration.active?.state };
  });
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  const offline = {
    heading: await page.locator("h1").textContent(),
    banner: await page.getByText("Demo — sample data, nothing is saved").isVisible(),
  };
  await page.getByRole("button", { name: "Pause captions" }).click();
  offline.resumeVisible = await page.getByRole("button", { name: "Resume captions" }).isVisible();
  report.scenarios.pwa = { update, offline, events };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const events = instrument(page);
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.locator("#license").fill("   ");
  await page.getByRole("button", { name: "Verify license" }).click();
  const blankMessage = await page.locator("#license-result").textContent();
  await page.locator("#license").fill(`qa-invalid-${Date.now()}`);
  await page.getByRole("button", { name: "Verify license" }).click();
  await page.waitForFunction(() => !document.querySelector("#license-result")?.textContent?.includes("Checking"));
  const invalidMessage = await page.locator("#license-result").textContent();
  report.scenarios.licenseRecovery = { blankMessage, invalidMessage, events };
  await context.close();
}

await browser.close();
await writeFile(".factory/qa/live-qa.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
