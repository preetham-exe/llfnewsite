import { TransitionLink } from "@/components/transition/TransitionLink";
import { notFound } from "@/content/pages";

import { ShelfWithGap } from "./ShelfWithGap";

/**
 * "The misplaced book": what a missing page says, under a small shelf with a
 * gap where a book should be. Shown by both not-found files.
 */
export function MisplacedBook() {
  return (
    <div className="pt-(--nav-height)">
      <section className="mx-auto max-w-measure px-4 py-20 sm:py-28">
        <ShelfWithGap />
        <h1 className="text-h1">{notFound.title}</h1>
        <p className="mt-6 text-lede text-ink-soft">{notFound.body}</p>
        <p className="mt-10 font-sans text-ui">
          <TransitionLink href="/" className="tap-target">
            {notFound.back}
          </TransitionLink>
        </p>
      </section>
    </div>
  );
}
