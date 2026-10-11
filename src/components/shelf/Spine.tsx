import { Monogram } from "@/components/brand/Monogram";
import type { Book } from "@/content/types";

type SpineFaceProps = {
  book: Book;
  /** Thick spines carry the title across; the rest run it down the spine. */
  title: "vertical" | "horizontal";
  /**
   * Give the spine a label card with the section's one-line description. The
   * id lets the link use it as its accessible description.
   */
  labelId?: string;
};

/**
 * What is printed on a spine: head and tail bands, the title (live text, so it
 * is the link's accessible name) and the LLF monogram at the base. The spine's
 * size, cloth and shading come from the element that wraps it.
 */
export function SpineFace({ book, title, labelId }: SpineFaceProps) {
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
      {labelId && (
        // Hidden from the accessible name; read as the link's description.
        <span id={labelId} aria-hidden="true" className="spine__label">
          {book.label}
        </span>
      )}
      <Monogram className="spine__monogram" />
      <span aria-hidden="true" className="spine__band spine__band--tail" />
    </>
  );
}
