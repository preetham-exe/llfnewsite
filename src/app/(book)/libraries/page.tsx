import type { Route } from "next";

import { BookPage } from "@/components/book/BookPage";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Txt } from "@/components/ui/Txt";
import { isTodo } from "@/content/helpers";
import { libraries } from "@/content/libraries";
import { librariesIndex } from "@/content/pages";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: librariesIndex.title,
  description: librariesIndex.description,
  path: "/libraries",
});

export default function LibrariesPage() {
  return (
    <BookPage
      book="libraries"
      title={librariesIndex.title}
      lede={librariesIndex.lede}
    >
      <ol className="divide-y divide-paper-edge border-y border-paper-edge">
        {libraries.map((library) => (
          <li key={library._id} className="py-8">
            <p className="text-caption smallcaps text-ink-soft">
              Chapter {library.number}
            </p>
            <h2 className="mt-2 text-h2">
              <TransitionLink
                href={`/libraries/${library.slug}` as Route}
                prefetch
                className="no-underline hover:underline"
              >
                <Txt>{library.name}</Txt>
              </TransitionLink>
            </h2>
            <p className="mt-3 font-sans text-ui text-ink-soft">
              Opened <Txt>{formatDate(library.openedOn)}</Txt>
              {" · "}
              {isTodo(library.partner) ? (
                <Txt>{library.partner}</Txt>
              ) : (
                <>With {library.partner.name}</>
              )}
            </p>
            <p className="mt-4">
              <Txt>{library.summary}</Txt>
            </p>
          </li>
        ))}
      </ol>
    </BookPage>
  );
}
