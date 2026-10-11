"use client";

import { useEffect } from "react";

import { ScrollTrigger } from "@/lib/gsap";

/**
 * Rendered by every page template. Once the page's fonts have loaded it
 * refreshes ScrollTrigger so trigger positions match the final layout.
 * Phase 3 extends this into the "page is ready" signal for the transition.
 */
export function PageReady() {
  useEffect(() => {
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
