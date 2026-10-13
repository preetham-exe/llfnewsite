import { gsap } from "@/lib/gsap";
import { book, ease, reveal, transition } from "@/motion/tokens";

import {
  snapshotPage,
  type BookSource,
  type FrameGeometry,
  type Stage,
} from "./capture";

/*
 * The book transition: a CSS 3D book driven by GSAP, and the timelines that
 * open it from the shelf and close it back. The provider loads this module
 * when the browser is idle, so it never delays the first page.
 *
 * The book is built on the spine it replaces, at exactly that spine's size,
 * so its first frame and its last frame on the shelf match the real spine.
 * Only transforms and opacity animate, plus the book's own perspective as it
 * leaves the shelf (it starts with the shelf's perspective so the hover pull
 * carries over without a jump).
 *
 * Safari rules: nothing that holds 3D children (.tb-book__tilt, __turn,
 * .tb-hinge) gets opacity, overflow, filter or clipping, or it would flatten.
 * Only leaf elements (faces, shades, gutters) fade.
 */

export type Choreography = {
  /** Finish quickly: a click or a key during the transition. */
  skip(): void;
  /** Stop at once, leaving nothing behind. */
  kill(): void;
};

type Common = {
  stage: Stage;
  /** Resolves when the destination page is ready to be shown. */
  ready: Promise<void>;
  /** The nav bar's own dimmer, so the whole screen darkens together. */
  navVeil: HTMLElement | null;
  onDone(): void;
};

export type OpenRequest = Common & {
  source: BookSource;
  /** Where the new page's frame is, once the page is ready. */
  frame(): FrameGeometry | null;
  /** The new page's content, which rises in at the end. */
  content(): HTMLElement[];
  /** The paper fills the screen: from here on the new page is what shows. */
  onReveal(): void;
};

export type CloseRequest = Common & {
  /** Where the page's frame was when closing began. */
  frame: FrameGeometry | null;
  /** The book's place on the shelf, once the shelf is ready. */
  destination(): BookSource | null;
  /** The shelf starts to show around the book. */
  onShelf(): void;
};

export type FadeRequest = Common & {
  onReveal(): void;
};

/** Half a pixel of overlap where spine meets cover, so no seam shows. */
const SEAM = 0.5;

/* ---------- Running timelines, with skip ---------- */

type Animation = gsap.core.Timeline | gsap.core.Tween;

function runner() {
  const running = new Set<Animation>();
  let skipping = false;
  let dead = false;

  const hurry = (animation: Animation) => {
    const left = animation.duration() - animation.time();
    if (left > 0) {
      animation.timeScale(
        Math.max(animation.timeScale(), left / transition.skipFinish),
      );
    }
  };

  return {
    add<T extends Animation>(animation: T): T {
      running.add(animation);
      if (skipping) hurry(animation);
      return animation;
    },
    skip() {
      skipping = true;
      running.forEach(hurry);
    },
    kill() {
      dead = true;
      running.forEach((animation) => animation.kill());
      running.clear();
    },
    get dead() {
      return dead;
    },
  };
}

/* ---------- Geometry ---------- */

type Pose = { x: number; y: number; scale: number };

