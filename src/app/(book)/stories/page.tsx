import type { Route } from "next";

import { BookPage } from "@/components/book/BookPage";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Txt } from "@/components/ui/Txt";
import { storiesIndex } from "@/content/pages";
import { stories } from "@/content/stories";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: storiesIndex.title,
  description: storiesIndex.description,
  path: "/stories",
});

export default function StoriesPage() {
  return (
    <BookPage
      book="stories"
      title={storiesIndex.title}
      lede={storiesIndex.lede}
    >
      <ul className="divide-y divide-paper-edge border-y border-paper-edge">
        {stories.map((story) => (
          <li key={story._id} className="py-8">
            <h2 className="text-h2">
              <TransitionLink
                href={`/stories/${story.slug}` as Route}
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
    </BookPage>
  );
}
