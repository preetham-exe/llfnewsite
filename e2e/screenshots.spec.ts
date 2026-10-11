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
    // Scroll through once so everything that reveals on scroll is shown.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(900);
    await page.screenshot({
      path: `screenshots/${phase}/${testInfo.project.name}/${route.name}.png`,
      fullPage: true,
    });
  });
}
