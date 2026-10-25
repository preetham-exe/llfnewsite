import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookPage } from "@/components/book/BookPage";
import { Margin } from "@/components/book/Margin";
import { CatalogueCard } from "@/components/book/Marginalia";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { JsonLd } from "@/components/ui/JsonLd";
import { PictureFrame } from "@/components/ui/PictureFrame";
import { RichText } from "@/components/ui/RichText";
import { Txt } from "@/components/ui/Txt";
import { isTodo } from "@/content/helpers";
import { librariesIndex } from "@/content/pages";
import { site } from "@/content/site";
import type { Library, LibrarySize } from "@/content/types";
import { getLibraries, getLibrary } from "@/lib/content";
import { formatCount, formatDate } from "@/lib/format";
import { breadcrumbJsonLd, libraryJsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/seo";

/*
 * Each library page reads its slug from the URL, so it cannot be part of the
 * shared App Shell. It is allowed to wait for the server, and every link to
 * it uses prefetch={true}, which loads the whole page ahead of time.
 */
export const instant = false;

/*
 * Every library is built ahead. One added in the Studio after a deploy is
 * built on its first visit (and from then on served like the rest).
 * Cache Components needs at least one entry, so with no libraries at all
 * this builds one page that is not found.
 */
export async function generateStaticParams() {
  const libraries = await getLibraries();
  return libraries.length
    ? libraries.map((library) => ({ slug: library.slug }))
    : [{ slug: "none" }];
}

function libraryTitle(library: Library): string {
  return isTodo(library.name) ? `Library #${library.number}` : library.name;
}

const sizeNames: Record<LibrarySize, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

export async function generateMetadata({
  params,
}: PageProps<"/libraries/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const library = await getLibrary(slug);
  if (!library) return {};

  return pageMetadata({
    title: libraryTitle(library),
    description: isTodo(library.summary)
      ? `Library #${library.number}, built by Literate Lives Foundation.`
      : library.summary,
    path: `/libraries/${library.slug}`,
    ownShareImage: true,
  });
}

export default async function LibraryPage({
  params,
}: PageProps<"/libraries/[slug]">) {
  const { slug } = await params;
  const library = await getLibrary(slug);
  if (!library) notFound();

  const { partner, size } = library;
  const facts = [
    { term: "Opened", detail: <Txt>{formatDate(library.openedOn)}</Txt> },
    { term: "City", detail: <Txt>{library.city}</Txt> },
    {
      term: "Partner",
      detail: isTodo(partner) ? (
        <Txt>{partner}</Txt>
      ) : (
        <TransitionLink href="/partners" className="tap-area">
          {partner.name}
        </TransitionLink>
      ),
    },
    {
      term: "Books placed",
      detail: <Txt>{formatCount(library.booksPlaced)}</Txt>,
    },
    {
      term: "Children",
      detail: <Txt>{formatCount(library.childrenServed)}</Txt>,
    },
    {
      term: "Size",
      detail: <Txt>{isTodo(size) ? size : sizeNames[size]}</Txt>,
    },
  ];

  return (
    <BookPage
      book="libraries"
      title={libraryTitle(library)}
      lede={library.summary}
      kicker={`Library #${library.number}`}
    >
      <JsonLd data={libraryJsonLd(library)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: site.name, path: "/" },
          { name: librariesIndex.title, path: "/libraries" },
          {
            name: libraryTitle(library),
            path: `/libraries/${library.slug}`,
          },
        ])}
      />
      {/* The library's facts, as its card in the catalogue: on the left
          page beside the photos, or first on smaller screens. */}
      <Margin>
        <CatalogueCard heading={libraryTitle(library)} facts={facts} />
      </Margin>

      {library.photos.map((photo, index) => (
        <PictureFrame
          key={index}
          picture={photo}
          sizes="(min-width: 768px) 42rem, 100vw"
          className={index > 0 ? "mt-12" : ""}
        />
      ))}

      <section className="mt-14">
        <h2 className="text-h2">Launch day</h2>
        <div className="mt-5">
          <RichText value={library.launchDay} />
        </div>
      </section>

      <p className="mt-16 font-sans text-ui">
        <TransitionLink href="/libraries" className="tap-target">
          All libraries
        </TransitionLink>
      </p>
    </BookPage>
  );
}
