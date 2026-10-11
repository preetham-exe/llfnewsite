import { BookPage } from "@/components/book/BookPage";
import { Sections } from "@/components/book/Sections";
import { Txt } from "@/components/ui/Txt";
import { todo } from "@/content/helpers";
import { getInvolved } from "@/content/pages";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: getInvolved.title,
  description: getInvolved.description,
  path: "/get-involved",
});

export default function GetInvolvedPage() {
  return (
    <BookPage
      book="get-involved"
      title={getInvolved.title}
      lede={getInvolved.lede}
    >
      <Sections sections={getInvolved.sections} />

      <section className="mt-14">
        <h2 className="text-h2">Write to us</h2>
        <p className="mt-5">
          Email <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
        <p className="mt-5">
          <Txt>
            {todo(
              "Contact form for volunteers, chapters and library requests (Phase 5)",
            )}
          </Txt>
        </p>
      </section>
    </BookPage>
  );
}
