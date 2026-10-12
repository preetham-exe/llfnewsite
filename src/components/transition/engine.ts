import type Lenis from "lenis";

import { books } from "@/content/books";
import type { BookId } from "@/content/types";
import { transition } from "@/motion/tokens";

import {
  captureBook,
  createStage,
  findSpine,
  isOnScreen,
  type BookSource,
  type Stage,
} from "./capture";
import type * as Choreographies from "./choreography";
import { isDisplayed, normalizePath, whenPageReady } from "./page-ready";

/*
 * Runs page transitions, one at a time. TransitionProvider creates one
 * engine for the whole site and connects it to React (the nav, the router,
 * Lenis); everything here is plain DOM and timers.
 *
 * A transition starts inside the event that starts the navigation (a click
 * on a book, Back to the shelf, Escape, or the browser's back and forward).
 * In that same event it copies the screen into the overlay, so the old page
 * stays on screen while Next renders the new one underneath. The
 * choreography then plays over the copy and hands over to the real page.
 */

/** The book a page belongs to: every section page opens from the shelf. */
export function openingBook(path: string): BookId | null {
  const book = books.find(
    ({ href }) => path === href || path.startsWith(`${href}/`),
  );
  return book?.id ?? null;
}

type ChoreographyModule = typeof Choreographies;

let choreographies: ChoreographyModule | null = null;
let loading: Promise<ChoreographyModule> | null = null;

/** The choreography is loaded on demand; the provider asks for it at idle. */
export function loadChoreographies(): Promise<ChoreographyModule> {
  loading ??= import("./choreography").then(
    (module) => (choreographies = module),
    (error: unknown) => {
      loading = null;
      throw error;
    },
  );
  return loading;
}

export type EngineHost = {
  overlay(): HTMLElement | null;
  /** Keep the nav showing `path` until released with null. */
  hold(path: string | null): void;
  /** Client navigation, for Escape (links navigate by themselves). */
  push(path: string): void;
};

type Kind = "open" | "close" | "fade";

type Run = {
  kind: Kind;
  /** Where the transition is going: an opening book, or the shelf. */
  to: string;
  book: BookId;
  started: number;
  choreography: Choreographies.Choreography | null;
  skipped: boolean;
  /** The spine on the shelf the book goes back to, hidden until it lands. */
  landing: HTMLElement | null;
  cleanups: (() => void)[];
};

type Request = {
  kind: "open" | "close";
  to: string;
  book: BookId;
  /** The spine the book comes off (opening). */
  spine?: HTMLElement | null;
  /** Starts the navigation, when the event that began it does not. */
  push?: () => void;
};

/** Every transition announces itself, for analytics later and for tests. */
export type TransitionEventDetail = {
  phase: "start" | "end" | "stop";
  kind: Kind;
  to: string;
};

export class TransitionEngine {
  /** The page on screen, as React last committed it. */
  private path = "/";
  private host: EngineHost | null = null;
  private lenis: Lenis | null = null;
  private run: Run | null = null;

  connect(host: EngineHost | null) {
    this.host = host;
  }

  setLenis(lenis: Lenis | undefined) {
    this.lenis = lenis ?? null;
  }

  setPath(path: string) {
    this.path = normalizePath(path);
  }

  get running() {
    return this.run !== null;
  }

