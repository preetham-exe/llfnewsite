import { isTodo } from "@/content/helpers";

/**
 * Renders a content value. TODO values (content the founder still has to
 * supply) are highlighted so they are easy to spot and impossible to miss.
 */
export function Txt({ children }: { children: string | number }) {
  if (isTodo(children)) {
    return (
      <mark className="rounded-[2px] bg-paper-shade px-1 font-sans text-[0.85em] text-stamp outline-1 outline-stamp/40 outline-dashed">
        {children}
      </mark>
    );
  }
  return <>{children}</>;
}
