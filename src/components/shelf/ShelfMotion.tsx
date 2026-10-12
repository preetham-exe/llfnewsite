"use client";

import { useRef, type ReactNode } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import { SETTLED_KEY } from "@/lib/storage-keys";
import { dur, ease, shelf, stagger } from "@/motion/tokens";

/**
 * The shelf's motion. The shelf itself is server-rendered; this wraps it and
 * adds, from the motion tokens:
 * - hover or keyboard focus pulls a book toward the reader, tilted forward,
 *   with its shadow deepening, its neighbours easing aside and its label card
 *   rising into view (focus gives exactly the hover state; focus that follows
 *   a click or a tap does not, so a book never stays pulled out by itself)
 * - on the first visit of a session the books settle into place
 * - arrow keys, Home and End move between books
 * Under prefers-reduced-motion: no pull, tilt, shift or settle; the label card
 * simply appears.
 */
export function ShelfMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const root = scope.current;
      if (!root || !contextSafe) return;
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const items = gsap.utils.toArray<HTMLElement>(".bookcase__book", root);
      const books = items.map((item) => ({
        item,
        spine: item.querySelector<HTMLElement>(".spine")!,
        lift: item.querySelector<HTMLElement>(".bookcase__lift")!,
        label: item.querySelector<HTMLElement>(".spine__label")!,
      }));

      gsap.set(
        books.map((book) => book.spine),
        {
          transformPerspective: shelf.perspective,
          transformOrigin: "50% 100%",
        },
      );

      /* ----- Pulled out: one book at a time, by hover or by focus ----- */

      let hovered: number | null = null;
      let focused: number | null = null;

      const render = contextSafe(() => {
        const active = hovered ?? focused;
        const motion: gsap.TweenVars = {
          duration: reduce ? 0 : dur.short,
          overwrite: "auto",
        };
        books.forEach((book, index) => {
          const isActive = index === active;
          const shift =
            active === null || reduce
              ? 0
              : index === active - 1
                ? -shelf.neighbourShift
                : index === active + 1
                  ? shelf.neighbourShift
                  : 0;
          gsap.set(book.item, { zIndex: isActive ? 2 : 1 });
          gsap.to(book.item, { x: shift, ease: ease.out, ...motion });
          gsap.to(book.spine, {
            z: isActive && !reduce ? shelf.pullOut : 0,
            rotationX: isActive && !reduce ? -shelf.tilt : 0,
            ease: isActive ? ease.out : ease.inOut,
            ...motion,
          });
          gsap.to(book.lift, {
            opacity: isActive && !reduce ? 1 : 0,
            ease: ease.out,
            ...motion,
          });
          gsap.to(book.label, {
            opacity: isActive ? 1 : 0,
            y: isActive || reduce ? 0 : shelf.labelRise,
            ease: isActive ? ease.out : ease.inOut,
            duration: reduce ? dur.micro : isActive ? dur.short : dur.micro,
            delay: isActive && !reduce ? dur.micro / 3 : 0,
            overwrite: "auto",
          });
        });
      });

      const cleanups: (() => void)[] = [];
      const listen = (
        target: HTMLElement,
        type: string,
        handler: (event: Event) => void,
      ) => {
        target.addEventListener(type, handler);
        cleanups.push(() => target.removeEventListener(type, handler));
      };

      books.forEach(({ item, spine }, index) => {
        // Hover only for mouse and pen; a tap simply opens the book.
        listen(item, "pointerenter", (event) => {
          if ((event as PointerEvent).pointerType === "touch") return;
          hovered = index;
          render();
        });
        listen(item, "pointerleave", () => {
          if (hovered === index) hovered = null;
          render();
        });
        listen(spine, "focus", () => {
          if (!spine.matches(":focus-visible")) return;
          focused = index;
          render();
        });
        listen(spine, "blur", () => {
          if (focused === index) focused = null;
          render();
        });
      });

      /* ----- Arrow keys, Home and End move between books ----- */

      listen(root, "keydown", (event) => {
        const key = (event as KeyboardEvent).key;
        const links = gsap.utils
          .toArray<HTMLAnchorElement>(".spine", root)
          .filter((link) => link.offsetParent !== null);
        const current = links.indexOf(
          document.activeElement as HTMLAnchorElement,
        );
        if (current === -1) return;
        const last = links.length - 1;
        const next =
          key === "ArrowRight" || key === "ArrowDown"
            ? current === last
              ? 0
              : current + 1
            : key === "ArrowLeft" || key === "ArrowUp"
              ? current === 0
                ? last
                : current - 1
              : key === "Home"
                ? 0
                : key === "End"
                  ? last
                  : null;
        if (next === null) return;
        event.preventDefault();
        links[next]?.focus();
      });

      /* ----- First visit of the session: the books settle ----- */

      const html = document.documentElement;
      if (html.hasAttribute("data-shelf-settle")) {
        try {
          sessionStorage.setItem(SETTLED_KEY, "1");
        } catch {
          // Storage can be unavailable (private modes); the settle still runs.
        }
        const standingRow = root.querySelector<HTMLElement>(".bookcase__row");
        const upright =
          standingRow && getComputedStyle(standingRow).display !== "none";
        // Standing books settle left to right; a pile settles from the bottom up.
        const targets = upright
          ? items
          : gsap.utils.toArray<HTMLElement>(".pile__book", root).reverse();
        const each = shelf.settleTotal - stagger.settle * (targets.length - 1);
        gsap.to(targets, {
          y: 0,
          duration: each,
          ease: ease.out,
          stagger: stagger.settle,
          onComplete: () => html.removeAttribute("data-shelf-settle"),
        });
      }

      return () => cleanups.forEach((cleanup) => cleanup());
    },
    { scope },
  );

  return (
    <div ref={scope} className="h-full">
      {children}
    </div>
  );
}
