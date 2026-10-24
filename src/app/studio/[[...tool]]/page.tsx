import type { Metadata, Viewport } from "next";
import {
  metadata as studioMetadata,
  viewport as studioViewport,
} from "next-sanity/studio";

import { sanityConfigured } from "@/sanity/env";
import { Studio } from "@/sanity/Studio";

/*
 * Sanity Studio, where the founder edits Libraries, Stories and Partners.
 * Anyone can load the page, but only people invited to the Sanity project
 * can sign in, see drafts or change anything. Kept out of search (noindex
 * here, and robots.txt). It sits outside the (site) layout: no nav, no
 * transition, none of the site's styles.
 */

export const metadata: Metadata = { ...studioMetadata, title: "Studio" };

export const viewport: Viewport = {
  ...studioViewport,
  colorScheme: "light dark",
};

/* One static shell serves /studio and every address inside it: the Studio
   reads the rest of the address itself, in the browser. */
export function generateStaticParams() {
  return [{ tool: [] }];
}

export default function StudioPage() {
  if (!sanityConfigured) {
    return (
      <main
        style={{
          maxWidth: "36rem",
          margin: "4rem auto",
          padding: "0 1rem",
          font: "1rem/1.5 system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.5rem" }}>The Studio is not connected yet</h1>
        <p>
          Set NEXT_PUBLIC_SANITY_PROJECT_ID (see .env.example) and build the
          site again.
        </p>
      </main>
    );
  }
  return <Studio />;
}
