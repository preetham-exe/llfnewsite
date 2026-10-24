import { TransitionLink } from "@/components/transition/TransitionLink";
import { notFound } from "@/content/pages";

/** "The misplaced book". Phase 9 adds the small shelf with a gap in it. */
export default function NotFound() {
  return (
    <div className="pt-(--nav-height)">
      <section className="mx-auto max-w-measure px-4 py-24 sm:py-32">
        <h1 className="text-h1">{notFound.title}</h1>
        <p className="mt-6 text-lede text-ink-soft">{notFound.body}</p>
        <p className="mt-10 font-sans text-ui">
          <TransitionLink href="/" className="tap-target">
            {notFound.back}
          </TransitionLink>
        </p>
      </section>
    </div>
  );
}
