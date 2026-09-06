import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const base = "https://local-live-captions.sociobot.in";
const out = ".factory/verification-evidence-20";
const result = { checkedAt: new Date().toISOString(), firstRead: {}, routes: {}, demo: {}, offline: {}, keyboard: {}, requests: [], errors: [], axe: {} };
const check = (condition, message) => { if (!condition) throw new Error(message); };
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });

async function firstRead(name, contextOptions) {
  const context = await browser.newContext({ ...contextOptions, serviceWorkers: "block" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  const response = await page.goto(base, { waitUntil: "networkidle" });
  const h1 = page.getByRole("heading", { level: 1 });
  const audience = page.locator(".dek");
  const action = page.getByRole("link", { name: /Try it with sample data/ });
  const facts = page.locator(".facts li");
  const locators = [h1, audience, action, ...await facts.all()];
  const visible = [];
  for (const locator of locators) { const box = await locator.boundingBox(); visible.push(Boolean(box && box.y >= 0 && box.y + box.height <= contextOptions.viewport.height)); }
  check(response?.status() === 200, `${name} home status was not 200`);
  check(visible.every(Boolean), `${name} first screen does not contain job, audience, action, and facts`);
  check(errors.length === 0, `${name} home logged console errors: ${errors.join(" | ")}`);
  result.firstRead[name] = { job: await h1.textContent(), audience: await audience.textContent(), action: await action.textContent(), facts: await facts.allTextContents(), visible, errors };
  await page.screenshot({ path: `${out}/${name}-first-read.png`, fullPage: false });
  await context.close();
}

await firstRead("phone", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/128 Mobile Safari/537.36" });
await firstRead("desktop", { viewport: { width: 1366, height: 768 } });

{
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, acceptDownloads: true });
  const page = await context.newPage();
  page.on("request", (request) => result.requests.push({ url: request.url(), type: request.resourceType() }));
  page.on("pageerror", (error) => result.errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") result.errors.push(message.text()); });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.setItem("real:verify-20", "kept"));
  await page.getByRole("link", { name: /Try it with sample data/ }).click();
  await page.waitForURL(/demo=1/);
  const banner = page.getByText("Demo — sample data, nothing is saved", { exact: false });
  const captions = page.locator("#transcript-list li");
  check(await banner.isVisible(), "demo banner is absent");
  check(await captions.count() === 4, "demo did not show four caption lines");
  const sample = await captions.allTextContents();
  await page.getByRole("button", { name: "Pause captions" }).click();
  await page.getByRole("button", { name: "Resume captions" }).click();
  await page.locator("[data-caption-size]").fill("42");
  await page.evaluate(() => sessionStorage.setItem("demo:verify-20", "discard"));
  await page.getByRole("button", { name: "Reset demo" }).click();
  const afterReset = await page.evaluate(() => ({ real: localStorage.getItem("real:verify-20"), demo: sessionStorage.getItem("demo:verify-20") }));
  check(afterReset.real === "kept" && afterReset.demo === null, "reset changed real data or retained demo data");
  check(await banner.isVisible(), "demo banner disappeared after reset");
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export TXT" }).click();
  const download = await downloadEvent;
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  check(text.trim().split(/\r?\n/).length === 4, "TXT export did not contain four lines");
  await page.screenshot({ path: `${out}/demo-populated-desktop.png`, fullPage: false });
  await page.getByRole("link", { name: "Start for real" }).click();
  await page.waitForURL(`${base}/`);
  const afterExit = await page.evaluate(() => ({ real: localStorage.getItem("real:verify-20"), demoKeys: Object.keys(sessionStorage).filter((key) => key.startsWith("demo:")) }));
  check(afterExit.real === "kept" && afterExit.demoKeys.length === 0, "leaving demo changed real data or kept demo state");
  result.demo = { sample, bannerAfterReset: true, afterReset, afterExit, txtLines: text.trim().split(/\r?\n/).length };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: "networkidle" });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  const count = await page.locator("#transcript-list li").count();
  check(count === 4, "offline demo reload did not retain sample captions");
  result.offline = { captions: count };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: "networkidle" });
  const skip = page.getByRole("link", { name: "Skip to content" });
  await skip.focus();
  await page.keyboard.press("Enter");
  const target = await page.evaluate(() => document.activeElement?.id);
  const metrics = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth, reduced: matchMedia("(prefers-reduced-motion: reduce)").matches, animations: [...document.querySelectorAll("*")].map((node) => getComputedStyle(node).animationName).filter((name) => name && name !== "none") }));
  check(target === "main", "skip link did not focus main");
  check(metrics.scrollWidth === metrics.innerWidth, "mobile 200% equivalent layout overflows");
  result.keyboard = { skipTarget: target, ...metrics };
  await page.screenshot({ path: `${out}/demo-phone-reduced-motion.png`, fullPage: false });
  await context.close();
}

for (const route of ["/", "/demo", "/privacy", "/terms", "/not-a-real-route"]) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error" && route !== "/not-a-real-route") errors.push(message.text()); });
  const response = await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
  const h1 = await page.locator("h1").count();
  const main = await page.locator("main").count();
  const axe = await new AxeBuilder({ page }).analyze();
  const serious = axe.violations.filter((item) => ["serious", "critical"].includes(item.impact || "")).map((item) => ({ id: item.id, impact: item.impact }));
  check(h1 === 1 && main === 1, `${route} did not provide exactly one h1 and main`);
  check(serious.length === 0, `${route} has serious Axe results`);
  check(errors.length === 0, `${route} logged unexpected errors`);
  result.routes[route] = { status: response?.status(), title: await page.title(), h1, main, errors };
  result.axe[route] = serious;
  await context.close();
}
check(result.routes["/not-a-real-route"].status === 404, "unknown route did not return expected HTTP 404");
const identity = await fetch(`${base}/release-identity.json?verify20=${Date.now()}`).then((response) => response.json());
check(identity.tag === "v0.1.20" && identity.commit === "541c7907f2805d2bcad10140520a50309b92b435", "live identity differs from candidate");
result.identity = identity;
await browser.close();
await writeFile(`${out}/live-check.json`, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
