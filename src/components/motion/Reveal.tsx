"use client";

import { useRef, type ReactNode } from "react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { dur, ease, reveal } from "@/motion/tokens";

/**
 * Fades a block up gently the first time it scrolls into view. Anything on
 * screen at load is left alone (never hidden while the page loads), and
 * nothing moves with reduced motion or without JavaScript.
 */
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element) return;
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const visible = element.getBoundingClientRect().top < window.innerHeight;
      if (reduce || visible) return;

      gsap.set(element, { opacity: 0, y: reveal.distance });
      ScrollTrigger.create({
        trigger: element,
        start: "top 88%",
        once: true,
        onEnter: () =>
          gsap.to(element, {
            opacity: 1,
            y: 0,
            duration: dur.medium,
            ease: ease.out,
          }),
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} data-reveal="" className={className}>
      {children}
    </div>
  );
}
