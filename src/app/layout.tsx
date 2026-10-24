import type { Metadata } from "next";

import { Document } from "@/components/site/Document";
import { site } from "@/content/site";
import { SITE_INDEXABLE, SITE_URL } from "@/lib/site-url";

/** Every page on the site is fully static. The build fails otherwise. */
export const ensureStatic = "navigation";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    siteName: site.name,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: SITE_INDEXABLE
    ? { index: true, follow: true }
    : { index: false, follow: false },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export { viewport } from "@/components/site/Document";

/*
 * Site pages bring their shell and styles with the (site) layout; the Studio
 * at /studio brings its own. Nothing here loads the site's CSS, so none of
 * it reaches the Studio.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return <Document>{children}</Document>;
}
