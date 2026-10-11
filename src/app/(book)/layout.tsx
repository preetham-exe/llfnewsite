import type { ReactNode } from "react";

/**
 * Shared by every section page (the route group adds nothing to the URL).
 * Because this layout stays mounted between sections, Phase 4's open-book
 * frame lives here and only the page content changes on navigation.
 */
export default function BookLayout({ children }: { children: ReactNode }) {
  return <div className="pt-(--nav-height)">{children}</div>;
}
