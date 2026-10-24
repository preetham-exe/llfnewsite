import { BookPage } from "@/components/book/BookPage";
import { Margin } from "@/components/book/Margin";
import { BookPocket } from "@/components/book/Marginalia";
import { Sections } from "@/components/book/Sections";
import { CheckoutCard } from "@/components/donate/CheckoutCard";
import { Txt } from "@/components/ui/Txt";
import { donate } from "@/content/pages";
import { MILAAP_URL, site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { marginalia } from "@/motion/tokens";

export const metadata = pageMetadata({
  title: donate.title,
  description: donate.description,
  path: "/donate",
});

const { terms } = donate.registration;
const registrationRows = [
  { term: terms.trust, detail: site.registrations.trust },
  { term: terms.section12A, detail: site.registrations.section12A },
  { term: terms.section80G, detail: site.registrations.section80G },
  { term: terms.darpan, detail: site.registrations.darpan },
  { term: terms.pan, detail: site.registrations.pan },
];

/**
 * Donate: the library checkout card first (giving happens on Milaap, never
 * on this site), then how giving works, where the money goes, the 80G tax
 * benefit, the registrations and a contact for larger gifts. On the open
 * spread the card's pocket is on the left page.
 */
export default function DonatePage() {
  return (
    <BookPage book="donate" title={donate.title} lede={donate.lede}>
      <Margin drift={marginalia.card} wideOnly>
        <BookPocket name={site.name} motto={site.tagline} />
      </Margin>

      <CheckoutCard copy={donate.checkout} destination={MILAAP_URL} />

      <div className="mt-16">
        <Sections sections={[...donate.sections]} />
      </div>

      <section className="mt-14">
        <h2 className="text-h2">{donate.registration.heading}</h2>
        <p className="mt-5">{site.registrationSummary}</p>
        <dl className="mt-6 divide-y divide-paper-edge border-y border-paper-edge figures-lining">
          {registrationRows.map((row) => (
            <div
              key={row.term}
              className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr] sm:gap-4"
            >
              <dt className="smallcaps">{row.term}</dt>
              <dd>
                <Txt>{row.detail}</Txt>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-14">
        <h2 className="text-h2">{donate.larger.heading}</h2>
        <p className="mt-5">
          {donate.larger.text} <a href={`mailto:${site.email}`}>{site.email}</a>
          .
        </p>
      </section>
    </BookPage>
  );
}
