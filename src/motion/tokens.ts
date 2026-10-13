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
  /** Chapter headings rise line by line from behind a mask. */
  lines: { duration: 0.7, stagger: 0.08 },
} as const;

/** Objects in the margins drift a little against the scroll (px). */
export const parallax = {
  min: 10,
  max: 40,
} as const;

/**
 * How far each kind of margin object drifts over a screen of scrolling (px,
 * within parallax.min and parallax.max). Lighter, nearer things move more.
 */
export const marginalia = {
  clipboard: 14,
  letters: 16,
  polaroid: 18,
  notebook: 20,
  card: 22,
  sticky: 24,
  note: 26,
  ruler: 28,
  leaf: 30,
  pencil: 34,
} as const;

/** Pencil marks under a phrase: drawn once, as if by hand. */
export const pencil = {
  duration: 0.8,
  /** After the page shows, before a mark on the first screen is drawn. */
  delay: 0.5,
  /**
   * A sketch is drawn line by line: each line takes `line`, the next starts
   * `stagger` later. Its quick strokes (books on a shelf) start `quickFrom`
   * in and go faster, and its labels fade in over `label` at the end.
   */
  sketch: {
    line: 0.28,
    stagger: 0.07,
    quickFrom: 0.5,
    quick: { line: 0.1, stagger: 0.012 },
    label: 0.5,
  },
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
   * The brief asked for 1.4 s at most; the founder found that a little fast
   * and asked for it slower (2026-10-12), so it now takes 1.7 s.
   */
  open: {
    total: 1.7,
    pull: [0, 0.22],
    travel: [0.15, 0.8],
    hinge: [0.75, 1.21],
    expand: [1.19, 1.41],
    /** Within the expand: flying to the page and coming to rest on it. */
    land: [1.19, 1.35],
    /** The page content fades and rises in once the paper fills the screen. */
    rise: [1.41, 1.7],
    /** Delay between the cover and each following page leaf. */
    leafLag: 0.05,
    /** The book starts to turn just after it starts to travel. */
    turnLag: 0.05,
    /** The room is fully dim this far into the travel. */
    dimBy: 0.7,
    /**
     * The book dissolves into the page it has landed on over the last part
     * of the expand, hiding any difference between the two.
     */
    handover: 0.08,
  },
  /** Phones play the same choreography a little faster. */
  openMobile: {
    total: 1.33,
  },
  /** Page to shelf: the text fades, the book closes and goes back. */
  close: {
    total: 1.12,
    fade: [0, 0.16],
    /** The book appears over the page it is about to close. */
    handover: 0.06,
    /** The rest is measured from the end of the fade. */
    shrink: [0, 0.27],
    hinge: [0.2, 0.55],
    travel: [0.5, 0.92],
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
  squares: { width: 0.02, height: 0.026 },
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
