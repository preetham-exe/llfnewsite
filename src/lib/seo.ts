import type { Metadata } from "next";

import { home } from "@/content/pages";
import { site } from "@/content/site";

/*
 * A page that sets its own openGraph replaces the inherited one, including the
 * image from app/opengraph-image.tsx, so the default image is named here for
 * pages without their own. A page with its own opengraph-image file (a
 * section's book cover) must not name one: a named image wins over the file.
 * Twitter takes whichever Open Graph image a page has.
 */
const defaultShareImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${site.name}. ${home.headline}`,
};

type PageMetadataInput = {
  title: string;
  description: string;
  /** Path from the site root, such as "/our-story". */
  path: string;
  /** Use an absolute title (no " | Literate Lives Foundation" suffix). */
  absoluteTitle?: boolean;
  type?: "website" | "article";
  /** The page has its own opengraph-image file beside it. */
  ownShareImage?: boolean;
};

/**
 * Per-page metadata: title, description, canonical URL, Open Graph and
 * Twitter. URLs are relative and resolved against metadataBase (SITE_URL) in
 * the root layout. Share images come from the opengraph-image files.
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  type = "website",
  ownShareImage = false,
}: PageMetadataInput): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type,
      siteName: site.name,
      locale: "en_IN",
      ...(ownShareImage ? {} : { images: [defaultShareImage] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
