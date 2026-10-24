import type { MetadataRoute } from "next";

import { books } from "@/content/books";
import { getLibraries, getStories } from "@/lib/content";
import { absoluteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [libraries, stories] = await Promise.all([
    getLibraries(),
    getStories(),
  ]);
  const paths = [
    "/",
    ...books.map((book) => book.href),
    ...libraries.map((library) => `/libraries/${library.slug}`),
    ...stories.map((story) => `/stories/${story.slug}`),
  ];

  return paths.map((path) => ({ url: absoluteUrl(path) }));
}
