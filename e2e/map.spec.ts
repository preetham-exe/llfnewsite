import { expect, test } from "@playwright/test";

import { isTodo } from "../src/content/helpers";
import { libraries } from "../src/content/libraries";
import { moments } from "../src/content/moments";
import { partners } from "../src/content/partners";
import { stories } from "../src/content/stories";
import { galleryPlates, roman } from "../src/lib/gallery";
import {
  mapContent,
  type RawContent,
  sortContent,
  toLibrary,
  toMoment,
  toPartner,
  toPhoto,
  toRichText,
  toStory,
} from "../src/sanity/map";
import standIn from "./sanity-content.json" with { type: "json" };

/* Phase 8: what Sanity returns becomes the site's content (src/sanity/map.ts).
   Plain functions, so they run once, outside a browser. */

test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium-desktop",
    "No browser involved: once is enough",
  );
});

/** The same content, whatever keys its text blocks were given. */
function withoutKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== "_key")
        .map(([key, item]) => [key, withoutKeys(item)]),
    );
  }
  return value;
}

test("the stand-in for Sanity holds exactly the seed, as imported", () => {
  // So every other test, run against the stand-in, checks the same pages
  // the seed gives without Sanity.
  expect(withoutKeys(mapContent(standIn as RawContent))).toEqual(
    withoutKeys(sortContent({ libraries, stories, partners, moments })),
  );
});

test("a library with only its number and address shows what is missing", () => {
  const library = toLibrary({ _id: "x", number: 7, slug: "x" });
  expect(library.name).toBe("TODO: Name of Library #7");
  for (const [field, note] of [
    ["city", "City of Library #7"],
    ["partner", "Partner organisation for Library #7"],
    ["openedOn", "Month and year Library #7 opened"],
    ["booksPlaced", "Books placed in Library #7"],
    ["childrenServed", "Children served by Library #7"],
    ["size", "Size of Library #7: small, medium or large"],
    ["summary", "One or two sentences about Library #7"],
  ] as const) {
    expect(library[field]).toBe(`TODO: ${note}`);
  }
  expect(library.launchDay[0]?.children[0]?.text).toBe(
    "TODO: A short account of launch day at Library #7",
  );
  // A placeholder with a photo's proportions, until there is a photo.
  expect(library.photos).toEqual([
    {
      _type: "photoPlaceholder",
      aspectRatio: 4 / 3,
      label: "Photo: Library #7",
      alt: "TODO: Describe the photo of Library #7",
    },
  ]);
});

test("a named library's notes use its name; a TODO name does not count", () => {
  const named = toLibrary({
    _id: "x",
    number: 7,
    slug: "x",
    name: "Hill Library",
  });
  expect(named.city).toBe("TODO: City of Hill Library");
  const unnamed = toLibrary({
    _id: "x",
    number: 7,
    slug: "x",
    name: "TODO: Name of Library #7",
    size: "enormous",
    booksPlaced: 0,
  });
  expect(unnamed.name).toBe("TODO: Name of Library #7");
  expect(unnamed.city).toBe("TODO: City of Library #7");
  // Only the sizes the Studio offers; zero is a number, not a gap.
  expect(isTodo(unnamed.size)).toBe(true);
  expect(unnamed.booksPlaced).toBe(0);
});

test("photos without an uploaded file are left out; the blurred copy is kept", () => {
  expect(toPhoto({ alt: "A shelf", src: null })).toBeNull();
  expect(
    toPhoto({ alt: " ", src: "/a.jpg", width: 4, height: 3, lqip: "data:x" }),
  ).toEqual({
    _type: "photo",
    src: "/a.jpg",
    width: 4,
    height: 3,
    alt: "TODO: Describe this photo",
    lqip: "data:x",
  });
  const library = toLibrary({
    _id: "x",
    number: 1,
    slug: "x",
    photos: [
      { alt: "Half uploaded" },
      { alt: "A shelf", src: "/a.jpg", width: 4, height: 3 },
    ],
  });
  expect(library.photos).toHaveLength(1);
});

test("text keeps paragraphs, headings, quotes, italics and links, nothing else", () => {
  const text = toRichText([
    {
      _type: "block",
      _key: "a",
      style: "h2",
      markDefs: [
        { _type: "link", _key: "l", href: "https://example.org" },
        { _type: "link", _key: "empty", href: "" },
      ],
      children: [
        { _type: "span", _key: "a0", text: "Read ", marks: ["em"] },
        { _type: "span", _key: "a1", text: "this", marks: ["l"] },
      ],
    },
    {
      _type: "block",
      _key: "b",
      style: "h6",
      children: [{ _type: "span", text: "Small" }],
    },
    {
      _type: "block",
      _key: "c",
      style: "normal",
      children: [{ _type: "span", text: "  " }],
    },
    { _type: "image", _key: "d" },
  ]);
  expect(text).toHaveLength(2);
  expect(text[0]?.style).toBe("h2");
  expect(text[0]?.markDefs).toEqual([
    { _type: "link", _key: "l", href: "https://example.org" },
  ]);
  expect(text[0]?.children.map((span) => span.marks)).toEqual([["em"], ["l"]]);
  // A style the site has no design for reads as a paragraph.
  expect(text[1]?.style).toBe("normal");
});

