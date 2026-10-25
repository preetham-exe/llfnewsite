import { BookPage } from "@/components/book/BookPage";
import { Margin } from "@/components/book/Margin";
import { SignUpSheet, StickyNotes } from "@/components/book/Marginalia";
import { Sections } from "@/components/book/Sections";
import { ContactForm } from "@/components/forms/ContactForm";
import { contactForm, getInvolved, getInvolvedMargins } from "@/content/pages";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { marginalia } from "@/motion/tokens";

export const metadata = pageMetadata({
  title: getInvolved.title,
  description: getInvolved.description,
  path: "/get-involved",
  ownShareImage: true,
});

export default function GetInvolvedPage() {
  return (
    <BookPage
      book="get-involved"
      title={getInvolved.title}
      lede={getInvolved.lede}
    >
      <Sections
        sections={getInvolved.sections}
        besides={[
          // A sticky note for each way to help.
          <Margin key="notes" drift={marginalia.sticky}>
            <StickyNotes
              notes={getInvolved.sections.map(({ heading }) => heading)}
            />
          </Margin>,
        ]}
      />

      <section className="mt-14">
        <Margin drift={marginalia.clipboard} variant="inset">
          <SignUpSheet {...getInvolvedMargins.sheet} />
        </Margin>
        <h2 className="text-h2">{contactForm.heading}</h2>
        <p className="mt-5">
          {contactForm.intro} {contactForm.orEmail}{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
        <ContactForm copy={contactForm} email={site.email} />
      </section>
    </BookPage>
  );
}
