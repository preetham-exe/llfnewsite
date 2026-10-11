"use client";

import { useTransition } from "./TransitionProvider";

/**
 * The fixed layer the book animation runs in. It sits directly under <body>
 * (never inside a transformed element, which would break position: fixed),
 * below the persistent nav so Donate stays reachable. Empty until Phase 3.
 */
export function TransitionOverlay() {
  const { overlayRef } = useTransition();

  return (
    <div
      ref={overlayRef}
      data-transition-overlay=""
      aria-hidden="true"
      inert
      className="pointer-events-none fixed inset-0 z-(--z-overlay)"
    />
  );
}
