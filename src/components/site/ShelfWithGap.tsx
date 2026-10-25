import type { CSSProperties } from "react";

import type { Cloth, Lettering } from "@/content/types";

type SmallBook = {
  cloth: Cloth;
  lettering: Lettering;
  /** Height and width as a share of a full-size book on this shelf. */
  height: number;
  width: number;
  /** A book with nothing beside it tips over into the gap (deg). */
  lean?: number;
};

/*
 * The site's own books in shelf order, from the bookcase's proportions,
 * with Partners' place empty: the misplaced book.
 */
const BOOKS: (SmallBook | "gap")[] = [
  { cloth: "oxblood", lettering: "cream", height: 0.9, width: 1 },
  { cloth: "forest", lettering: "cream", height: 0.97, width: 1.18 },
  { cloth: "ochre", lettering: "ink", height: 0.86, width: 0.94 },
  "gap",
  { cloth: "linen", lettering: "ink", height: 0.84, width: 0.88, lean: -12 },
  { cloth: "plum", lettering: "cream", height: 0.98, width: 0.96 },
  { cloth: "teal", lettering: "cream", height: 0.94, width: 1 },
  { cloth: "navy", lettering: "foil", height: 0.89, width: 1.2 },
];

/** A small shelf with a gap where a book should be. Decorative. */
export function ShelfWithGap() {
  return (
    <div aria-hidden="true" className="gap-shelf">
      <div className="gap-shelf__row">
        {BOOKS.map((book, index) =>
          book === "gap" ? (
            <span key={index} className="gap-shelf__gap" />
          ) : (
            <span
              key={index}
              className={`gap-shelf__book cloth cloth-${book.cloth} lettering-${book.lettering}`}
              style={
                {
                  "--h": book.height,
                  "--w": book.width,
                  "--lean": `${book.lean ?? 0}deg`,
                } as CSSProperties
              }
            />
          ),
        )}
      </div>
      <div className="gap-shelf__board" />
    </div>
  );
}