  /** A TransitionLink was clicked: decide whether this navigation animates. */
  navigate = (href: string, link: HTMLAnchorElement | null) => {
    // A new navigation ends any transition at once.
    if (this.run) this.stop();
    const from = this.path;
    const to = normalizePath(href.split(/[?#]/)[0] ?? href);
    if (to === from) return;

    const opening = from === "/" ? openingBook(to) : null;
    const closing = to === "/" ? openingBook(from) : null;
    if (opening) {
      // Only the book itself opens: other links to its page (the nav's
      // Donate, the footer) go straight there.
      const spine = link?.dataset.book === opening ? link : null;
      if (spine && isOnScreen(spine)) {
        this.begin({ kind: "open", to, book: opening, spine });
      }
    } else if (closing) {
      this.begin({ kind: "close", to, book: closing });
    }
  };

  /** The browser's back or forward buttons. */
  popstate = () => {
    if (this.run) {
      this.stop();
      return;
    }
    const from = this.path;
    const to = normalizePath(window.location.pathname);
    if (to === from) return;

    const closing = to === "/" ? openingBook(from) : null;
    const opening = from === "/" ? openingBook(to) : null;
    if (closing) {
      this.begin({ kind: "close", to, book: closing });
    } else if (opening) {
      const spine = findSpine(opening);
      if (spine && isOnScreen(spine)) {
        this.begin({ kind: "open", to, book: opening, spine });
      }
    }
  };

  /**
   * Escape on an open book closes it, unless the key belongs to something
   * else: a form field, an open menu or dialog, or another handler.
   */
  escape = (event: KeyboardEvent) => {
    if (
      event.key !== "Escape" ||
      event.defaultPrevented ||
      event.repeat ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      this.run
    ) {
      return;
    }
    const book = openingBook(this.path);
    if (!book) return;
    const target = event.target instanceof Element ? event.target : null;
    if (
      target?.closest(
        "input, textarea, select, [contenteditable]:not([contenteditable='false'])",
      )
    ) {
      return;
    }
    const open = document.querySelectorAll("details[open], dialog[open]");
    if ([...open].some(isDisplayed)) return;

    event.preventDefault();
    this.begin({
      kind: "close",
      to: "/",
      book,
      push: () => this.host?.push("/"),
    });
  };

  /** A click or a key during a transition: finish it quickly. */
  skip = () => {
    const run = this.run;
    if (!run || run.skipped) return;
    run.skipped = true;
    run.choreography?.skip();
  };

  /** Ends any transition at once and leaves the page as it is. */
  stop = () => {
    const run = this.run;
    if (!run) return;
    run.choreography?.kill();
    this.tidy(run);
    this.emit("stop", run);
  };

  private begin(request: Request) {
    const overlay = this.host?.overlay();
    if (!this.host || !overlay) {
      request.push?.();
      return;
    }
    this.stop();

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Copy first: once the navigation starts, the old page begins to go.
    const source =
      request.kind === "open" && !reduce && request.spine
        ? captureBook(request.spine)
        : null;
    const stage = createStage(overlay);
    if (!stage) {
      request.push?.();
      return;
    }

    const run: Run = {
      kind:
        reduce || (request.kind === "open" && !source) ? "fade" : request.kind,
      to: request.to,
      book: request.book,
      started: performance.now(),
      choreography: null,
      skipped: false,
      landing: null,
      cleanups: [],
    };
    this.run = run;

    overlay.dataset.active = "";
    this.host.hold(this.path);
    this.lenis?.stop();

    // Any click or key skips to the end. So does a resize, which would
    // leave the book flying to the wrong place.
    const onKey = (event: KeyboardEvent) => {
      if (!event.repeat) this.skip();
    };
    this.listen(run, "pointerdown", this.skip, true);
    this.listen(run, "keydown", onKey, true);
    this.listen(run, "resize", this.skip);

    // The new page gets a few seconds to appear, then a normal page load
    // takes over. A hidden tab does not count: it is not painting.
    const ready = whenPageReady(request.to, run.started);
    let holding = 0;
    const holdOn = () => {
      holding = window.setTimeout(() => {
        if (this.run !== run) return;
        if (document.hidden) holdOn();
        else window.location.assign(request.to);
      }, transition.holdLimit * 1000);
    };
    holdOn();
    void ready.then(() => window.clearTimeout(holding));
    run.cleanups.push(() => window.clearTimeout(holding));

    // Whatever happens, nothing outlives this.
    const watchdog = window.setTimeout(
      this.stop,
      (transition.open.total + transition.holdLimit + 2) * 1000,
    );
    run.cleanups.push(() => window.clearTimeout(watchdog));

    this.emit("start", run);
    request.push?.();

    const play = (module: ChoreographyModule) => {
      if (this.run !== run) return;
      run.choreography = this.choreograph(module, run, stage, source, ready);
      if (run.skipped) run.choreography.skip();
    };
    if (choreographies) play(choreographies);
    else loadChoreographies().then(play, this.stop);
  }

  private choreograph(
    module: ChoreographyModule,
    run: Run,
    stage: Stage,
    source: BookSource | null,
    ready: Promise<void>,
  ): Choreographies.Choreography {
    const common = {
      stage,
      ready,
      navVeil: document.querySelector<HTMLElement>("[data-nav-veil]"),
      onDone: () => this.finish(run),
    };
    const reveal = () => this.reveal(run);

    if (run.kind === "open" && source) {
      return module.playOpen({
        ...common,
        source,
        content: pageContent,
        onReveal: reveal,
      });
    }
    if (run.kind === "close") {
      return module.playClose({
        ...common,
        destination: () => this.landOn(run),
        onShelf: () => this.host?.hold(null),
      });
    }
    return module.playFade({ ...common, onReveal: reveal });
  }

  /** The new page shows: the nav catches up and the page can scroll. */
  private reveal(run: Run) {
    if (this.run !== run) return;
    this.host?.hold(null);
    this.lenis?.start();
    const overlay = this.host?.overlay();
    if (overlay) delete overlay.dataset.active;
    if (run.to !== "/") focusHeading();
  }

  /** The book's place on the shelf, hidden until the book lands in it. */
  private landOn(run: Run): BookSource | null {
    const spine = findSpine(run.book);
    if (!spine || !isOnScreen(spine)) return null;
    const source = captureBook(spine);
    if (!source) return null;
    spine.dataset.bookOut = "";
    run.landing = spine;
    return source;
  }

  private finish(run: Run) {
    if (this.run !== run) return;
    const landing = run.landing;
    this.tidy(run);
    if (run.to === "/") {
      (landing ?? findSpine(run.book))?.focus({ preventScroll: true });
    }
    this.emit("end", run);
  }

  private tidy(run: Run) {
    run.cleanups.forEach((cleanup) => cleanup());
    run.cleanups = [];
    if (run.landing) delete run.landing.dataset.bookOut;
    const overlay = this.host?.overlay();
    if (overlay) {
      overlay.replaceChildren();
      delete overlay.dataset.active;
    }
    // The nav's dimmer goes back to its resting state (no live blur kept).
    document.querySelector("[data-nav-veil]")?.removeAttribute("style");
    this.host?.hold(null);
    this.lenis?.start();
    this.run = null;
  }

  private listen<K extends keyof WindowEventMap>(
    run: Run,
    type: K,
    listener: (event: WindowEventMap[K]) => void,
    capture = false,
  ) {
    window.addEventListener(type, listener, capture);
    run.cleanups.push(() =>
      window.removeEventListener(type, listener, capture),
    );
  }

  private emit(phase: TransitionEventDetail["phase"], run: Run) {
    window.dispatchEvent(
      new CustomEvent<TransitionEventDetail>("llf:transition", {
        detail: { phase, kind: run.kind, to: run.to },
      }),
    );
  }
}

/** The new page's content, which rises in as the book hands over. */
function pageContent(): HTMLElement[] {
  const content = [
    ...document.querySelectorAll<HTMLElement>("[data-transition-content]"),
  ].filter(isDisplayed);
  const footer = document.querySelector<HTMLElement>(
    "[data-page-root] > footer",
  );
  if (footer && footer.getBoundingClientRect().top < window.innerHeight) {
    content.push(footer);
  }
  return content;
}

/** Screen readers start the new page at its title. */
function focusHeading() {
  const heading = [...document.querySelectorAll<HTMLElement>("main h1")].find(
    isDisplayed,
  );
  heading?.focus({ preventScroll: true });
}
