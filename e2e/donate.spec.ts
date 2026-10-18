import { expect, test, type Locator, type Page } from "@playwright/test";

import { isTodo } from "../src/content/helpers";
import { MILAAP_URL } from "../src/content/site";
import { checkout, transition } from "../src/motion/tokens";

/* Phase 6 acceptance: Donate. The library checkout card offers gifts on its
   ruled lines and circles the chosen one in pencil. Check out stamps the
   card (THANK YOU and today's date, in under 0.8 s) and goes to Milaap in
   the same tab; nothing is paid on this site. Until the content has a
   Milaap link, Donate stamps the card and says so, and the redirect itself
   is tested on /dev/checkout, whose card has a stand-in link. No request
   ever reaches Milaap: they are all answered here. */

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < 768;

const BENCH = "/dev/checkout";
const STAND_IN = /milaap\.org\/fundraisers\/checkout-test-bench$/;

// On the whole context, so new tabs are caught too.
test.beforeEach(async ({ context }) => {
  await context.route("https://milaap.org/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Milaap stand-in</title><h1>Milaap stand-in</h1>",
    }),
  );
});

/**
 * Opens the bench with the page's clock under the test's control, so the
 * stamp's timing can be checked step by step whatever the machine's load.
 * Returns Check out, ready to press: then move the clock with runFor.
 */
async function benchOnTestClock(page: Page) {
  await page.clock.install();
  await page.goto(BENCH);
  await page.waitForLoadState("networkidle");
  const link = page.getByRole("link", { name: "Check out" });
  await link.scrollIntoViewIfNeeded();
  // Far enough ahead that a busy machine cannot have passed it already.
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
  return link;
}

const gift = (page: Page, name: RegExp) => page.getByRole("radio", { name });

/** The visible (and fully drawn) pencil circle of a gift's line, if any. */
const circleOf = (radio: Locator) =>
  radio.locator(
    "xpath=ancestor::label[contains(@class, 'checkout__option')]//*[local-name()='svg']",
  );

const drawn = (path: Locator) =>
  path.evaluate((element: SVGPathElement) => {
    const { strokeDasharray } = getComputedStyle(element);
    if (strokeDasharray === "none") return true;
    const [dash = 0] = strokeDasharray.split(",").map(parseFloat);
    return dash >= element.getTotalLength() - 1;
  });

/** Today as the stamp prints it, in the browser's own time. */
const today = (page: Page) =>
  page.evaluate(() =>
    new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
      .formatToParts(new Date())
      .filter((part) => part.type !== "literal")
      .map((part) => part.value.toUpperCase())
      .join(" "),
  );

test("the stamp is quick, as the brief asks", () => {
  const { lift, drop, squash, settle, away } = checkout.stamp;
  expect(lift + drop + squash + settle + away).toBeLessThan(0.8);
  expect(checkout.leaveBy).toBeLessThanOrEqual(0.8);
});

test.describe("the checkout card", () => {
  test("offers the gifts with their amounts, and nothing is paid here", async ({
    page,
  }) => {
    await page.goto("/donate");
    const gifts = page.getByRole("group", { name: "Choose a gift" });
    await expect(gifts.getByRole("radio")).toHaveCount(3);
    await expect(gift(page, /^One book/)).toBeVisible();
    await expect(gift(page, /^A shelf of books/)).toBeVisible();
    await expect(
      gift(page, /^A whole library for 50 to 60 children/),
    ).toBeVisible();
    await expect(page.locator(".checkout__option").last()).toContainText(
      "about ₹20,000 to ₹40,000",
    );
    await expect(page.locator(".checkout__note").first()).toContainText(
      "Nothing is paid on this site.",
    );
    // No payment form, ever: not a single field to type into.
    await expect(
      page.getByRole("main").locator("form, input:not([type='radio'])"),
    ).toHaveCount(0);

    if (isTodo(MILAAP_URL)) {
      // Until there is a Milaap link, Check out says so.
      await expect(
        page.getByRole("button", { name: "Check out" }),
      ).toBeVisible();
      await expect(page.getByText(/TODO: Milaap campaign link/)).toBeVisible();
    } else {
      await expect(
        page.getByRole("link", { name: "Check out" }),
      ).toHaveAttribute("href", MILAAP_URL);
    }
  });

  test("choosing a gift circles it in pencil", async ({ page }) => {
    await page.goto("/donate");
    const shelf = gift(page, /^A shelf of books/);
    const library = gift(page, /^A whole library/);
    await shelf.check();
    await expect(circleOf(shelf)).toBeVisible();
    await expect.poll(() => drawn(circleOf(shelf).locator("path"))).toBe(true);
    // Choosing another rubs the first out.
    await library.check();
    await expect(circleOf(library)).toBeVisible();
    await expect(circleOf(shelf)).toBeHidden();
  });

  test("Check out stamps the card with THANK YOU and today's date", async ({
    page,
  }) => {
    await page.goto("/donate");
    await gift(page, /^A whole library/).check();
    await page.getByRole("button", { name: "Check out" }).click();
    const ink = page.locator(".checkout__ink");
    await expect(ink).toBeVisible();
    await expect(ink).toContainText("Thank you", { ignoreCase: true });
    await expect(ink).toContainText(await today(page));
    // The stamp has lifted away, leaving its impression.
    await expect(page.locator(".checkout__stamp")).toBeHidden();
    await expect(page.locator("[data-checkout-live]")).toHaveText(
      "Thank you. Taking you to Milaap to finish your gift.",
    );
  });
});

