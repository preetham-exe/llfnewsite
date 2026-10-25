import { expect, type Page, test } from "@playwright/test";

import { publish, sanityStandIn, signature } from "./sanity";

/* Phase 8 acceptance: Libraries, Stories and Partners come from Sanity, and
   what is published in the Studio is on the live site within seconds, with
   no redeploy. The site is built against a stand-in for Sanity
   (e2e/mock-sanity.mjs). These tests change what it holds, as publishing in
   the Studio would, then call the webhook Sanity calls. They run on their
   own ("cms" in playwright.config.ts), after every other test, because they
   change content the other tests check. */

test.describe.configure({ mode: "serial" });

type Document = Record<string, unknown> & { _id: string };
type Content = {
  libraries: Document[];
  stories: Document[];
  partners: Document[];
  moments: Document[];
};

const block = (key: string, text: string) => ({
  _type: "block",
  _key: key,
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: `${key}-0`, text, marks: [] }],
});

/** A 1 x 1 PNG, standing in for the blurred copy Sanity makes of a photo. */
const lqip =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const testLibrary: Document = {
  _id: "test-library",
  number: 4,
  name: "Test Library",
  slug: "test-library",
  city: "Test City",
  partner: { slug: "mana-foundation", name: "MANA Foundation" },
  openedOn: "2026-11",
  booksPlaced: 320,
  childrenServed: 55,
  size: "medium",
  summary: "Added in the Studio by the tests.",
  photos: [
    {
      alt: "Shelves of storybooks, standing in for a photo from the Studio.",
      caption: null,
      src: "/photos/shelves-of-storybooks.jpg",
      width: 2400,
      height: 2400,
      lqip,
    },
  ],
  launchDay: [block("launch", "Launch day, as written in the Studio.")],
};

const testStory: Document = {
  _id: "test-story",
  title: "A Test Story",
  slug: "test-story",
  dek: "Written in the Studio by the tests.",
  author: "Tester",
  publishedOn: "2026-11-02",
  library: {
    slug: "qcity-community-library",
    name: "QCity Community Library",
    number: 3,
  },
  cover: null,
  body: [block("body", "The story itself, as written in the Studio.")],
};

/** Back to the start, in the stand-in and on the site. */
test.beforeAll(async ({ playwright }) => {
  const api = await playwright.request.newContext();
  await api.delete(`${sanityStandIn}/content`);
  await api.dispose();
});
test.afterAll(async ({ playwright, baseURL }) => {
  const api = await playwright.request.newContext({ baseURL });
  await api.delete(`${sanityStandIn}/content`);
  await publish(api, { _type: "library" });
  await api.dispose();
});

/** Changes what the stand-in holds, as publishing in the Studio would. */
async function changeContent(
  page: Page,
  change: (content: Content) => void,
): Promise<void> {
  const response = await page.request.get(`${sanityStandIn}/content`);
  const { content } = (await response.json()) as { content: Content };
  change(content);
  await page.request.put(`${sanityStandIn}/content`, { data: content });
}

/** Publishes in the Studio: Sanity calls the webhook, which must take it. */
async function publishAndWait(page: Page, document: { _type: string }) {
  const response = await publish(page.request, document);
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ revalidated: true });
}

test("the webhook turns away anything Sanity did not sign", async ({
  request,
}) => {
  const body = JSON.stringify({ _type: "library" });
  const post = (headers: Record<string, string>) =>
    request.post("/api/revalidate", {
      data: body,
      headers: { "content-type": "application/json", ...headers },
    });

  expect((await post({})).status()).toBe(401);
  for (const forged of [
    signature(body, "not-the-secret"),
    signature(JSON.stringify({ _type: "story" })),
    "t=1,v1=nonsense",
  ]) {
    expect((await post({ "sanity-webhook-signature": forged })).status()).toBe(
      401,
    );
  }
});

