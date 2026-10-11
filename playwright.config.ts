import { defineConfig, devices } from "@playwright/test";

/*
 * End-to-end checks run against a production build (prefetching and the
 * transition only behave for real in production). Two sizes, two engines:
 * Chromium stands in for Android Chrome, WebKit for Safari and iOS.
 */

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3200);

const desktop = { width: 1440, height: 900 };
const mobile = { width: 390, height: 844 };

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `pnpm build && pnpm start -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"], viewport: desktop },
    },
    {
      name: "chromium-mobile",
      use: {
        ...devices["Pixel 7"],
        viewport: mobile,
        deviceScaleFactor: 2,
      },
    },
    {
      name: "webkit-desktop",
      use: { ...devices["Desktop Safari"], viewport: desktop },
    },
    {
      name: "webkit-mobile",
      use: {
        ...devices["iPhone 15"],
        viewport: mobile,
        deviceScaleFactor: 2,
      },
    },
  ],
});
