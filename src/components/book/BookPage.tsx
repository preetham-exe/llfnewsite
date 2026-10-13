import type { CSSProperties, ReactNode } from "react";

import { Txt } from "@/components/ui/Txt";
import { books, getBook } from "@/content/books";
import { site } from "@/content/site";
import type { BookId, Todo } from "@/content/types";
import { book as proportions } from "@/motion/tokens";

import { PageReady } from "./PageReady";
import { Prose } from "./Prose";
import { SpreadMotion } from "./SpreadMotion";

type BookPageProps = {
  book: BookId;
  title: string;
  /** The opening paragraph; [[a phrase]] gets a pencil mark. */
  lede?: string | Todo;
  children?: ReactNode;
};

const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"];

/**
 * The cloth that shows round the pages, as a share of the open book's width
 * (two pages) or of one page's frame. They follow from the book's proportions
 * in the motion tokens, so the book the opening transition carries lands
 * exactly on this frame.
 */
function clothMargins(): CSSProperties {
  const { aspect, squares } = proportions;
  // Beyond each page, as a share of the page's width: at the outer side and
  // at the head of the book.
  const side = squares.width / (1 - squares.width);
  const head = (aspect * squares.height) / (2 * (1 - squares.width));
  return {
    "--rim-side-2": side / (2 * (1 + side)),
    "--rim-top-2": head / (2 * (1 + side)),
    "--rim-side-1": side / (1 + 2 * side),
    "--rim-top-1": head / (1 + 2 * side),
  } as CSSProperties;
}

/**
 * The template every section page uses: the page as the open book it came
 * from, in that book's cloth. The chapter opening is on the left page and
 * the text on the right (one page on smaller screens), with a running header
 * and page numbers as in print. Objects in the margins are <Margin> blocks
 * placed among the children, just before the text they belong beside.
 */
export function BookPage({ book, title, lede, children }: BookPageProps) {
  const { spineTitle, cloth } = getBook(book);
  const index = books.findIndex((candidate) => candidate.id === book);
  // Left-hand pages are even in a printed book, right-hand pages odd.
  const folio = 2 * (index + 1);

  return (
    <div
      data-spread=""
      className={`spread cloth-${cloth}`}
      style={clothMargins()}
    >
      <article className="spread__book cloth">
        <div data-spread-pages="" className="spread__pages">
          <SpreadMotion>
            <div aria-hidden="true" className="spread__heads">
              <span>{spineTitle}</span>
              <span>{site.name}</span>
            </div>

            <div className="spread__text">
              <header className="spread__left spread__opening">
                <p aria-hidden="true" className="spread__numeral">
                  Chapter {NUMERALS[index]}
                </p>
                <h1
                  tabIndex={-1}
                  className="mt-3 text-display focus:outline-none"
                >
                  <Txt>{title}</Txt>
                </h1>
                {lede && (
                  <p className="spread__lede">
                    <Prose>{lede}</Prose>
                  </p>
                )}
              </header>

              <div className="mt-14 xl:mt-0 xl:pt-[3.25rem]">{children}</div>
            </div>

            <div aria-hidden="true" className="spread__folios">
              <span>{folio}</span>
              <span>{folio + 1}</span>
            </div>
          </SpreadMotion>
        </div>
      </article>

      <PageReady />
    </div>
  );
}
