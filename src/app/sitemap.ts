import type { MetadataRoute } from "next";

import { books } from "@/content/books";
import { libraries } from "@/content/libraries";
import { stories } from "@/content/stories";
import { absoluteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    ...books.map((book) => book.href),
    ...libraries.map((library) => `/libraries/${library.slug}`),
    ...stories.map((story) => `/stories/${story.slug}`),
  ];

  return paths.map((path) => ({ url: absoluteUrl(path) }));
}
