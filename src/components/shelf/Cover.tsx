import { site } from "@/content/site";
import type { Book } from "@/content/types";

import { Monogram } from "./Spine";

/**
 * A book's front cover. Every cover belongs to one series: blind-stamped
 * frame, title, the LLF device and the imprint. The books differ by cloth and
 * title, and Donate by its gold foil. Seen during the opening transition.
 */
export function CoverFace({ book }: { book: Book }) {
  return (
    <div
      className={`cover cloth cloth-${book.cloth} lettering-${book.lettering}`}
    >
      <span aria-hidden="true" className="cover__frame" />
      <span className="cover__title">{book.spineTitle}</span>
      <Monogram className="cover__monogram" />
      <span className="cover__imprint">{site.name}</span>
    </div>
  );
}
