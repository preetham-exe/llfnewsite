import { expect, test } from "@playwright/test";

import { routes } from "./routes";

/*
 * No errors in the console on any page: hydration mismatches, failed requests
 * and script errors all show up here, and Lighthouse's Best Practices score
 * counts them. Against the dev server this also catches React's development
 * warnings.
 */

for (const route of routes) {
  test(`${route.path} logs no errors`, async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") problems.push(message.text());
      if (
        message.type() === "warning" &&
        /hydrat|did not match|Encountered a script tag/i.test(message.text())
      ) {
        problems.push(message.text());
      }
    });
    page.on("pageerror", (error) => problems.push(error.message));

    await page.goto(route.path, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);

    expect(problems).toEqual([]);
  });
}
