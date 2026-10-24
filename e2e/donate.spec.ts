import { expect, test, type Locator, type Page } from "@playwright/test";

import { isTodo } from "../src/content/helpers";
import { MILAAP_URL } from "../src/content/site";
import { checkout, transition } from "../src/motion/tokens";

/* Phase 6 acceptance: Donate. The library checkout card offers gifts on its
   ruled lines and circles the chosen one in pencil. Check out stamps the
   card (THANK YOU and today's date, in under 0.8 s) and goes to the Milaap
   campaign in the same tab; nothing is paid on this site. No request ever
   reaches Milaap: a stand-in answers them all here. */

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < 768;

/** The campaign's address, exactly as the browser asks for it. */
const MILAAP = new RegExp(
  `^${MILAAP_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
);

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
 * Opens Donate with the page's clock under the test's control, so the
 * stamp's timing can be checked step by step whatever the machine's load.
 * Returns Check out, ready to press: then move the clock with runFor.
 */
async function donateOnTestClock(page: Page) {
  await page.clock.install();
  await page.goto("/donate");
  await page.waitForLoadState("networkidle");
  const link = page.getByRole("link", { name: "Check out" });
  await link.scrollIntoViewIfNeeded();
  // Far enough ahead that a busy machine cannot have passed it already.
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
  return link;
}

const gift = (page: Page, name: RegExp) => page.getByRole("radio", { name });

/** The pencil circle on a gift's line. */
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
    const amounts = page.locator(".checkout__amount");
    // What a shelf costs varies, so its line gives no amount.
    await expect(amounts.nth(1)).toBeEmpty();
    await expect(amounts.nth(2)).toHaveText("about ₹20,000 to ₹40,000");
    await expect(page.locator(".checkout__note").first()).toContainText(
      "Nothing is paid on this site.",
    );
    // No payment form, ever: not a single field to type into.
    await expect(
      page.getByRole("main").locator("form, input:not([type='radio'])"),
    ).toHaveCount(0);

    if (isTodo(MILAAP_URL)) {
      // Without a campaign, Check out says so.
      await expect(
        page.getByRole("button", { name: "Check out" }),
      ).toBeVisible();
      await expect(page.getByText(/TODO: Milaap/)).toBeVisible();
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
});

test.describe("going to Milaap", () => {
  test.skip(isTodo(MILAAP_URL), "There is no Milaap campaign in the content");

  test("the stamp prints THANK YOU and today's date, then Milaap opens in the same tab within 0.8 s", async ({
    page,
    context,
  }) => {
    let popups = 0;
    context.on("page", () => popups++);
    const asked: string[] = [];
    page.on("request", (request) => {
      if (MILAAP.test(request.url())) asked.push(request.url());
    });
    const link = await donateOnTestClock(page);
    await gift(page, /^A whole library/).check({ force: true });
    await link.click({ force: true, noWaitAfter: true });

    // The stamp has landed and the ink has taken: nobody has left yet.
    await page.clock.runFor(330);
    await expect(page.locator(".checkout__stamp")).toBeVisible();
    const ink = page.locator(".checkout__ink");
    await expect(ink).toBeVisible();
    await expect(ink).toContainText("Thank you", { ignoreCase: true });
    await expect(ink).toContainText(await today(page));
    await expect(page.locator("[data-checkout-live]")).toHaveText(
      "Thank you. Taking you to Milaap to finish your gift.",
    );
    expect(asked).toHaveLength(0);

    // And now the visitor is on the way, well inside the 0.8 s allowed.
    const leaving = page.waitForRequest(MILAAP);
    await page.clock.runFor(checkout.leaveBy * 1000 - 330);
    await leaving;
    await page.clock.resume();
    await expect(page).toHaveURL(MILAAP);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Milaap stand-in",
    );
    expect(popups).toBe(0);
  });

  test("the keyboard does it all: choose with arrows, check out with Enter", async ({
    page,
  }) => {
    test.skip(isPhone(page), "A keyboard check, on desktop");
    await page.goto("/donate");
    await gift(page, /^One book/).focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowDown");
    await expect(gift(page, /^A shelf of books/)).toBeChecked();
    await expect(gift(page, /^A shelf of books/)).toBeFocused();
    await page.getByRole("link", { name: "Check out" }).focus();
    const leaving = page.waitForRequest(MILAAP);
    await page.keyboard.press("Enter");
    await leaving;
    await expect(page).toHaveURL(MILAAP);
  });

  test("a click with a modifier is left to the browser (a new tab), with no stamp", async ({
    page,
  }) => {
    await page.goto("/donate");
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

    test("no stamp comes down: the impression appears and Milaap opens at once", async ({
      page,
    }) => {
      const link = await donateOnTestClock(page);
      await link.click({ force: true, noWaitAfter: true });
      await page.clock.runFor(100);
      await expect(page.locator(".checkout__stamp")).toBeHidden();
      await expect(page.locator(".checkout__ink")).toBeVisible();
      // Just the short fade of the ink, then off.
      const leaving = page.waitForRequest(MILAAP);
      await page.clock.runFor(transition.reducedFade * 1000);
      await leaving;
      await page.clock.resume();
      await expect(page).toHaveURL(MILAAP);
    });
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("Check out is a real link to Milaap", async ({ page }) => {
      await page.goto("/donate");
      const link = page.getByRole("link", { name: "Check out" });
      await expect(link).toHaveAttribute("href", MILAAP_URL);
      await link.click();
      await expect(page).toHaveURL(MILAAP);
    });
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("a chosen gift still shows its pencil circle", async ({ page }) => {
    await page.goto("/donate");
    const library = gift(page, /^A whole library/);
    await library.check();
    await expect(circleOf(library)).toBeVisible();
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
