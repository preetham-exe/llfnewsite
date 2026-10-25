import { isTodo } from "@/content/helpers";
import { getLibraries, getLibrary } from "@/lib/content";
import {
  bookCover,
  sectionCover,
  shareSize,
  shareType,
} from "@/lib/share-image";

export const alt = "A library built by Literate Lives Foundation.";
export const size = shareSize;
export const contentType = shareType;

/* Built for every library, as the pages are (see page.tsx). */
export async function generateStaticParams() {
  const libraries = await getLibraries();
  return libraries.length
    ? libraries.map((library) => ({ slug: library.slug }))
    : [{ slug: "none" }];
}

/** The Libraries' cover, with the library's name and its first photo. */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const library = await getLibrary(slug);
  if (!library) return sectionCover("libraries");
  const number = `Library #${library.number}`;
  return bookCover({
    book: "libraries",
    title: isTodo(library.name) ? number : library.name,
    kicker: isTodo(library.name) ? "The Libraries" : number,
    photo: library.photos.find((picture) => picture._type === "photo"),
  });
}
