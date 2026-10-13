import { expect, type Page } from "@playwright/test";

/* Watching page transitions from tests: every transition announces itself
   with an llf:transition event (start, then end or stop). */

export type TransitionEvent = {
  phase: "start" | "end" | "stop";
  kind: "open" | "close" | "turn" | "fade";
  to: string;
  t: number;
  /** Where the page was scrolled when the event fired. */
  scrollY: number;
};

/** Records every transition, and whether the 3D book was ever built. */
export async function recordTransitions(page: Page) {
  await page.addInitScript(() => {
    const record = window as unknown as {
      __transitions: unknown[];
      __bookSeen: boolean;
    };
    record.__transitions = [];
    record.__bookSeen = false;
    window.addEventListener("llf:transition", (event) => {
      record.__transitions.push({
        ...(event as CustomEvent).detail,
        t: performance.now(),
        scrollY: window.scrollY,
      });
    });
    new MutationObserver(() => {
      if (document.querySelector(".tb-book")) record.__bookSeen = true;
    }).observe(document, { childList: true, subtree: true });
  });
}

export const events = (page: Page) =>
  page.evaluate(
    () =>
      (window as unknown as { __transitions: TransitionEvent[] }).__transitions,
  );

export const bookSeen = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { __bookSeen: boolean }).__bookSeen,
  );

/** Waits for the next transition to finish and returns its start and end. */
export async function finished(page: Page, count = 1) {
  await expect
    .poll(
      async () =>
        (await events(page)).filter((event) => event.phase !== "start").length,
      { timeout: 6000 },
    )
    .toBeGreaterThanOrEqual(count);
  const all = await events(page);
  const starts = all.filter((event) => event.phase === "start");
  const ends = all.filter((event) => event.phase !== "start");
  return { start: starts[count - 1]!, end: ends[count - 1]! };
}

export const overlay = (page: Page) =>
  page.locator("[data-transition-overlay]");

/** Nothing of the transition is left: no copy, no hidden book, no lock. */
export async function expectSettled(page: Page) {
  await expect(overlay(page)).toBeEmpty();
  await expect(overlay(page)).not.toHaveAttribute("data-active");
  await expect(page.locator("[data-book-out]")).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveClass(/lenis-stopped/);
}
