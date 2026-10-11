import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Book } from "@/components/shelf/Book";
import { CoverFace } from "@/components/shelf/Cover";
import { books } from "@/content/books";

/*
 * A test bench for the covers and the 3D book, so they can be checked in
 * every browser (Safari especially) long before the transition exists.
 * Not linked from the site, not indexed, and absent from production.
 */

export const metadata: Metadata = {
  title: "Book test bench",
  robots: { index: false, follow: false },
};

export default function BookTestPage() {
  if (process.env.VERCEL_ENV === "production") notFound();

  return (
    <div className="pt-(--nav-height)">
      <div className="mx-auto max-w-page px-4 py-12 sm:px-6">
        <h1 className="text-h2">Book test bench</h1>
        <p className="mt-2 font-sans text-ui text-ink-soft">
          Covers and the 3D book, for checking in every browser. Not linked from
          the site.
        </p>

        <h2 className="mt-12 text-h3">Covers</h2>
        <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-7">
          {books.map((book) => (
            <li key={book.id} className="aspect-[1/1.42]">
              <CoverFace book={book} />
            </li>
          ))}
        </ul>

        <h2 className="mt-16 text-h3">Three-quarter view</h2>
        <ul className="mt-12 grid grid-cols-[repeat(auto-fill,minmax(19rem,1fr))] gap-x-10 gap-y-28 pl-10">
          {books.map((book) => (
            <li key={book.id} data-test-book={book.id}>
              <Book book={book} turn={30} tilt={-8} />
            </li>
          ))}
        </ul>

        <h2 className="mt-16 text-h3">Spine facing, as on the shelf</h2>
        <ul className="mt-10 flex flex-wrap items-end gap-1">
          {books.map((book) => (
            <li key={book.id}>
              <Book book={book} turn={90} className="[--w:9rem]" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
