import { test } from "@playwright/test";

import { routes } from "./routes";

/*
 * Full-page screenshots of every route at every project size, for review at
 * the end of each phase. Saved under screenshots/<phase>/<project>/ (ignored
 * by git). Run with: pnpm screenshots
 */

const phase = process.env.PHASE ?? "phase-0";

for (const route of routes) {
  test(`screenshot ${route.path}`, async ({ page }, testInfo) => {
    await page.goto(route.path);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `screenshots/${phase}/${testInfo.project.name}/${route.name}.png`,
      fullPage: true,
    });
  });
}
