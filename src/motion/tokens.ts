/**
 * Motion tokens. Every duration, ease and distance in an animation comes from
 * here. Durations are in seconds (GSAP's unit), distances in px, angles in deg.
 *
 * Plain data only, so server code can import it without pulling in GSAP.
 */

export const dur = {
  micro: 0.18,
  short: 0.3,
  medium: 0.55,
  long: 0.9,
} as const;

/**
 * Custom curves, registered with CustomEase in src/lib/gsap.ts.
 * hinge: accelerates gently, then settles softly with no visible overshoot.
 * stamp: a quick drop that lands with a tiny settle.
 */
export const easeCurves = {
  "llf-hinge": "M0,0 C0.38,0 0.3,0.78 0.62,0.95 0.78,1.02 0.88,1 1,1",
  "llf-stamp": "M0,0 C0.42,0 0.6,0.76 0.72,1.035 0.8,1.05 0.88,1 1,1",
} as const;

export const ease = {
  out: "power3.out",
  in: "power2.in",
  inOut: "power2.inOut",
  hinge: "llf-hinge",
  stamp: "llf-stamp",
} as const;

/** Shelf hover and focus: the pulled-out state. */
export const shelf = {
  pullOut: 14,
  tilt: 4,
  neighbourShift: 2,
  /** First-visit settle. The whole stagger finishes in under 0.8 s. */
  settleTotal: 0.8,
} as const;

export const parallax = {
  min: 10,
  max: 40,
} as const;

export const stagger = {
  settle: 0.06,
} as const;

/** Page transitions. Times are offsets within each timeline. */
export const transition = {
  open: {
    total: 1.4,
    pull: [0, 0.2],
    travel: [0.2, 0.75],
    hinge: [0.75, 1.15],
    expand: [1.15, 1.4],
    /** Delay between the cover and each following page leaf. */
    leafLag: 0.04,
  },
  openMobile: {
    total: 1.1,
  },
  close: 0.9,
  /** Quiet crossfade between section pages. */
  fade: 0.3,
  /** Every transition with prefers-reduced-motion. */
  reducedFade: 0.2,
  /** /libraries to /libraries/[slug] and back. */
  pageTurn: 0.5,
  /** How long to finish after a skip, so the end is never a hard cut. */
  skipFinish: 0.15,
  /** After this long without the next page, fall back to a normal load. */
  holdLimit: 3,
} as const;
