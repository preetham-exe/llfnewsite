import {
  expect,
  test,
  type APIRequestContext,
  type Locator,
  type Page,
} from "@playwright/test";

import { transition } from "../src/motion/tokens";
import {
  bookSeen,
  events,
  expectSettled,
  finished,
  recordTransitions,
} from "./transitions";

/* Phase 5 acceptance: the remaining pages, each with its own objects in the
   margins; a page turn inside a book and a quiet crossfade between books;
   and the contact form on Get Involved, which emails the founder. Here the
   email goes to a stand-in for the email service (e2e/mock-email.mjs). */

const width = (page: Page) => page.viewportSize()?.width ?? 0;
/** Both pages show from 80rem (1280 px). */
const showsSpread = (page: Page) => width(page) >= 1280;

const sectionPages = [
  "/libraries",
  "/libraries/qcity-community-library",
  "/how-we-build",
  "/partners",
  "/stories",
  "/stories/first-story",
  "/get-involved",
] as const;

test.beforeEach(({ page }) => recordTransitions(page));

/** Fully drawn: its dash covers the whole path, or it is not dashed. */
const drawn = (path: Locator) =>
  path.evaluate((element: SVGPathElement) => {
    const { strokeDasharray } = getComputedStyle(element);
    if (strokeDasharray === "none") return true;
    const [dash = 0] = strokeDasharray.split(",").map(parseFloat);
    return dash >= element.getTotalLength() - 1;
  });

test.describe("the margins", () => {
  test("each page has its own objects, and they are decoration", async ({
    page,
  }) => {
    await page.goto("/libraries");
    const card = page.locator(".date-due");
    await expect(card).toHaveAttribute("aria-hidden", "true");
    // Stamped with the months the libraries opened, as far as confirmed.
    await expect(card.locator(".date-due__stamp")).toHaveText([
      "JAN 2025",
      "APR 2026",
    ]);
    await expect(page.locator(".leaf-object")).toHaveAttribute("alt", "");

    await page.goto("/how-we-build");
    await expect(page.locator(".pencil-sketch")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    await expect(page.locator(".ruler-object")).toHaveAttribute("alt", "");
    await expect(page.locator(".checklist")).toHaveAttribute(
      "aria-hidden",
      "true",
    );

    await page.goto("/partners");
    // Sealed with our own mark: no partner's logo is used as decoration.
    await expect(page.locator(".letters")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    await expect(page.locator(".letters__mark")).toHaveAttribute(
      "href",
      "#llf-monogram",
    );

    await page.goto("/stories");
    await expect(page.locator(".notebook-page")).toBeVisible();
    await expect(page.locator(".lying-object")).toHaveAttribute("alt", "");
    // The children's drawings are still to come, and say so.
    await expect(page.locator(".drawing-placeholder")).toContainText("TODO");

    await page.goto("/get-involved");
    await expect(page.locator(".sticky-note")).toHaveText([
      "Volunteer",
      "Start a chapter",
      "Ask for a library",
    ]);
    await expect(page.locator(".sign-up")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  test("a library's facts are on its catalogue card, to be read", async ({
    page,
  }) => {
    await page.goto("/libraries/qcity-community-library");
    const card = page.locator(".catalogue-card");
    await expect(card).not.toHaveAttribute("aria-hidden");
    const opened = card.locator(".catalogue-card__row", { hasText: "Opened" });
    await expect(opened.locator("dd")).toHaveText("April 2026");
    await expect(
      card.getByRole("link", { name: "Robinhood Army" }),
    ).toHaveAttribute("href", "/partners");
    await expect(
      page.getByRole("img", { name: /reads a book beside a white bookshelf/ }),
    ).toBeVisible();
  });

  test("on the open spread, the objects stay on the left-hand page", async ({
    page,
  }) => {
    test.skip(!showsSpread(page), "Between the text blocks on smaller screens");
    for (const path of sectionPages) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const fold = await page
        .locator("[data-spread-pages]")
        .evaluate((pages) => {
          const rect = pages.getBoundingClientRect();
          return { left: rect.left, middle: rect.left + rect.width / 2 };
        });
      const objects = await page
        .locator(".spread__margin")
        .evaluateAll((items) =>
          items.flatMap((item) =>
            [item, ...item.querySelectorAll("*")].map((node) => {
              const rect = node.getBoundingClientRect();
              return { left: rect.left, right: rect.right };
            }),
          ),
        );
      expect(objects.length, path).toBeGreaterThan(0);
      for (const object of objects) {
        expect(object.left, path).toBeGreaterThanOrEqual(fold.left);
        expect(object.right, path).toBeLessThanOrEqual(fold.middle);
      }
    }
  });

  test("the shelf sketch draws itself as it comes into view", async ({
    page,
  }) => {
    await page.goto("/how-we-build");
    const sketch = page.locator(".pencil-sketch");
    await sketch.scrollIntoViewIfNeeded();
    await expect(sketch).toHaveCSS("visibility", "visible");
    await expect.poll(() => drawn(sketch.locator("path").last())).toBe(true);
    await expect(sketch.locator("text").last()).toHaveCSS("opacity", "1");
    await expect(sketch.locator("text")).toHaveText([
      "3 to 4 shelves",
      "Medium",
      "300 to 400 books",
    ]);
  });

  test("with reduced motion the sketch is simply there", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/how-we-build");
    const sketch = page.locator(".pencil-sketch");
    await expect(sketch).toHaveCSS("visibility", "visible");
    expect(await drawn(sketch.locator("path").last())).toBe(true);
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the sketch and the marks are there in full", async ({ page }) => {
    await page.goto("/how-we-build");
    await expect(page.locator(".pencil-sketch")).toHaveCSS(
      "visibility",
      "visible",
    );
    await expect(page.locator(".pencil-mark__line").first()).toHaveCSS(
      "visibility",
      "visible",
    );
  });
});

test("links stay links for screen readers, headings included", async ({
  page,
}) => {
  for (const path of sectionPages) {
    await page.goto(path);
    // Every reveal on the page has played.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 60));
      }
    });
    await page.waitForTimeout(400);
    const main = page.getByRole("main");
    // (The form's trap for bots is hidden too, but out of the tab order.)
    await expect(
      main.locator(
        '[aria-hidden="true"] :is(a, button, input, textarea):not([tabindex="-1"])',
      ),
      path,
    ).toHaveCount(0);
    const emptyLinks = await main
      .locator("a")
      .evaluateAll(
        (links) => links.filter((link) => !link.textContent?.trim()).length,
      );
    expect(emptyLinks, path).toBe(0);
  }
  await page.goto("/libraries");
  await expect(
    page
      .getByRole("main")
      .getByRole("link", { name: "QCity Community Library" }),
  ).toHaveCount(1);
});

