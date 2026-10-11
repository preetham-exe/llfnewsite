import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookPage } from "@/components/book/BookPage";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { PictureFrame } from "@/components/ui/PictureFrame";
import { RichText } from "@/components/ui/RichText";
import { Txt } from "@/components/ui/Txt";
import { isTodo } from "@/content/helpers";
import { getLibrary, libraries } from "@/content/libraries";
import type { Library } from "@/content/types";
import { formatCount, formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

/*
 * Each library page reads its slug from the URL, so it cannot be part of the
 * shared App Shell. It is allowed to wait for the server, and every link to
 * it uses prefetch={true}, which loads the whole page ahead of time.
 */
export const instant = false;

export function generateStaticParams() {
  return libraries.map((library) => ({ slug: library.slug }));
}

function libraryTitle(library: Library): string {
  return isTodo(library.name) ? `Library #${library.number}` : library.name;
}

export async function generateMetadata({
  params,
}: PageProps<"/libraries/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const library = getLibrary(slug);
  if (!library) return {};

  return pageMetadata({
    title: libraryTitle(library),
    description: isTodo(library.summary)
      ? `Library #${library.number}, built by Literate Lives Foundation.`
      : library.summary,
    path: `/libraries/${library.slug}`,
  });
}

export default async function LibraryPage({
  params,
}: PageProps<"/libraries/[slug]">) {
  const { slug } = await params;
  const library = getLibrary(slug);
  if (!library) notFound();

  const facts = [
    { term: "Opened", detail: formatDate(library.openedOn) },
    { term: "City", detail: library.city },
    {
      term: "Partner",
      detail: isTodo(library.partner) ? library.partner : library.partner.name,
    },
    { term: "Books placed", detail: formatCount(library.booksPlaced) },
    { term: "Children", detail: formatCount(library.childrenServed) },
    { term: "Size", detail: library.size },
  ];

  return (
    <BookPage
      book="libraries"
      title={libraryTitle(library)}
      lede={library.summary}
    >
      <p className="text-caption smallcaps text-ink-soft">
        Chapter {library.number}
      </p>

      <dl className="mt-4 divide-y divide-paper-edge border-y border-paper-edge figures-lining">
        {facts.map((fact) => (
          <div
            key={fact.term}
            className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4"
          >
            <dt className="smallcaps">{fact.term}</dt>
            <dd>
              <Txt>{fact.detail}</Txt>
            </dd>
          </div>
        ))}
      </dl>

      {library.photos.map((photo, index) => (
        <PictureFrame
          key={index}
          picture={photo}
          sizes="(min-width: 768px) 42rem, 100vw"
          className="mt-12"
        />
      ))}

      <section className="mt-14">
        <h2 className="text-h2">Launch day</h2>
        <div className="mt-5">
          <RichText value={library.launchDay} />
        </div>
      </section>

      <p className="mt-16 font-sans text-ui">
        <TransitionLink href="/libraries">All libraries</TransitionLink>
      </p>
    </BookPage>
  );
}