type Geometry = {
  lying: boolean;
  /** The open book shows both pages (desktop) or only the right one. */
  spread: boolean;
  /** Cover width and height, thickness, page width and height (px). */
  W: number;
  H: number;
  D: number;
  pw: number;
  ph: number;
  /** The perspective once the book is off the shelf. */
  P: number;
  /** The spine's in-plane rotation on the shelf: a lying book is turned. */
  roll: number;
  /** Where the closed book waits at the centre of the screen. */
  centre: Pose;
  /** Where the right-hand page covers the whole screen. */
  filled: Pose;
  /** The centre of the spine on the shelf, which every pose is measured from. */
  from: { x: number; y: number };
  /** Sideways shift that centres the open spread on the gutter. */
  spreadShift: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function measure(source: BookSource): Geometry {
  const { lying } = source;
  // A standing spine is the book's height by its thickness; a lying spine
  // is the same, turned on its side.
  const H = lying ? source.width : source.height;
  const D = lying ? source.height : source.width;
  const W = H / book.aspect;
  const pw = W * (1 - book.squares.width);
  const ph = H * (1 - book.squares.height);

  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const nav = document.querySelector("header")?.getBoundingClientRect().bottom;
  const top = nav ?? 0;
  const room = vh - top;
  const fromX = source.left + source.width / 2;
  const fromY = source.top + source.height / 2;

  const spreadScale = Math.min(
    (book.fill.spreadWidth * vw) / (2 * W),
    (book.fill.height * room) / H,
  );
  const grow = (value: number) => clamp(value, book.scale.min, book.scale.max);
  const spread = !lying && 2 * W * grow(spreadScale) <= vw * book.spreadMax;
  const scale = grow(
    spread
      ? spreadScale
      : Math.min((book.fill.pageWidth * vw) / W, (book.fill.height * room) / H),
  );

  // The paper covers the screen: both pages around the gutter, or the
  // right page alone.
  const fill =
    Math.max(vw / (spread ? 2 * pw : pw), vh / ph) * (1 + book.overfill);
  const focus = spread ? 0 : pw / 2 - W / 2;

  return {
    lying,
    spread,
    W,
    H,
    D,
    pw,
    ph,
    P: W * book.perspective,
    roll: lying ? source.roll - 90 : 0,
    centre: { x: vw / 2 - fromX, y: top + room / 2 - fromY, scale },
    filled: {
      x: vw / 2 - fill * focus - fromX,
      y: vh / 2 - fromY,
      scale: fill,
    },
    spreadShift: spread ? W / 2 : 0,
    from: { x: fromX, y: fromY },
  };
}

/**
 * The pose that lays the open book's right-hand page exactly on a page's
 * frame: the same fold (left edge), top and width. On a page scrolled down,
 * the part on screen starts at the top of the screen. Phones' full-bleed
 * page takes the cover-the-screen pose.
 */
function landing(g: Geometry, frame: FrameGeometry | null): Pose {
  if (!frame || frame.bleed) return g.filled;
  const scale = frame.width / g.pw;
  // The page's top left corner from the book's centre: bound a pixel inside
  // the spine (transition.css), and moved with the spread.
  const left = -g.W / 2 + 1 + g.spreadShift;
  const top = -g.ph / 2;
  return {
    x: frame.left - g.from.x - scale * left,
    y: Math.max(frame.top, 0) - g.from.y - scale * top,
    scale,
  };
}

/** How strongly the fold shows on the page frame, at rest. */
function gutterRest(): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    "--gutter-rest",
  );
  return Number.parseFloat(value) || 0;
}

/* ---------- The book ---------- */

type Parts = {
  root: HTMLElement;
  tilt: HTMLElement;
  turn: HTMLElement;
  cover: HTMLElement;
  leaves: HTMLElement[];
  /**
   * Everything behind the front cover. It is only shown while the cover is
   * open: shut, it could not be seen anyway, and the browser's 3D sorting
   * can let its edges show through the spine as the book turns.
   */
  inside: HTMLElement[];
  /**
   * The cloth round the pages (the back board and the inside of the cover),
   * and the leaves that make the left-hand page. As the book lands, a page's
   * frame already shows its own cloth and pages there.
   */
  boards: HTMLElement[];
  sheets: HTMLElement[];
  spineShade: HTMLElement;
  coverShade: HTMLElement;
  insideShade: HTMLElement;
  leafShades: HTMLElement[];
  /** The soft shadows where the pages meet the spine. */
  gutters: HTMLElement[];
  label: HTMLElement | null;
};

function div(className: string, parent?: HTMLElement): HTMLElement {
  const node = document.createElement("div");
  node.className = className;
  parent?.append(node);
  return node;
}

