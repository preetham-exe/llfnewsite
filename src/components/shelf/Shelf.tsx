import { TransitionLink } from "@/components/transition/TransitionLink";
import { books } from "@/content/books";
import { home } from "@/content/pages";
import type { Cloth } from "@/content/types";

/* Static class names so Tailwind can see them. */
const clothSwatch: Record<Cloth, string> = {
  navy: "bg-cloth-navy",
  oxblood: "bg-cloth-oxblood",
  forest: "bg-cloth-forest",
  slate: "bg-cloth-slate",
  ochre: "bg-cloth-ochre",
  linen: "bg-cloth-linen",
  teal: "bg-cloth-teal",
};

/**
 * The shelf: a nav landmark holding a list of real links with real text.
 * Phase 0 placeholder. Phase 1 turns it into the bookshelf.
 */
export function Shelf() {
  return (
    <nav aria-label={home.shelfLabel}>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {books.map((book) => (
          <li key={book.id}>
            <TransitionLink
              href={book.href}
              data-flip-id={book.id}
              className="flex h-full items-start gap-4 border border-paper-edge p-4 no-underline hover:bg-paper-shade"
            >
              <span
                aria-hidden="true"
                className={`mt-1 h-12 w-3 shrink-0 ${clothSwatch[book.cloth]}`}
              />
              <span>
                <span className="block text-h3">{book.spineTitle}</span>
                <span className="mt-1 block font-sans text-caption text-ink-soft">
                  {book.label}
                </span>
              </span>
            </TransitionLink>
          </li>
        ))}
      </ol>
    </nav>
  );
}
