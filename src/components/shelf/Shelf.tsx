import type { CSSProperties } from "react";

import { TransitionLink } from "@/components/transition/TransitionLink";
import { books, getBook } from "@/content/books";
import { home } from "@/content/pages";

import { CoverFace } from "./Cover";
import { pile, standing } from "./proportions";
import { SpineFace } from "./Spine";

/**
 * The shelf: one nav landmark holding the seven books as real links with real
 * text, inside a wooden bookcase. Tablets and desktops see the books standing
 * side by side across the full width; phones see them stacked flat with
 * Donate on top. The two are separate lists (only one is ever displayed) so
 * each reads and tabs in its own visual order. Each spine carries data-book,
 * and the covers wait, hidden, for the opening transition to copy.
 */
export function Shelf() {
  return (
    <nav aria-label={home.shelfLabel} className="shelf">
      <div className="bookcase">
        <div className="bookcase__inside">
          <ol className="bookcase__row">
            {books.map((book) => {
              const fit = standing[book.id];
              const style = {
                "--h": fit.height,
                "--t": fit.thickness,
              } as CSSProperties;
              const classes = [
                "spine spine--upright cloth",
                `cloth-${book.cloth}`,
                `lettering-${book.lettering}`,
                book.id === "donate" && "spine--special",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <li key={book.id} className="bookcase__book" style={style}>
                  <span aria-hidden="true" className="bookcase__lift" />
                  <TransitionLink
                    href={book.href}
                    data-book={book.id}
                    aria-describedby={`shelf-label-${book.id}`}
                    className={classes}
                  >
                    <SpineFace
                      book={book}
                      title="horizontal"
                      labelId={`shelf-label-${book.id}`}
                    />
                  </TransitionLink>
                </li>
              );
            })}
          </ol>

          <ol className="pile">
            {pile.map((item, index) => {
              const book = getBook(item.id);
              const style = {
                "--w": item.width,
                "--t": item.thickness,
                "--x": `${item.shift}px`,
                "--r": `${item.tilt}deg`,
              } as CSSProperties;
              return (
                // Higher books sit above lower ones, so their shadows fall on them.
                <li
                  key={book.id}
                  className="pile__book"
                  style={{ zIndex: pile.length - index }}
                >
                  <TransitionLink
                    href={book.href}
                    data-book={book.id}
                    aria-describedby={`pile-label-${book.id}`}
                    className={`spine spine--lying cloth cloth-${book.cloth} lettering-${book.lettering}`}
                    style={style}
                  >
                    <SpineFace book={book} title="horizontal" />
                  </TransitionLink>
                  {/* No room for a label card on a lying spine, so the
                      description is for assistive technology only. */}
                  <span
                    id={`pile-label-${book.id}`}
                    aria-hidden="true"
                    className="sr-only"
                  >
                    {book.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div hidden>
        {books.map((book) => (
          <div key={book.id} data-cover-for={book.id}>
            <CoverFace book={book} />
          </div>
        ))}
      </div>
    </nav>
  );
}
