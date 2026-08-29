import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI === "1" ? 1 : 0,
  timeout: 30_000,
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: { command: "npm run build:site && npm run preview", url: "http://127.0.0.1:4173", reuseExistingServer: process.env.CI !== "1", timeout: 120_000 },
  projects: [
    { name: "chromium", testIgnore: "browser-crash.spec.ts", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", testIgnore: "browser-crash.spec.ts", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: "crash-recovery", testMatch: "browser-crash.spec.ts", retries: 1, use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }
  ]
});