test("stories and partners fill their gaps, and links need an address", () => {
  const story = toStory({
    _id: "s",
    slug: "s",
    library: { slug: null, name: "Hill Library", number: 7 },
    cover: { alt: "No file yet" },
  });
  expect(story.title).toBe("TODO: Title of this story");
  expect(story.library).toBeNull();
  expect(story.cover).toBeNull();
  expect(story.body[0]?.children[0]?.text).toBe("TODO: The story itself");
  expect(
    toStory({ _id: "s", slug: "s", library: { slug: "x", number: 7 } }).library,
  ).toEqual({ slug: "x", name: "Library #7" });

  const partner = toPartner({
    _id: "p",
    slug: "p",
    name: "Hill Trust",
    website: "",
    libraries: [{ slug: "x", name: "TODO: Name of Library #7", number: 7 }],
  });
  expect(partner.about).toBe("TODO: One line on who Hill Trust are");
  expect(partner.website).toBeNull();
  expect(partner.libraries).toEqual([{ slug: "x", name: "Library #7" }]);
});

test("the order: libraries as they opened, newest stories, partners with libraries first", () => {
  const { libraries, stories, partners } = mapContent({
    libraries: [
      { _id: "b", number: 2, slug: "b" },
      { _id: "a", number: 1, slug: "a" },
    ],
    stories: [
      { _id: "old", slug: "old", publishedOn: "2025-03-01" },
      { _id: "undated", slug: "undated" },
      { _id: "new", slug: "new", publishedOn: "2026-10-01" },
    ],
    partners: [
      {
        _id: "z",
        slug: "z",
        name: "Zinnia Trust",
        libraries: [{ slug: "a", number: 1 }],
      },
      {
        _id: "y",
        slug: "y",
        name: "Yarrow Trust",
        libraries: [{ slug: "b", number: 2 }],
      },
      { _id: "c", slug: "c", name: "Cedar Trust" },
      { _id: "a", slug: "a", name: "Aster Trust" },
    ],
  });
  expect(libraries.map((l) => l.number)).toEqual([1, 2]);
  expect(stories.map((s) => s.slug)).toEqual(["new", "old", "undated"]);
  expect(partners.map((p) => p.name)).toEqual([
    "Zinnia Trust",
    "Yarrow Trust",
    "Aster Trust",
    "Cedar Trust",
  ]);
});

test("a gallery moment fills its gaps and keeps only uploaded photos", () => {
  const moment = toMoment({
    _id: "m",
    photos: [
      { alt: "Not uploaded yet" },
      { alt: "A book drive", src: "/a.jpg", width: 4, height: 3 },
    ],
  });
  expect(moment.title).toBe("TODO: What this moment was");
  expect(moment.date).toBe("TODO: When this was");
  expect(moment.photos.map((photo) => photo.alt)).toEqual(["A book drive"]);
});

test("the Gallery numbers every real photo as a plate, newest first", () => {
  const photo = (alt: string) => ({
    _id: alt,
    alt,
    src: `/${alt}.jpg`,
    width: 4,
    height: 3,
  });
  const content = mapContent({
    libraries: [
      {
        _id: "a",
        number: 1,
        slug: "a",
        name: "Hill Library",
        openedOn: "2025-01",
        photos: [photo("hill")],
      },
      { _id: "b", number: 2, slug: "b", openedOn: "2025-06" },
      {
        _id: "c",
        number: 3,
        slug: "c",
        name: "River Library",
        openedOn: "2026-04",
        photos: [photo("river-1"), photo("river-2")],
      },
    ],
    stories: [],
    partners: [],
    moments: [
      {
        _id: "m1",
        title: "Book drive",
        date: "2026-06-14",
        photos: [photo("drive")],
      },
      { _id: "m2", title: "Undated", photos: [photo("undated")] },
    ],
  });
  const plates = galleryPlates(content);
  expect(plates.map((plate) => [plate.numeral, plate.photo.alt])).toEqual([
    ["I", "drive"],
    ["II", "river-1"],
    ["III", "river-2"],
    ["IV", "hill"],
    ["V", "undated"],
  ]);
  // Library #2 has only a placeholder: no plate.
  expect(plates.some((plate) => plate.from === "Library #2")).toBe(false);
  expect(plates[1]).toMatchObject({
    anchor: "plate-2",
    from: "River Library",
    href: "/libraries/c",
    when: "2026-04",
  });
  expect(plates[0]?.href).toBeNull();
});

test("plate numbers are Roman numerals", () => {
  expect([1, 4, 9, 14, 40, 49, 90, 2026].map(roman)).toEqual([
    "I",
    "IV",
    "IX",
    "XIV",
    "XL",
    "XLIX",
    "XC",
    "MMXXVI",
  ]);
});
