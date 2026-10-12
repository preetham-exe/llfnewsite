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
  /** A move that lands softly: the paper drawing back, a book settling. */
  settle: "power2.out",
  /** Gentler curves for light, shade and fades. */
  soft: "power1.out",
  softIn: "power1.in",
  softInOut: "power1.inOut",
  hinge: "llf-hinge",
  stamp: "llf-stamp",
} as const;

/** Shelf hover and focus: the pulled-out state. */
export const shelf = {
  /** How far the book comes toward the reader (px along z). */
  pullOut: 14,
  /** Forward tilt of the pulled book, hinged at its foot (deg). */
  tilt: 4,
  /** Perspective for the pull, so 14 px of z reads as coming closer. */
  perspective: 700,
  neighbourShift: 2,
  /** The label card rises this far as it appears (px). */
  labelRise: 8,
  /** First visit: books start this far above their place (px) and settle. */
  settleDrop: 20,
  /** First-visit settle. The whole stagger finishes in under 0.8 s. */
  settleTotal: 0.8,
} as const;

/** Story blocks below the shelf fade up this far as they enter view (px). */
export const reveal = {
  distance: 16,
} as const;

export const parallax = {
  min: 10,
  max: 40,
} as const;

export const stagger = {
  settle: 0.06,
} as const;

/**
 * Page transitions. Times are seconds from the start of each timeline, and
 * each phase is [start, end]. Phases overlap a little so the motion never
 * stops between them.
 */
export const transition = {
  /**
   * Shelf to page: the book comes off the shelf, turns, opens and fills.
   * The limit is 1.4 s; the choreography ends a little before it, leaving a
   * frame or two for the click and for the new page to hand over.
   */
  open: {
    total: 1.36,
    pull: [0, 0.18],
    travel: [0.12, 0.64],
    hinge: [0.6, 0.97],
    expand: [0.95, 1.13],
    /** The page content fades and rises in once the paper fills the screen. */
    rise: [1.13, 1.36],
    /** Delay between the cover and each following page leaf. */
    leafLag: 0.04,
    /** The book starts to turn just after it starts to travel. */
    turnLag: 0.04,
    /** The room is fully dim this far into the travel. */
    dimBy: 0.7,
  },
  /** Phones play the same choreography faster: the limit there is 1.1 s. */
  openMobile: {
    total: 1.06,
  },
  /** Page to shelf: the text fades, the book closes and goes back. */
  close: {
    total: 0.9,
    fade: [0, 0.16],
    /** The rest is measured from the end of the fade. */
    shrink: [0, 0.22],
    hinge: [0.16, 0.44],
    travel: [0.4, 0.74],
    /** Carried forward for this share of the travel, then pushed home. */
    carry: 0.6,
    /** The room brightens over the last part of the travel. */
    brightenFrom: 0.2,
  },
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

/** The book during the transition: its proportions and its pose. */
export const book = {
  /** Every book shares one trim size: cover height over cover width. */
  aspect: 1.42,
  /** Pages sit inside the boards by this much of the cover's size. */
  squares: { width: 0.03, height: 0.04 },
  /** Perspective, as a multiple of the cover's width. */
  perspective: 4.5,
  /** Coming off the shelf: toward the reader (px) and up (share of height). */
  pullZ: 60,
  pullLift: 0.025,
  /** The open book at the centre fills at most this share of the screen. */
  fill: { spreadWidth: 0.72, pageWidth: 0.62, height: 0.7 },
  /** Show both pages only when the spread fits in this share of the width. */
  spreadMax: 0.94,
  /** Limits on how much the book grows on its way to the centre. */
  scale: { min: 0.8, max: 1.8 },
  /** Resting angles once open (deg). Leaves lie a little above the cover. */
  coverOpen: -172,
  leavesOpen: [-169, -166, -163],
  /** How dark the room gets behind the book, and how soft. */
  dim: 0.42,
  blur: 3,
  /**
   * Light from the front: faces darken as they turn away. Opacity of a dark
   * layer over each face, at rest and at its darkest.
   */
  shade: {
    /** The spine once the book faces the reader. */
    spine: 0.55,
    /** The cover while it still faces sideways, on the shelf. */
    coverAside: 0.4,
    /** The cover, and the inside of the cover, seen edge-on. */
    edgeOn: 0.5,
    insideEdgeOn: 0.45,
    /** The inside of the cover, lying open. */
    insideOpen: 0.08,
    /** A leaf mid-turn, and once it has settled. */
    leafTurning: 0.22,
    leafOpen: 0.04,
  },
  /** The paper overshoots the screen edges by this share when it fills. */
  overfill: 0.03,
} as const;
