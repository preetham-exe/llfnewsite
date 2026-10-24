import "@/styles/globals.css";

import type { Metadata } from "next";

import { Document } from "@/components/site/Document";
import { MisplacedBook } from "@/components/site/MisplacedBook";
import { SiteChrome } from "@/components/site/SiteChrome";
import { site } from "@/content/site";

/*
 * An address that matches no page. Next renders this without any layout,
 * so it brings the whole document and the site's shell itself. Being outside
 * the root layout is the point: a not-found.tsx beside the root layout would
 * put the site's styles on every page under it, the Studio included. A
 * library or story that does not exist gets app/(site)/not-found.tsx.
 */

export const metadata: Metadata = {
  title: site.name,
  robots: { index: false, follow: false },
};

export { viewport } from "@/components/site/Document";

export default function GlobalNotFound() {
  return (
    <Document>
      <SiteChrome>
        <MisplacedBook />
      </SiteChrome>
    </Document>
  );
}
