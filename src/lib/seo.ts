import type { Metadata } from "next";

import { home } from "@/content/pages";
import { site } from "@/content/site";

/*
 * A page that sets its own openGraph replaces the inherited one, including the
 * image from app/opengraph-image.tsx, so the default image is named here.
 * Per-page opengraph-image files (Phase 9) take precedence over this.
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
      images: [defaultShareImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [defaultShareImage],
    },
  };
}
