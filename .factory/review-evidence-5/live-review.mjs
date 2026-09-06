import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const base = "https://local-live-captions.sociobot.in";
const out = ".factory/review-evidence-5";
const expectedCommit = "541c7907f2805d2bcad10140520a50309b92b435";
const result = {
  checkedAt: new Date().toISOString(),
  firstRead: {}, routes: {}, axe: {}, demo: {}, offline: {}, keyboard: {},
  reflow: {}, history: {}, links: {}, requests: {}, errors: [],
};
const check = (condition, message) => { if (!condition) throw new Error(message); };
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });

async function freshContext(options = {}) {
  return browser.newContext({ serviceWorkers: "block", ...options });
}

async function firstRead(name, options) {
  const context = await freshContext(options);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  const response = await page.goto(base, { waitUntil: "networkidle" });
  const h1 = page.getByRole("heading", { level: 1 });
  const audience = page.locator(".dek");
  const action = page.getByRole("link", { name: /Try it with sample data/ });
  const facts = page.locator(".facts li");
  const visible = [];
  for (const locator of [h1, audience, action, ...await facts.all()]) {
    const box = await locator.boundingBox();
    visible.push(Boolean(box && box.y >= 0 && box.y + box.height <= options.viewport.height));
  }
  check(response?.status() === 200, `${name}: home did not return 200`);
  check(visible.every(Boolean), `${name}: first screen does not show job, audience, action, and all facts`);
  check(errors.length === 0, `${name}: console errors: ${errors.join(" | ")}`);
  result.firstRead[name] = {
    job: await h1.textContent(), audience: await audience.textContent(),
    action: await action.textContent(), facts: await facts.allTextContents(), visible, errors,
  };
  await page.screenshot({ path: `${out}/${name}-first-read.png` });
  await context.close();
}

await firstRead("phone", {
  viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
  userAgent: "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/140.0.0.0 Mobile Safari/537.36",
});
await firstRead("desktop", { viewport: { width: 1366, height: 768 } });

{
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, acceptDownloads: true });
  const page = await context.newPage();
  const directDemoRequests = [];
  page.on("request", (request) => directDemoRequests.push(request.url()));
  page.on("pageerror", (error) => result.errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") result.errors.push(message.text()); });
  await page.goto(`${base}/demo`, { waitUntil: "networkidle" });
  const external = directDemoRequests.filter((url) => new URL(url).origin !== base);
  check(external.length === 0, `direct demo made cross-origin requests: ${external.join(", ")}`);
  await page.evaluate(() => localStorage.setItem("real:review-5", "kept"));
  const banner = page.getByText("Demo — sample data, nothing is saved", { exact: false });
  const captions = page.locator("#transcript-list li");
  check(await banner.isVisible(), "demo label is not visible");
  check(await captions.count() === 4, "demo does not begin with four populated captions");
  const sample = await captions.allTextContents();
  await page.getByRole("button", { name: "Pause captions" }).click();
  await page.getByRole("button", { name: "Resume captions" }).click();
  await page.getByLabel("Caption size").fill("42");
  check(await page.locator(".caption-stack").evaluate((element) => getComputedStyle(element).fontSize) === "42px", "caption size did not become 42 px");

  async function downloadText(name) {
    const event = page.waitForEvent("download");
    await page.getByRole("button", { name }).last().click();
    const download = await event;
    const stream = await download.createReadStream();
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return { filename: download.suggestedFilename(), body: Buffer.concat(chunks).toString("utf8") };
  }
  const txt = await downloadText("Export TXT");
  const srt = await downloadText("Export subtitle file (.srt)");
  check(txt.body.trim().split(/\r?\n/).length === 4, "TXT export does not contain four lines");
  check((srt.body.match(/-->/g) || []).length === 4, "SRT export does not contain four cues");
  await page.evaluate(() => sessionStorage.setItem("demo:review-5", "discard"));
  await page.getByRole("button", { name: "Reset demo" }).click();
  const afterReset = await page.evaluate(() => ({
    real: localStorage.getItem("real:review-5"), demo: sessionStorage.getItem("demo:review-5"),
  }));
  check(afterReset.real === "kept" && afterReset.demo === null, "Reset demo touched real data or retained demo data");
  check(await banner.isVisible(), "demo label disappeared after reset");
  await page.screenshot({ path: `${out}/demo-populated-desktop.png` });
  await page.getByRole("link", { name: "Start for real" }).click();
  await page.waitForURL(`${base}/`);
  const afterExit = await page.evaluate(() => ({
    real: localStorage.getItem("real:review-5"), demoKeys: Object.keys(sessionStorage).filter((key) => key.startsWith("demo:")),
  }));
  check(afterExit.real === "kept" && afterExit.demoKeys.length === 0, "Start for real touched real data or retained demo state");
  result.demo = { sample, txt: { filename: txt.filename, lines: txt.body.trim().split(/\r?\n/).length }, srt: { filename: srt.filename, cues: (srt.body.match(/-->/g) || []).length }, afterReset, afterExit, bannerAfterReset: true };
  result.requests.demo = { count: directDemoRequests.length, external };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: "networkidle" });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  const captions = await page.locator("#transcript-list li").count();
  await page.getByRole("button", { name: "Pause captions" }).click();
  check(captions === 4 && await page.getByRole("button", { name: "Resume captions" }).isVisible(), "offline sample did not reload and operate");
  result.offline = { captions, pauseWorked: true };
  await context.close();
}

