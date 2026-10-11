"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, type ReactNode } from "react";

import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * One Lenis instance for the whole site, created once in the root layout.
 * GSAP's ticker drives it so ScrollTrigger and Lenis share a single frame loop.
 * Lenis disables smoothing by itself under prefers-reduced-motion, and leaves
 * touch scrolling native.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{ autoRaf: false, anchors: true, stopInertiaOnNavigate: true }}
    >
      <LenisGsapBridge />
      {children}
    </ReactLenis>
  );
}

function LenisGsapBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const update = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.off("scroll", ScrollTrigger.update);
    };
  }, [lenis]);

  return null;
}
