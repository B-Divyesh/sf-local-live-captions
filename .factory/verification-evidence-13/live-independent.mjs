import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";

const base = "https://local-live-captions.sociobot.in";
const outDir = new URL("./", import.meta.url);
const browser = await chromium.launch({ headless: true });
const report = { checkedAt: new Date().toISOString(), base, routes: {}, flows: {} };

async function inspectRoute(path, viewport = { width: 1280, height: 720 }) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const requests = [];
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on("request", request => requests.push(request.url()));
  page.on("requestfailed", request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", error => pageErrors.push(error.message));
  const response = await page.goto(`${base}${path}`, { waitUntil: "networkidle", timeout: 60_000 });
  const axe = await new AxeBuilder({ page }).analyze();
  const result = {
    status: response?.status(),
    title: await page.title(),
    lang: await page.locator("html").getAttribute("lang"),
    h1Count: await page.locator("h1").count(),
    h1: await page.locator("h1").allTextContents(),
    mainCount: await page.locator("main").count(),
    missingAlt: await page.locator("img:not([alt])").count(),
    unlabeledButtons: await page.locator("button").evaluateAll(buttons => buttons.filter(button => !button.innerText.trim() && !button.getAttribute("aria-label")).length),
    horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    seriousCriticalAxe: axe.violations.filter(v => v.impact === "serious" || v.impact === "critical").map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
    requests,
    consoleErrors,
    pageErrors,
    failedRequests,
    headers: response?.headers(),
  };
  await context.close();
  return result;
}

for (const path of ["/", "/demo", "/privacy", "/terms", "/definitely-missing-verification-13"]) {
  report.routes[path] = await inspectRoute(path);
}

for (const [name, viewport] of Object.entries({ desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } })) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  const action = page.getByRole("link", { name: /Try it with sample data/ });
  report.flows[`cold-${name}`] = {
    h1: await page.locator("h1").innerText(),
    audience: await page.locator(".hero-copy > p").first().innerText(),
    action: await action.innerText(),
    actionBox: await action.boundingBox(),
    viewport,
    visibleText: (await page.locator("body").innerText()).slice(0, 900),
  };
  await page.screenshot({ path: new URL(`cold-${name}.png`, outDir).pathname, fullPage: false });
  await action.click();
  await page.waitForLoadState("networkidle");
  report.flows[`one-click-demo-${name}`] = {
    url: page.url(),
    banner: await page.getByText("Demo — sample data, nothing is saved").isVisible(),
    transcriptLines: await page.locator("#transcript-list li").count(),
    captureState: await page.locator(".capture-state").innerText(),
  };
  await page.screenshot({ path: new URL(`demo-${name}.png`, outDir).pathname, fullPage: false });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  const requests = [];
  const consoleErrors = [];
  const pageErrors = [];
  page.on("request", request => requests.push(request.url()));
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", error => pageErrors.push(error.message));
  await page.goto(`${base}/demo`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    sessionStorage.setItem("real:sentinel", "keep");
    sessionStorage.setItem("demo:caption-size", "42");
  });
  await page.reload({ waitUntil: "networkidle" });
  const pause = page.getByRole("button", { name: "Pause captions" });
  await pause.focus();
  const focus = await pause.evaluate(element => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, outlineColor: style.outlineColor };
  });
  await pause.press("Space");
  const pausedState = await page.locator(".capture-state").innerText();
  await page.getByRole("button", { name: "Resume captions" }).press("Space");
  const resumedState = await page.locator(".capture-state").innerText();
  const srtDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export subtitle file (.srt)" }).last().click();
  const srt = await srtDownload;
  const srtPath = await srt.path();
  const srtText = await fs.readFile(srtPath, "utf8");
  const txtDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export TXT" }).click();
  const txt = await txtDownload;
  const txtPath = await txt.path();
  const txtText = await fs.readFile(txtPath, "utf8");
  await page.getByRole("button", { name: "Reset demo" }).click();
  const storageAfterReset = await page.evaluate(() => ({ real: sessionStorage.getItem("real:sentinel"), demo: sessionStorage.getItem("demo:caption-size") }));
  const motion = await page.locator(".button").first().evaluate(element => ({ transitionDuration: getComputedStyle(element).transitionDuration, scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior }));
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  const overflowAt200 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const sw = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return { controlled: Boolean(navigator.serviceWorker.controller), scope: registration.scope, caches: await caches.keys() };
  });
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  report.flows.demo = {
    focus,
    pausedState,
    resumedState,
    srt: { filename: srt.suggestedFilename(), cueCount: (srtText.match(/^\d+$/gm) || []).length, validTimestamp: /\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}/.test(srtText) },
    txt: { filename: txt.suggestedFilename(), nonemptyLines: txtText.trim().split("\n").length, includesAstronomy: txtText.includes("star changes") },
    storageAfterReset,
    motion,
    overflowAt200,
    sw,
    offline: { title: await page.title(), h1: await page.locator("h1").innerText(), pauseVisible: await page.getByRole("button", { name: "Pause captions" }).isVisible() },
    externalRequests: requests.filter(url => new URL(url).origin !== base),
    consoleErrors,
    pageErrors,
  };
  await context.close();
}

{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  const firstTab = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), href: document.activeElement?.getAttribute("href") }));
  await page.keyboard.press("Enter");
  const afterSkip = await page.evaluate(() => ({ id: document.activeElement?.id, tag: document.activeElement?.tagName }));
  const input = page.getByLabel("License token");
  await input.fill("");
  await page.getByRole("button", { name: "Verify license" }).click();
  const emptyError = await page.locator("#license-result").innerText();
  await input.fill("verification-13-invalid-token");
  await page.getByRole("button", { name: "Verify license" }).click();
  await page.locator("#license-result").filter({ hasText: /not active|could not be reached/ }).waitFor({ timeout: 30_000 });
  report.flows.keyboardAndInvalid = {
    firstTab,
    afterSkip,
    emptyError,
    invalidError: await page.locator("#license-result").innerText(),
    invalidStored: await page.evaluate(() => localStorage.getItem("sb_license:local-live-captions")),
  };
  await context.close();
}

await browser.close();
await fs.writeFile(new URL("live-independent.json", outDir), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
