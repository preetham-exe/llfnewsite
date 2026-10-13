import { paragraphs, todo } from "./helpers";
import type { Library } from "./types";

/*
 * Libraries in the order they opened. Moves to Sanity in Phase 8.
 * Slugs for #1 and #2 are placeholders until their names are known.
 */
export const libraries: Library[] = [
  {
    _id: "library-1",
    _type: "library",
    slug: "library-1",
    number: 1,
    name: todo("Name of Library #1"),
    city: todo("City of Library #1"),
    partner: todo("Partner organisation for Library #1"),
    openedOn: "2025-01",
    booksPlaced: todo("Books placed in Library #1"),
    childrenServed: todo("Children served by Library #1"),
    size: todo("Size of Library #1: small, medium or large"),
    summary: todo("One or two sentences about Library #1"),
    launchDay: paragraphs(
      "library-1-launch",
      todo("A short account of launch day at Library #1"),
    ),
    photos: [
      {
        _type: "photoPlaceholder",
        aspectRatio: 4 / 3,
        label: "Photo: Library #1",
        alt: todo("Describe the photo of Library #1"),
      },
    ],
  },
  {
    _id: "library-2",
    _type: "library",
    slug: "library-2",
    number: 2,
    name: todo("Name of Library #2"),
    city: todo("City of Library #2"),
    partner: todo("Partner organisation for Library #2"),
    openedOn: todo("Month and year Library #2 opened"),
    booksPlaced: todo("Books placed in Library #2"),
    childrenServed: todo("Children served by Library #2"),
    size: todo("Size of Library #2: small, medium or large"),
    summary: todo("One or two sentences about Library #2"),
    launchDay: paragraphs(
      "library-2-launch",
      todo("A short account of launch day at Library #2"),
    ),
    photos: [
      {
        _type: "photoPlaceholder",
        aspectRatio: 4 / 3,
        label: "Photo: Library #2",
        alt: todo("Describe the photo of Library #2"),
      },
    ],
  },
  {
    _id: "qcity-community-library",
    _type: "library",
    slug: "qcity-community-library",
    number: 3,
    name: "QCity Community Library",
    city: todo("Confirm the city of QCity Community Library"),
    partner: { slug: "robinhood-army", name: "Robinhood Army" },
    openedOn: "2026-04",
    booksPlaced: todo("Books placed in QCity Community Library"),
    childrenServed: todo("Children served by QCity Community Library"),
    size: todo("Size of QCity Community Library: small, medium or large"),
    summary:
      "Our third library, built with Robinhood Army and opened in April 2026.",
    launchDay: paragraphs(
      "qcity-launch",
      todo("A short account of launch day at QCity Community Library"),
    ),
    photos: [
      {
        // From the founder's photos, taken on 12 April 2026.
        _type: "photo",
        src: "/photos/boy-reading-by-new-shelf.jpg",
        width: 1800,
        height: 2400,
        alt: "A boy smiles as he reads a book beside a white bookshelf decorated with green balloons.",
        caption: todo(
          "Confirm this photo is from QCity Community Library (taken 12 April 2026), and add a caption",
        ),
      },
    ],
  },
];

export function getLibrary(slug: string): Library | undefined {
  return libraries.find((library) => library.slug === slug);
}
