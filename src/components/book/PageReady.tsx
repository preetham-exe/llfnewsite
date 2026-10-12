"use client";

import { useEffect } from "react";

import { announcePage } from "@/components/transition/page-ready";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Rendered by every page template. Each time the page is shown it tells the
 * transition (which waits for it before revealing the page), and once fonts
 * have loaded it refreshes ScrollTrigger so trigger positions match the
 * final layout.
 */
export function PageReady() {
  useEffect(() => {
    announcePage(window.location.pathname);

    let cancelled = false;
    let frame = 0;
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
