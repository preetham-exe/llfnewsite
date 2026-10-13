import { ScrollTrigger } from "@/lib/gsap";

/*
 * Pages tell the transition when they are on screen. Every page template
 * renders <PageReady />, which calls announcePage() each time the page is
 * shown: on its first mount, and again when Next brings a kept page back.
 * The transition waits for that, then for fonts and the first screen's
 * images, before it reveals the page.
 */

const shownAt = new Map<string, number>();
const listeners = new Set<(path: string) => void>();

/** Paths compare without a trailing slash. */
export function normalizePath(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

export function announcePage(path: string) {
  const key = normalizePath(path);
  shownAt.set(key, performance.now());
  listeners.forEach((listener) => listener(key));
}

/** Resolves once the page at `path` has been shown since `since`. */
function whenShown(path: string, since: number): Promise<void> {
  const key = normalizePath(path);
  if ((shownAt.get(key) ?? -1) >= since) return Promise.resolve();
  return new Promise((resolve) => {
    const listener = (shown: string) => {
      if (shown !== key) return;
      listeners.delete(listener);
      resolve();
    };
    listeners.add(listener);
  });
}

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/** Elements that are displayed: Next keeps visited pages mounted but hidden. */
export function isDisplayed(element: Element): boolean {
  return element.getClientRects().length > 0;
}

/**
 * Resolves when the page at `path` is shown, its fonts have loaded, the
 * images on its first screen are decoded and it has been painted. Images get
 * a second at most: a slow photo never holds the page back. Transitions with
 * no motion of their own to cover a wait (a page turn, a fade) leave the
 * images out: photos keep their space, so they can arrive afterwards.
 */
export async function whenPageReady(
  path: string,
  since: number,
  { images = true }: { images?: boolean } = {},
) {
  await whenShown(path, since);
  await document.fonts.ready;

  const firstScreen = [...document.querySelectorAll("main img")].filter(
    (image): image is HTMLImageElement =>
      images &&
      image instanceof HTMLImageElement &&
      isDisplayed(image) &&
      image.getBoundingClientRect().top < window.innerHeight,
  );
  if (firstScreen.length > 0) {
    await Promise.race([
      Promise.all(firstScreen.map((image) => image.decode().catch(() => {}))),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
  }

  await nextFrame();
  await nextFrame();
  ScrollTrigger.refresh();
}
