import type { Route } from "next";

import { BookPage } from "@/components/book/BookPage";
import { Margin } from "@/components/book/Margin";
import {
  DrawingPlaceholder,
  InkPen,
  NotebookPage,
} from "@/components/book/Marginalia";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Txt } from "@/components/ui/Txt";
import { storiesIndex, storiesMargins } from "@/content/pages";
import { getStories } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { marginalia } from "@/motion/tokens";

export const metadata = pageMetadata({
  title: storiesIndex.title,
  description: storiesIndex.description,
  path: "/stories",
});

export default async function StoriesPage() {
  const stories = await getStories();

  return (
    <BookPage
      book="stories"
      title={storiesIndex.title}
      lede={storiesIndex.lede}
    >
      {/* A page torn from a notebook, with the pen lying across it. */}
      <Margin drift={marginalia.notebook}>
        <div className="relative w-fit">
          <NotebookPage />
          <div className="absolute right-[-2.5rem] bottom-8 w-52">
            <InkPen tilt={-28} />
          </div>
        </div>
      </Margin>

      <ul className="divide-y divide-paper-edge border-y border-paper-edge">
        {stories.map((story) => (
          <li key={story._id} className="py-8">
            <h2 className="text-h2">
              <TransitionLink
                href={`/stories/${story.slug}` as Route}
                prefetch
                className="no-underline hover:underline"
              >
                <Txt>{story.title}</Txt>
              </TransitionLink>
            </h2>
            <p className="mt-3">
              <Txt>{story.dek}</Txt>
            </p>
            <p className="mt-3 font-sans text-ui text-ink-soft">
              <Txt>{story.author}</Txt>
              {" · "}
              <Txt>{formatDate(story.publishedOn)}</Txt>
            </p>
          </li>
        ))}
      </ul>

      <Margin variant="inset">
        <DrawingPlaceholder label={storiesMargins.drawing} />
      </Margin>
    </BookPage>
  );
}
