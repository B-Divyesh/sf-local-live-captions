import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";

const base = "https://local-live-captions.sociobot.in";
const browser = await chromium.launch({ headless: true });
const result = { desktop: {}, mobile: {}, requests: [], errors: [] };
const desktopContext = await browser.newContext({ viewport: { width: 1366, height: 768 } });
const desktop = await desktopContext.newPage();
desktop.on("request", (request) => result.requests.push({ url: request.url(), method: request.method(), resourceType: request.resourceType() }));
desktop.on("console", (message) => {
  if (["error", "warning"].includes(message.type())) result.errors.push({ type: message.type(), text: message.text() });
});
desktop.on("pageerror", (error) => result.errors.push({ type: "pageerror", text: error.message }));
await desktop.goto(`${base}/demo`, { waitUntil: "networkidle" });
result.desktop.title = await desktop.title();
result.desktop.h1 = await desktop.locator("h1").innerText();
const desktopText = await desktop.locator("body").innerText();
result.desktop.demoBanner = desktopText.includes("Demo — sample data, nothing is saved");
result.desktop.sampleCaption = desktopText.includes("Today we will trace how a star changes over its lifetime.");
await desktop.screenshot({ path: ".factory/verification-evidence-17/live-demo-desktop.png", fullPage: false });
const skip = desktop.getByRole("link", { name: "Skip to content" });
await skip.focus();
result.desktop.skipFocused = await desktop.evaluate(() => document.activeElement?.textContent);
await desktop.keyboard.press("Enter");
result.desktop.skipTarget = await desktop.evaluate(() => document.activeElement?.id);
await desktop.goto(base, { waitUntil: "networkidle" });
await desktop.getByLabel("License token").fill("not-a-real-license");
await desktop.getByRole("button", { name: "Verify license" }).click();
await desktop.waitForTimeout(750);
result.desktop.invalidLicenseMessage = (await desktop.locator("body").innerText()).match(/.{0,80}(invalid|license).{0,100}/gi)?.slice(-3) ?? [];

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mobile = await mobileContext.newPage();
const mobileErrors = [];
mobile.on("console", (message) => { if (message.type() === "error") mobileErrors.push(message.text()); });
mobile.on("pageerror", (error) => mobileErrors.push(error.message));
await mobile.goto(`${base}/demo`, { waitUntil: "networkidle" });
await mobile.evaluate(() => { document.body.style.zoom = "2"; });
await mobile.screenshot({ path: ".factory/verification-evidence-17/live-demo-mobile-390-200pct.png", fullPage: false });
result.mobile = {
  h1: await mobile.locator("h1").innerText(),
  scrollWidth: await mobile.evaluate(() => document.documentElement.scrollWidth),
  innerWidth: await mobile.evaluate(() => innerWidth),
  errors: mobileErrors,
};

const motionContext = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: "reduce" });
const motion = await motionContext.newPage();
await motion.goto(`${base}/demo`, { waitUntil: "networkidle" });
result.reducedMotion = {
  media: await motion.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches),
  animations: await motion.evaluate(() => [...document.querySelectorAll("*")].map((element) => getComputedStyle(element).animationName).filter((name) => name && name !== "none").slice(0, 20)),
};

await desktopContext.close();
await mobileContext.close();
await motionContext.close();
await browser.close();
await writeFile(".factory/verification-evidence-17/live-interaction.json", JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
