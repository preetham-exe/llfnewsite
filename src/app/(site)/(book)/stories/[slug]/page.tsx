import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";

import { BookPage } from "@/components/book/BookPage";
import { Margin } from "@/components/book/Margin";
import { InkPen } from "@/components/book/Marginalia";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { PictureFrame } from "@/components/ui/PictureFrame";
import { RichText } from "@/components/ui/RichText";
import { Txt } from "@/components/ui/Txt";
import { isTodo } from "@/content/helpers";
import { getStories, getStory } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { marginalia } from "@/motion/tokens";

/*
 * Each story page reads its slug from the URL, so it cannot be part of the
 * shared App Shell. It is allowed to wait for the server, and every link to
 * it uses prefetch={true}, which loads the whole page ahead of time.
 */
export const instant = false;

/*
 * Every story is built ahead. One added in the Studio after a deploy is
 * built on its first visit. Cache Components needs at least one entry, so
 * with no stories at all this builds one page that is not found.
 */
export async function generateStaticParams() {
  const stories = await getStories();
  return stories.length
    ? stories.map((story) => ({ slug: story.slug }))
    : [{ slug: "none" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/stories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStory(slug);
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
  const story = await getStory(slug);
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
            <TransitionLink
              href={`/libraries/${story.library.slug}` as Route}
              prefetch
            >
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

      <Margin drift={marginalia.pencil} variant="narrow">
        <InkPen />
      </Margin>

      <div className="mt-10">
        <RichText value={story.body} />
      </div>

      <p className="mt-16 font-sans text-ui">
        <TransitionLink href="/stories" className="tap-target">
          All stories
        </TransitionLink>
      </p>
    </BookPage>
  );
}