for (const route of ["/", "/demo", "/privacy", "/terms", "/not-a-real-route"]) {
  const context = await freshContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error" && route !== "/not-a-real-route") errors.push(message.text()); });
  const response = await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
  const title = await page.title();
  const structure = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    h1: document.querySelectorAll("h1").length,
    main: document.querySelectorAll("main").length,
    headings: [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((heading) => Number(heading.tagName.slice(1))),
  }));
  const axe = await new AxeBuilder({ page }).analyze();
  const serious = axe.violations.filter((item) => ["serious", "critical"].includes(item.impact || "")).map((item) => ({ id: item.id, impact: item.impact }));
  check(structure.lang === "en" && structure.h1 === 1 && structure.main === 1, `${route}: invalid language or page structure`);
  check(title.length > 0 && title.length <= 60, `${route}: missing or overlong title`);
  check(serious.length === 0, `${route}: serious or critical Axe result`);
  check(errors.length === 0, `${route}: unexpected console errors: ${errors.join(" | ")}`);
  const status = response?.status();
  check(route === "/not-a-real-route" ? status === 404 : status === 200, `${route}: unexpected HTTP ${status}`);
  result.routes[route] = { status, title, ...structure, errors };
  result.axe[route] = serious;
  await context.close();
}

{
  const context = await freshContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce", colorScheme: "dark" });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  const skipFocused = await page.getByRole("link", { name: "Skip to content" }).evaluate((element) => document.activeElement === element);
  await page.keyboard.press("Enter");
  const skipTarget = await page.evaluate(() => document.activeElement?.id);
  const pause = page.getByRole("button", { name: "Pause captions" });
  for (let index = 0; index < 20 && !await pause.evaluate((element) => document.activeElement === element); index += 1) {
    await page.keyboard.press("Tab");
  }
  await page.waitForTimeout(20);
  const focus = await pause.evaluate((element) => ({ outline: getComputedStyle(element).outlineStyle, width: getComputedStyle(element).outlineWidth }));
  await pause.press("Space");
  const resumeVisible = await page.getByRole("button", { name: "Resume captions" }).isVisible();
  const reduced = await page.evaluate(() => ({
    matches: matchMedia("(prefers-reduced-motion: reduce)").matches,
    animations: [...document.querySelectorAll("*")].map((element) => getComputedStyle(element).animationName).filter((name) => name && name !== "none"),
  }));
  const axe = await new AxeBuilder({ page }).analyze();
  const serious = axe.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""));
  check(skipFocused && skipTarget === "main", "keyboard skip path failed");
  check(focus.outline !== "none" && parseFloat(focus.width) >= 3 && resumeVisible, "focus indication or Space operation failed");
  check(reduced.matches && reduced.animations.length === 0, "reduced motion leaves active animations");
  check(serious.length === 0, "dark reduced-motion demo has serious Axe results");
  result.keyboard = { skipFocused, skipTarget, focus, resumeVisible, reduced, darkAxeSerious: serious.length };
  await page.screenshot({ path: `${out}/demo-phone-dark-reduced-motion.png` });
  await context.close();
}

