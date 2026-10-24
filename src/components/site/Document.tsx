import type { Viewport } from "next";
import type { ReactNode } from "react";

import { POPSTATE_HANDLER } from "@/components/transition/first-popstate";
import { fontVariables } from "@/lib/fonts";
import { SETTLED_KEY } from "@/lib/storage-keys";
import { shelf } from "@/motion/tokens";

/*
 * Runs before first paint. Marks that JavaScript is running, so starting
 * states for animations apply only when the animation can actually run
 * (without JavaScript every page renders complete). Adds the page's first
 * popstate listener, so back and forward reach the transition before Next
 * (see first-popstate.ts). On a session's first visit to the shelf it also
 * lifts the books a little so ShelfMotion can settle them, and drops them
 * into place anyway if that has not started in 3 s.
 */
const boot = `(function () {
  var d = document.documentElement;
  d.classList.add("js");
  addEventListener("popstate", function (event) {
    var handle = window["${POPSTATE_HANDLER}"];
    if (handle) handle(event);
  });
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

/** The paper colour for the browser's own bars; the site has no dark mode. */
export const viewport: Viewport = {
  themeColor: "#f6f1e7",
  colorScheme: "only light",
};

/**
 * The HTML document every page sits in: the root layout's, and the 404 for
 * addresses that match no page (app/global-not-found.tsx), which Next
 * renders without any layout.
 */
export function Document({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" className={fontVariables} suppressHydrationWarning>
      {/* eslint-disable-next-line @next/next/no-head-element -- The App
          Router's own document (next/head is for the Pages Router). */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