test.describe("moving between pages", () => {
  test("a library opens from the index with a page turn, and turns back", async ({
    page,
  }) => {
    await page.goto("/libraries");
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("main")
      .getByRole("link", { name: "QCity Community Library" })
      .click();
    let { start, end } = await finished(page);
    expect(start.kind).toBe("turn");
    expect(end.phase).toBe("end");
    // The turn itself, once the page is ready (allowing for a slow machine).
    expect(end.t - start.t).toBeLessThan(transition.turn.total * 1000 + 900);
    await expect(page).toHaveURL(/\/libraries\/qcity-community-library$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    await expectSettled(page);

    await page
      .getByRole("main")
      .getByRole("link", { name: "All libraries" })
      .click();
    ({ start, end } = await finished(page, 2));
    expect(start.kind).toBe("turn");
    expect(end.phase).toBe("end");
    await expect(page).toHaveURL(/\/libraries$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "The Libraries",
    );

    await page.goBack();
    ({ start, end } = await finished(page, 3));
    expect(start.kind).toBe("turn");
    await expect(page).toHaveURL(/\/libraries\/qcity-community-library$/);
    await expectSettled(page);
    expect(await bookSeen(page)).toBe(false);
  });

  test("going from one book to another is a quiet crossfade", async ({
    page,
  }) => {
    await page.goto("/our-story");
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Partners" })
      .click();
    const { start, end } = await finished(page);
    expect(start.kind).toBe("fade");
    expect(end.phase).toBe("end");
    expect(end.t - start.t).toBeLessThan(transition.fade * 1000 + 900);
    await expect(page).toHaveURL(/\/partners$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    await expectSettled(page);
    expect(await bookSeen(page)).toBe(false);
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("the page turn is a short crossfade", async ({ page }) => {
      await page.goto("/libraries");
      await page.waitForLoadState("networkidle");
      await page
        .getByRole("main")
        .getByRole("link", { name: "QCity Community Library" })
        .click();
      const { start, end } = await finished(page);
      expect(start.kind).toBe("fade");
      expect(end.phase).toBe("end");
      expect(end.t - start.t).toBeLessThan(transition.reducedFade * 1000 + 900);
      await expect(page).toHaveURL(/\/libraries\/qcity-community-library$/);
      await expectSettled(page);
    });
  });

  test("every transition ends, and none is left running", async ({ page }) => {
    await page.goto("/libraries");
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("main")
      .getByRole("link", { name: "QCity Community Library" })
      .click();
    await finished(page);
    const phases = (await events(page)).map((event) => event.phase);
    expect(phases).toEqual(["start", "end"]);
  });
});

/* ---------- The contact form ---------- */

type SentEmail = {
  authorization: string;
  email: {
    from: string;
    to: string[];
    reply_to: string;
    subject: string;
    text: string;
  };
};

/** The emails the stand-in has been sent that contain `marker`. */
async function sentWith(request: APIRequestContext, marker: string) {
  const response = await request.get("http://127.0.0.1:3299/received");
  const all = (await response.json()) as SentEmail[];
  return all.filter((sent) => sent.email.text.includes(marker));
}

/** A name no other test uses, to find this test's email. */
const uniqueName = (label: string) =>
  `${label} ${Math.random().toString(36).slice(2, 8)}`;

async function fillForm(
  page: Page,
  { name, email, message }: { name: string; email: string; message: string },
) {
  await page.getByLabel("Asking for a library").check();
  await page.getByLabel("Your name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Message").fill(message);
}

test.describe("the contact form", () => {
  test("every field is labelled, and the optional ones say so", async ({
    page,
  }) => {
    await page.goto("/get-involved");
    const form = page.locator("form.contact-form");
    await expect(
      form.getByRole("group", { name: "What is this about?" }),
    ).toBeVisible();
    for (const option of [
      "Volunteering",
      "Starting a chapter in my city",
      "Asking for a library",
      "Something else",
    ]) {
      await expect(form.getByRole("radio", { name: option })).toBeVisible();
    }
    await expect(form.getByLabel("Your name")).toHaveAttribute("required", "");
    await expect(form.getByLabel("Email")).toHaveAttribute("type", "email");
    await expect(form.getByLabel("Phone (optional)")).not.toHaveAttribute(
      "required",
    );
    await expect(form.getByLabel("City (optional)")).not.toHaveAttribute(
      "required",
    );
    await expect(form.getByLabel("Message")).toHaveAttribute("required", "");
  });

  test("a message reaches the founder", async ({ page, request }) => {
    await page.goto("/get-involved");
    const name = uniqueName("Form test");
    await fillForm(page, {
      name,
      email: "reader@example.com",
      message: `We run a children's home. (${name})`,
    });
    await page.getByRole("button", { name: "Send message" }).click();
    const thanks = page.getByRole("main").getByRole("status");
    await expect(thanks).toHaveText(/Thank you for writing/);
    await expect(thanks).toBeFocused();

    const [sent] = await sentWith(request, name);
    expect(sent?.authorization).toBe("Bearer re_test");
    expect(sent?.email.to).toEqual(["founder@literatelives.org"]);
    expect(sent?.email.reply_to).toBe("reader@example.com");
    expect(sent?.email.subject).toBe(
      `Asking for a library: a message from ${name}`,
    );
    expect(sent?.email.from).toContain("Literate Lives website");
    expect(sent?.email.text).toContain("We run a children's home.");
  });

  test("if it cannot be sent, the form says so and keeps the message", async ({
    page,
  }) => {
    await page.goto("/get-involved");
    const message = "This one will not go through. [fail]";
    await fillForm(page, {
      name: uniqueName("Unsent test"),
      email: "reader@example.com",
      message,
    });
    await page.getByRole("button", { name: "Send message" }).click();
    const problem = page.getByRole("main").getByRole("alert");
    await expect(problem).toContainText("could not be sent");
    await expect(
      problem.getByRole("link", { name: "founder@literatelives.org" }),
    ).toHaveAttribute("href", "mailto:founder@literatelives.org");
    await expect(page.getByLabel("Message")).toHaveValue(message);
    await expect(page.getByLabel("Asking for a library")).toBeChecked();
  });

  test("an address that cannot be replied to is pointed out", async ({
    page,
  }) => {
    await page.goto("/get-involved");
    await fillForm(page, {
      name: uniqueName("Address test"),
      // The browser accepts this; there is no way to reply to it.
      email: "reader@example",
      message: "Hello.",
    });
    await page.getByRole("button", { name: "Send message" }).click();
    const email = page.getByLabel("Email");
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(email).toBeFocused();
    await expect(
      page.getByText("Enter an email address we can reply to"),
    ).toBeVisible();
  });

  test("a bot that fills in the hidden field is thanked, and nothing is sent", async ({
    page,
    request,
  }) => {
    await page.goto("/get-involved");
    const name = uniqueName("Bot test");
    await fillForm(page, {
      name,
      email: "bot@example.com",
      message: `Buy now (${name})`,
    });
    await page.locator('input[name="website"]').fill("https://spam.example", {
      force: true,
    });
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByRole("main").getByRole("status")).toHaveText(
      /Thank you for writing/,
    );
    expect(await sentWith(request, name)).toHaveLength(0);
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("the form still sends, and says so on a page of its own", async ({
      page,
      request,
    }) => {
      await page.goto("/get-involved");
      const name = uniqueName("No script test");
      await fillForm(page, {
        name,
        email: "reader@example.com",
        message: `Sent without JavaScript. (${name})`,
      });
      await page.getByRole("button", { name: "Send message" }).click();
      await expect(page).toHaveURL(/\/get-involved\/sent$/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Thank you",
      );
      expect(await sentWith(request, name)).toHaveLength(1);
    });

    test("when it cannot send, the page gives the address instead", async ({
      page,
    }) => {
      await page.goto("/get-involved");
      await fillForm(page, {
        name: uniqueName("No script unsent"),
        email: "reader@example.com",
        message: "Not this time. [fail]",
      });
      await page.getByRole("button", { name: "Send message" }).click();
      await expect(page).toHaveURL(/\/get-involved\/unsent$/);
      await expect(
        page.getByRole("main").getByRole("link", {
          name: "founder@literatelives.org",
        }),
      ).toHaveAttribute("href", "mailto:founder@literatelives.org");
    });
  });

  test("the pages for the outcome are kept out of search", async ({
    page,
    request,
  }) => {
    for (const path of ["/get-involved/sent", "/get-involved/unsent"]) {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex/,
      );
    }
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain("/get-involved/sent");
  });
});
