import type { Route } from "next";

import { BookPage } from "@/components/book/BookPage";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Txt } from "@/components/ui/Txt";
import { partnersIndex } from "@/content/pages";
import { partners } from "@/content/partners";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: partnersIndex.title,
  description: partnersIndex.description,
  path: "/partners",
});

export default function PartnersPage() {
  return (
    <BookPage
      book="partners"
      title={partnersIndex.title}
      lede={partnersIndex.lede}
    >
      <ul className="divide-y divide-paper-edge border-y border-paper-edge">
        {partners.map((partner) => (
          <li key={partner._id} className="py-8">
            <h2 className="text-h2">{partner.name}</h2>
            <p className="mt-3">
              <Txt>{partner.about}</Txt>
            </p>
            <p className="mt-3">
              <span className="smallcaps">Together: </span>
              <Txt>{partner.produced}</Txt>
            </p>
            {partner.libraries.length > 0 && (
              <ul className="mt-3 font-sans text-ui">
                {partner.libraries.map((library) => (
                  <li key={library.slug}>
                    <TransitionLink
                      href={`/libraries/${library.slug}` as Route}
                    >
                      {library.name}
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </BookPage>
  );
}
