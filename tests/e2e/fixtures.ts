import { test as base, expect, type Browser, type BrowserContext } from "@playwright/test";

type IsolatedFixtures = {
  isolatedBrowser: Browser;
};

let previousBrowser: Browser | undefined;

export const test = base.extend<IsolatedFixtures>({
  isolatedBrowser: async ({ playwright, browserName, headless, launchOptions }, use) => {
    if (previousBrowser?.isConnected()) {
      throw new Error("The previous test browser is still connected");
    }

    const browser = await playwright[browserName].launch({ ...launchOptions, headless });
    previousBrowser = browser;
    try {
      await use(browser);
    } finally {
      if (browser.isConnected()) await browser.close({ reason: "Isolated test finished" });
    }
  },

  context: async ({
    isolatedBrowser,
    acceptDownloads,
    baseURL,
    bypassCSP,
    colorScheme,
    contextOptions,
    deviceScaleFactor,
    extraHTTPHeaders,
    geolocation,
    hasTouch,
    httpCredentials,
    ignoreHTTPSErrors,
    isMobile,
    javaScriptEnabled,
    locale,
    offline,
    permissions,
    proxy,
    serviceWorkers,
    storageState,
    timezoneId,
    userAgent,
    viewport,
  }, use) => {
    const options = {
      ...contextOptions,
      acceptDownloads,
      baseURL,
      bypassCSP,
      colorScheme,
      deviceScaleFactor,
      extraHTTPHeaders,
      geolocation,
      hasTouch,
      httpCredentials,
      ignoreHTTPSErrors,
      isMobile,
      javaScriptEnabled,
      locale,
      offline,
      permissions,
      proxy,
      serviceWorkers,
      storageState,
      timezoneId,
      userAgent,
      viewport,
    };
    const context: BrowserContext = await isolatedBrowser.newContext(options);
    try {
      await use(context);
    } finally {
      if (isolatedBrowser.isConnected()) await context.close({ reason: "Isolated test finished" });
    }
  },
});

export { expect };
