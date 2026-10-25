import "@/styles/globals.css";

import type { ReactNode } from "react";

import { SiteChrome } from "@/components/site/SiteChrome";

/** Every page of the site: its styles, and the shell round each page. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
