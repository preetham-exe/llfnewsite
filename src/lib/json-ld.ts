import { isTodo } from "@/content/helpers";
import { site } from "@/content/site";
import type { Library, Photo, Story } from "@/content/types";

import type { Plate } from "./gallery";
import { absoluteUrl, SITE_URL } from "./site-url";

/** Organization (NGO) structured data for the homepage. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: site.name,
    alternateName: site.shortName,
    url: SITE_URL,
    logo: absoluteUrl("/apple-icon"),
    email: site.email,
    slogan: site.tagline,
    description: site.description,
    foundingDate: String(site.foundedYear),
    address: {
      "@type": "PostalAddress",
      addressLocality: site.city,
      addressRegion: site.region,
      addressCountry: site.country,
    },
    areaServed: { "@type": "City", name: site.city },
  };
}

/* Structured data for search engines, one kind per page. Details still to
   come (TODO notes) are left out rather than published. */

const publisher = () => ({ "@type": "NGO", name: site.name, url: SITE_URL });

/** A photo's address: Sanity's is already absolute, the site's are paths. */
const imageUrl = (photo: Photo) =>
  photo.src.startsWith("/") ? absoluteUrl(photo.src) : photo.src;

/** Only what is known: a TODO note becomes nothing. */
const known = <T>(key: string, value: T | string | null | undefined) =>
  value === null || value === undefined || isTodo(value)
    ? {}
    : { [key]: value };

/** A library LLF built, as schema.org's own Library. */
export function libraryJsonLd(library: Library) {
  const photo = library.photos.find((picture) => picture._type === "photo");
  return {
    "@context": "https://schema.org",
    "@type": "Library",
    name: isTodo(library.name) ? `Library #${library.number}` : library.name,
    url: absoluteUrl(`/libraries/${library.slug}`),
    ...known("description", library.summary),
    ...known("foundingDate", library.openedOn),
    ...(isTodo(library.city)
      ? {}
      : {
          address: {
            "@type": "PostalAddress",
            addressLocality: library.city,
            addressCountry: site.country,
          },
        }),
    ...(photo ? { image: imageUrl(photo) } : {}),
    parentOrganization: publisher(),
  };
}

/** A story, as an article. */
export function storyJsonLd(story: Story) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: isTodo(story.title) ? "A story" : story.title,
    url: absoluteUrl(`/stories/${story.slug}`),
    ...known("description", story.dek),
    ...known("datePublished", story.publishedOn),
    ...(isTodo(story.author)
      ? {}
      : { author: { "@type": "Person", name: story.author } }),
    ...(story.cover?._type === "photo" ? { image: imageUrl(story.cover) } : {}),
    publisher: publisher(),
  };
}

/** The Gallery: its plates, as an image gallery. */
export function galleryJsonLd(plates: Plate[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "Gallery",
    url: absoluteUrl("/gallery"),
    publisher: publisher(),
    image: plates.map((plate) => ({
      "@type": "ImageObject",
      contentUrl: imageUrl(plate.photo),
      width: plate.photo.width,
      height: plate.photo.height,
      description: plate.photo.alt,
      ...known("caption", plate.caption),
    })),
  };
}

/** Where a page sits: the homepage, its section, the page. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: absoluteUrl(step.path),
    })),
  };
}

/** Serialise for a <script type="application/ld+json"> without breaking out of it. */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
