"use client";

import { type ReactNode, useRef, useState } from "react";

import { afterArrival } from "@/components/book/arrival";
import type { gallery as galleryCopy } from "@/content/pages";
import type { Plate } from "@/lib/gallery";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ease, gallery } from "@/motion/tokens";

import { PlateViewer } from "./PlateViewer";

type GalleryMotionProps = {
  plates: Plate[];
  copy: typeof galleryCopy;
  children: ReactNode;
};

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The Gallery's motion. Each plate's tissue leaf turns back on its inner
 * edge as the plate comes into view (on the first screen, once the page
 * shows), and is gone. A click on a plate opens it in the viewer, from
 * which focus returns to the plate. With reduced motion there are no
 * leaves (gallery.css), and the viewer only fades.
 */
export function GalleryMotion({ plates, copy, children }: GalleryMotionProps) {
  const scope = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLAnchorElement | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  useGSAP(
    (_, contextSafe) => {
      const root = scope.current;
      if (!root || !contextSafe) return;

      const turnBack = contextSafe((leaf: HTMLElement) => {
        gsap
          .timeline()
          .set(leaf, {
            transformOrigin: "0% 50%",
            transformPerspective: gallery.tissue.perspective,
          })
          .to(leaf, {
            rotationY: gallery.tissue.angle,
            duration: gallery.tissue.turn,
            ease: ease.hinge,
          })
          .to(
            leaf,
            {
              autoAlpha: 0,
              duration: gallery.tissue.turn * (1 - gallery.tissue.fadeFrom),
              ease: ease.softIn,
            },
            gallery.tissue.turn * gallery.tissue.fadeFrom,
          );
      });

      if (!reducedMotion()) {
        root.querySelectorAll<HTMLElement>(".plate__tissue").forEach((leaf) => {
          const plate = leaf.parentElement ?? leaf;
          // Measured from the top of the page, not the window: a page
          // arriving by transition mounts while the window is still
          // scrolled for the page it replaces.
          const onFirstScreen =
            plate.getBoundingClientRect().top + window.scrollY <
            window.innerHeight * 0.8;
          if (onFirstScreen) {
            afterArrival(() =>
              gsap.delayedCall(gallery.tissue.delay, () => turnBack(leaf)),
            );
          } else {
            ScrollTrigger.create({
              trigger: plate,
              start: "top 78%",
              once: true,
              onEnter: () => turnBack(leaf),
            });
          }
        });
      }

      // A plate opens in the viewer, unless the reader wants it elsewhere.
      const onClick = contextSafe((event: MouseEvent) => {
        const link = (event.target as Element).closest<HTMLAnchorElement>(
          "a[data-plate]",
        );
        if (
          !link ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        event.preventDefault();
        opener.current = link;
        setOpen(Number(link.dataset.plate));
      });
      root.addEventListener("click", onClick);
      return () => root.removeEventListener("click", onClick);
    },
    { scope },
  );

  const close = (index: number) => {
    setOpen(null);
    // Back to the plate the reader ended on (it may be another one),
    // scrolled into view if it is not on screen.
    const plate = scope.current?.querySelector<HTMLAnchorElement>(
      `a[data-plate="${index}"]`,
    );
    (plate ?? opener.current)?.focus();
  };

  return (
    <div ref={scope} className="plates">
      {children}
      {open !== null && (
        <PlateViewer
          plates={plates}
          index={open}
          copy={copy}
          onChange={setOpen}
          onClose={close}
        />
      )}
    </div>
  );
}
