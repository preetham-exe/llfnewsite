import { expect, test, type Page } from "@playwright/test";

import { transition } from "../src/motion/tokens";

/* Phase 3 acceptance: the book transition, for Our Story only. It opens in
   1.4 s or less (1.1 s on phones), skips on any click or key, closes back
   into its place, and never leaves anything behind. WebKit here cannot draw
   CSS 3D, but everything this file checks still applies there. */

type Event = {
  phase: "start" | "end" | "stop";
  kind: "open" | "close" | "fade";
  to: string;
  t: number;
  /** Where the page was scrolled when the event fired. */
  scrollY: number;
};

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < 768;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const record = window as unknown as {
      __transitions: unknown[];
      __bookSeen: boolean;
    };
    record.__transitions = [];
    record.__bookSeen = false;
    window.addEventListener("llf:transition", (event) => {
      record.__transitions.push({
        ...(event as CustomEvent).detail,
        t: performance.now(),
        scrollY: window.scrollY,
      });
    });
    new MutationObserver(() => {
      if (document.querySelector(".tb-book")) record.__bookSeen = true;
    }).observe(document, { childList: true, subtree: true });
  });
});

const events = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { __transitions: Event[] }).__transitions,
  );

/** Waits for the next transition to finish and returns its start and end. */
async function finished(page: Page, count = 1) {
  await expect
    .poll(
      async () =>
        (await events(page)).filter((event) => event.phase !== "start").length,
      { timeout: 6000 },
    )
    .toBeGreaterThanOrEqual(count);
  const all = await events(page);
  const starts = all.filter((event) => event.phase === "start");
  const ends = all.filter((event) => event.phase !== "start");
  return { start: starts[count - 1]!, end: ends[count - 1]! };
}

const shelfBook = (page: Page, name: string) =>
  page
    .getByRole("navigation", { name: "Sections of the site" })
    .getByRole("link", { name, exact: true });

const overlay = (page: Page) => page.locator("[data-transition-overlay]");

/** The shelf, with the next page prefetched and the transition loaded. */
async function openShelf(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
}

async function openOurStory(page: Page) {
  await openShelf(page);
  const book = shelfBook(page, "Our Story");
  if (!isPhone(page)) await book.hover();
  await book.click();
  return finished(page);
}

async function expectSettled(page: Page) {
  await expect(overlay(page)).toBeEmpty();
  await expect(overlay(page)).not.toHaveAttribute("data-active");
  await expect(page.locator("[data-book-out]")).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveClass(/lenis-stopped/);
}

test("the timings stay within the brief's limits", () => {
  expect(transition.open.total).toBeLessThanOrEqual(1.4);
  expect(transition.openMobile.total).toBeLessThanOrEqual(1.1);
  expect(transition.open.rise[1]).toBe(transition.open.total);
  expect(transition.reducedFade).toBe(0.2);
});

test.describe("opening a book", () => {
  test("Our Story opens from the shelf into its page", async ({ page }) => {
    const { start, end } = await openOurStory(page);
    expect(start.kind).toBe("open");
    expect(end.phase).toBe("end");
    expect(end.to).toBe("/our-story");
    // The animation plus a frame or two either side.
    expect(end.t - start.t).toBeLessThan(isPhone(page) ? 1200 : 1500);

    await expect(page).toHaveURL(/\/our-story$/);
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveText("Our Story");
    await expect(heading).toBeFocused();
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.locator("[data-transition-content]")).not.toHaveAttribute(
      "style",
      /opacity|transform/,
    );
    await expect(
      page.getByRole("link", { name: /Back to the shelf/ }),
    ).toBeVisible();
    await expectSettled(page);
  });

  test("a click during the opening skips to the end", async ({ page }) => {
    await openShelf(page);
    await shelfBook(page, "Our Story").click();
    await page.waitForTimeout(250);
    const skippedAt = await page.evaluate(() => performance.now());
    await page.mouse.click(200, 500);
    const { end } = await finished(page);
    expect(end.phase).toBe("end");
    expect(end.t - skippedAt).toBeLessThan(450);
    await expect(page).toHaveURL(/\/our-story$/);
    await expectSettled(page);
  });

  test("a key press during the opening skips to the end", async ({ page }) => {
    await openShelf(page);
    await shelfBook(page, "Our Story").click();
    await page.waitForTimeout(250);
    const skippedAt = await page.evaluate(() => performance.now());
    await page.keyboard.press("x");
    const { end } = await finished(page);
    expect(end.phase).toBe("end");
    expect(end.t - skippedAt).toBeLessThan(450);
    await expect(page).toHaveURL(/\/our-story$/);
    await expectSettled(page);
  });

  test("the other books open their pages without it, until Phase 5", async ({
    page,
  }) => {
    await openShelf(page);
    await shelfBook(page, "The Libraries").click();
    await expect(page).toHaveURL(/\/libraries$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "The Libraries",
    );
    expect(await events(page)).toHaveLength(0);
  });

  test("a direct load shows the page with no transition", async ({ page }) => {
    await page.goto("/our-story");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await events(page)).toHaveLength(0);
    await expect(overlay(page)).toBeEmpty();
  });

  test("a modified click opens a new tab, with no transition", async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(
      browserName === "webkit" || isPhone(page),
      "New tabs from modifier clicks are a desktop Chromium check",
    );
    await openShelf(page);
    const opened = context.waitForEvent("page");
    await shelfBook(page, "Our Story").click({ modifiers: ["ControlOrMeta"] });
    const tab = await opened;
    await tab.waitForLoadState();
    expect(tab.url()).toMatch(/\/our-story$/);
    await expect(page).toHaveURL(/\/$/);
    expect(await events(page)).toHaveLength(0);
    await expect(overlay(page)).toBeEmpty();
  });
});

