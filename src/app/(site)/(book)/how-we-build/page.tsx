import type { ReactNode } from "react";

import { BookPage } from "@/components/book/BookPage";
import { Margin } from "@/components/book/Margin";
import { Checklist, Ruler, ShelfSketch } from "@/components/book/Marginalia";
import { Sections } from "@/components/book/Sections";
import { howWeBuild, howWeBuildMargins } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";
import { marginalia } from "@/motion/tokens";

export const metadata = pageMetadata({
  title: howWeBuild.title,
  description: howWeBuild.description,
  path: "/how-we-build",
  ownShareImage: true,
});

/**
 * What sits in the margin beside each section, in order. The sketch is
 * drawn on the page itself, so it stays still.
 */
const besides: ReactNode[] = [
  null,
  <Margin key="ruler" drift={marginalia.ruler} variant="narrow">
    <Ruler />
  </Margin>,
  <Margin key="sketch">
    <ShelfSketch {...howWeBuildMargins.sketch} />
  </Margin>,
  null,
  <Margin key="checklist" drift={marginalia.card} variant="inset">
    <Checklist {...howWeBuildMargins.checklist} />
  </Margin>,
];

export default function HowWeBuildPage() {
  return (
    <BookPage
      book="how-we-build"
      title={howWeBuild.title}
      lede={howWeBuild.lede}
    >
      <Sections sections={howWeBuild.sections} besides={besides} />
    </BookPage>
  );
}
