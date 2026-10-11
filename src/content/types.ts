import type { Route } from "next";

/*
 * Content types.
 *
 * Libraries, stories and partners move to Sanity in Phase 8. Each type here is
 * the exact shape the GROQ query for that page will return (references
 * resolved, slugs as plain strings, images with their dimensions), so the pages
 * will not change when the content source does.
 */

/** Anything the founder still has to supply. Rendered visibly, never shipped. */
export type Todo = `TODO: ${string}`;

/* Rich text: the subset of Portable Text (Sanity's format) the site uses. */

export type Span = {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
};

export type LinkMark = {
  _type: "link";
  _key: string;
  href: string;
};

export type Block = {
  _type: "block";
  _key: string;
  style: "normal" | "h2" | "h3" | "blockquote";
  children: Span[];
  markDefs: LinkMark[];
};

export type RichText = Block[];

/* Pictures */

export type Photo = {
  _type: "photo";
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
};

/** A labelled box with the right proportions, used until the real photo arrives. */
export type PhotoPlaceholder = {
  _type: "photoPlaceholder";
  /** Width divided by height. */
  aspectRatio: number;
  label: string;
  alt: string;
};

export type Picture = Photo | PhotoPlaceholder;

/** A resolved reference to another document. */
export type Reference = {
  slug: string;
  name: string;
};

/* Documents */

export type LibrarySize = "small" | "medium" | "large";

export type Library = {
  _id: string;
  _type: "library";
  slug: string;
  /** Library #1, #2 and so on, in the order they opened. */
  number: number;
  name: string | Todo;
  city: string | Todo;
  partner: Reference | Todo;
  /** Year and month ("2025-01") or a full ISO date. */
  openedOn: string | Todo;
  booksPlaced: number | Todo;
  childrenServed: number | Todo;
  size: LibrarySize | Todo;
  summary: string | Todo;
  launchDay: RichText;
  photos: Picture[];
};

export type Story = {
  _id: string;
  _type: "story";
  slug: string;
  title: string | Todo;
  dek: string | Todo;
  author: string | Todo;
  publishedOn: string | Todo;
  library: Reference | null;
  cover: Picture | null;
  body: RichText;
};

export type Partner = {
  _id: string;
  _type: "partner";
  slug: string;
  name: string;
  /** One line on who they are. */
  about: string | Todo;
  /** What the partnership has produced so far. */
  produced: string | Todo;
  website: string | Todo | null;
  libraries: Reference[];
};

/* The shelf */

export type BookId =
  | "our-story"
  | "libraries"
  | "how-we-build"
  | "partners"
  | "stories"
  | "get-involved"
  | "donate";

export type Cloth =
  "navy" | "oxblood" | "forest" | "slate" | "ochre" | "linen" | "teal";

/** Spine lettering: gold foil, cream, or dark ink on the light cloths. */
export type Lettering = "foil" | "cream" | "ink";

export type Book = {
  id: BookId;
  spineTitle: string;
  href: Route;
  /** One line for the label card under the book. */
  label: string;
  cloth: Cloth;
  lettering: Lettering;
};
