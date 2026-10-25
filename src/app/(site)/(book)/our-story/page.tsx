import type { ReactNode } from "react";

import { BookPage } from "@/components/book/BookPage";
import { Margin } from "@/components/book/Margin";
import { NoteCard, Pencil, Polaroid } from "@/components/book/Marginalia";
import { Sections } from "@/components/book/Sections";
import { ourStory, ourStoryMargins } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";
import { marginalia } from "@/motion/tokens";

export const metadata = pageMetadata({
  title: ourStory.title,
  description: ourStory.description,
  path: "/our-story",
  ownShareImage: true,
});

/** What sits in the margin beside each section, in order. */
const besides: ReactNode[] = [
  null,
  <Margin key="polaroid" drift={marginalia.polaroid}>
    <Polaroid photo={ourStoryMargins.photo} caption={ourStoryMargins.caption} />
  </Margin>,
  <Margin key="note" drift={marginalia.note} variant="inset">
    <NoteCard>{ourStoryMargins.note}</NoteCard>
  </Margin>,
  <Margin key="pencil" drift={marginalia.pencil} variant="narrow">
    <Pencil />
  </Margin>,
];

export default function OurStoryPage() {
  return (
    <BookPage book="our-story" title={ourStory.title} lede={ourStory.lede}>
      <Sections sections={ourStory.sections} besides={besides} />
    </BookPage>
  );
}
