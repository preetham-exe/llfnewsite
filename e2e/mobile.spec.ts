import { expect, test, type Locator, type Page } from "@playwright/test";

import { routes, unlistedRoutes } from "./routes";

/* Phase 7 acceptance: the mobile pass. On phones nothing scrolls sideways,
   every control a thumb needs is at least 44 px tall, form fields never make
   iOS zoom, the books in the pile are nearly full width and at least 56 px
   tall, the menu is a full-width sheet that a tap outside closes, and a
   phone turned on its side shows the headline beside the whole bookcase.
   These run in the phone projects only, at the sizes each test sets. */

test.beforeEach(({}, testInfo) => {
  test.skip(
    !testInfo.project.name.endsWith("mobile"),
    "Phones only: the phone projects emulate touch and mobile layout",
  );
});

/** Height of a control as a thumb meets it (rounded, as browsers draw). */
const height = async (locator: Locator) =>
  Math.round((await locator.boundingBox())?.height ?? 0);

async function expectThumbSized(locators: Locator[], label: string) {
  for (const locator of locators) {
    const name = (await locator.textContent())?.trim() || label;
    expect(await height(locator), `${label}: ${name}`).toBeGreaterThanOrEqual(
      44,
    );
  }
}

for (const width of [320, 360, 390]) {
  test.describe(`${width} px wide`, () => {
    test.use({ viewport: { width, height: 800 } });

    test("no page scrolls sideways", async ({ page }) => {
      for (const route of [...routes, ...unlistedRoutes]) {
        await page.goto(route.path);
        await page.evaluate(() => document.fonts.ready);
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow, route.path).toBeLessThanOrEqual(0);
      }
    });

    test("the books in the pile are nearly full width and at least 56 px tall", async ({
      page,
    }) => {
      await page.goto("/");
      const pile = page.locator(".pile");
      const room = (await pile.boundingBox())?.width ?? 0;
      const books = pile.locator("[data-book]");
      await expect(books).toHaveCount(7);
      for (const book of await books.all()) {
        const box = await book.boundingBox();
        expect(box?.height).toBeGreaterThanOrEqual(56);
        expect(box?.width).toBeGreaterThanOrEqual(room * 0.8);
      }
      // Donate is on top.
      await expect(books.first()).toHaveAttribute("data-book", "donate");
    });
  });
}

test.describe("controls a thumb needs", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("are at least 44 px tall: the bar, the menu, the footer", async ({
    page,
  }) => {
    await page.goto("/our-story");
    const bar = page.getByRole("banner");
    await expectThumbSized(
      [
        bar.getByRole("link", { name: /Back to the shelf/ }),
        bar.locator("summary"),
        bar.getByRole("link", { name: "Donate", exact: true }).last(),
      ],
      "bar",
    );
    await bar.locator("summary").click();
    await expectThumbSized(
      await bar.getByRole("navigation").getByRole("link").all(),
      "menu",
    );
    await page.keyboard.press("Escape");
    const footer = page.getByRole("contentinfo");
    await expectThumbSized(await footer.getByRole("link").all(), "footer");
  });

  test("are at least 44 px tall: Check out, the form, the way back", async ({
    page,
  }) => {
    await page.goto("/donate");
    await expectThumbSized(
      [
        page.getByRole("link", { name: "Check out" }),
        ...(await page.locator(".checkout__option").all()),
      ],
      "donate",
    );

    await page.goto("/get-involved");
    const form = page.locator("form.contact-form");
    await expectThumbSized(
      [
        ...(await form.locator(".contact-form__option").all()),
        ...(await form
          .locator(
            "input:not([type=radio]):not([type=hidden]):not([tabindex='-1']), textarea",
          )
          .all()),
        form.getByRole("button", { name: "Send message" }),
      ],
      "form",
    );

    await page.goto("/libraries/qcity-community-library");
    await expectThumbSized(
      [page.getByRole("link", { name: "All libraries" })],
      "library",
    );
  });

  test("form fields are 16 px or larger, so iOS does not zoom in", async ({
    page,
  }) => {
    await page.goto("/get-involved");
    const sizes = await page
      .locator("form.contact-form")
      .locator("input:not([type=radio]):not([type=hidden]), textarea")
      .evaluateAll((fields) =>
        fields.map((field) => parseFloat(getComputedStyle(field).fontSize)),
      );
    expect(sizes.length).toBeGreaterThan(0);
    for (const size of sizes) expect(size).toBeGreaterThanOrEqual(16);
  });
});

test.describe("the menu on a small phone", () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test("is a sheet the width of the screen, closed by a tap outside it", async ({
    page,
  }) => {
    await page.goto("/how-we-build");
    const menu = page.getByRole("banner").locator("details");
    await menu.locator("summary").click();
    await expect(menu).toHaveAttribute("open", "");
    const sheet = await menu.getByRole("navigation").boundingBox();
    expect(sheet?.x).toBe(0);
    expect(sheet?.width).toBe(320);
    await page.mouse.click(160, 540);
    await expect(menu).not.toHaveAttribute("open");
  });

  test("the running header keeps just the section's name", async ({ page }) => {
    await page.goto("/how-we-build");
    const heads = page.locator(".spread__heads > span");
    await expect(heads.first()).toBeVisible();
    await expect(heads.last()).toBeHidden();
  });
});

/** Each standing book on screen, with its title inside its spine. */
async function expectWholeBookcase(page: Page) {
  const spines = page.locator(".bookcase__row [data-book]");
  await expect(spines).toHaveCount(7);
  const viewport = page.viewportSize();
  for (const spine of await spines.all()) {
    const box = await spine.boundingBox();
    expect(box && box.y + box.height).toBeLessThanOrEqual(
      viewport?.height ?? 0,
    );
    const title = await spine.locator(".spine__title").boundingBox();
    expect(title && box && title.x >= box.x - 0.5).toBe(true);
    expect(
      title && box && title.x + title.width <= box.x + box.width + 0.5,
    ).toBe(true);
  }
}

test.describe("a phone turned on its side", () => {
  test.use({ viewport: { width: 844, height: 390 } });

  test("shows the headline beside the whole bookcase", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".pile")).toBeHidden();
    await expectWholeBookcase(page);
    const headline = await page
      .getByRole("heading", { level: 1 })
      .boundingBox();
    const bookcase = await page.locator(".bookcase").boundingBox();
    expect(
      headline && bookcase && headline.x + headline.width,
    ).toBeLessThanOrEqual(bookcase?.x ?? 0);
  });
});

test.describe("a small phone turned on its side", () => {
  test.use({ viewport: { width: 667, height: 375 } });

  test("keeps the pile, under the headline", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".pile")).toBeVisible();
    await expect(page.locator(".bookcase__row")).toBeHidden();
  });
});
