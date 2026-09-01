import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.argv[2] || "https://local-live-captions.sociobot.in";
const evidence = process.argv[3] || ".factory/evidence-polish-3";
const browser = await chromium.launch({ headless: true });
const report = { base, checkedAt: new Date().toISOString(), routes: {}, demo: {}, firstScreen: {}, focus: {} };

await mkdir(evidence, { recursive: true });

async function inspectRoute(path) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: "block" });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  const response = await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
  const axe = await new AxeBuilder({ page }).analyze();
  report.routes[path] = {
    status: response?.status(),
    title: await page.title(),
    lang: await page.locator("html").getAttribute("lang"),
    h1Count: await page.locator("h1").count(),
    mainCount: await page.locator("main").count(),
    seriousOrCritical: axe.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""))
      .map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })),
    consoleErrors,
  };
  await context.close();
}

for (const path of ["/", "/demo", "/privacy", "/terms", "/not-a-real-route"]) await inspectRoute(path);

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true, serviceWorkers: "block" });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  const required = [
    page.getByRole("heading", { level: 1 }),
    page.locator(".dek"),
    page.getByRole("link", { name: /Try it with sample data/ }),
    ...await page.locator(".facts li").all(),
  ];
  report.firstScreen = {
    heading: await page.getByRole("heading", { level: 1 }).textContent(),
    withinViewport: await Promise.all(required.map(async (locator) => {
      const box = await locator.boundingBox();
      return Boolean(box && box.y >= 0 && box.y + box.height <= 844);
    })),
  };
  await page.screenshot({ path: `${evidence}/live-first-read-390.png`, fullPage: true });
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.screenshot({ path: `${evidence}/live-first-read-desktop.png`, fullPage: true });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true, serviceWorkers: "block" });
  const page = await context.newPage();
  const external = [];
  page.on("request", (request) => { if (new URL(request.url()).origin !== new URL(base).origin) external.push(request.url()); });
  await page.goto(`${base}/?demo=1`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Reset demo" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export TXT" }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  report.demo = {
    banner: await page.getByText("Demo — sample data, nothing is saved", { exact: false }).isVisible(),
    captions: await page.locator("#transcript-list li").count(),
    externalRequests: external,
    textDownload: { filename: download.suggestedFilename(), lines: Buffer.concat(chunks).toString("utf8").trim().split(/\r?\n/).length },
  };
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  report.demo.overflowAt200Percent = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.screenshot({ path: `${evidence}/live-demo-390.png`, fullPage: true });
  await context.close();
}

{
  const context = await browser.newContext({ serviceWorkers: "block" });
  const page = await context.newPage();
  await page.goto(`${base}/privacy`, { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "How it works" }).click();
  const sectionFocused = await page.getByRole("heading", { name: "How it works" }).evaluate((element) => document.activeElement === element);
  await page.goBack();
  const privacyFocused = await page.getByRole("heading", { level: 1 }).evaluate((element) => document.activeElement === element);
  report.focus = { sectionFocused, privacyFocused, pathAfterBack: new URL(page.url()).pathname };
  await context.close();
}

await browser.close();
await writeFile(`${evidence}/live-routes.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
