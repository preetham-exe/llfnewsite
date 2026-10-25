import { isTodo, paragraphs, todo } from "@/content/helpers";
import type {
  Block,
  Library,
  LibrarySize,
  LinkMark,
  Moment,
  Partner,
  Photo,
  RichText,
  Span,
  Story,
} from "@/content/types";

/*
 * Turns what contentQuery returns into the site's content types, so pages
 * never know where their content came from. Anything left empty in the
 * Studio becomes a TODO note, shown highlighted on the site, exactly as the
 * local content marked what was still to come. A note typed into a field
 * ("TODO: ...") is shown the same way.
 */

export type Content = {
  libraries: Library[];
  stories: Story[];
  partners: Partner[];
  moments: Moment[];
};

/* What the query returns. Anything not filled in comes back as null. */

export type RawPhoto = {
  alt?: string | null;
  caption?: string | null;
  src?: string | null;
  width?: number | null;
  height?: number | null;
  lqip?: string | null;
};

export type RawLibraryReference = {
  slug?: string | null;
  name?: string | null;
  number?: number | null;
};

type RawSpan = {
  _type?: string;
  _key?: string;
  text?: string;
  marks?: string[];
};
type RawMarkDef = { _type?: string; _key?: string; href?: string };
export type RawBlock = {
  _type?: string;
  _key?: string;
  style?: string;
  children?: RawSpan[];
  markDefs?: RawMarkDef[];
};

export type RawLibrary = {
  _id: string;
  number: number;
  slug: string;
  name?: string | null;
  city?: string | null;
  partner?: { slug?: string | null; name?: string | null } | null;
  openedOn?: string | null;
  booksPlaced?: number | null;
  childrenServed?: number | null;
  size?: string | null;
  summary?: string | null;
  photos?: RawPhoto[] | null;
  launchDay?: RawBlock[] | null;
};

export type RawStory = {
  _id: string;
  slug: string;
  title?: string | null;
  dek?: string | null;
  author?: string | null;
  publishedOn?: string | null;
  library?: RawLibraryReference | null;
  cover?: RawPhoto | null;
  body?: RawBlock[] | null;
};

export type RawPartner = {
  _id: string;
  slug: string;
  name?: string | null;
  about?: string | null;
  produced?: string | null;
  website?: string | null;
  libraries?: RawLibraryReference[] | null;
};

export type RawMoment = {
  _id: string;
  title?: string | null;
  date?: string | null;
  place?: string | null;
  photos?: RawPhoto[] | null;
};

export type RawContent = {
  libraries: RawLibrary[];
  stories: RawStory[];
  partners: RawPartner[];
  /** Missing from content saved before the Gallery existed. */
  moments?: RawMoment[];
};

/** Filled in: not null, and not just spaces. */
const given = (value: string | null | undefined): value is string =>
  typeof value === "string" && value.trim() !== "";

/** A library's name, or "Library #3" until it has one. */
function libraryLabel(
  name: string | null | undefined,
  number: number | null | undefined,
): string {
  return given(name) && !isTodo(name) ? name : `Library #${number ?? "?"}`;
}

export function toPhoto(raw: RawPhoto): Photo | null {
  if (!given(raw.src) || !raw.width || !raw.height) return null;
  return {
    _type: "photo",
    src: raw.src,
    width: raw.width,
    height: raw.height,
    alt: given(raw.alt) ? raw.alt : todo("Describe this photo"),
    ...(given(raw.caption) ? { caption: raw.caption } : {}),
    ...(given(raw.lqip) ? { lqip: raw.lqip } : {}),
  };
}

const blockStyles: ReadonlySet<string> = new Set([
  "normal",
  "h2",
  "h3",
  "blockquote",
]);

/**
 * Keeps what the site can show: paragraphs, headings and quotes, with
 * italics and links. Empty paragraphs (the editor often leaves one at the
 * end) are dropped.
 */
export function toRichText(raw: RawBlock[] | null | undefined): RichText {
  return (raw ?? []).flatMap((block, index): Block[] => {
    if (block._type !== "block") return [];
    const children = (block.children ?? []).flatMap((span, i): Span[] =>
      span._type === "span" && typeof span.text === "string"
        ? [
            {
              _type: "span",
              _key: span._key ?? `${index}-${i}`,
              text: span.text,
              marks: span.marks ?? [],
            },
          ]
        : [],
    );
    if (!children.some((span) => span.text.trim() !== "")) return [];
    const markDefs = (block.markDefs ?? []).flatMap((mark): LinkMark[] =>
      mark._type === "link" && mark._key && given(mark.href)
        ? [{ _type: "link", _key: mark._key, href: mark.href }]
        : [],
    );
    return [
      {
        _type: "block",
        _key: block._key ?? String(index),
        style:
          block.style && blockStyles.has(block.style)
            ? (block.style as Block["style"])
            : "normal",
        children,
        markDefs,
      },
    ];
  });
}

const librarySizes: readonly string[] = ["small", "medium", "large"];

