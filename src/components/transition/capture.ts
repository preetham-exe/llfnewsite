import { gsap } from "@/lib/gsap";
import { shelf } from "@/motion/tokens";

import { isDisplayed } from "./page-ready";

/*
 * Copies of what is on screen, taken at the instant a navigation starts,
 * before Next swaps the page. The overlay shows them while the new page
 * renders underneath, so the shelf never disappears mid-animation.
 * Everything here runs synchronously inside the click or popstate event.
 */

/** A book on the shelf, as the transition needs it. */
export type BookSource = {
  id: string;
  /** A spine in the phone pile (lying flat) rather than standing. */
  lying: boolean;
  /** The spine's box before its own transform, in viewport px. */
  left: number;
  top: number;
  width: number;
  height: number;
  /** In-plane tilt of a lying spine (deg). */
  roll: number;
  /** A standing spine's hover pull, as ShelfMotion left it. */
  pull: { z: number; rotationX: number; perspective: number };
  /** Detached copies of the spine and the front cover. */
  spine: HTMLElement;
  cover: HTMLElement | null;
};

/** The displayed spine for a book: Next keeps hidden copies of past pages. */
export function findSpine(id: string): HTMLElement | null {
  const spines = document.querySelectorAll<HTMLElement>(`[data-book="${id}"]`);
  return [...spines].find(isDisplayed) ?? null;
}

/** Whether an element is at least partly on screen below the nav. */
export function isOnScreen(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  const nav = document.querySelector("header")?.getBoundingClientRect();
  return rect.bottom > (nav?.bottom ?? 0) && rect.top < window.innerHeight;
}

/** A copy of an element's markup with no ids, so nothing is duplicated. */
function copyOf(element: Element, tag = "div"): HTMLElement {
  const copy = document.createElement(tag);
  copy.className = element.className;
  copy.innerHTML = element.innerHTML;
  copy.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
  return copy;
}

export function captureBook(spine: HTMLElement): BookSource | null {
  const id = spine.dataset.book;
  if (!id || !isDisplayed(spine)) return null;
  const lying = spine.classList.contains("spine--lying");
  const cover = spine
    .closest(".shelf")
    ?.querySelector(`[data-cover-for="${id}"] .cover`);

  let box: { left: number; top: number; width: number; height: number };
  let roll = 0;
  let pull = { z: 0, rotationX: 0, perspective: shelf.perspective };

  if (lying) {
    // Rotated about its centre, so the centre and the layout size give the
    // box; the tilt comes from the computed matrix.
    const rect = spine.getBoundingClientRect();
    const width = spine.offsetWidth;
    const height = spine.offsetHeight;
    box = {
      left: rect.left + rect.width / 2 - width / 2,
      top: rect.top + rect.height / 2 - height / 2,
      width,
      height,
    };
    const transform = getComputedStyle(spine).transform;
    if (transform !== "none") {
      const matrix = new DOMMatrixReadOnly(transform);
      roll = (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
    }
  } else {
    // A standing spine fills its slot, which only ever moves sideways.
    const slot = spine.parentElement ?? spine;
    const rect = slot.getBoundingClientRect();
    box = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
    pull = {
      z: Number(gsap.getProperty(spine, "z")) || 0,
      rotationX: Number(gsap.getProperty(spine, "rotationX")) || 0,
      perspective: shelf.perspective,
    };
  }

  return {
    id,
    lying,
    ...box,
    roll,
    pull,
    spine: copyOf(spine),
    cover: cover ? copyOf(cover) : null,
  };
}

/**
 * The visible page (main content and footer) as an inert copy, placed where
 * it is on screen. Pages Next keeps hidden are left out, ids are removed and
 * book markers are renamed so no query ever finds the copy by mistake.
 */
export function snapshotPage(): HTMLElement | null {
  const root = document.querySelector<HTMLElement>("[data-page-root]");
  if (!root) return null;

  const copy = root.cloneNode(true) as HTMLElement;
  copy
    .querySelectorAll(
      '[style*="display: none"], [hidden], script, template, noscript',
    )
    .forEach((node) => node.remove());
  copy.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
  copy.querySelectorAll<HTMLElement>("[data-book]").forEach((node) => {
    node.dataset.snapshotBook = node.dataset.book;
    delete node.dataset.book;
  });
  // The page's words stay findable in the copy (closing fades just them).
  copy.querySelectorAll("[data-transition-content]").forEach((node) => {
    node.removeAttribute("data-transition-content");
    node.setAttribute("data-snapshot-content", "");
  });
  copy.removeAttribute("data-page-root");
  copy.dataset.snapshot = "";

  Object.assign(copy.style, {
    position: "absolute",
    left: "0",
    top: `${-window.scrollY}px`,
    width: `${root.offsetWidth}px`,
  });
  return copy;
}

/** A box on screen, in viewport px. */
export type Box = { left: number; top: number; right: number; bottom: number };

/**
 * Where a section page's open-book frame is on screen: its right-hand page
 * (or its only page), which the transition's book lands on and starts from.
 */
export type FrameGeometry = {
  /** The page's left edge (the fold, when both pages show), top and width. */
  left: number;
  top: number;
  width: number;
  /** Both pages show, the left one to the left of `left`. */
  spread: boolean;
  /** Paper to the edges of the screen (phones): no cloth, no surround. */
  bleed: boolean;
  /** All the paper: both pages on a spread. A page turn turns part of it. */
  pages: Box;
};

export function measureFrame(): FrameGeometry | null {
  const pages = [
    ...document.querySelectorAll<HTMLElement>("[data-spread-pages]"),
  ].find(isDisplayed);
  const book = pages?.parentElement;
  if (!pages || !book) return null;
  const rect = pages.getBoundingClientRect();
  // The fold is drawn only when both pages show.
  const spread = getComputedStyle(pages, "::before").content !== "none";
  const bleed = parseFloat(getComputedStyle(book).paddingLeft) === 0;
  return {
    left: spread ? rect.left + rect.width / 2 : rect.left,
    top: rect.top,
    width: spread ? rect.width / 2 : rect.width,
    spread,
    bleed,
    pages: {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
    },
  };
}

/** The overlay's contents for one transition. */
export type Stage = {
  root: HTMLElement;
  /** Plain paper, under everything. */
  paper: HTMLElement;
  /** The page as it was when the navigation started. */
  page: HTMLElement;
};

/** Builds the stage in the overlay, showing exactly what is on screen now. */
export function createStage(overlay: HTMLElement): Stage | null {
  const page = snapshotPage();
  if (!page) return null;
  const root = document.createElement("div");
  root.className = "tb-stage";
  root.inert = true;
  const paper = document.createElement("div");
  paper.className = "tb-paper";
  root.append(paper, page);
  overlay.replaceChildren(root);
  return { root, paper, page };
}
