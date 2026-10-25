"use client";

import { useRef, type ReactNode } from "react";

import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { gsap } from "@/lib/gsap-draw";
import { SplitText } from "@/lib/gsap-split";
import { ease, pencil, reveal } from "@/motion/tokens";

import { afterArrival } from "./arrival";

/**
 * The motion of a section page, all of it small and once only:
 * - chapter headings rise into place line by line as they come into view
 * - pencil marks under key phrases are drawn, as if by hand
 * - pencil sketches in the margins are drawn line by line
 * - objects in the margins drift a little against the scroll
 * Nothing on the first screen is hidden before it animates. With reduced
 * motion nothing moves, and the pencil marks and sketches are simply there.
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
      const sketches = [
        ...root.querySelectorAll<SVGSVGElement>(".pencil-sketch"),
      ];
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        [...marks, ...sketches].forEach((drawing) =>
          gsap.set(drawing, { visibility: "visible" }),
        );
        return;
      }
      // Below the page's first screen. Measured from the top of the page, not
      // the window: a page arriving by transition mounts while the window is
      // still scrolled for the page it replaces.
      const belowFold = (element: Element) =>
        element.getBoundingClientRect().top + window.scrollY >
        window.innerHeight;
      // Drawn once: as it scrolls into view, or, on the first screen, a
      // moment after the page shows.
      const whenSeen = (element: Element, start: string, draw: () => void) => {
        if (belowFold(element)) {
          ScrollTrigger.create({
            trigger: element,
            start,
            once: true,
            onEnter: draw,
          });
        } else {
          afterArrival(() => gsap.delayedCall(pencil.delay, draw));
        }
      };

      /* Chapter headings, line by line from behind a mask. A heading that
         holds a link stays whole: splitting it would hide the link from
         screen readers and copy it once for every line. */
      root.querySelectorAll<HTMLElement>("h2").forEach((heading) => {
        if (!belowFold(heading) || heading.querySelector("a, button")) return;
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
        whenSeen(mark, "top 85%", () =>
          gsap.to(strokes, {
            drawSVG: "100%",
            duration: pencil.duration,
            stagger: pencil.duration / 3,
            ease: ease.inOut,
          }),
        );
      });

      /* Sketches: the main lines, the quick strokes among them, then the
         labels. */
      sketches.forEach((sketch) => {
        const lines = [...sketch.querySelectorAll("[data-pencil]")];
        const quick = lines.filter(
          (line) => line.getAttribute("data-pencil") === "quick",
        );
        const steady = lines.filter((line) => !quick.includes(line));
        const labels = sketch.querySelectorAll("text");
        gsap.set(lines, { drawSVG: "0%" });
        if (labels.length) gsap.set(labels, { opacity: 0 });
        gsap.set(sketch, { visibility: "visible" });
        whenSeen(sketch, "top 75%", () => {
          const { sketch: pace } = pencil;
          const timeline = gsap.timeline().to(steady, {
            drawSVG: "100%",
            duration: pace.line,
            stagger: pace.stagger,
            ease: ease.softInOut,
          });
          if (quick.length) {
            timeline.to(
              quick,
              {
                drawSVG: "100%",
                duration: pace.quick.line,
                stagger: pace.quick.stagger,
                ease: ease.soft,
              },
              pace.quickFrom,
            );
          }
          if (labels.length) {
            timeline.to(labels, {
              opacity: 1,
              duration: pace.label,
              ease: ease.soft,
            });
          }
        });
      });

      /* Objects in the margins drift against the scroll. */
      root.querySelectorAll<HTMLElement>("[data-drift]").forEach((item) => {
        const depth = Number(item.dataset.drift);
        if (!depth) return;
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
