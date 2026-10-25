import { PageReady } from "@/components/book/PageReady";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { DonateButton } from "@/components/nav/DonateButton";
import { Shelf } from "@/components/shelf/Shelf";
import { ShelfMotion } from "@/components/shelf/ShelfMotion";
import { JsonLd } from "@/components/ui/JsonLd";
import { FullBleedPhoto } from "@/components/ui/FullBleedPhoto";
import { home } from "@/content/pages";
import { site, stats } from "@/content/site";
import { getLibraries } from "@/lib/content";
import { organizationJsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: home.metaTitle,
  description: site.description,
  path: "/",
  absoluteTitle: true,
});

export default async function HomePage() {
  const impact = [
    { value: stats.childrenReached, label: "children reached" },
    { value: stats.booksPlaced, label: "books placed" },
    { value: String((await getLibraries()).length), label: "libraries so far" },
  ];

  return (
    <div className="pt-(--nav-height)">
      <JsonLd data={organizationJsonLd()} />

      {/* The first screen: what LLF does, then the bookcase filling the rest
          of the screen (between 26rem and 46rem tall on larger screens). On
          a phone turned on its side the two sit side by side instead. */}
      <section className="wall grid min-h-[calc(100svh-var(--nav-height))] md:grid-rows-[auto_1fr] short-landscape:h-[calc(100svh-var(--nav-height))] short-landscape:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] short-landscape:grid-rows-1">
        <div className="mx-auto w-full max-w-page px-4 pt-10 pb-8 sm:px-6 sm:pt-14 md:pb-10 short-landscape:self-center short-landscape:py-4">
          <h1 className="max-w-[22ch] text-display short-landscape:text-h2">
            {home.headline}
          </h1>
          <p className="mt-4 font-serif-italic text-lede text-ink-soft">
            {site.tagline}
          </p>
        </div>
        <div className="md:max-h-[46rem] md:min-h-[26rem] short-landscape:min-h-0 short-landscape:py-3 short-landscape:pr-3">
          <ShelfMotion>
            <Shelf />
          </ShelfMotion>
        </div>
      </section>

      <section
        aria-label="About Literate Lives Foundation"
        className="mx-auto max-w-measure px-4 pt-24 pb-16 sm:px-0"
      >
        <Reveal>
          <p className="text-lede">{home.mission}</p>
          <p className="mt-4 text-ink-soft">{home.next}</p>
        </Reveal>

        <Reveal>
          <dl className="mt-16 grid gap-6 figures-lining sm:grid-cols-3 sm:gap-10">
            {impact.map((item) => (
              <div key={item.label} className="flex flex-col-reverse gap-1">
                <dt className="font-sans text-ui text-ink-soft">
                  {item.label}
                </dt>
                <dd className="text-h1">
                  <CountUp value={item.value} />
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      <FullBleedPhoto photo={home.photo} focus="50% 42%" />

      <section className="mx-auto max-w-measure px-4 py-24 text-center">
        <Reveal>
          <p className="text-lede">{home.donateLine}</p>
          <DonateButton className="mt-8">{home.donateCta}</DonateButton>
        </Reveal>
      </section>

      <PageReady />
    </div>
  );
}
