import type { Book } from "@/content/types";

type SpineFaceProps = {
  book: Book;
  /** Thick spines carry the title across; the rest run it down the spine. */
  title: "vertical" | "horizontal";
};

/**
 * What is printed on a spine: head and tail bands, the title (live text, so it
 * is the link's accessible name) and a small LLF monogram at the base. The
 * spine's size, cloth and shading come from the element that wraps it.
 */
export function SpineFace({ book, title }: SpineFaceProps) {
  return (
    <>
      <span aria-hidden="true" className="spine__band spine__band--head" />
      <span
        data-spine-title=""
        className={
          title === "horizontal"
            ? "spine__title spine__title--across"
            : "spine__title"
        }
      >
        {book.spineTitle}
      </span>
      <Monogram className="spine__monogram" />
      <span aria-hidden="true" className="spine__band spine__band--tail" />
    </>
  );
}

/**
 * The LLF device used on spines and covers. A typographic stand-in until the
 * vector version of the foundation's monogram arrives.
 */
export function Monogram({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`monogram ${className}`}>
      LLF
    </span>
  );
}
