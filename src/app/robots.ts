import type { MetadataRoute } from "next";

import { absoluteUrl, SITE_INDEXABLE } from "@/lib/site-url";

/** Closed to search engines until launch (SITE_INDEXABLE=true on Production). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: SITE_INDEXABLE
      ? { userAgent: "*", allow: "/" }
      : { userAgent: "*", disallow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
