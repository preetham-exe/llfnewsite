import { defineConfig, devices } from "@playwright/test";

/*
 * End-to-end checks run against a production build (prefetching and the
 * transition only behave for real in production). Two sizes, two engines:
 * Chromium stands in for Android Chrome, WebKit for Safari and iOS.
 */

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3200);
/** A stand-in for the email service, so the contact form really sends. */
const emailPort = 3299;

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
  // A server already running on the port is reused locally: start it with
  // the env below, or stop it, so the contact form reaches the stand-in.
  webServer: [
    {
      command: "node e2e/mock-email.mjs",
      url: `http://127.0.0.1:${emailPort}/`,
      env: { MOCK_EMAIL_PORT: String(emailPort) },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `pnpm build && pnpm start -p ${port}`,
      url: `http://localhost:${port}`,
      env: {
        RESEND_API_KEY: "re_test",
        RESEND_ENDPOINT: `http://127.0.0.1:${emailPort}/emails`,
      },
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
    },
  ],
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
