import { expect, test, type Locator, type Page } from "@playwright/test";

/* Phase 4 acceptance: the page as an open book, and Our Story built fully.
   Our Story reads beautifully, and the decoration never competes with the
   text: nothing in the margins overlaps it, the measure stays readable, and
   nothing on the first screen is hidden while it loads. */

const width = (page: Page) => page.viewportSize()?.width ?? 0;
/** Both pages show from 80rem (1280 px); phones get paper to the edges. */
const showsSpread = (page: Page) => width(page) >= 1280;
const isPhone = (page: Page) => width(page) < 768;

const box = async (locator: Locator) => {
  const rect = await locator.boundingBox();
  if (!rect) throw new Error("not on screen");
  return rect;
};

const overlaps = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) =>
  a.x < b.x + b.width &&
  b.x < a.x + a.width &&
  a.y < b.y + b.height &&
  b.y < a.y + a.height;

test.describe("the open book", () => {
  test("Our Story opens as a book: the chapter on the left, the text on the right", async ({
    page,
  }) => {
    await page.goto("/our-story");
    const pages = page.locator("[data-spread-pages]");
    const pagesBox = await box(pages);
    const fold = pagesBox.x + pagesBox.width / 2;
    const title = await box(page.getByRole("heading", { level: 1 }));
    const firstSection = await box(
      page.getByRole("heading", { level: 2 }).first(),
    );

    if (showsSpread(page)) {
      expect(title.x + title.width).toBeLessThan(fold);
      expect(firstSection.x).toBeGreaterThan(fold);
    } else {
      // One page: the chapter opening comes first, then the text below it.
      expect(firstSection.y).toBeGreaterThan(title.y + title.height);
    }
  });

  test("each book's pages are framed in its own cloth", async ({ page }) => {
    test.skip(isPhone(page), "Phones show the page to the edges, no cloth");
    const cloth = async (path: string) => {
      await page.goto(path);
      return page
        .locator(".spread__book")
        .evaluate((element) => getComputedStyle(element).backgroundColor);
    };
    // Oxblood for Our Story, forest for The Libraries, navy for Donate.
    expect(await cloth("/our-story")).toBe("rgb(94, 33, 41)");
    expect(await cloth("/libraries")).toBe("rgb(47, 74, 58)");
    expect(await cloth("/donate")).toBe("rgb(35, 49, 75)");
  });

  test("the running header and page numbers read like a printed book", async ({
    page,
  }) => {
    await page.goto("/our-story");
    const heads = page.locator(".spread__heads");
    await expect(heads).toHaveAttribute("aria-hidden", "true");
    await expect(heads).toContainText("Our Story");
    await expect(heads).toContainText("Literate Lives Foundation");
    const folios = page.locator(".spread__folios span");
    await expect(folios).toHaveText(["2", "3"]);
    // One page, one number.
    await expect(folios.first()).toHaveCSS(
      "visibility",
      showsSpread(page) ? "visible" : "hidden",
    );
  });

  test("the text keeps a readable measure", async ({ page }) => {
    await page.goto("/our-story");
    await page.evaluate(() => document.fonts.ready);
    const longest = await page
      .locator(".spread__text section p")
      .first()
      .evaluate((paragraph) => {
        const range = document.createRange();
        const lines = new Map<number, number>();
        const walker = document.createTreeWalker(
          paragraph,
          NodeFilter.SHOW_TEXT,
        );
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const text = node as Text;
          for (let index = 0; index < text.length; index++) {
            range.setStart(text, index);
            range.setEnd(text, index + 1);
            const top = Math.round(range.getBoundingClientRect().top);
            lines.set(top, (lines.get(top) ?? 0) + 1);
          }
        }
        return Math.max(...lines.values());
      });
    // 60 to 72 characters on most screens; the narrowest spread (1280 px)
    // and phones run a little shorter.
    expect(longest).toBeLessThanOrEqual(76);
    expect(longest).toBeGreaterThanOrEqual(isPhone(page) ? 30 : 50);
  });
});

