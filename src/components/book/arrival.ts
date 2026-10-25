/**
 * Runs once the page is on screen: at once, or when the book that is opening
 * onto it has finished.
 */
export function afterArrival(callback: () => void) {
  const opening = document.querySelector(
    "[data-transition-overlay][data-active]",
  );
  if (!opening) {
    callback();
    return;
  }
  const done = (event: Event) => {
    const { phase } = (event as CustomEvent<{ phase: string }>).detail;
    if (phase === "start") return;
    window.removeEventListener("llf:transition", done);
    callback();
  };
  window.addEventListener("llf:transition", done);
}
