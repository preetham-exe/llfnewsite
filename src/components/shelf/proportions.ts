import type { BookId } from "@/content/types";

/*
 * How each book sits in the bookcase. Presentation only, so it lives with the
 * shelf rather than in the content files.
 */

export type StandingBook = {
  /** Height as a share of the bookcase's inside height (books vary ~15%). */
  height: number;
  /** Relative thickness. The seven books share the row in these proportions. */
  thickness: number;
};

export const standing: Record<BookId, StandingBook> = {
  "our-story": { height: 0.9, thickness: 1.0 },
  libraries: { height: 0.97, thickness: 1.18 },
  "how-we-build": { height: 0.86, thickness: 0.94 },
  partners: { height: 0.92, thickness: 1.04 },
  stories: { height: 0.84, thickness: 0.88 },
  "get-involved": { height: 0.94, thickness: 1.0 },
  donate: { height: 0.89, thickness: 1.2 },
};

export type LyingBook = {
  id: BookId;
  /** Length relative to the inside width of the bookcase. */
  width: number;
  /** Thickness relative to the 56 px minimum tap target. */
  thickness: number;
  /** Sideways offset in px, so the pile looks stacked by hand. */
  shift: number;
  /** A fraction of a degree of rotation, for the same reason. */
  tilt: number;
};

/** The pile on phones, top to bottom. Donate sits on top. */
export const pile: LyingBook[] = [
  { id: "donate", width: 0.88, thickness: 1.16, shift: 5, tilt: -0.4 },
  { id: "our-story", width: 0.95, thickness: 1.0, shift: -4, tilt: 0.25 },
  { id: "libraries", width: 1.0, thickness: 1.1, shift: 2, tilt: 0 },
  { id: "how-we-build", width: 0.92, thickness: 1.0, shift: 7, tilt: -0.3 },
  { id: "partners", width: 0.97, thickness: 1.04, shift: -3, tilt: 0.2 },
  { id: "stories", width: 0.9, thickness: 1.0, shift: 4, tilt: -0.15 },
  { id: "get-involved", width: 0.99, thickness: 1.06, shift: -1, tilt: 0.1 },
];