function buildBook(source: BookSource, g: Geometry): Parts {
  const cloth = [...source.spine.classList]
    .filter((name) => /^(cloth|lettering)-/.test(name))
    .join(" ");

  const root = div("tb-book");
  root.style.cssText = [
    `left:${source.left}px`,
    `top:${source.top}px`,
    `width:${source.width}px`,
    `height:${source.height}px`,
    `--W:${g.W}px`,
    `--H:${g.H}px`,
    `--D:${g.D}px`,
    `--pw:${g.pw}px`,
    `--ph:${g.ph}px`,
  ].join(";");
  const tilt = div("tb-book__tilt", root);
  const turn = div("tb-book__turn", tilt);

  // Back to front: the board behind the right-hand page, the page, the
  // leaves that turn, the front cover, and the spine on the left.
  const board = div(`tb-face tb-board cloth ${cloth}`, turn);
  const page = div("tb-face tb-page", turn);
  const gutters = [div("tb-gutter", page)];

  const leaves: HTMLElement[] = [];
  const sheets: HTMLElement[] = [];
  const leafShades: HTMLElement[] = [];
  book.leavesOpen.forEach((_, index) => {
    const leaf = div("tb-hinge tb-leaf", turn);
    const sheet = div("tb-face tb-leaf__sheet", leaf);
    sheets.push(sheet);
    sheet.style.setProperty("--depth", `${index + 1}px`);
    gutters.push(div("tb-gutter", sheet));
    leafShades.push(div("tb-shade", sheet));
    leaves.push(leaf);
  });

  const cover = div("tb-hinge tb-cover", turn);
  const outside = div("tb-face tb-cover__outside", cover);
  if (source.cover) outside.append(source.cover);
  else outside.className += ` cloth ${cloth}`;
  const coverShade = div("tb-shade", outside);
  const inside = div(`tb-face tb-cover__inside cloth ${cloth}`, cover);
  const endpaper = div("tb-endpaper", inside);
  gutters.push(div("tb-gutter tb-gutter--inside", endpaper));
  const insideShade = div("tb-shade", inside);

  const spineFace = div("tb-face tb-spine", turn);
  const spine = source.spine;
  spine.style.cssText = "width:100%;height:100%;min-height:0;transform:none";
  if (g.lying) {
    // The pile shows the spine across; the book's spine runs down its
    // height, so the copy is turned back to read as it did in the pile.
    div("tb-spine__across", spineFace).append(spine);
  } else {
    spineFace.append(spine);
  }
  const spineShade = div("tb-shade", spineFace);

  return {
    root,
    tilt,
    turn,
    cover,
    leaves,
    inside: [board, page, ...leaves],
    boards: [board, inside],
    sheets,
    spineShade,
    coverShade,
    insideShade,
    leafShades,
    gutters,
    label: spine.querySelector<HTMLElement>(".spine__label"),
  };
}

/**
 * The room darkens behind the book (and the nav bar with it): a layer of
 * ink, faded up to the dim level in the motion tokens.
 */
function veil(): HTMLElement {
  return div("tb-veil");
}

/**
 * The room also goes soft: a blurred copy of the page fades in under the
 * veil. A blur drawn once on a still copy costs nothing while the book
 * moves; blurring live (backdrop-filter) is redrawn every frame and dropped
 * frames on slower machines.
 */
function softCopy(page: HTMLElement): HTMLElement {
  const copy = page.cloneNode(true) as HTMLElement;
  copy.style.filter = `blur(${book.blur}px)`;
  copy.style.opacity = "0";
  copy
    .querySelectorAll<HTMLElement>(".bookcase__lift")
    .forEach((lift) => (lift.style.opacity = "0"));
  return copy;
}

/**
 * The nav's dimmer, or a detached stand-in so tweens never get null. The
 * bar is a thin strip, so it can afford a live blur.
 */
function navDimmer(node: HTMLElement | null): HTMLElement {
  const target = node ?? document.createElement("div");
  target.style.setProperty("backdrop-filter", `blur(${book.blur}px)`);
  target.style.setProperty("-webkit-backdrop-filter", `blur(${book.blur}px)`);
  return target;
}

/* ---------- Poses ---------- */

function onShelf(parts: Parts, g: Geometry, source: BookSource) {
  // A standing spine may be pulled out (hover or focus): start exactly there,
  // seen through the shelf's perspective from the spine's foot.
  const pulled = !g.lying;
  gsap.set(parts.root, {
    x: 0,
    y: 0,
    scale: 1,
    perspective: `${pulled ? source.pull.perspective : g.P}px`,
    perspectiveOrigin: pulled ? "50% 100%" : "50% 50%",
  });
  gsap.set(parts.tilt, {
    z: pulled ? source.pull.z : 0,
    y: 0,
    rotationX: pulled ? source.pull.rotationX : 0,
  });
  gsap.set(parts.turn, {
    x: 0,
    z: -(g.W / 2 - SEAM),
    rotationY: 90,
    rotation: g.roll,
  });
  gsap.set([parts.cover, ...parts.leaves], { z: g.D / 2, rotationY: 0 });
  gsap.set(parts.inside, { visibility: "hidden" });
  gsap.set(parts.spineShade, { opacity: 0 });
  gsap.set(parts.coverShade, { opacity: book.shade.coverAside });
}