test.describe("going to Milaap", () => {
  test("the stamp comes down, then Milaap opens in the same tab within 0.8 s", async ({
    page,
    context,
  }) => {
    let popups = 0;
    context.on("page", () => popups++);
    const asked: string[] = [];
    page.on("request", (request) => {
      if (STAND_IN.test(request.url())) asked.push(request.url());
    });
    const link = await benchOnTestClock(page);
    await link.click({ force: true, noWaitAfter: true });
    // The stamp is on its way down: nobody has left yet.
    await page.clock.runFor(300);
    await expect(page.locator(".checkout__stamp")).toBeVisible();
    expect(asked).toHaveLength(0);
    // The ink has taken by now, and the visitor is on the way to Milaap,
    // well inside the 0.8 s the brief allows.
    const leaving = page.waitForRequest(STAND_IN);
    await page.clock.runFor(checkout.leaveBy * 1000 - 300);
    await leaving;
    await page.clock.resume();
    await expect(page).toHaveURL(STAND_IN);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Milaap stand-in",
    );
    expect(popups).toBe(0);
  });

  test("the keyboard does it all: choose with arrows, check out with Enter", async ({
    page,
  }) => {
    test.skip(isPhone(page), "A keyboard check, on desktop");
    await page.goto(BENCH);
    await gift(page, /^One book/).focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowDown");
    await expect(gift(page, /^A shelf of books/)).toBeChecked();
    await expect(gift(page, /^A shelf of books/)).toBeFocused();
    await page.getByRole("link", { name: "Check out" }).focus();
    const leaving = page.waitForRequest(STAND_IN);
    await page.keyboard.press("Enter");
    await leaving;
    await expect(page).toHaveURL(STAND_IN);
  });

  test("a click with a modifier is left to the browser (a new tab), with no stamp", async ({
    page,
  }) => {
    await page.goto(BENCH);
    await page.waitForLoadState("networkidle");
    // After the card has had its say, note whether it held the click back,
    // then hold it back here so the test never leaves for Milaap.
    await page.evaluate(() => {
      window.addEventListener("click", (event) => {
        (window as unknown as { __prevented: boolean }).__prevented =
          event.defaultPrevented;
        event.preventDefault();
      });
    });
    await page
      .getByRole("link", { name: "Check out" })
      .click({ modifiers: ["ControlOrMeta"] });
    const prevented = await page.evaluate(
      () => (window as unknown as { __prevented?: boolean }).__prevented,
    );
    expect(prevented).toBe(false);
    await page.waitForTimeout(checkout.leaveBy * 1000);
    await expect(page.locator(".checkout__stamp")).toBeHidden();
    await expect(page.locator(".checkout__ink")).toBeHidden();
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("the impression simply appears, and Milaap opens at once", async ({
      page,
    }) => {
      const link = await benchOnTestClock(page);
      await link.click({ force: true, noWaitAfter: true });
      const leaving = page.waitForRequest(STAND_IN);
      // Just the short fade of the ink, then off.
      await page.clock.runFor(transition.reducedFade * 1000 + 50);
      await leaving;
      await page.clock.resume();
      await expect(page).toHaveURL(STAND_IN);
    });

    test("the stamp never comes down on Donate", async ({ page }) => {
      await page.goto("/donate");
      const seen = page.evaluate(
        () =>
          new Promise<boolean>((resolve) => {
            const stamp = document.querySelector(".checkout__stamp");
            if (!stamp) return resolve(false);
            const watch = new MutationObserver(() => {
              if (getComputedStyle(stamp).visibility === "visible") {
                resolve(true);
              }
            });
            watch.observe(stamp, { attributes: true });
            setTimeout(() => resolve(false), 1500);
          }),
      );
      await page.getByRole("button", { name: "Check out" }).click();
      expect(await seen).toBe(false);
      await expect(page.locator(".checkout__ink")).toBeVisible();
    });
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("Check out is a real link to Milaap", async ({ page }) => {
      await page.goto(BENCH);
      const link = page.getByRole("link", { name: "Check out" });
      await expect(link).toHaveAttribute("href", STAND_IN);
      await link.click();
      await expect(page).toHaveURL(STAND_IN);
    });

    test("a chosen gift still shows its pencil circle", async ({ page }) => {
      await page.goto("/donate");
      const library = gift(page, /^A whole library/);
      await library.check();
      await expect(circleOf(library)).toBeVisible();
    });
  });
});

test("below the card: how giving works, the money, the tax benefit, the registrations and larger gifts", async ({
  page,
}) => {
  await page.goto("/donate");
  const main = page.getByRole("main");
  for (const heading of [
    "How giving works",
    "Where the money goes",
    "Tax benefit",
    "Registration",
    "Larger gifts",
  ]) {
    await expect(main.getByRole("heading", { name: heading })).toBeVisible();
  }
  await expect(
    main.getByRole("link", { name: "founder@literatelives.org" }),
  ).toHaveAttribute("href", "mailto:founder@literatelives.org");
});
