import type { ReactNode } from "react";

/**
 * Shared by every section page (the route group adds nothing to the URL).
 * Each page draws its own open-book frame (BookPage), in its own book's
 * cloth, and clears the nav itself.
 */
export default function BookLayout({ children }: { children: ReactNode }) {
  return children;
}