export function toLibrary(raw: RawLibrary): Library {
  const label = libraryLabel(raw.name, raw.number);
  const photos = (raw.photos ?? []).flatMap((item) => toPhoto(item) ?? []);
  const launchDay = toRichText(raw.launchDay);
  return {
    _id: raw._id,
    _type: "library",
    slug: raw.slug,
    number: raw.number,
    name: given(raw.name) ? raw.name : todo(`Name of Library #${raw.number}`),
    city: given(raw.city) ? raw.city : todo(`City of ${label}`),
    partner:
      raw.partner && given(raw.partner.name)
        ? { slug: raw.partner.slug ?? "", name: raw.partner.name }
        : todo(`Partner organisation for ${label}`),
    openedOn: given(raw.openedOn)
      ? raw.openedOn
      : todo(`Month and year ${label} opened`),
    booksPlaced:
      typeof raw.booksPlaced === "number"
        ? raw.booksPlaced
        : todo(`Books placed in ${label}`),
    childrenServed:
      typeof raw.childrenServed === "number"
        ? raw.childrenServed
        : todo(`Children served by ${label}`),
    size:
      raw.size && librarySizes.includes(raw.size)
        ? (raw.size as LibrarySize)
        : todo(`Size of ${label}: small, medium or large`),
    summary: given(raw.summary)
      ? raw.summary
      : todo(`One or two sentences about ${label}`),
    launchDay: launchDay.length
      ? launchDay
      : paragraphs(
          `${raw._id}-launch`,
          todo(`A short account of launch day at ${label}`),
        ),
    photos: photos.length
      ? photos
      : [
          {
            _type: "photoPlaceholder",
            aspectRatio: 4 / 3,
            label: `Photo: ${label}`,
            alt: todo(`Describe the photo of ${label}`),
          },
        ],
  };
}

export function toStory(raw: RawStory): Story {
  const body = toRichText(raw.body);
  return {
    _id: raw._id,
    _type: "story",
    slug: raw.slug,
    title: given(raw.title) ? raw.title : todo("Title of this story"),
    dek: given(raw.dek)
      ? raw.dek
      : todo("One sentence that says what the story is about"),
    author: given(raw.author)
      ? raw.author
      : todo("Author's name, or first name only for a child"),
    publishedOn: given(raw.publishedOn)
      ? raw.publishedOn
      : todo("Publication date"),
    library: given(raw.library?.slug)
      ? {
          slug: raw.library.slug,
          name: libraryLabel(raw.library.name, raw.library.number),
        }
      : null,
    cover: raw.cover ? toPhoto(raw.cover) : null,
    body: body.length
      ? body
      : paragraphs(`${raw._id}-body`, todo("The story itself")),
  };
}

export function toPartner(raw: RawPartner): Partner {
  const name = given(raw.name) ? raw.name : todo("The partner's name");
  return {
    _id: raw._id,
    _type: "partner",
    slug: raw.slug,
    name,
    about: given(raw.about) ? raw.about : todo(`One line on who ${name} are`),
    produced: given(raw.produced)
      ? raw.produced
      : todo(`What the partnership with ${name} produced`),
    website: given(raw.website) ? raw.website : null,
    libraries: (raw.libraries ?? []).flatMap((library) =>
      given(library.slug)
        ? [
            {
              slug: library.slug,
              name: libraryLabel(library.name, library.number),
            },
          ]
        : [],
    ),
  };
}

export function toMoment(raw: RawMoment): Moment {
  return {
    _id: raw._id,
    _type: "moment",
    title: given(raw.title) ? raw.title : todo("What this moment was"),
    date: given(raw.date) ? raw.date : todo("When this was"),
    place: given(raw.place) ? raw.place : null,
    photos: (raw.photos ?? []).flatMap((item) => toPhoto(item) ?? []),
  };
}

/**
 * The order the site shows things in: libraries as they opened, the newest
 * stories and moments first (undated ones last), and partners we have built
 * libraries with first, in the order those opened, then the rest by name.
 */
export function sortContent({
  libraries,
  stories,
  partners,
  moments,
}: Content): Content {
  const numbers = new Map(
    libraries.map((library) => [library.slug, library.number]),
  );
  const firstLibrary = (partner: Partner) =>
    Math.min(
      ...partner.libraries.map(
        (library) => numbers.get(library.slug) ?? Infinity,
      ),
    );
  const newest = (a: string, b: string) =>
    (isTodo(b) ? "" : b).localeCompare(isTodo(a) ? "" : a);

  return {
    libraries: [...libraries].sort((a, b) => a.number - b.number),
    stories: [...stories].sort((a, b) => newest(a.publishedOn, b.publishedOn)),
    moments: [...moments].sort((a, b) => newest(a.date, b.date)),
    partners: [...partners].sort(
      (a, b) =>
        firstLibrary(a) - firstLibrary(b) || a.name.localeCompare(b.name, "en"),
    ),
  };
}

export function mapContent(raw: RawContent): Content {
  return sortContent({
    libraries: raw.libraries.map(toLibrary),
    stories: raw.stories.map(toStory),
    partners: raw.partners.map(toPartner),
    moments: (raw.moments ?? []).map(toMoment),
  });
}
