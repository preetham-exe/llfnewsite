/*
 * What the site reads from Sanity: one query for everything. There are few
 * enough libraries, stories and partners that every page rebuild reads them
 * all, and one cached result serves every page. Only documents with a web
 * address (and libraries with a number) are shown. The shapes it returns
 * are the Raw types in map.ts, which turns them into the site's types.
 */

const photo = /* groq */ `
  alt,
  caption,
  "src": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "lqip": asset->metadata.lqip
`;

const libraryReference = /* groq */ `"slug": slug.current, name, number`;

const shownLibrary = /* groq */ `_type == "library" && defined(slug.current) && defined(number)`;

export const contentQuery = /* groq */ `{
  "libraries": *[${shownLibrary}] | order(number asc) {
    _id,
    number,
    name,
    "slug": slug.current,
    city,
    "partner": partner->{ "slug": slug.current, name },
    openedOn,
    booksPlaced,
    childrenServed,
    size,
    summary,
    "photos": photos[]{ ${photo} },
    launchDay
  },
  "stories": *[_type == "story" && defined(slug.current)] {
    _id,
    title,
    "slug": slug.current,
    dek,
    author,
    publishedOn,
    "library": library->{ ${libraryReference} },
    "cover": cover{ ${photo} },
    body
  },
  "partners": *[_type == "partner" && defined(slug.current)] {
    _id,
    name,
    "slug": slug.current,
    about,
    produced,
    website,
    "libraries": *[${shownLibrary} && references(^._id)] | order(number asc) {
      ${libraryReference}
    }
  }
}`;
