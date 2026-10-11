import type { CSSProperties } from "react";

import type { Book as BookData } from "@/content/types";

import { CoverFace } from "./Cover";
import { standing } from "./proportions";
import { SpineFace } from "./Spine";

type BookProps = {
  book: BookData;
  /** Rotation about the vertical axis: 0 shows the cover, 90 the spine. */
  turn?: number;
  /** A slight tilt toward or away from the viewer. */
  tilt?: number;
  className?: string;
};

/**
 * The book as a CSS 3D box: front cover, back, spine, fore-edge, head and
 * tail. Only the transition overlay and the dev page use it; books on the
 * shelf are flat spines.
 *
 * Safari rules this follows: nothing on the 3D elements flattens them
 * (no opacity, overflow, filter or clip on .book3d__body), every face sets its
 * own backface-visibility, and faces that touch overlap slightly so no seam
 * shows at an angle. The perspective sits on the wrapper so the vanishing
 * point travels with the book.
 */
export function Book({ book, turn = 0, tilt = 0, className = "" }: BookProps) {
  const { thickness } = standing[book.id];
  const style = {
    "--turn": `${turn}deg`,
    "--tilt": `${tilt}deg`,
    "--thickness": thickness,
  } as CSSProperties;

  return (
    <div aria-hidden="true" className={`book3d ${className}`} style={style}>
      <div className="book3d__body">
        <div className="book3d__face book3d__front">
          <CoverFace book={book} />
        </div>
        <div className="book3d__face book3d__back">
          <div className={`cover cloth cloth-${book.cloth}`} />
        </div>
        <div
          className={`book3d__face book3d__spine spine cloth cloth-${book.cloth} lettering-${book.lettering}`}
        >
          <SpineFace book={book} title="vertical" />
        </div>
        <div className="book3d__face book3d__fore-edge" />
        <div className="book3d__face book3d__head" />
        <div className="book3d__face book3d__tail" />
      </div>
    </div>
  );
}
