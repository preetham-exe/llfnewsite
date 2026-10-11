import { PageReady } from "@/components/book/PageReady";
import { DonateButton } from "@/components/nav/DonateButton";
import { Shelf } from "@/components/shelf/Shelf";
import { JsonLd } from "@/components/ui/JsonLd";
import { PictureFrame } from "@/components/ui/PictureFrame";
import { libraries } from "@/content/libraries";
import { home } from "@/content/pages";
import { site, stats } from "@/content/site";
import { organizationJsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: home.metaTitle,
  description: site.description,
  path: "/",
  absoluteTitle: true,
});

const impact = [
  { value: stats.childrenReached, label: "children reached" },
  { value: stats.booksPlaced, label: "books placed" },
  { value: String(libraries.length), label: "libraries so far" },
];

export default function HomePage() {
  return (
    <div className="pt-(--nav-height)">
      <JsonLd data={organizationJsonLd()} />

      <section className="wall">
        <div className="mx-auto max-w-page px-4 pt-10 pb-16 sm:px-6 sm:pt-16 sm:pb-24">
          <h1 className="max-w-[18ch] text-display">{home.headline}</h1>
          <p className="mt-4 font-serif-italic text-lede text-ink-soft">
            {site.tagline}
          </p>
          <div className="mt-10 sm:mt-14">
            <Shelf />
          </div>
        </div>
      </section>

      <section
        aria-label="About Literate Lives Foundation"
        className="mx-auto max-w-measure px-4 pt-24 pb-16 sm:px-0"
      >
        <p className="text-lede">{home.mission}</p>
        <p className="mt-4 text-ink-soft">{home.next}</p>

        <dl className="mt-16 grid gap-10 figures-lining sm:grid-cols-3">
          {impact.map((item) => (
            <div key={item.label} className="flex flex-col-reverse gap-1">
              <dt className="font-sans text-ui text-ink-soft">{item.label}</dt>
              <dd className="text-h1">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <PictureFrame picture={home.photo} sizes="100vw" className="w-full" />

      <section className="mx-auto max-w-measure px-4 py-24 text-center">
        <p className="text-lede">{home.donateLine}</p>
        <DonateButton className="mt-8">{home.donateCta}</DonateButton>
      </section>

      <PageReady />
    </div>
  );
}
