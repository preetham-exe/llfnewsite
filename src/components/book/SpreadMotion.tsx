"use client";

import { useRef, type ReactNode } from "react";

import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { gsap } from "@/lib/gsap-draw";
import { SplitText } from "@/lib/gsap-split";
import { ease, pencil, reveal } from "@/motion/tokens";

/**
 * The motion of a section page, all of it small and once only:
 * - chapter headings rise into place line by line as they come into view
 * - pencil marks under key phrases are drawn, as if by hand
 * - objects in the margins drift a little against the scroll
 * Nothing on the first screen is hidden before it animates. With reduced
 * motion nothing moves, and the pencil marks are simply there.
 *
 * It also wraps the page's content, which rises in as the book opens.
 */
export function SpreadMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const marks = [
        ...root.querySelectorAll<SVGSVGElement>(".pencil-mark__line"),
      ];
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(marks, { visibility: "visible" });
        return;
      }
      // Below the page's first screen. Measured from the top of the page, not
      // the window: a page arriving by transition mounts while the window is
      // still scrolled for the page it replaces.
      const belowFold = (element: Element) =>
        element.getBoundingClientRect().top + window.scrollY >
        window.innerHeight;

      /* Chapter headings, line by line from behind a mask. */
      root.querySelectorAll<HTMLElement>("h2").forEach((heading) => {
        if (!belowFold(heading)) return;
        SplitText.create(heading, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (split) =>
            gsap.from(split.lines, {
              yPercent: 100,
              duration: reveal.lines.duration,
              stagger: reveal.lines.stagger,
              ease: ease.out,
              scrollTrigger: { trigger: heading, start: "top 88%", once: true },
            }),
        });
      });

      /* Pencil marks: hidden by CSS until now (only with JavaScript). */
      marks.forEach((mark) => {
        const strokes = mark.querySelectorAll("[data-pencil]");
        gsap.set(strokes, { drawSVG: "0%" });
        gsap.set(mark, { visibility: "visible" });
        const draw = () =>
          gsap.to(strokes, {
            drawSVG: "100%",
            duration: pencil.duration,
            stagger: pencil.duration / 3,
            ease: ease.inOut,
          });
        if (belowFold(mark)) {
          ScrollTrigger.create({
            trigger: mark,
            start: "top 85%",
            once: true,
            onEnter: draw,
          });
        } else {
          afterArrival(() => gsap.delayedCall(pencil.delay, draw));
        }
      });

      /* Objects in the margins drift against the scroll. */
      root.querySelectorAll<HTMLElement>("[data-drift]").forEach((item) => {
        const depth = Number(item.dataset.drift);
        gsap.fromTo(
          item,
          { y: depth / 2 },
          {
            y: -depth / 2,
            ease: "none",
            scrollTrigger: {
              trigger: item,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    },
    { scope },
  );

  return (
    <div ref={scope} data-transition-content="" className="spread__content">
      {children}
    </div>
  );
}

/**
 * Runs once the page is on screen: at once, or when the book that is opening
 * onto it has finished.
 */
function afterArrival(callback: () => void) {
  const opening = document.querySelector(
    "[data-transition-overlay][data-active]",
  );
  if (!opening) {
    callback();
    return;
  }
  const done = (event: Event) => {
    const { phase } = (event as CustomEvent<{ phase: string }>).detail;
    if (phase === "start") return;
    window.removeEventListener("llf:transition", done);
    callback();
  };
  window.addEventListener("llf:transition", done);
}
