import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { MONOGRAM } from "@/components/brand/paths";
import { standing } from "@/components/shelf/proportions";
import { books, getBook } from "@/content/books";
import { isTodo } from "@/content/helpers";
import { site } from "@/content/site";
import type { BookId, Cloth, Lettering, Photo, Todo } from "@/content/types";

import { roman } from "./gallery";

/*
 * Share images (Open Graph): the picture a page shows when it is shared.
 * Each section shares as its own book's cover, in its cloth, with a photo
 * tipped in when the page has one; the homepage shares the shelf. Drawn at
 * build time with next/og, which takes inline styles only.
 */

export const shareSize = { width: 1200, height: 630 };
export const shareType = "image/png";

/** The cloths and lettering, as in globals.css. */
export const clothColors: Record<Cloth, string> = {
  navy: "#23314b",
  oxblood: "#5e2129",
  forest: "#2f4a3a",
  slate: "#4a5560",
  ochre: "#b8893a",
  linen: "#d9cdb4",
  plum: "#4b2d42",
  teal: "#2f5b5a",
};
const letteringColors: Record<Lettering, string> = {
  foil: "#c9a96e",
  cream: "#efe6d2",
  ink: "#1f1a15",
};

const fontDir = join(process.cwd(), "src/assets/og");
const [literata, literataItalic] = await Promise.all([
  readFile(join(fontDir, "literata-display-regular.ttf")),
  readFile(join(fontDir, "literata-display-italic.ttf")),
]);
export const shareFonts = [
  {
    name: "Literata",
    data: literata,
    style: "normal" as const,
    weight: 400 as const,
  },
  {
    name: "Literata",
    data: literataItalic,
    style: "italic" as const,
    weight: 400 as const,
  },
];

/**
 * A photo for next/og: from Sanity's CDN, cropped to the space; from
 * public/, read from disk.
 */
async function photoSource(photo: Photo, width: number, height: number) {
  if (photo.src.startsWith("/")) {
    const file = await readFile(join(process.cwd(), "public", photo.src));
    return `data:image/jpeg;base64,${file.toString("base64")}`;
  }
  const url = new URL(photo.src);
  url.search = new URLSearchParams({
    w: String(width * 2),
    h: String(height * 2),
    fit: "crop",
    fm: "jpg",
    q: "82",
  }).toString();
  return url.toString();
}

type CoverProps = {
  book: BookId;
  /** The page's own title: a section's name, a library's, a story's. */
  title: string | Todo;
  /** The line above it: "Chapter VI", "Library #3". */
  kicker: string;
  /** Tipped in on the right, when the page has a photo. */
  photo?: Photo | null;
};

/** A section's share image: its book's cover. */
export async function bookCover({ book, title, kicker, photo }: CoverProps) {
  const { cloth, lettering } = getBook(book);
  const ink = letteringColors[lettering];
  const shown = isTodo(title) ? getBook(book).spineTitle : title;
  const plate = { width: 330, height: 410 };
  const source = photo
    ? await photoSource(photo, plate.width, plate.height)
    : null;

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: clothColors[cloth],
        color: ink,
        fontFamily: "Literata",
      }}
    >
      {/* The hinge of the front board. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: 56,
          backgroundImage:
            "linear-gradient(90deg, rgba(0,0,0,0.38), rgba(0,0,0,0.06) 70%, rgba(255,255,255,0.07))",
        }}
      />
      {/* Two fine rules, blocked in the cover. */}
      <div
        style={{
          position: "absolute",
          top: 34,
          right: 34,
          bottom: 34,
          left: 86,
          border: `2px solid ${ink}`,
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 44,
          right: 44,
          bottom: 44,
          left: 96,
          border: `1px solid ${ink}`,
          opacity: 0.35,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: source ? 640 : 960,
          padding: "104px 0 92px 144px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              opacity: 0.85,
            }}
          >
            {kicker}
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: shown.length > 26 ? 62 : 86,
              lineHeight: 1.06,
            }}
          >
            {shown}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <svg width="76" height="44" viewBox={MONOGRAM.viewBox}>
            <path fill={ink} fillRule="evenodd" d={MONOGRAM.d} />
          </svg>
          <div
            style={{
              // Narrower beside a photo, so the name stays on one line.
              fontSize: source ? 19 : 22,
              letterSpacing: source ? 2.5 : 4,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {site.name}
          </div>
        </div>
      </div>

      {source && (
        <div
          style={{
            position: "absolute",
            top: 96,
            right: 108,
            display: "flex",
            padding: 14,
            backgroundColor: "#fcfaf5",
            boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
            transform: "rotate(1.5deg)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- next/og draws plain img elements. */}
          <img
            src={source}
            alt=""
            width={plate.width}
            height={plate.height}
            style={{ objectFit: "cover" }}
          />
        </div>
      )}
    </div>,
    { ...shareSize, fonts: shareFonts },
  );
}

/** A section's cover: its book's title, and its chapter in shelf order. */
export function sectionCover(book: BookId, photo?: Photo | null) {
  const index = books.findIndex((candidate) => candidate.id === book);
  return bookCover({
    book,
    title: getBook(book).spineTitle,
    kicker: `Chapter ${roman(index + 1)}`,
    photo,
  });
}

/** What a section's share image shows, for people who cannot see it. */
export const sectionAlt = (book: BookId) =>
  `${getBook(book).spineTitle}: the book's cover, from the ${site.name} shelf.`;

/** The shelf's books in order, as they stand on it, for the homepage's. */
export const shelfSpines = books.map((book) => ({
  id: book.id,
  color: clothColors[book.cloth],
  height: Math.round(standing[book.id].height * 176),
  width: Math.round(standing[book.id].thickness * 46),
}));
