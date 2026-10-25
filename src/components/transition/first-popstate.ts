/*
 * Back and forward reach the transition before they reach Next. React
 * renders a page Next has kept during the popstate event itself, so a
 * listener that runs after Next's would find the page it has to copy already
 * gone. Which listener runs first cannot be left to the order in which React
 * mounts things (the site's shell hydrates after Next's router), nor to the
 * capture phase (Chromium ignores it for events on window). So the boot
 * script (Document.tsx) adds the very first popstate listener on the page,
 * long before Next adds its own, and hands each event to the handler set
 * here by TransitionProvider.
 */

/** Where the boot script looks for the handler. */
export const POPSTATE_HANDLER = "__llfPopstate";

type Handler = (event: PopStateEvent) => void;

export function setPopstateHandler(handler: Handler | null) {
  (window as unknown as Record<string, Handler | null>)[POPSTATE_HANDLER] =
    handler;
}
