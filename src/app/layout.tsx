import "@/styles/globals.css";

import type { Metadata, Viewport } from "next";

import { MonogramSymbol } from "@/components/brand/MonogramSymbol";
import { PersistentNav } from "@/components/nav/PersistentNav";
import { Providers } from "@/components/providers/Providers";
import { Footer } from "@/components/site/Footer";
import { SkipLink } from "@/components/site/SkipLink";
import { TransitionOverlay } from "@/components/transition/TransitionOverlay";
import { site } from "@/content/site";
import { fontVariables } from "@/lib/fonts";
import { SITE_INDEXABLE, SITE_URL } from "@/lib/site-url";
import { SETTLED_KEY } from "@/lib/storage-keys";
import { shelf } from "@/motion/tokens";

/** Every page on the site is fully static. The build fails otherwise. */
export const ensureStatic = "navigation";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    siteName: site.name,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: SITE_INDEXABLE
    ? { index: true, follow: true }
    : { index: false, follow: false },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f1e7",
  colorScheme: "only light",
};

/*
 * Runs before first paint. Marks that JavaScript is running, so starting
 * states for animations apply only when the animation can actually run
 * (without JavaScript every page renders complete). On a session's first visit
 * to the shelf it also lifts the books a little so ShelfMotion can settle
 * them, and drops them into place anyway if that has not started in 3 s.
 */
const boot = `(function () {
  var d = document.documentElement;
  d.classList.add("js");
  try {
    if (
      location.pathname === "/" &&
      !sessionStorage.getItem("${SETTLED_KEY}") &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      d.style.setProperty("--shelf-settle", "${shelf.settleDrop}px");
      d.setAttribute("data-shelf-settle", "");
      setTimeout(function () { d.removeAttribute("data-shelf-settle"); }, 3000);
    }
  } catch (e) {}
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <MonogramSymbol />
        <SkipLink />
        <Providers>
          <PersistentNav />
          <div data-page-root="">
            <main id="main" tabIndex={-1} className="focus:outline-none">
              {children}
            </main>
            <Footer />
          </div>
          <TransitionOverlay />
        </Providers>
      </body>
    </html>
  );
}
