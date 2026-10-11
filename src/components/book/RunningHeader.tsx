import { site } from "@/content/site";

/**
 * The printed-book running header: the section on the left, the foundation on
 * the right, in small caps. Hidden from screen readers because it repeats the
 * page title and the site name.
 */
export function RunningHeader({ section }: { section: string }) {
  return (
    <div
      aria-hidden="true"
      className="flex items-baseline justify-between gap-6 border-b border-paper-edge pt-6 pb-2 text-caption smallcaps text-ink-soft"
    >
      <span>{section}</span>
      <span>{site.name}</span>
    </div>
  );
}