test.describe("the margins", () => {
  test("nothing in the margins sits on the text", async ({ page }) => {
    test.skip(!showsSpread(page), "Between the text blocks on smaller screens");
    await page.goto("/our-story");
    await page.evaluate(() => document.fonts.ready);
    const text = await page
      .locator(".spread__text section")
      .evaluateAll((sections) =>
        sections.map((section) => {
          const rect = section.getBoundingClientRect();
          return {
            x: rect.x,
            y: rect.y + window.scrollY,
            width: rect.width,
            height: rect.height,
          };
        }),
      );
    const objects = await page.locator(".spread__margin").evaluateAll((items) =>
      items.map((item) => {
        const rect = item.getBoundingClientRect();
        return {
          x: rect.x,
          y: rect.y + window.scrollY,
          width: rect.width,
          height: rect.height,
        };
      }),
    );
    expect(objects).toHaveLength(3);
    for (const object of objects) {
      for (const section of text) expect(overlaps(object, section)).toBe(false);
    }
  });

  test("the photo is described; the pencil and the note are decoration", async ({
    page,
  }) => {
    await page.goto("/our-story");
    await expect(
      page.getByRole("img", { name: /bookshelves, full of children's books/ }),
    ).toBeAttached();
    await expect(page.locator(".pencil-object")).toHaveAttribute("alt", "");
    await expect(page.locator(".note-card")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});

test.describe("pencil marks and reveals", () => {
  test("pencil marks are drawn under their phrases", async ({ page }) => {
    await page.goto("/our-story");
    const marks = page.locator(".pencil-mark");
    await expect(marks).toHaveText(["a student", "three libraries"]);
    const line = marks.first().locator(".pencil-mark__line");
    await expect(line).toHaveCSS("visibility", "visible");
    // Drawn in full once it has played.
    await expect
      .poll(() =>
        line
          .locator("path")
          .first()
          .evaluate(
            (path) =>
              getComputedStyle(path).strokeDashoffset === "0px" ||
              getComputedStyle(path).strokeDasharray === "none",
          ),
      )
      .toBe(true);
  });

  test("with reduced motion the marks are simply there", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/our-story");
    const line = page.locator(".pencil-mark__line").first();
    await expect(line).toHaveCSS("visibility", "visible");
    await expect(line.locator("path").first()).toHaveCSS(
      "stroke-dasharray",
      "none",
    );
  });

  test("nothing on the first screen is hidden while the page loads", async ({
    page,
  }) => {
    await page.goto("/our-story");
    const firstHeading = page.getByRole("heading", { level: 2 }).first();
    await expect(firstHeading).toBeInViewport();
    // Not split into hidden lines: the first screen shows as it is.
    await expect(firstHeading.locator("[aria-hidden]")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCSS(
      "opacity",
      "1",
    );
  });

  test("headings further down rise into place as they come into view", async ({
    page,
  }) => {
    test.skip(!isPhone(page), "Phones have the most below the first screen");
    await page.goto("/our-story");
    const heading = page.getByRole("heading", { name: "The team" });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeInViewport();
    // Split into masked lines, each risen back into its place.
    const lines = heading.locator("div");
    await expect.poll(() => lines.count()).toBeGreaterThan(0);
    await expect
      .poll(() =>
        lines.evaluateAll((items) =>
          items.every((line) => {
            const transform = getComputedStyle(line).transform;
            return transform === "none" || transform.endsWith(", 0, 0)");
          }),
        ),
      )
      .toBe(true);
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("Our Story reads in full, marks and all", async ({ page }) => {
    await page.goto("/our-story");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Our Story",
    );
    await expect(
      page.getByRole("main").getByRole("heading", { level: 2 }),
    ).toHaveCount(4);
    await expect(page.locator(".pencil-mark__line").first()).toHaveCSS(
      "visibility",
      "visible",
    );
  });
});

test("nothing shifts while Our Story loads and scrolls", async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "Layout shift is measured in Chromium");
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
  await page.goto("/our-story");
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
