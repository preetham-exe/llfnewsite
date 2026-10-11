import type { CSSProperties } from "react";

import { TransitionLink } from "@/components/transition/TransitionLink";
import { books, getBook } from "@/content/books";
import { home } from "@/content/pages";

import { pile, standing } from "./proportions";
import { Bookend, LibraryCard } from "./ShelfObject";
import { SpineFace } from "./Spine";

/**
 * The shelf: one nav landmark holding the seven books as real links with real
 * text. Tablets and desktops get books standing on a wall shelf; phones get
 * the same books lying in a pile with Donate on top. The two are separate
 * lists (only one is ever displayed) so each reads and tabs in its own visual
 * order.
 */
export function Shelf() {
  return (
    <nav aria-label={home.shelfLabel} className="shelf">
      <div className="shelf__stand">
        <div className="shelf__row">
          <ol className="shelf__books">
            {books.map((book) => {
              const fit = standing[book.id];
              const style = {
                "--h": fit.height,
                "--t": fit.thickness,
              } as CSSProperties;
              return (
                <li key={book.id} className="shelf__book">
                  <TransitionLink
                    href={book.href}
                    data-flip-id={book.id}
                    className={`spine cloth cloth-${book.cloth} lettering-${book.lettering}`}
                    style={style}
                  >
                    <SpineFace book={book} title={fit.title} />
                  </TransitionLink>
                </li>
              );
            })}
          </ol>
          <Bookend />
          <LibraryCard />
        </div>
        <div aria-hidden="true" className="plank" />
      </div>

      <div className="pile">
        <ol className="pile__books">
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
                  data-flip-id={book.id}
                  className={`spine spine--lying cloth cloth-${book.cloth} lettering-${book.lettering}`}
                  style={style}
                >
                  <SpineFace book={book} title="horizontal" />
                </TransitionLink>
              </li>
            );
          })}
        </ol>
        <div aria-hidden="true" className="desk" />
      </div>
    </nav>
  );
}
