import { test, expect } from "./fixtures";
import { readFileSync } from "node:fs";

function chromiumProcessId(): number {
  const children = readFileSync(`/proc/${process.pid}/task/${process.pid}/children`, "utf8")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(Number);
  const chromium = children.find((pid) => {
    try {
      return readFileSync(`/proc/${pid}/cmdline`, "utf8").includes("chrome-headless-shell");
    } catch {
      return false;
    }
  });
  if (!chromium) throw new Error("Could not find the isolated Chromium child process");
  return chromium;
}

test("mobile Chromium SIGSEGV is isolated and retried with a clean browser", async ({ page }, testInfo) => {
  test.skip(process.platform !== "linux", "the SIGSEGV probe uses Linux process isolation");
  if (testInfo.retry === 0) {
    process.kill(chromiumProcessId(), "SIGSEGV");
    await page.waitForTimeout(1_000);
    throw new Error("Chromium did not exit after SIGSEGV");
  }

  await page.goto("/demo");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("See live captions before installing");
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
