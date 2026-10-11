"use client";

import { useRef } from "react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { dur, ease } from "@/motion/tokens";

/**
 * A statistic such as "1,500+" that counts up from zero the first time it
 * scrolls into view. The final value is in the HTML, so it reads correctly
 * without JavaScript, with reduced motion, and when already on screen at load.
 * Screen readers always get the final value.
 */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const element = ref.current;
      const match = value.match(/^([\d,]+)(.*)$/);
      if (!element || !match) return;
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const visible = element.getBoundingClientRect().top < window.innerHeight;
      if (reduce || visible) return;

      const target = Number(match[1]!.replaceAll(",", ""));
      const suffix = match[2] ?? "";
      const counter = { value: 0 };
      const show = () => {
        element.textContent =
          Math.round(counter.value).toLocaleString("en-IN") + suffix;
      };
      show();

      ScrollTrigger.create({
        trigger: element,
        start: "top 90%",
        once: true,
        onEnter: () =>
          gsap.to(counter, {
            value: target,
            duration: dur.long,
            ease: ease.out,
            onUpdate: show,
          }),
      });
    },
    { scope: ref },
  );

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {value}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}
