import type { Section as SectionCopy } from "@/content/pages";

import { Prose } from "./Prose";

/** Renders the sections of a fixed page from src/content/pages.ts. */
export function Sections({ sections }: { sections: SectionCopy[] }) {
  return (
    <>
      {sections.map((section) => (
        <Section key={section.heading} section={section} />
      ))}
    </>
  );
}

/** One section: a chapter heading and its text, steps or terms. */
export function Section({ section }: { section: SectionCopy }) {
  return (
    <section className="mt-14 first:mt-0">
      <h2 className="text-h2">{section.heading}</h2>

      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph} className="mt-5">
          <Prose>{paragraph}</Prose>
        </p>
      ))}

      {section.steps && (
        <ol className="mt-6 space-y-5">
          {section.steps.map((step, index) => (
            <li key={step.title} className="grid grid-cols-[2rem_1fr] gap-x-3">
              <span className="text-ink-soft figures-lining" aria-hidden="true">
                {index + 1}.
              </span>
              <div>
                <h3 className="text-h3">{step.title}</h3>
                <p className="mt-1">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {section.terms && (
        <dl className="mt-6 divide-y divide-paper-edge border-y border-paper-edge">
          {section.terms.map((item) => (
            <div
              key={item.term}
              className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr] sm:gap-4"
            >
              <dt className="smallcaps">{item.term}</dt>
              <dd>{item.detail}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
