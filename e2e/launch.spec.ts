import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

/* Phase 9: polish for launch. Every section shares its own book's cover,
   search engines get structured data for libraries, stories and the
   Gallery, and a missing page shows a small shelf with a gap in it. These
   read the HTML and the images themselves, so they run once. */

test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium-desktop",
    "No browser differences: once is enough",
  );
});

/** The page's share image, fetched from wherever its tag points. */
async function shareImage(
  request: APIRequestContext,
  page: Page,
  path: string,
) {
  await page.goto(path);
  const url = await page
    .locator('meta[property="og:image"]')
    .first()
    .getAttribute("content");
  expect(url, path).toBeTruthy();
  const { pathname, search } = new URL(url!);
  const response = await request.get(`${pathname}${search}`);
  expect(response.status(), path).toBe(200);
  expect(response.headers()["content-type"], path).toBe("image/png");
  return { pathname, body: await response.body() };
}

/** A PNG's width and height, from its header. */
const pngSize = (png: Buffer) => [png.readUInt32BE(16), png.readUInt32BE(20)];

test("every section shares its own book's cover; the homepage shares the shelf", async ({
  page,
  request,
}) => {
  const home = await shareImage(request, page, "/");
  expect(home.pathname).toBe("/opengraph-image");
  expect(pngSize(home.body)).toEqual([1200, 630]);

  const covers = new Set<string>();
  for (const path of [
    "/our-story",
    "/libraries",
    "/libraries/qcity-community-library",
    "/how-we-build",
    "/partners",
    "/stories",
    "/stories/first-story",
    "/gallery",
    "/get-involved",
    "/donate",
  ]) {
    const image = await shareImage(request, page, path);
    expect(image.pathname, path).toMatch(
      new RegExp(`^${path}/opengraph-image`),
    );
    expect(pngSize(image.body), path).toEqual([1200, 630]);
    covers.add(image.body.toString("base64"));
  }
  // Each one its own.
  expect(covers.size).toBe(10);

  // A page without one of its own keeps the shelf.
  const sent = await shareImage(request, page, "/get-involved/sent");
  expect(sent.pathname).toBe("/opengraph-image");
});

/** The structured data on a page, by type. */
async function structuredData(page: Page, path: string) {
  await page.goto(path);
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  return blocks.map((block) => JSON.parse(block) as Record<string, unknown>);
}

test("libraries, stories and the Gallery describe themselves to search engines", async ({
  page,
}) => {
  const library = await structuredData(
    page,
    "/libraries/qcity-community-library",
  );
  expect(library).toContainEqual(
    expect.objectContaining({
      "@type": "Library",
      name: "QCity Community Library",
      foundingDate: "2026-04",
      parentOrganization: expect.objectContaining({ "@type": "NGO" }),
    }),
  );
  // Details still to come are left out, not published as notes.
  expect(JSON.stringify(library)).not.toContain("TODO");
  const trail = library.find((data) => data["@type"] === "BreadcrumbList");
  expect(
    (trail?.itemListElement as { name: string }[]).map((step) => step.name),
  ).toEqual([
    "Literate Lives Foundation",
    "The Libraries",
    "QCity Community Library",
  ]);

  const story = await structuredData(page, "/stories/first-story");
  expect(story).toContainEqual(
    expect.objectContaining({ "@type": "Article", headline: "A story" }),
  );
  expect(JSON.stringify(story)).not.toContain("TODO");

  const gallery = await structuredData(page, "/gallery");
  const images = gallery.find((data) => data["@type"] === "ImageGallery")
    ?.image as { contentUrl: string }[];
  expect(images).toHaveLength(3);
  expect(images[0]?.contentUrl).toMatch(/boy-reading-by-new-shelf\.jpg$/);
});

test("a missing page shows a small shelf with a gap where a book should be", async ({
  page,
}) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  const shelf = page.locator(".gap-shelf");
  await expect(shelf).toBeVisible();
  await expect(shelf).toHaveAttribute("aria-hidden", "true");
  await expect(shelf.locator(".gap-shelf__book")).toHaveCount(7);
  await expect(shelf.locator(".gap-shelf__gap")).toHaveCount(1);
});

test("analytics load only on Vercel", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('script[src*="/_vercel/"]')).toHaveCount(0);
});

test.describe("crawlers and link previews", () => {
  // Lighthouse's own user agent: Next counts it among the "HTML-limited"
  // bots, which used to get a server re-render of each page.
  test.use({
    userAgent:
      "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36 Chrome-Lighthouse",
  });

  test("get the prerendered page, which hydrates without an error", async ({
    page,
    request,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    const response = await request.get("/", {
      headers: { "user-agent": await page.evaluate(() => navigator.userAgent) },
    });
    // Prerendered (next start sends the header twice: "1, 1").
    expect(response.headers()["x-nextjs-prerender"]).toMatch(/^1\b/);

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // The shelf's own bar: its name and Donate, not a section's.
    await expect(
      page.getByRole("banner").getByRole("link", { name: /Back to the shelf/ }),
    ).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});