{
  const context = await freshContext({ viewport: { width: 195, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: "networkidle" });
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  const controls = {};
  for (const [role, name] of [["button", "Reset demo"], ["link", "Start for real"], ["button", "Pause captions"], ["button", "Export TXT"]]) {
    const box = await page.getByRole(role, { name }).boundingBox();
    controls[name] = box;
    check(box && box.x >= 0 && box.x + box.width <= 196, `${name} does not fit the 195 CSS px reflow viewport`);
  }
  check(dimensions.scrollWidth === dimensions.clientWidth, "195 CSS px reflow has horizontal overflow");
  result.reflow = { dimensions, controls };
  await page.screenshot({ path: `${out}/demo-195-css-px.png` });
  await context.close();
}

{
  const context = await freshContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}/privacy`);
  await page.getByRole("link", { name: "How it works" }).click();
  await page.waitForTimeout(100);
  const forward = await page.getByRole("heading", { name: "How it works" }).evaluate((element) => document.activeElement === element);
  await page.goBack();
  await page.waitForTimeout(100);
  const back = await page.getByRole("heading", { level: 1 }).evaluate((element) => document.activeElement === element);
  await page.goForward();
  await page.waitForTimeout(100);
  const forwardAgain = await page.getByRole("heading", { name: "How it works" }).evaluate((element) => document.activeElement === element);
  check(forward && back && forwardAgain, "history navigation did not restore heading focus");
  result.history = { forward, back, forwardAgain };

  const legalTargets = {};
  for (const route of ["/privacy", "/terms"]) {
    await page.goto(`${base}${route}`);
    legalTargets[route] = await page.locator("a,button,input,select").evaluateAll((elements) => elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { name: element.textContent?.trim() || element.getAttribute("aria-label") || element.tagName, width: box.width, height: box.height };
    }));
    check(legalTargets[route].every((target) => target.width >= 44 && target.height >= 44), `${route}: undersized touch target`);
  }
  result.links.legalTargets = legalTargets;
  await context.close();
}

{
  const context = await freshContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();
  const internal = new Set();
  const external = new Set();
  for (const route of ["/", "/demo", "/privacy", "/terms", "/not-a-real-route"]) {
    await page.goto(`${base}${route}`, { waitUntil: "domcontentloaded" });
    for (const href of await page.locator("a[href]").evaluateAll((links) => links.map((link) => link.href))) {
      const url = new URL(href);
      if (url.protocol === "mailto:") { external.add(href); continue; }
      if (url.origin === base) internal.add(`${url.pathname}${url.search}`);
      else external.add(href);
    }
  }
  const statuses = {};
  for (const path of internal) {
    const response = await context.request.get(`${base}${path}`, { maxRedirects: 0 });
    statuses[path] = response.status();
    const expectedNotFoundSelfLink = path.startsWith("/not-a-real-route") && response.status() === 404;
    check(expectedNotFoundSelfLink || (response.status() >= 200 && response.status() < 400), `internal link ${path} returned ${response.status()}`);
  }
  result.links.internal = statuses;
  result.links.external = [...external].sort();
  await context.close();
}

const identity = await fetch(`${base}/release-identity.json?review5=${Date.now()}`).then((response) => response.json());
check(identity.tag === "v0.1.20" && identity.commit === expectedCommit, "live identity differs from v0.1.20 implementation");
result.identity = identity;
check(result.errors.length === 0, `live demo errors: ${result.errors.join(" | ")}`);
await browser.close();
await writeFile(`${out}/live-review.json`, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
