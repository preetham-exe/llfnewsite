"use client";

import { useTransition } from "./TransitionProvider";

/**
 * The fixed layer the book animation runs in. It sits directly under <body>
 * (never inside a transformed element, which would break position: fixed),
 * below the persistent nav so Donate stays reachable. It is hidden from
 * assistive technology; what it shows is a copy (inert) of what is already
 * on the page. While a transition runs it takes clicks, so a click can skip
 * the animation without landing on the page underneath.
 */
export function TransitionOverlay() {
  const { overlayRef } = useTransition();

  return (
    <div
      ref={overlayRef}
      data-transition-overlay=""
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-(--z-overlay) data-active:pointer-events-auto"
    />
  );
}
