import type { Route } from "next";

import { isTodo } from "@/content/helpers";
import type { Library, Moment, Photo, Todo } from "@/content/types";

/*
 * The Gallery as a book of plates: every real photo of a library, and every
 * gallery moment's, numbered in order as plates are in a printed book. The
 * newest come first, so new photos are the first a visitor sees.
 */

export type Plate = {
  /** 1, 2, 3... down the page. */
  number: number;
  /** Plate I, II, III... */
  numeral: string;
  /** Its place on the page, for the list of plates to link to. */
  anchor: string;
  photo: Photo;
  /** The photo's own caption, if it has one. */
  caption: string | Todo | null;
  /** Where it was taken: the library (with its page) or the moment. */
  from: string | Todo;
  href: Route | null;
  /** When: the month the library opened, or the moment's date. */
  when: string | Todo;
  place: string | null;
};

const ROMAN: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

/** 14 becomes "XIV". */
export function roman(value: number): string {
  let rest = value;
  let out = "";
  for (const [step, letters] of ROMAN) {
    while (rest >= step) {
      out += letters;
      rest -= step;
    }
  }
  return out;
}

type Source = Omit<
  Plate,
  "number" | "numeral" | "anchor" | "photo" | "caption"
>;

/** A library's name, or "Library #3" until it has one. */
const libraryName = (library: Library) =>
  isTodo(library.name) ? `Library #${library.number}` : library.name;

export function galleryPlates({
  libraries,
  moments,
}: {
  libraries: Library[];
  moments: Moment[];
}): Plate[] {
  const groups: { source: Source; photos: Photo[] }[] = [
    ...libraries.map((library) => ({
      source: {
        from: libraryName(library),
        href: `/libraries/${library.slug}` as Route,
        when: library.openedOn,
        place: isTodo(library.city) ? null : library.city,
      },
      photos: library.photos.flatMap((picture) =>
        picture._type === "photo" ? [picture] : [],
      ),
    })),
    ...moments.map((moment) => ({
      source: {
        from: moment.title,
        href: null,
        when: moment.date,
        place: moment.place,
      },
      photos: moment.photos,
    })),
  ];

  // Newest first; anything undated last. The sort is stable, so libraries
  // and moments from the same month keep their order.
  const date = (when: string | Todo) => (isTodo(when) ? "" : when);
  groups.sort((a, b) => date(b.source.when).localeCompare(date(a.source.when)));

  return groups
    .flatMap(({ source, photos }) =>
      photos.map((photo) => ({ ...source, photo })),
    )
    .map(({ photo, ...source }, index) => ({
      number: index + 1,
      numeral: roman(index + 1),
      anchor: `plate-${index + 1}`,
      photo,
      caption: photo.caption ?? null,
      ...source,
    }));
}