test("a library published in the Studio is on the site without a redeploy", async ({
  page,
}) => {
  await changeContent(page, (content) => {
    content.libraries.push(testLibrary);
    const mana = content.partners.find((p) => p._id === "mana-foundation");
    if (mana)
      mana.libraries = [
        { slug: "test-library", name: "Test Library", number: 4 },
      ];
  });

  // Until Sanity calls the webhook, pages built ahead show what they had.
  // (A page that was never built, like the new library's, is built with
  // what is published whenever it is first visited.)
  await page.goto("/libraries");
  await expect(page.getByRole("link", { name: "Test Library" })).toHaveCount(0);

  await publishAndWait(page, { _type: "library" });

  // The list of libraries, at once.
  await page.goto("/libraries");
  await expect(page.getByRole("link", { name: "Test Library" })).toBeVisible();

  // Its own page.
  const response = await page.goto("/libraries/test-library");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Test Library",
  );
  const card = page.locator(".catalogue-card");
  for (const [term, detail] of [
    ["Opened", "November 2026"],
    ["City", "Test City"],
    ["Partner", "MANA Foundation"],
    ["Books placed", "320"],
    ["Children", "55"],
    ["Size", "Medium"],
  ] as const) {
    await expect(
      card.locator(".catalogue-card__row", { hasText: term }),
    ).toContainText(detail);
  }
  await expect(
    page.getByRole("img", { name: /Shelves of storybooks/ }),
  ).toBeVisible();
  await expect(
    page.getByText("Launch day, as written in the Studio."),
  ).toBeVisible();
  // The photo shows its blurred copy while it loads.
  const html = await (await page.request.get("/libraries/test-library")).text();
  expect(html).toContain(lqip.slice("data:image/png;base64,".length, 60));

  // Everywhere else it counts.
  await page.goto("/");
  // (The number screen readers get: the one on screen counts up from 0.)
  await expect(
    page
      .locator("dl div", { hasText: "libraries so far" })
      .locator("dd .sr-only"),
  ).toHaveText("4");
  await page.goto("/partners");
  await expect(
    page
      .getByRole("listitem")
      .filter({ hasText: "MANA Foundation" })
      .getByRole("link", { name: "Test Library" }),
  ).toBeVisible();
  const sitemap = await (await page.request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/libraries/test-library");
});

test("an edit and an unpublish reach the site too", async ({ page }) => {
  await changeContent(page, (content) => {
    const qcity = content.libraries.find(
      (l) => l._id === "qcity-community-library",
    );
    if (qcity) qcity.summary = "Edited in the Studio by the tests.";
    content.libraries = content.libraries.filter(
      (l) => l._id !== "test-library",
    );
    const mana = content.partners.find((p) => p._id === "mana-foundation");
    if (mana) mana.libraries = [];
  });
  await publishAndWait(page, { _type: "library" });

  await page.goto("/libraries/qcity-community-library");
  await expect(
    page.getByText("Edited in the Studio by the tests."),
  ).toBeVisible();
  expect((await page.goto("/libraries/test-library"))?.status()).toBe(404);
  await page.goto("/libraries");
  await expect(page.getByRole("link", { name: "Test Library" })).toHaveCount(0);
});

test("a story published in the Studio gets its own page", async ({ page }) => {
  await changeContent(page, (content) => {
    content.stories.push(testStory);
  });
  await publishAndWait(page, { _type: "story" });

  // Newest first: the undated placeholder story comes after it.
  await page.goto("/stories");
  const titles = page.locator("main li h2");
  await expect(titles.first()).toHaveText("A Test Story");

  await page.goto("/stories/test-story");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "A Test Story",
  );
  await expect(page.getByText("2 November 2026")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "QCity Community Library" }),
  ).toHaveAttribute("href", "/libraries/qcity-community-library");
  await expect(
    page.getByText("The story itself, as written in the Studio."),
  ).toBeVisible();
});

test("a gallery moment published in the Studio becomes the Gallery's first plates", async ({
  page,
}) => {
  await changeContent(page, (content) => {
    content.moments.push({
      _id: "test-moment",
      title: "Book drive",
      date: "2026-10-12",
      place: "Hyderabad",
      photos: [
        {
          alt: "Shelves of storybooks, standing in for a book drive.",
          caption: "Books sorted and ready for the next library.",
          src: "/photos/shelves-of-storybooks.jpg",
          width: 2400,
          height: 2400,
          lqip: null,
        },
      ],
    });
  });
  await publishAndWait(page, { _type: "moment" });

  await page.goto("/gallery");
  // The newest, so plate I.
  const first = page.locator("figure.plate-entry").first();
  await expect(first.locator(".plate-entry__numeral")).toHaveText("Plate I");
  await expect(first.locator(".plate-entry__text")).toHaveText(
    "Books sorted and ready for the next library.",
  );
  await expect(first.locator(".plate-entry__from")).toHaveText("Book drive");
  await expect(first.locator(".plate-entry__when")).toHaveText(
    "12 October 2026, Hyderabad",
  );
  await expect(page.locator("figure.plate-entry")).toHaveCount(4);
});

test("a project with nothing in it yet shows the seed, not an empty site", async ({
  page,
}) => {
  // As when the project ID is set before `pnpm sanity:seed` has run.
  await changeContent(page, (content) => {
    content.libraries = [];
    content.stories = [];
    content.partners = [];
    content.moments = [];
  });
  await publishAndWait(page, { _type: "library" });

  await page.goto("/libraries");
  await expect(
    page.getByRole("link", { name: "QCity Community Library" }),
  ).toBeVisible();
  await page.goto("/partners");
  await expect(
    page.getByRole("heading", { name: "Robinhood Army" }),
  ).toBeVisible();
});
