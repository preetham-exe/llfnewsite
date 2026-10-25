import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { ReactNode } from "react";

import { MonogramSymbol } from "@/components/brand/MonogramSymbol";
import { PersistentNav } from "@/components/nav/PersistentNav";
import { Providers } from "@/components/providers/Providers";
import { Footer } from "@/components/site/Footer";
import { SkipLink } from "@/components/site/SkipLink";
import { TransitionOverlay } from "@/components/transition/TransitionOverlay";

/** Built on Vercel, where Analytics and Speed Insights have their scripts. */
const onVercel = process.env.VERCEL === "1";

/**
 * Everything round a page of the site: the nav, Lenis, the transition
 * overlay and the footer. It lives in the (site) layout, so it never
 * unmounts between client navigations; the 404 page renders it too, as it
 * sits outside that layout. The Studio at /studio has none of it.
 *
 * On Vercel it also counts visits and measures real visitors' page speed
 * (Vercel Analytics and Speed Insights: no cookies, nothing personal).
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
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
      {onVercel && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </>
  );
}
