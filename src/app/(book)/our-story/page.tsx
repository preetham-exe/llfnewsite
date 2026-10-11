import { BookPage } from "@/components/book/BookPage";
import { Sections } from "@/components/book/Sections";
import { ourStory } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: ourStory.title,
  description: ourStory.description,
  path: "/our-story",
});

export default function OurStoryPage() {
  return (
    <BookPage book="our-story" title={ourStory.title} lede={ourStory.lede}>
      <Sections sections={ourStory.sections} />
    </BookPage>
  );
}
