import type { Metadata } from "next";

import { BookPage } from "@/components/book/BookPage";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { contactForm, getInvolved } from "@/content/pages";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

/*
 * Where the contact form leads when a message could not be sent and the
 * form could not say so in place (no JavaScript yet): the email address to
 * write to instead. Kept out of search results.
 */
export const metadata: Metadata = {
  ...pageMetadata({
    title: contactForm.unsent.title,
    description: contactForm.unsent.body,
    path: "/get-involved/unsent",
  }),
  robots: { index: false, follow: false },
};

export default function UnsentPage() {
  return (
    <BookPage
      book="get-involved"
      title={contactForm.unsent.title}
      kicker={getInvolved.title}
    >
      <p>
        {contactForm.unsent.body}{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
      <p className="mt-8 font-sans text-ui">
        <TransitionLink href="/get-involved" className="tap-target">
          {contactForm.unsent.back}
        </TransitionLink>
      </p>
    </BookPage>
  );
}
