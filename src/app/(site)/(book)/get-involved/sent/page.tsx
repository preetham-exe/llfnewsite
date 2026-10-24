import type { Metadata } from "next";

import { BookPage } from "@/components/book/BookPage";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { contactForm, getInvolved } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";

/*
 * Where the contact form leads once a message is sent, when the form could
 * not show it in place (no JavaScript yet). Kept out of search results.
 */
export const metadata: Metadata = {
  ...pageMetadata({
    title: contactForm.sent.title,
    description: contactForm.sent.body,
    path: "/get-involved/sent",
  }),
  robots: { index: false, follow: false },
};

export default function SentPage() {
  return (
    <BookPage
      book="get-involved"
      title={contactForm.sent.title}
      lede={contactForm.sent.body}
      kicker={getInvolved.title}
    >
      <p className="font-sans text-ui">
        <TransitionLink href="/get-involved" className="tap-target">
          {contactForm.sent.back}
        </TransitionLink>
      </p>
    </BookPage>
  );
}
