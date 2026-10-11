import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";

import { BookPage } from "@/components/book/BookPage";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { PictureFrame } from "@/components/ui/PictureFrame";
import { RichText } from "@/components/ui/RichText";
import { Txt } from "@/components/ui/Txt";
import { isTodo } from "@/content/helpers";
import { getStory, stories } from "@/content/stories";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return stories.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/stories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) return {};

  return pageMetadata({
    title: isTodo(story.title) ? "A story" : story.title,
    description: isTodo(story.dek)
      ? "A story from Literate Lives Foundation, which builds libraries for children in Hyderabad."
      : story.dek,
    path: `/stories/${story.slug}`,
    type: "article",
  });
}

export default async function StoryPage({
  params,
}: PageProps<"/stories/[slug]">) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();

  return (
    <BookPage book="stories" title={story.title} lede={story.dek}>
      <p className="font-sans text-ui text-ink-soft">
        <Txt>{story.author}</Txt>
        {" · "}
        <Txt>{formatDate(story.publishedOn)}</Txt>
        {story.library && (
          <>
            {" · "}
            <TransitionLink href={`/libraries/${story.library.slug}` as Route}>
              {story.library.name}
            </TransitionLink>
          </>
        )}
      </p>

      {story.cover && (
        <PictureFrame
          picture={story.cover}
          sizes="(min-width: 768px) 42rem, 100vw"
          className="mt-10"
        />
      )}

      <div className="mt-10">
        <RichText value={story.body} />
      </div>

      <p className="mt-16 font-sans text-ui">
        <TransitionLink href="/stories">All stories</TransitionLink>
      </p>
    </BookPage>
  );
}