function openFlat(parts: Parts, g: Geometry, pose: Pose) {
  gsap.set(parts.root, {
    ...pose,
    perspective: `${g.P}px`,
    perspectiveOrigin: "50% 50%",
  });
  gsap.set(parts.tilt, { z: 0, y: 0, rotationX: 0 });
  gsap.set(parts.turn, {
    x: g.spreadShift,
    z: -g.D / 2,
    rotationY: 0,
    rotation: 0,
  });
  gsap.set([parts.cover, ...parts.leaves], { z: g.D / 2, rotationY: -180 });
  gsap.set(parts.inside, { visibility: "visible" });
  gsap.set(parts.gutters, { opacity: gutterRest() });
  gsap.set(parts.leafShades, { opacity: 0 });
  gsap.set(parts.insideShade, { opacity: book.shade.insideOpen });
  gsap.set(parts.spineShade, { opacity: book.shade.spine });
  gsap.set(parts.coverShade, { opacity: 0 });
}

const span = ([start, end]: readonly [number, number]) => ({
  at: start,
  duration: end - start,
});

/* ---------- Opening: shelf to page ---------- */

export function playOpen(request: OpenRequest): Choreography {
  const { stage, source } = request;
  const run = runner();
  const g = measure(source);
  const parts = buildBook(source, g);
  const dim = veil();
  const navVeil = navDimmer(request.navVeil);

  // The spine leaves its slot: hide it in the copy of the shelf, and let the
  // pulled-out shadow behind it fade as the book comes away.
  const inCopy = stage.page.querySelectorAll<HTMLElement>(
    `[data-snapshot-book="${source.id}"]`,
  );
  inCopy.forEach((spine) => (spine.style.visibility = "hidden"));
  const lift = [...inCopy]
    .map((spine) => spine.parentElement?.querySelector(".bookcase__lift"))
    .filter((node): node is HTMLElement => node instanceof HTMLElement);

  const soft = softCopy(stage.page);
  stage.root.append(soft, dim, parts.root);
  onShelf(parts, g, source);

  const O = transition.open;
  const pull = span(O.pull);
  const travel = span(O.travel);
  const hinge = span(O.hinge);
  const expand = span(O.expand);
  const rise = span(O.rise);
  const turnAt = travel.at + O.turnLag;
  const turnFor = travel.duration - O.turnLag;
  let content: HTMLElement[] = [];

  const tl = run.add(
    gsap.timeline({ paused: true, onComplete: () => request.onDone() }),
  );

  // 1. Pulled off the shelf: toward the reader, lifted a little, upright.
  tl.to(
    parts.root,
    {
      perspective: `${g.P}px`,
      perspectiveOrigin: "50% 50%",
      duration: pull.duration,
      ease: ease.soft,
    },
    pull.at,
  )
    .to(
      parts.tilt,
      {
        z: book.pullZ,
        y: -book.pullLift * g.H,
        rotationX: 0,
        duration: pull.duration,
        ease: ease.out,
      },
      pull.at,
    )
    .to(lift, { opacity: 0, duration: pull.duration }, pull.at)
    .to(
      soft,
      {
        opacity: 1,
        duration: travel.at + travel.duration * O.dimBy,
        ease: ease.softInOut,
      },
      pull.at,
    )
    .to(
      [dim, navVeil],
      {
        opacity: book.dim,
        duration: travel.at + travel.duration * O.dimBy,
        ease: ease.softInOut,
      },
      pull.at,
    );
  if (parts.label) {
    tl.to(parts.label, { opacity: 0, duration: pull.duration / 2 }, pull.at);
  }

  // 2. To the centre of the screen, turning from spine to cover.
  tl.to(
    parts.root,
    { ...g.centre, duration: travel.duration, ease: ease.inOut },
    travel.at,
  )
    .to(
      parts.tilt,
      {
        z: 0,
        y: 0,
        duration: travel.at + travel.duration - pull.duration,
        ease: ease.inOut,
      },
      pull.duration,
    )
    .to(
      parts.turn,
      {
        rotationY: 0,
        rotation: 0,
        z: -g.D / 2,
        duration: turnFor,
        ease: ease.inOut,
      },
      turnAt,
    )
    .to(
      parts.spineShade,
      { opacity: book.shade.spine, duration: turnFor },
      turnAt,
    )
    .to(parts.coverShade, { opacity: 0, duration: turnFor }, turnAt);

  // 3. The cover swings open on its hinge, a few leaves following it.
  tl.set(parts.inside, { visibility: "visible" }, hinge.at)
    .to(
      parts.cover,
      { rotationY: book.coverOpen, duration: hinge.duration, ease: ease.hinge },
      hinge.at,
    )
    .to(
      parts.coverShade,
      {
        opacity: book.shade.edgeOn,
        duration: hinge.duration / 2,
        ease: ease.softIn,
      },
      hinge.at,
    )
    .fromTo(
      parts.insideShade,
      { opacity: book.shade.insideEdgeOn },
      {
        opacity: book.shade.insideOpen,
        duration: hinge.duration / 2,
        ease: ease.soft,
      },
      hinge.at + hinge.duration / 2,
    );
  parts.leaves.forEach((leaf, index) => {
    const delay = O.leafLag * (index + 1);
    const duration = hinge.duration - delay;
    const shade = parts.leafShades[index];
    tl.to(
      leaf,
      { rotationY: book.leavesOpen[index], duration, ease: ease.hinge },
      hinge.at + delay,
    );
    if (shade) {
      tl.to(
        shade,
        {
          opacity: book.shade.leafTurning,
          duration: duration / 2,
          ease: ease.softIn,
        },
        hinge.at + delay,
      ).to(
        shade,
        {
          opacity: book.shade.leafOpen,
          duration: duration / 2,
          ease: ease.soft,
        },
        hinge.at + delay + duration / 2,
      );
    }
  });
  if (g.spread) {
    tl.to(
      parts.turn,
      { x: g.spreadShift, duration: hinge.duration, ease: ease.inOut },
      hinge.at,
    );
  }

  // 4. The book lands on the new page. That page has to be ready first: if
  // it is not yet, the open book waits here, and the rest is built once it is.
  tl.addPause(expand.at, () => {
    void request.ready.then(() => {
      if (run.dead) return;
      content = request.content();
      gsap.set(content, { opacity: 0, y: reveal.distance });

      // The page as it will look the moment the book lands (its frame, the
      // words not in yet) fades in round the book as it flies to its place
      // on it, so the room becomes the page. Once the book is at rest on its
      // own image, it dissolves into it.
      const land = span(O.land);
      const destination = snapshotPage();
      if (destination) {
        destination.style.opacity = "0";
        stage.root.insertBefore(destination, parts.root);
        tl.to(
          destination,
          { opacity: 1, duration: land.duration, ease: ease.softInOut },
          land.at,
        );
      }
      const handover = Math.min(O.handover, expand.duration);
      const frame = request.frame();
      tl.to(
        parts.root,
        {
          ...landing(g, frame),
          duration: land.duration,
          ease: ease.inOut,
        },
        land.at,
      )
        .to(
          parts.root,
          { opacity: 0, duration: handover, ease: "none" },
          expand.at + expand.duration - handover,
        )
        .to(
          [parts.cover, ...parts.leaves],
          { rotationY: -180, duration: land.duration, ease: ease.softInOut },
          land.at,
        )
        .to(
          frame?.spread
            ? parts.boards
            : [...parts.boards, ...parts.sheets, ...parts.gutters],
          { opacity: 0, duration: land.duration, ease: ease.softIn },
          land.at,
        )
        .to(parts.leafShades, { opacity: 0, duration: land.duration }, land.at)
        .to(
          navVeil,
          { opacity: 0, duration: land.duration, ease: ease.softIn },
          land.at,
        )
        .to(
          content,
          {
            opacity: 1,
            y: 0,
            duration: rise.duration,
            ease: ease.out,
            clearProps: "opacity,transform",
          },
          rise.at,
        );
      // When both pages show, the fold keeps its resting shade.
      if (frame?.spread) {
        tl.to(
          parts.gutters,
          { opacity: gutterRest(), duration: land.duration },
          land.at,
        );
      }
      tl.play();
    });
  });

  // The page takes over once the book has landed on it.
  tl.call(
    () => {
      stage.root.remove();
      request.onReveal();
    },
    [],
    expand.at + expand.duration,
  )
    // Fixes the timeline's length before the landing is added at the gate.
    .set({}, {}, rise.at + rise.duration);

  if (g.lying) tl.timeScale(O.total / transition.openMobile.total);
  tl.play();

  return {
    skip: () => run.skip(),
    kill: () => {
      run.kill();
      gsap.set(content, { clearProps: "opacity,transform" });
      gsap.set(navVeil, { opacity: 0 });
    },
  };
}

