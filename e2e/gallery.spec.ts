import { expect, test, type Page } from "@playwright/test";

import { expectSettled, finished, recordTransitions } from "./transitions";

/* The Gallery, the founder's addition after Phase 8: the eighth book, a
   book of plates. Every real photo of a library and of a gallery moment is a
   plate, newest first, numbered as in a printed book, under a tissue leaf
   that turns back as it comes into view; a plate opens large in a viewer.
   With the stand-in content: QCity's photo (April 2026), then the seed's
   undated moment with the two photos already on the site. */

const width = (page: Page) => page.viewportSize()?.width ?? 0;
/** Both pages show from 80rem (1280 px). */
const showsSpread = (page: Page) => width(page) >= 1280;
const plates = (page: Page) => page.locator("figure.plate-entry");

test.beforeEach(({ page }) => recordTransitions(page));

test("Gallery opens from the shelf like every book", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const book = page
    .getByRole("navigation", { name: "Sections of the site" })
    .getByRole("link", { name: "Gallery", exact: true });
  if (width(page) >= 768) await book.hover();
  await book.click();
  const { start, end } = await finished(page);
  expect(start.kind).toBe("open");
  expect(end.to).toBe("/gallery");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Gallery");
  await expectSettled(page);
});

test("every photo is a plate, newest first, numbered as in a book", async ({
  page,
}) => {
  await page.goto("/gallery");
  await expect(plates(page)).toHaveCount(3);
  await expect(page.locator(".plate-entry__numeral")).toHaveText([
    "Plate I",
    "Plate II",
    "Plate III",
  ]);
  const first = plates(page).nth(0);
  await expect(first.locator(".plate__image")).toHaveAttribute(
    "alt",
    /A boy smiles as he reads/,
  );
  await expect(
    first.getByRole("link", { name: "QCity Community Library" }),
  ).toHaveAttribute("href", "/libraries/qcity-community-library");
  await expect(first.locator(".plate-entry__when")).toHaveText("April 2026");
  await expect(plates(page).nth(1).locator(".plate__image")).toHaveAttribute(
    "alt",
    /Children crowd around new bookshelves/,
  );
  // Libraries without photos yet give no placeholder plates.
  await expect(page.getByText("Placeholder")).toHaveCount(0);
});

test("on the open spread, a list of plates faces the title and each caption faces its plate", async ({
  page,
}) => {
  test.skip(!showsSpread(page), "The list and facing captions need both pages");
  await page.goto("/gallery");
  const middle = await page.locator("[data-spread-pages]").evaluate((pages) => {
    const rect = pages.getBoundingClientRect();
    return rect.left + rect.width / 2;
  });

  const list = page.getByRole("navigation", { name: "List of plates" });
  await expect(list.getByRole("link")).toHaveCount(3);
  expect((await list.boundingBox())?.x).toBeGreaterThan(middle);

  for (const plate of await plates(page).all()) {
    const caption = await plate.locator("figcaption").boundingBox();
    const sheet = await plate.locator(".plate").boundingBox();
    expect(caption && caption.x + caption.width).toBeLessThan(middle);
    expect(sheet?.x).toBeGreaterThan(middle);
  }

  await list.getByRole("link").nth(2).click();
  await expect(plates(page).nth(2)).toBeInViewport({ ratio: 0.3 });
});

test.describe("tissue leaves", () => {
  test("cover a plate until it comes into view, then turn back", async ({
    page,
  }) => {
    await page.goto("/gallery");
    const leaf = plates(page).nth(2).locator(".plate__tissue");
    await expect(leaf).toBeVisible();
    await plates(page).nth(2).scrollIntoViewIfNeeded();
    await expect(leaf).toBeHidden();
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("there are none, and a plate's link opens the photo itself", async ({
      page,
    }) => {
      await page.goto("/gallery");
      await expect(page.locator(".plate__tissue").first()).toBeHidden();
      await expect(plates(page).first().locator(".plate__image")).toBeVisible();
      await expect(
        plates(page).first().locator("a[data-plate]"),
      ).toHaveAttribute("href", "/photos/boy-reading-by-new-shelf.jpg");
    });
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("there are none", async ({ page }) => {
      await page.goto("/gallery");
      for (const leaf of await page.locator(".plate__tissue").all()) {
        await expect(leaf).toBeHidden();
      }
    });
  });
});

test.describe("the viewer", () => {
  const openFirst = async (page: Page) => {
    await page.goto("/gallery");
    await page.getByRole("link", { name: /View larger: A boy smiles/ }).click();
    await expect(
      page.getByRole("dialog", { name: "Plate I of III" }),
    ).toBeVisible();
  };

  test("opens a plate large, steps with the arrow keys, and closes back to the plate", async ({
    page,
  }) => {
    await openFirst(page);
    await expect(page.getByRole("dialog").getByRole("img")).toHaveAttribute(
      "alt",
      /A boy smiles/,
    );
    await page.keyboard.press("ArrowRight");
    const second = page.getByRole("dialog", { name: "Plate II of III" });
    await expect(second).toBeVisible();
    await expect(second.getByRole("img")).toHaveAttribute(
      "alt",
      /Children crowd/,
    );
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    // Back on the plate the reader ended on, not the one they opened.
    await expect(
      page.getByRole("link", { name: /View larger: Children crowd/ }),
    ).toBeFocused();
    // The page did not move on underneath.
    await expect(page).toHaveURL(/\/gallery$/);
  });

  test("its buttons step from plate to plate, stop at the ends, and close", async ({
    page,
  }) => {
    await openFirst(page);
    const viewer = page.getByRole("dialog");
    const previous = viewer.getByRole("button", { name: "Previous plate" });
    const next = viewer.getByRole("button", { name: "Next plate" });
    await expect(previous).toBeDisabled();
    await next.click();
    await next.click();
    await expect(viewer).toHaveAccessibleName("Plate III of III");
    await expect(next).toBeDisabled();
    await previous.click();
    await expect(viewer).toHaveAccessibleName("Plate II of III");
    await viewer.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("a swipe moves to the next plate", async ({ page }) => {
    test.skip(width(page) >= 768, "Phones");
    await openFirst(page);
    // A finger drawn from right to left across the plate.
    await page.getByRole("dialog").evaluate((dialog) => {
      const touch = (type: string, x: number) =>
        dialog.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            pointerType: "touch",
            clientX: x,
            clientY: 300,
          }),
        );
      touch("pointerdown", 300);
      touch("pointerup", 120);
    });
    await expect(
      page.getByRole("dialog", { name: "Plate II of III" }),
    ).toBeVisible();
  });
});