test.describe("closing the book", () => {
  test("Back to the shelf closes it into its place", async ({ page }) => {
    await openOurStory(page);
    await page
      .getByRole("banner")
      .getByRole("link", { name: /Back to the shelf/ })
      .click();
    const { start, end } = await finished(page, 2);
    expect(start.kind).toBe("close");
    expect(end.phase).toBe("end");
    expect(end.t - start.t).toBeLessThan(1100);

    await expect(page).toHaveURL(/\/$/);
    const book = shelfBook(page, "Our Story");
    await expect(book).toBeVisible();
    await expect(book).toBeFocused();
    await expectSettled(page);
  });

  test("the browser's back button closes it too, back where the reader was", async ({
    page,
  }) => {
    const opened = await openOurStory(page);
    await page.goBack();
    const { start, end } = await finished(page, 2);
    expect(start.kind).toBe("close");
    expect(end.phase).toBe("end");
    await expect(page).toHaveURL(/\/$/);
    // Phones scroll a little to reach the pile; back returns to that spot.
    expect(
      Math.abs(
        (await page.evaluate(() => window.scrollY)) - opened.start.scrollY,
      ),
    ).toBeLessThan(1);
    await expect(shelfBook(page, "Our Story")).toBeVisible();
    await expectSettled(page);
  });

  test("Escape closes it", async ({ page }) => {
    await openOurStory(page);
    await page.keyboard.press("Escape");
    const { start, end } = await finished(page, 2);
    expect(start.kind).toBe("close");
    expect(end.phase).toBe("end");
    await expect(page).toHaveURL(/\/$/);
    await expect(shelfBook(page, "Our Story")).toBeFocused();
    await expectSettled(page);
  });

  test("Escape closes an open menu first, not the book", async ({ page }) => {
    test.skip(!isPhone(page), "The menu is for narrow screens");
    await page.goto("/our-story");
    await page.getByRole("banner").getByText("Menu").click();
    const menu = page.locator("header details");
    await expect(menu).toHaveAttribute("open", "");
    await page.keyboard.press("Escape");
    await expect(menu).not.toHaveAttribute("open", "");
    await expect(page).toHaveURL(/\/our-story$/);
    expect(await events(page)).toHaveLength(0);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("opening and closing are a short crossfade", async ({ page }) => {
    await openShelf(page);
    await shelfBook(page, "Our Story").click();
    let { start, end } = await finished(page);
    expect(start.kind).toBe("fade");
    expect(end.phase).toBe("end");
    expect(end.t - start.t).toBeLessThan(700);
    await expect(page).toHaveURL(/\/our-story$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();

    await page.keyboard.press("Escape");
    ({ start, end } = await finished(page, 2));
    expect(start.kind).toBe("fade");
    expect(end.phase).toBe("end");
    await expect(page).toHaveURL(/\/$/);
    await expectSettled(page);

    const bookSeen = await page.evaluate(
      () => (window as unknown as { __bookSeen: boolean }).__bookSeen,
    );
    expect(bookSeen).toBe(false);
  });
});

test("if the page never arrives, a normal page load takes over", async ({
  page,
}) => {
  // Client navigations fetch the page's RSC payload; hold every one forever.
  // (The network never goes quiet, so wait for the transition to load.)
  await page.route(/[?&]_rsc=/, () => {});
  await page.goto("/");
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    (window as unknown as { __oldPage: boolean }).__oldPage = true;
  });
  await shelfBook(page, "Our Story").click();
  await expect(page).toHaveURL(/\/our-story$/, {
    timeout: (transition.holdLimit + 3) * 1000,
  });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Our Story");
  // A fresh page load: nothing of the old page, or the transition, is left.
  expect(
    await page.evaluate(
      () => (window as unknown as { __oldPage?: boolean }).__oldPage,
    ),
  ).toBeUndefined();
  await expect(overlay(page)).toBeEmpty();
});

test("a navigation during the opening ends it cleanly", async ({ page }) => {
  await openShelf(page);
  await shelfBook(page, "Our Story").click();
  await page.waitForTimeout(300);
  await page.getByRole("banner").getByRole("link", { name: "Donate" }).click();
  await expect(page).toHaveURL(/\/donate$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Donate");
  const [, stopped] = await events(page);
  expect(stopped?.phase).toBe("stop");
  await expectSettled(page);
});
