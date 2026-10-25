import { isTodo } from "@/content/helpers";
import { getStories, getStory } from "@/lib/content";
import {
  bookCover,
  sectionCover,
  shareSize,
  shareType,
} from "@/lib/share-image";

export const alt = "A story from Literate Lives Foundation.";
export const size = shareSize;
export const contentType = shareType;

/* Built for every story, as the pages are (see page.tsx). */
export async function generateStaticParams() {
  const stories = await getStories();
  return stories.length
    ? stories.map((story) => ({ slug: story.slug }))
    : [{ slug: "none" }];
}

/** The Stories' cover, with the story's title and its photo or drawing. */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) return sectionCover("stories");
  return bookCover({
    book: "stories",
    title: isTodo(story.title) ? "A story" : story.title,
    kicker: "Stories",
    photo: story.cover?._type === "photo" ? story.cover : null,
  });
}
