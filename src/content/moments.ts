import { todo } from "./helpers";
import type { Moment } from "./types";

/*
 * The seed: gallery moments as Sanity starts with them (scripts/sanity/seed.ts
 * imports these), and what the Gallery shows until a Sanity project is set
 * up. Pages read them through src/lib/content.ts.
 *
 * The two photos already on the site (the homepage and Our Story), until the
 * founder names the library they show and moves them there.
 */
export const moments: Moment[] = [
  {
    _id: "photos-from-our-libraries",
    _type: "moment",
    title: todo(
      "What these photos show, or move them to the library they were taken at",
    ),
    // A date cannot hold a note in the Studio: the same wording the site
    // gives any moment without one.
    date: todo("When this was"),
    place: null,
    photos: [
      {
        _type: "photo",
        src: "/photos/children-at-new-shelves.jpg",
        width: 2400,
        height: 1800,
        alt: "Children crowd around new bookshelves to choose books, while a girl beside them smiles.",
      },
      {
        _type: "photo",
        src: "/photos/shelves-of-storybooks.jpg",
        width: 2400,
        height: 2400,
        alt: "Three wooden bookshelves, full of children's books.",
      },
    ],
  },
];
