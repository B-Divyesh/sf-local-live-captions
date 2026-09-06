import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";

const base = "https://local-live-captions.sociobot.in";
const expected = {
  tag: "v0.1.20",
  commit: "541c7907f2805d2bcad10140520a50309b92b435",
};
const browser = await chromium.launch({ headless: true });
const result = { checkedAt: new Date().toISOString(), expected, firstScreens: {}, demo: {}, offline: {} };

function check(condition, message) {
  if (!condition) throw new Error(message);
}

async function checkFirstScreen(name, options) {
  const context = await browser.newContext({ ...options, serviceWorkers: "block" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  const response = await page.goto(base, { waitUntil: "networkidle" });
  const heading = page.getByRole("heading", { level: 1 });
  const audience = page.locator(".dek");
  const action = page.getByRole("link", { name: /Try it with sample data/ });
  const facts = page.locator(".facts li");
  const visible = [];
  for (const locator of [heading, audience, action, ...await facts.all()]) {
    const box = await locator.boundingBox();
    visible.push(Boolean(box && box.y >= 0 && box.y + box.height <= options.viewport.height));
  }
  const axe = await new AxeBuilder({ page }).analyze();
  const seriousOrCritical = axe.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""));
  check(response?.status() === 200, `${name} home did not return 200`);
  check(visible.every(Boolean), `${name} first-screen content is outside the viewport`);
  check(errors.length === 0, `${name} logged console errors`);
  check(seriousOrCritical.length === 0, `${name} has serious or critical Axe findings`);
  result.firstScreens[name] = {
    heading: await heading.textContent(),
    audience: await audience.textContent(),
    firstAction: await action.textContent(),
    facts: await facts.allTextContents(),
    visible,
    errors,
    seriousOrCritical: seriousOrCritical.map(({ id, impact }) => ({ id, impact })),
  };
  await page.screenshot({ path: `.factory/evidence-repair-15/live/${name}-first-screen.png`, fullPage: true });
  if (name === "desktop") {
    const download = page.getByRole("link", { name: "Download for Linux", exact: true });
    await download.waitFor();
    const href = await download.getAttribute("href");
    check(Boolean(href?.includes("/releases/download/v0.1.20/") && href.endsWith(".AppImage")), "desktop download does not target the v0.1.20 AppImage");
    result.firstScreens[name].download = href;
  }
  await context.close();
}

await checkFirstScreen("phone", {
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/128 Mobile Safari/537.36",
});
await checkFirstScreen("desktop", { viewport: { width: 1366, height: 768 } });

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true, serviceWorkers: "block" });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.setItem("real:repair-15", "kept"));
  await page.getByRole("link", { name: /Try it with sample data/ }).click();
  await page.waitForURL(/demo=1/);
  const banner = page.getByText("Demo — sample data, nothing is saved", { exact: false });
  check(await banner.isVisible(), "demo label is not visible");
  check(await page.locator("#transcript-list li").count() === 4, "demo did not load four realistic captions");
  await page.getByRole("button", { name: "Pause captions" }).click();
  await page.getByRole("button", { name: "Resume captions" }).click();
  await page.locator("[data-caption-size]").fill("42");
  await page.evaluate(() => sessionStorage.setItem("demo:repair-15", "discard"));
  await page.getByRole("button", { name: "Reset demo" }).click();
  check(await banner.isVisible(), "demo label disappeared after reset");
  const afterReset = await page.evaluate(() => ({
    real: localStorage.getItem("real:repair-15"),
    demo: sessionStorage.getItem("demo:repair-15"),
  }));
  check(afterReset.real === "kept" && afterReset.demo === null, "demo reset touched real data or retained demo data");
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export TXT" }).click();
  const download = await downloadEvent;
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  check(text.trim().split(/\r?\n/).length === 4, "demo TXT export did not contain four captions");
  await page.getByRole("link", { name: "Start for real" }).click();
  await page.waitForURL(`${base}/`);
  const afterExit = await page.evaluate(() => ({
    real: localStorage.getItem("real:repair-15"),
    demoKeys: Object.keys(sessionStorage).filter((key) => key.startsWith("demo:")),
  }));
  check(afterExit.real === "kept" && afterExit.demoKeys.length === 0, "leaving demo touched real data or retained demo data");
  result.demo = { captionCount: 4, labelPersistedAfterReset: true, exportedTextLines: 4, afterReset, afterExit };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: "networkidle" });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  const captionCount = await page.locator("#transcript-list li").count();
  check(captionCount === 4, "offline demo reload lost its sample captions");
  result.offline = { captionCount };
  await context.close();
}

const identity = await fetch(`${base}/release-identity.json?repair15=${Date.now()}`).then((response) => response.json());
check(identity.tag === expected.tag && identity.commit === expected.commit, "live release identity does not match v0.1.20");
result.identity = identity;
await browser.close();
await writeFile(".factory/evidence-repair-15/live/fresh-browsers.json", `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