/* ---------- Closing: page to shelf ---------- */

export function playClose(request: CloseRequest): Choreography {
  const { stage } = request;
  const run = runner();
  const C = transition.close;
  const navVeil = navDimmer(request.navVeil);

  // 1. The words fade from the page, leaving its paper.
  const fade = span(C.fade);
  const words =
    stage.page.querySelector<HTMLElement>("[data-snapshot-content]") ??
    stage.page;
  const fading = run.add(
    gsap.to(words, { opacity: 0, duration: fade.duration, ease: ease.soft }),
  );

  void Promise.all([fading.then(), request.ready]).then(() => {
    if (run.dead) return;
    const source = request.destination();
    if (!source) {
      // Nowhere on screen to put the book back: a quiet fade instead.
      request.onShelf();
      run.add(
        gsap.to(stage.root, {
          opacity: 0,
          duration: transition.reducedFade,
          onComplete: () => request.onDone(),
        }),
      );
      return;
    }

    // The book, open and lying exactly on the page's frame. Above the copy
    // of the page, the room (the shelf, real underneath and a soft copy of
    // it here) comes back as the book draws away.
    const g = measure(source);
    const parts = buildBook(source, g);
    const shelf = snapshotPage();
    const soft = shelf ? softCopy(shelf) : div("tb-veil");
    const dim = veil();
    stage.root.append(soft, dim, parts.root);
    openFlat(parts, g, landing(g, request.frame));
    gsap.set([parts.root, soft, dim], { opacity: 0 });
    // It appears as just the pages the frame shows; its cloth (and, on a
    // one-page frame, its left-hand page) comes back as it draws away.
    const hidden = request.frame?.spread
      ? parts.boards
      : [...parts.boards, ...parts.sheets];
    gsap.set(hidden, { opacity: 0 });
    if (!request.frame?.spread) gsap.set(parts.gutters, { opacity: 0 });
    request.onShelf();

    // Everything after the book appears is offset by the hand-over.
    const handover = C.handover;
    const shrink = span(C.shrink);
    const hinge = span(C.hinge);
    const travel = span(C.travel);
    const tl = run.add(gsap.timeline({ onComplete: () => request.onDone() }));
    tl.to(parts.root, { opacity: 1, duration: handover, ease: "none" }, 0);
    shrink.at += handover;
    hinge.at += handover;
    travel.at += handover;

    // 2. The page draws back into an open book at the centre.
    tl.to(
      hidden,
      { opacity: 1, duration: shrink.duration, ease: ease.soft },
      shrink.at,
    )
      .to(
        soft,
        { opacity: 1, duration: shrink.duration, ease: ease.soft },
        shrink.at,
      )
      .to(
        dim,
        { opacity: book.dim, duration: shrink.duration, ease: ease.soft },
        shrink.at,
      )
      .call(
        () => {
          stage.paper.remove();
          stage.page.remove();
        },
        [],
        shrink.at + shrink.duration,
      )
      .to(
        parts.root,
        { ...g.centre, duration: shrink.duration, ease: ease.settle },
        shrink.at,
      )
      .to(
        parts.cover,
        {
          rotationY: book.coverOpen,
          duration: shrink.duration,
          ease: ease.soft,
        },
        shrink.at,
      )
      .to(parts.gutters, { opacity: 1, duration: shrink.duration }, shrink.at)
      .to(
        navVeil,
        { opacity: book.dim, duration: shrink.duration / 2 },
        shrink.at,
      );
    parts.leaves.forEach((leaf, index) => {
      tl.to(
        leaf,
        {
          rotationY: book.leavesOpen[index],
          duration: shrink.duration,
          ease: ease.soft,
        },
        shrink.at,
      );
    });

    // 3. It closes: the top leaf first, the cover last, pressing them shut.
    [...parts.leaves].reverse().forEach((leaf, index) => {
      const delay = transition.open.leafLag * index;
      const duration = hinge.duration - delay;
      const shade = parts.leafShades[parts.leaves.length - 1 - index];
      tl.to(
        leaf,
        { rotationY: 0, duration, ease: ease.inOut },
        hinge.at + delay,
      );
      if (shade) {
        tl.to(
          shade,
          {
            opacity: book.shade.leafTurning,
            duration: duration / 2,
            ease: ease.softIn,
          },
          hinge.at + delay,
        ).to(
          shade,
          { opacity: 0, duration: duration / 2, ease: ease.soft },
          hinge.at + delay + duration / 2,
        );
      }
    });
    const coverDelay = transition.open.leafLag * parts.leaves.length;
    tl.to(
      parts.cover,
      {
        rotationY: 0,
        duration: hinge.duration - coverDelay,
        ease: ease.inOut,
      },
      hinge.at + coverDelay,
    )
      .to(
        parts.insideShade,
        {
          opacity: book.shade.insideEdgeOn,
          duration: hinge.duration / 2,
          ease: ease.softIn,
        },
        hinge.at,
      )
      .fromTo(
        parts.coverShade,
        { opacity: book.shade.edgeOn },
        { opacity: 0, duration: hinge.duration / 2, ease: ease.soft },
        hinge.at + hinge.duration / 2,
      );
    if (g.spread) {
      tl.to(
        parts.turn,
        { x: 0, duration: hinge.duration, ease: ease.inOut },
        hinge.at,
      );
    }
    tl.set(parts.inside, { visibility: "hidden" }, hinge.at + hinge.duration);

    // 4. Back to its place: turning spine-out, carried forward, then pushed
    // home into the shelf.
    const carried = travel.duration * C.carry;
    const brighten = travel.duration * C.brightenFrom;
    tl.to(
      parts.root,
      { x: 0, y: 0, scale: 1, duration: travel.duration, ease: ease.inOut },
      travel.at,
    )
      .to(
        parts.turn,
        {
          rotationY: 90,
          rotation: g.roll,
          z: -(g.W / 2 - SEAM),
          duration: travel.duration,
          ease: ease.inOut,
        },
        travel.at,
      )
      .to(
        parts.spineShade,
        { opacity: 0, duration: travel.duration },
        travel.at,
      )
      .to(
        parts.coverShade,
        { opacity: book.shade.coverAside, duration: travel.duration },
        travel.at,
      )
      .to(
        parts.tilt,
        { z: book.pullZ / 2, duration: carried, ease: ease.settle },
        travel.at,
      )
      .to(
        parts.tilt,
        { z: 0, duration: travel.duration - carried, ease: ease.inOut },
        travel.at + carried,
      )
      .to(
        [soft, dim, navVeil],
        {
          opacity: 0,
          duration: travel.duration - brighten,
          ease: ease.softInOut,
        },
        travel.at + brighten,
      );
  });

  return {
    skip: () => run.skip(),
    kill: () => {
      run.kill();
      gsap.set(navVeil, { opacity: 0 });
    },
  };
}

/* ---------- Reduced motion: a crossfade ---------- */

export function playFade(request: FadeRequest): Choreography {
  const run = runner();
  void request.ready.then(() => {
    if (run.dead) return;
    request.onReveal();
    run.add(
      gsap.to(request.stage.root, {
        opacity: 0,
        duration: transition.reducedFade,
        ease: ease.softInOut,
        onComplete: () => request.onDone(),
      }),
    );
  });
  return { skip: () => run.skip(), kill: () => run.kill() };
}
