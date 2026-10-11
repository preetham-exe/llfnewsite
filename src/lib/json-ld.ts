import { site } from "@/content/site";

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

/** Serialise for a <script type="application/ld+json"> without breaking out of it. */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
