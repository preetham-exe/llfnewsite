import { test } from "@playwright/test";

import { routes } from "./routes";

/*
 * Full-page screenshots of every route at every project size, for review at
 * the end of each phase. Saved under screenshots/<phase>/<project>/ (ignored
 * by git). Run with: PHASE=phase-n pnpm screenshots
 */

const phase = process.env.PHASE ?? "phase-0";

/** Pages that are not in the site map but are checked visually. */
const benches = [{ path: "/dev/book", name: "dev-book" }];

for (const route of [...routes, ...benches]) {
  test(`screenshot ${route.path}`, async ({ page }, testInfo) => {
    await page.goto(route.path);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `screenshots/${phase}/${testInfo.project.name}/${route.name}.png`,
      fullPage: true,
    });
  });
}
