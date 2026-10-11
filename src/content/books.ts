import type { Book, BookId } from "./types";

/** The seven books on the shelf, left to right. Donate is the only navy one. */
export const books: Book[] = [
  {
    id: "our-story",
    spineTitle: "Our Story",
    href: "/our-story",
    label: "Why we started, and who we are.",
    cloth: "oxblood",
    lettering: "cream",
  },
  {
    id: "libraries",
    spineTitle: "The Libraries",
    href: "/libraries",
    label: "Every library we have built, one chapter each.",
    cloth: "forest",
    lettering: "cream",
  },
  {
    id: "how-we-build",
    spineTitle: "How We Build",
    href: "/how-we-build",
    label: "From a first conversation to launch day.",
    cloth: "ochre",
    lettering: "ink",
  },
  {
    id: "partners",
    spineTitle: "Partners",
    href: "/partners",
    label: "The organisations we build with.",
    cloth: "slate",
    lettering: "cream",
  },
  {
    id: "stories",
    spineTitle: "Stories",
    href: "/stories",
    label: "Writing from our team and our readers.",
    cloth: "linen",
    lettering: "ink",
  },
  {
    id: "get-involved",
    spineTitle: "Get Involved",
    href: "/get-involved",
    label: "Volunteer, start a chapter, or ask for a library.",
    cloth: "teal",
    lettering: "cream",
  },
  {
    id: "donate",
    spineTitle: "Donate",
    href: "/donate",
    label: "Help pay for the next library.",
    cloth: "navy",
    lettering: "foil",
  },
];

export function getBook(id: BookId): Book {
  const book = books.find((candidate) => candidate.id === id);
  if (!book) throw new Error(`Unknown book: ${id}`);
  return book;
}
