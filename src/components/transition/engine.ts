import type Lenis from "lenis";

import { books } from "@/content/books";
import type { BookId } from "@/content/types";
import { transition } from "@/motion/tokens";

import {
  captureBook,
  createStage,
  findSpine,
  isOnScreen,
  measureFrame,
  type BookSource,
  type FrameGeometry,
  type Stage,
} from "./capture";
import type * as Choreographies from "./choreography";
import { isDisplayed, normalizePath, whenPageReady } from "./page-ready";

/*
 * Runs page transitions, one at a time. TransitionProvider creates one
 * engine for the whole site and connects it to React (the nav, the router,
 * Lenis); everything here is plain DOM and timers.
 *
 * Every navigation inside the site gets one:
 * - open: a book on the shelf opens into its page (only a click on the
 *   book itself, while it is on screen)
 * - close: a page closes back into its book on the shelf
 * - turn: a page turns inside the open book, between two pages of the same
 *   book (/libraries and /libraries/[slug])
 * - fade: a quiet crossfade for everything else (the nav, links between
 *   books), and for every transition with reduced motion
 *
 * A transition starts inside the event that starts the navigation (a click,
 * Escape, or the browser's back and forward). In that same event it copies
 * the screen into the overlay, so the old page stays on screen while Next
 * renders the new one underneath. The choreography then plays over the copy
 * and hands over to the real page.
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

type Kind = "open" | "close" | "turn" | "fade";

type Run = {
  kind: Kind;
  /** Where the transition is going. */
  to: string;
  /** The book opening, closing or turning a page (none for some fades). */
  book: BookId | null;
  /** A page turn back to an earlier page. */
  back: boolean;
  /** prefers-reduced-motion: every transition is the short fade. */
  reduce: boolean;
  started: number;
  choreography: Choreographies.Choreography | null;
  skipped: boolean;
  /** The spine on the shelf the book goes back to, hidden until it lands. */
  landing: HTMLElement | null;
  cleanups: (() => void)[];
};

type Request = {
  kind: Kind;
  to: string;
  book: BookId | null;
  /** The spine the book comes off (opening). */
  spine?: HTMLElement | null;
  /** A page turn back to an earlier page. */
  back?: boolean;
  /** Starts the navigation, when the event that began it does not. */
  push?: () => void;
};

/**
 * Which transition a navigation gets. `spine` is the book on the shelf that
 * was clicked (or that a back or forward step returns to), if any.
 */
function plan(from: string, to: string, spine: HTMLElement | null): Request {
  const opening = from === "/" ? openingBook(to) : null;
  if (opening && spine && isOnScreen(spine)) {
    return { kind: "open", to, book: opening, spine };
  }
  const closing = to === "/" ? openingBook(from) : null;
  if (closing) return { kind: "close", to, book: closing };

  const book = openingBook(from);
  if (book && book === openingBook(to)) {
    // Up from a page inside the book (a library) to the one it came from
    // turns back; anything else turns forward.
    return { kind: "turn", to, book, back: from.startsWith(`${to}/`) };
  }
  return { kind: "fade", to, book: openingBook(to) };
}

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

  /** A TransitionLink was clicked: start its transition. */
  navigate = (href: string, link: HTMLAnchorElement | null) => {
    // A new navigation ends any transition at once.
    if (this.run) this.stop();
    const from = this.path;
    const to = normalizePath(href.split(/[?#]/)[0] ?? href);
    if (to === from) return;

    // Only the book itself opens: other links to its page (the nav's
    // Donate, the footer) fade.
    const opening = from === "/" ? openingBook(to) : null;
    const spine = opening && link?.dataset.book === opening ? link : null;
    this.begin(plan(from, to, spine));
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

    const opening = from === "/" ? openingBook(to) : null;
    this.begin(plan(from, to, opening ? findSpine(opening) : null));
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
    // Closing and turning a page start from the page's frame, so measure it
    // while it is here.
    const frame =
      request.kind === "close" || request.kind === "turn"
        ? measureFrame()
        : null;
    const stage = createStage(overlay);
    if (!stage) {
      request.push?.();
      return;
    }

    const missing =
      (request.kind === "open" && !source) ||
      (request.kind === "turn" && !frame);
    const run: Run = {
      kind: reduce || missing ? "fade" : request.kind,
      to: request.to,
      book: request.book,
      back: request.back ?? false,
      reduce,
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
    const ready = whenPageReady(request.to, run.started, {
      images: run.kind === "open" || run.kind === "close",
    });
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
      run.choreography = this.choreograph(
        module,
        run,
        stage,
        source,
        frame,
        ready,
      );
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
    frame: FrameGeometry | null,
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
        frame: measureFrame,
        content: pageContent,
        onReveal: reveal,
      });
    }
    if (run.kind === "close") {
      return module.playClose({
        ...common,
        frame,
        destination: () => this.landOn(run),
        onShelf: () => this.host?.hold(null),
      });
    }
    if (run.kind === "turn" && frame) {
      return module.playTurn({
        ...common,
        from: frame,
        to: measureFrame,
        back: run.back,
        onReveal: reveal,
      });
    }
    return module.playFade({
      ...common,
      duration: run.reduce ? transition.reducedFade : transition.fade,
      onReveal: reveal,
    });
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
    if (!run.book) return null;
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
    if (run.to === "/" && run.book) {
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
