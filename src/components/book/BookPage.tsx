import type { ReactNode } from "react";

import { Txt } from "@/components/ui/Txt";
import { getBook } from "@/content/books";
import type { BookId, Todo } from "@/content/types";

import { PageReady } from "./PageReady";
import { RunningHeader } from "./RunningHeader";

type BookPageProps = {
  book: BookId;
  title: string;
  lede?: string | Todo;
  children?: ReactNode;
};

/**
 * The template every section page uses: running header, chapter heading and a
 * single readable column. Phase 4 frames it as an open book.
 */
export function BookPage({ book, title, lede, children }: BookPageProps) {
  const { spineTitle } = getBook(book);

  return (
    <article className="mx-auto max-w-page px-4 pb-24 sm:px-6">
      <RunningHeader section={spineTitle} />

      <header className="mx-auto mt-12 max-w-measure sm:mt-16">
        <h1 className="text-h1">
          <Txt>{title}</Txt>
        </h1>
        {lede && (
          <p className="mt-6 text-lede text-ink-soft">
            <Txt>{lede}</Txt>
          </p>
        )}
      </header>

      <div className="mx-auto mt-14 max-w-measure">{children}</div>

      <PageReady />
    </article>
  );
}
