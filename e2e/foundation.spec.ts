import { expect, test, type Page } from "@playwright/test";

import { routes } from "./routes";

/* Phase 0 acceptance: every route loads directly and via client navigation,
   the HTML is real, it reads without JavaScript, and scrolling behaves. */

const isDesktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;

/* Safari, like WebKit here, only tabs to links with Option+Tab by default. */
const tabKey = (browserName: string) =>
  browserName === "webkit" ? "Alt+Tab" : "Tab";

test.describe("direct loads", () => {
  for (const route of routes) {
    test(`${route.path} serves complete HTML and metadata`, async ({
      page,
    }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);

      const html = (await response?.text()) ?? "";
      expect(html).toContain(route.heading);

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        route.heading,
      );
      await expect(page).toHaveTitle(/Literate Lives Foundation/);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        /.{40,}/,
      );
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(`${route.path === "/" ? "" : route.path}$`),
      );
      await expect(
        page.locator('meta[property="og:image"]').first(),
      ).toHaveAttribute("content", /opengraph-image/);
      await expect(
        page.getByRole("link", { name: "Donate" }).first(),
      ).toBeVisible();
    });
  }

  for (const path of [
    "/no-such-page",
    "/libraries/no-such-library",
    "/stories/no-such-story",
  ]) {
    test(`${path} is the misplaced book, with a 404`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "This book has been misplaced.",
      );
    });
  }

  test("only the headline font is preloaded", async ({ request }) => {
    const response = await request.get("/");
    const link = response.headers()["link"] ?? "";
    const fontPreloads = link
      .split(",")
      .filter((entry) => entry.includes('as="font"'));
    expect(fontPreloads).toHaveLength(1);
    expect(fontPreloads[0]).toContain("literata_roman");
  });

  test("robots.txt keeps crawlers out before launch and points to the sitemap", async ({
    request,
  }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /");
    expect(robots).toContain("sitemap.xml");

    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const route of routes) {
      expect(sitemap).toContain(
        `${route.path === "/" ? "" : route.path}</loc>`,
      );
    }
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  for (const route of routes) {
    test(`${route.path} is fully readable`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        route.heading,
      );
      await expect(page.locator("main p").first()).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Donate" }).first(),
      ).toBeVisible();
    });
  }
});

test.describe("navigation", () => {
  test("links navigate on the client without reloading the page", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate(() => {
      (window as unknown as { __alive: boolean }).__alive = true;
    });

    await page
      .getByRole("navigation", { name: "Sections of the site" })
      .getByRole("link", { name: /Our Story/ })
      .click();
    await expect(page).toHaveURL(/\/our-story$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Our Story",
    );

    await page
      .getByRole("banner")
      .getByRole("link", { name: "Donate" })
      .click();
    await expect(page).toHaveURL(/\/donate$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Donate");

    await page.goBack();
    await expect(page).toHaveURL(/\/our-story$/);

    const alive = await page.evaluate(
      () => (window as unknown as { __alive?: boolean }).__alive,
    );
    expect(alive).toBe(true);
  });

  test("new pages open at the top; back returns to the same place", async ({
    page,
  }) => {
    await page.goto("/how-we-build");
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(600);

    if (isDesktop(page)) {
      await page
        .getByRole("banner")
        .getByRole("navigation", { name: "Sections" })
        .getByRole("link", { name: "Partners" })
        .click();
    } else {
      await page.getByRole("banner").getByText("Menu").click();
      await page
        .getByRole("banner")
        .getByRole("link", { name: "Partners" })
        .click();
    }
    await expect(page).toHaveURL(/\/partners$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

    await page.goBack();
    await expect(page).toHaveURL(/\/how-we-build$/);
    await expect
      .poll(() => page.evaluate(() => Math.round(window.scrollY)))
      .toBeGreaterThan(590);
  });
});

test.describe("keyboard", () => {
  test("the first Tab reaches the skip link, which moves focus to the content", async ({
    page,
    browserName,
  }) => {
    await page.goto("/our-story");
    await page.keyboard.press(tabKey(browserName));
    await expect(
      page.getByRole("link", { name: "Skip to content" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });

  test("every book on the shelf is reachable, with a visible focus ring", async ({
    page,
    browserName,
  }) => {
    await page.goto("/");
    const shelf = page.getByRole("navigation", {
      name: "Sections of the site",
    });
    const books = shelf.getByRole("link");
    await expect(books).toHaveCount(8);

    // Skip link, site name, Donate, then the eight books.
    const tab = tabKey(browserName);
    for (let press = 0; press < 3; press++) await page.keyboard.press(tab);
    for (let index = 0; index < 8; index++) {
      await page.keyboard.press(tab);
      const book = books.nth(index);
      await expect(book).toBeFocused();
      const outline = await book.evaluate(
        (el) => getComputedStyle(el).outlineStyle,
      );
      expect(outline).not.toBe("none");
    }
  });
});

test.describe("motion preferences", () => {
  test("reduced motion turns off smooth scrolling", async ({ page }) => {
    test.skip(!isDesktop(page), "Wheel input is a desktop concern");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/how-we-build");
    await page.mouse.move(700, 450);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(80);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(560);
  });

  test("without reduced motion, the wheel scrolls smoothly", async ({
    page,
  }) => {
    test.skip(!isDesktop(page), "Wheel input is a desktop concern");
    await page.goto("/how-we-build");
    await expect(page.locator("html")).toHaveClass(/\blenis\b/);
    await page.mouse.move(700, 450);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(80);
    const early = await page.evaluate(() => window.scrollY);
    expect(early).toBeLessThan(560);
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(590);
  });
});
