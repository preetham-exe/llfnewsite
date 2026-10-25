import { expect, test, type Locator, type Page } from "@playwright/test";

/* Phase 2 acceptance: the shelf feels physical and calm, and keyboard-only
   use works. Plus the homepage story below the shelf. */

const shelfName = "Sections of the site";
const hasStandingShelf = (page: Page) =>
  (page.viewportSize()?.width ?? 0) >= 768;

const shelfLinks = (page: Page) =>
  page.getByRole("navigation", { name: shelfName }).getByRole("link");

const width = async (locator: Locator) =>
  (await locator.boundingBox())?.width ?? 0;

const labels: Record<string, string> = {
  "Our Story": "Why we started, and who we are.",
  "The Libraries": "Every library we have built, one chapter each.",
  "How We Build": "From a first conversation to launch day.",
  Partners: "The organisations we build with.",
  Stories: "Writing from our team and our readers.",
  Gallery: "Photographs from our libraries.",
  "Get Involved": "Volunteer, start a chapter, or ask for a library.",
  Donate: "Help pay for the next library.",
};

test.describe("pulling a book out", () => {
  test("hover pulls the book toward the reader and shows its label card", async ({
    page,
  }) => {
    test.skip(!hasStandingShelf(page), "Phones have no hover: a tap opens");
    await page.goto("/");
    const book = shelfLinks(page).filter({ hasText: "Partners" });
    const label = book.locator(".spine__label");
    const restingWidth = await width(book);
    await expect(label).toHaveCSS("opacity", "0");

    await book.hover();
    await expect(label).toHaveCSS("opacity", "1");
    // Pulled toward the reader, the book looks a little larger.
    await expect.poll(() => width(book)).toBeGreaterThan(restingWidth + 1);

    await page.mouse.move(2, 2);
    await expect(label).toHaveCSS("opacity", "0");
    await expect.poll(() => width(book)).toBeLessThan(restingWidth + 0.5);
  });

  test("keyboard focus gives the same pulled-out state as hover", async ({
    page,
  }) => {
    test.skip(!hasStandingShelf(page), "Phones show the pile");
    await page.goto("/");
    const book = shelfLinks(page).filter({ hasText: "Stories" });
    const restingWidth = await width(book);
    await book.focus();
    await expect(book.locator(".spine__label")).toHaveCSS("opacity", "1");
    await expect.poll(() => width(book)).toBeGreaterThan(restingWidth + 1);
  });

  test("arrow keys, Home and End move between books", async ({ page }) => {
    await page.goto("/");
    const links = shelfLinks(page);
    await links.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(links.nth(1)).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(links.nth(0)).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(links.last()).toBeFocused();
    await page.keyboard.press("Home");
    await expect(links.nth(0)).toBeFocused();
    await page.keyboard.press("End");
    await expect(links.last()).toBeFocused();
  });

  test("every book describes its section to assistive technology", async ({
    page,
  }) => {
    await page.goto("/");
    for (const [title, label] of Object.entries(labels)) {
      const link = page
        .getByRole("navigation", { name: shelfName })
        .getByRole("link", { name: title, exact: true });
      await expect(link).toHaveAccessibleDescription(label);
    }
  });
});

test.describe("first visit", () => {
  test("the books settle once per session, then never again", async ({
    page,
  }) => {
    // Watch the whole document: <html> does not exist yet when this runs.
    await page.addInitScript(() => {
      const record = window as unknown as { settleSeen?: boolean };
      new MutationObserver(() => {
        if (document.documentElement?.hasAttribute("data-shelf-settle")) {
          record.settleSeen = true;
        }
      }).observe(document, {
        attributes: true,
        attributeFilter: ["data-shelf-settle"],
        subtree: true,
      });
    });
    const settleSeen = () =>
      page.evaluate(
        () =>
          (window as unknown as { settleSeen?: boolean }).settleSeen ?? false,
      );

    await page.goto("/");
    expect(await settleSeen()).toBe(true);
    // Settled and tidied up well within a second.
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-shelf-settle",
      { timeout: 2000 },
    );

    await page.reload();
    expect(await settleSeen()).toBe(false);
  });

  test("reduced motion: no settle, no pull, but the label still appears", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    expect(
      await page.evaluate(() =>
        document.documentElement.hasAttribute("data-shelf-settle"),
      ),
    ).toBe(false);

    test.skip(!hasStandingShelf(page), "Phones have no label cards");
    const book = shelfLinks(page).filter({ hasText: "Donate" });
    const restingWidth = await width(book);
    await book.focus();
    await expect(book.locator(".spine__label")).toHaveCSS("opacity", "1");
    expect(await width(book)).toBeLessThan(restingWidth + 0.5);
  });
});

test.describe("below the shelf", () => {
  test("the impact numbers count up to their real values", async ({ page }) => {
    await page.goto("/");
    const numbers = page.locator('dd span[aria-hidden="true"]');
    await expect(numbers.first()).toHaveText("0+");

    await page.locator("dl").scrollIntoViewIfNeeded();
    await expect(numbers.nth(0)).toHaveText("300+");
    await expect(numbers.nth(1)).toHaveText("1,500+");
    await expect(numbers.nth(2)).toHaveText("3");
  });

  test("the photo loads, with a description", async ({ page }) => {
    await page.goto("/");
    const photo = page.getByRole("img", { name: /Children crowd around/ });
    await photo.scrollIntoViewIfNeeded();
    await expect(photo).toBeVisible();
    await expect
      .poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
  });

  test("nothing shifts while the page loads and scrolls", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "Layout shift is measured in Chromium",
    );
    await page.addInitScript(() => {
      const record = window as unknown as { shift: number };
      record.shift = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as {
          value: number;
          hadRecentInput: boolean;
        }[]) {
          if (!entry.hadRecentInput) record.shift += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    for (let step = 0; step < 6; step++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.8));
      await page.waitForTimeout(250);
    }
    const shift = await page.evaluate(
      () => (window as unknown as { shift: number }).shift,
    );
    expect(shift).toBeLessThan(0.05);
  });
});
