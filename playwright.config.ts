import { defineConfig, devices } from "@playwright/test";

import { sanityPort, sanityStandIn, webhookSecret } from "./e2e/sanity";

/*
 * End-to-end checks run against a production build (prefetching and the
 * transition only behave for real in production). Two sizes, two engines:
 * Chromium stands in for Android Chrome, WebKit for Safari and iOS. The site
 * is built against a stand-in for Sanity holding the seed content, and the
 * publish tests ("cms") run last, on their own, as they change it.
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
  // the env below, or stop it, so the site reaches the stand-ins. They start
  // in this order, so the stand-in for Sanity is up before the build.
  webServer: [
    {
      command: "node e2e/mock-email.mjs",
      url: `http://127.0.0.1:${emailPort}/`,
      env: { MOCK_EMAIL_PORT: String(emailPort) },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "node e2e/mock-sanity.mjs",
      url: `${sanityStandIn}/`,
      env: { MOCK_SANITY_PORT: String(sanityPort) },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `pnpm build && pnpm start -p ${port}`,
      url: `http://localhost:${port}`,
      env: {
        RESEND_API_KEY: "re_test",
        RESEND_ENDPOINT: `http://127.0.0.1:${emailPort}/emails`,
        NEXT_PUBLIC_SANITY_PROJECT_ID: "test",
        NEXT_PUBLIC_SANITY_DATASET: "test",
        SANITY_API_HOST: sanityStandIn,
        SANITY_REVALIDATE_SECRET: webhookSecret,
      },
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
    },
  ],
  projects: [
    {
      name: "chromium-desktop",
      testIgnore: "cms.spec.ts",
      use: { ...devices["Desktop Chrome"], viewport: desktop },
    },
    {
      name: "chromium-mobile",
      testIgnore: "cms.spec.ts",
      use: {
        ...devices["Pixel 7"],
        viewport: mobile,
        deviceScaleFactor: 2,
      },
    },
    {
      name: "webkit-desktop",
      testIgnore: "cms.spec.ts",
      use: { ...devices["Desktop Safari"], viewport: desktop },
    },
    {
      name: "webkit-mobile",
      testIgnore: "cms.spec.ts",
      use: {
        ...devices["iPhone 15"],
        viewport: mobile,
        deviceScaleFactor: 2,
      },
    },
    {
      // Publishing changes what the other tests check, so it comes last.
      name: "cms",
      testMatch: "cms.spec.ts",
      dependencies: [
        "chromium-desktop",
        "chromium-mobile",
        "webkit-desktop",
        "webkit-mobile",
      ],
      use: { ...devices["Desktop Chrome"], viewport: desktop },
    },
  ],
});
