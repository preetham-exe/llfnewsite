import type { BookId } from "@/content/types";

/*
 * How each book sits on the shelf. Presentation only, so it lives with the
 * shelf rather than in the content files.
 */

export type StandingBook = {
  /** Height relative to the tallest book (books vary within about 15%). */
  height: number;
  /** Thickness relative to a standard spine. */
  thickness: number;
  /** Thick spines can carry their title across rather than down. */
  title: "vertical" | "horizontal";
};

export const standing: Record<BookId, StandingBook> = {
  "our-story": { height: 0.94, thickness: 1.0, title: "vertical" },
  libraries: { height: 1.0, thickness: 1.22, title: "vertical" },
  "how-we-build": { height: 0.88, thickness: 0.92, title: "vertical" },
  partners: { height: 0.92, thickness: 1.02, title: "vertical" },
  stories: { height: 0.86, thickness: 0.86, title: "vertical" },
  "get-involved": { height: 0.96, thickness: 1.0, title: "vertical" },
  donate: { height: 0.91, thickness: 1.36, title: "horizontal" },
};

export type LyingBook = {
  id: BookId;
  /** Length relative to the width of the pile. */
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
