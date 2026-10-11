import { BookPage } from "@/components/book/BookPage";
import { Sections } from "@/components/book/Sections";
import { Txt } from "@/components/ui/Txt";
import { isTodo } from "@/content/helpers";
import { donate } from "@/content/pages";
import { MILAAP_URL, site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: donate.title,
  description: donate.description,
  path: "/donate",
});

const registrationRows = [
  { term: "Trust", detail: site.registrations.trust },
  { term: "12A", detail: site.registrations.section12A },
  { term: "80G", detail: site.registrations.section80G },
  { term: "NGO DARPAN", detail: site.registrations.darpan },
  { term: "PAN", detail: site.registrations.pan },
];

export default function DonatePage() {
  return (
    <BookPage book="donate" title={donate.title} lede={donate.lede}>
      {/* Phase 6 replaces this with the library checkout card. */}
      <p>
        {isTodo(MILAAP_URL) ? (
          <Txt>{MILAAP_URL}</Txt>
        ) : (
          <a href={MILAAP_URL}>Donate on Milaap</a>
        )}
      </p>

      <div className="mt-14">
        <Sections sections={donate.sections} />
      </div>

      <section className="mt-14">
        <h2 className="text-h2">Registration</h2>
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
    </BookPage>
  );
}
