import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";

const base = "https://local-live-captions.sociobot.in";
const evidence = ".factory/verification-evidence-15";
const browser = await chromium.launch({ headless: true });
const report = { checkedAt: new Date().toISOString(), base, routes: {}, demo: {}, mobile: {}, offline: {} };

async function pageSignals(page) {
  const axe = await new AxeBuilder({ page }).analyze();
  return {
    title: await page.title(),
    lang: await page.locator("html").getAttribute("lang"),
    h1Count: await page.locator("h1").count(),
    mainCount: await page.locator("main").count(),
    seriousOrCritical: axe.violations
      .filter((item) => ["serious", "critical"].includes(item.impact || ""))
      .map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })),
  };
}

for (const route of ["/", "/demo", "/privacy", "/terms", "/not-a-real-route"]) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: "block" });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  page.on("console", (message) => message.type() === "error" && consoleErrors.push(message.text()));
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const response = await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
  report.routes[route] = {
    status: response?.status(),
    ...(await pageSignals(page)),
    consoleErrors,
    pageErrors,
    requests,
    requestOrigins: [...new Set(requests.map((url) => new URL(url).origin))],
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true, serviceWorkers: "block" });
  const page = await context.newPage();
  const requests = [];
  const errors = [];
  page.on("request", (request) => requests.push(request.url()));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${base}/demo`, { waitUntil: "networkidle" });
  const banner = page.getByText("Demo — sample data, nothing is saved", { exact: false });
  const captionsBefore = await page.locator("#transcript-list li").allTextContents();
  const pause = page.getByRole("button", { name: /pause captions/i });
  if (await pause.count()) await pause.click();
  const pausedStateVisible = await page.getByRole("button", { name: /resume captions/i }).isVisible();
  const resume = page.getByRole("button", { name: /resume captions/i });
  if (await resume.count()) await resume.click();
  const range = page.locator('input[type="range"]');
  let rangeResult = null;
  if (await range.count()) {
    const max = await range.getAttribute("max");
    await range.fill(max || "48");
    rangeResult = { max, value: await range.inputValue() };
  }
  let textDownload = null;
  const txtButton = page.getByRole("button", { name: /export txt/i });
  if (await txtButton.count()) {
    const downloadPromise = page.waitForEvent("download");
    await txtButton.click();
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const text = Buffer.concat(chunks).toString("utf8");
    textDownload = { filename: download.suggestedFilename(), lines: text.trim().split(/\r?\n/), bytes: Buffer.byteLength(text) };
  }
  await page.screenshot({ path: `${evidence}/live-demo-desktop.png`, fullPage: true });
  report.demo = {
    bannerVisible: await banner.isVisible(),
    captionsBefore,
    pausedStateVisible,
    range: rangeResult,
    textDownload,
    requestOrigins: [...new Set(requests.map((url) => new URL(url).origin))],
    errors,
    ...(await pageSignals(page)),
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  const action = page.getByRole("link", { name: /try it with sample data/i });
  const actionBox = await action.boundingBox();
  const focusSequence = [];
  for (let index = 0; index < 8; index += 1) {
    await page.keyboard.press("Tab");
    focusSequence.push(await page.evaluate(() => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement)) return null;
      const style = getComputedStyle(element);
      return {
        tag: element.tagName,
        text: (element.innerText || element.getAttribute("aria-label") || "").trim().slice(0, 80),
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
        boxShadow: style.boxShadow,
      };
    }));
  }
  const targets = await page.locator("a:visible, button:visible, input:visible").evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { name: (element.textContent || element.getAttribute("aria-label") || "").trim().slice(0, 60), width: rect.width, height: rect.height };
  }));
  const widthBefore = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await page.waitForTimeout(200);
  const widthAt200 = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  await page.screenshot({ path: `${evidence}/live-mobile-390-200-percent.png`, fullPage: true });
  report.mobile = {
    firstActionVisibleInViewport: Boolean(actionBox && actionBox.y >= 0 && actionBox.y + actionBox.height <= 844),
    actionBox,
    focusSequence,
    undersizedTargets: targets.filter((target) => target.width < 44 || target.height < 44),
    widthBefore,
    widthAt200,
  };
  await context.close();
}

{
  const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  report.reducedMotion = await page.evaluate(() => ({
    mediaMatches: matchMedia("(prefers-reduced-motion: reduce)").matches,
    animatedVisibleElements: [...document.querySelectorAll("*")].filter((element) => {
      const style = getComputedStyle(element);
      return element.getClientRects().length > 0 && style.animationName !== "none" && style.animationDuration !== "0s" && style.animationDuration !== "0.001s";
    }).map((element) => ({ tag: element.tagName, className: element.className, animationName: getComputedStyle(element).animationName, duration: getComputedStyle(element).animationDuration })),
  }));
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "allow" });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    if (!navigator.serviceWorker.controller) await new Promise((resolve) => navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true }));
  });
  const worker = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return { active: registration.active?.state, scriptURL: registration.active?.scriptURL, controlled: Boolean(navigator.serviceWorker.controller) };
  });
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  report.offline = {
    worker,
    title: await page.title(),
    bannerVisible: await page.getByText("Demo — sample data, nothing is saved", { exact: false }).isVisible(),
    captionCount: await page.locator("#transcript-list li").count(),
  };
  await context.close();
}

{
  const context = await browser.newContext({ serviceWorkers: "block" });
  const page = await context.newPage();
  const hrefs = new Set();
  for (const route of ["/", "/demo", "/privacy", "/terms", "/not-a-real-route"]) {
    await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
    for (const href of await page.locator("a[href]").evaluateAll((links) => links.map((link) => link.href))) hrefs.add(href);
  }
  report.links = [];
  for (const href of hrefs) {
    if (href.startsWith("mailto:")) report.links.push({ href, result: "mailto" });
    else if (href.includes("/checkout")) report.links.push({ href, result: "checkout link shape confirmed; not opened" });
    else {
      const response = await fetch(href, { method: "HEAD", redirect: "follow" });
      report.links.push({ href, status: response.status, finalUrl: response.url });
    }
  }
  await context.close();
}

await browser.close();
await writeFile(`${evidence}/live-independent.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
