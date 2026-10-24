import Image from "next/image";

import { TransitionLink } from "@/components/transition/TransitionLink";
import { Txt } from "@/components/ui/Txt";
import { books } from "@/content/books";
import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t border-paper-edge bg-paper-shade font-sans text-ui text-ink-soft">
      <div className="mx-auto grid max-w-page gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <Image
            src="/brand/wordmark.svg"
            alt="Literate Lives"
            width={296}
            height={146}
            unoptimized
            className="h-auto w-40"
          />
          <p className="mt-5 font-serif-italic text-lede text-ink">
            {site.tagline}
          </p>
          <p className="mt-3">
            {site.name}, {site.city}
          </p>
        </div>

        <div>
          <h2 className="font-serif smallcaps text-ink">Contact</h2>
          <p className="mt-3">
            <a href={`mailto:${site.email}`} className="tap-target">
              {site.email}
            </a>
          </p>
          <p className="mt-3">
            <Txt>{site.social}</Txt>
          </p>
        </div>

        <div>
          <h2 className="font-serif smallcaps text-ink">Registration</h2>
          <p className="mt-3">{site.registrationSummary}</p>
          <p className="mt-3">
            <Txt>{site.registrations.trust}</Txt>
          </p>
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <ul className="flex flex-wrap gap-x-5">
            {books.map((book) => (
              <li key={book.id}>
                <TransitionLink
                  href={book.href}
                  className="tap-target no-underline hover:underline"
                >
                  {book.spineTitle}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
