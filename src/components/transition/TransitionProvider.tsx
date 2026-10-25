"use client";

import { useLenis } from "lenis/react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

import { ScrollTrigger } from "@/lib/gsap";

import { loadChoreographies, TransitionEngine } from "./engine";
import { setPopstateHandler } from "./first-popstate";

/*
 * Owns navigation between pages. It lives in the site's shell (SiteChrome,
 * in the (site) layout) and never unmounts. It connects the transition
 * engine (engine.ts) to React and looks after scrolling: following a link
 * opens the new page at the top; back and forward return to where the
 * reader was on that page.
 */

type TransitionContextValue = {
  overlayRef: RefObject<HTMLDivElement | null>;
  /**
   * The page on screen. During a transition this stays the page being left
   * until the new one shows, so the nav changes with the page, not before.
   */
  visiblePath: string;
  /** TransitionLink calls this as a same-tab navigation starts. */
  navigate(href: string, link: HTMLAnchorElement | null): void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

/** Runs once the browser is idle, or after a moment where that is unknown. */
function whenIdle(callback: () => void): () => void {
  if ("requestIdleCallback" in window) {
    const handle = window.requestIdleCallback(callback, { timeout: 3000 });
    return () => window.cancelIdleCallback(handle);
  }
  const timer = setTimeout(callback, 1500);
  return () => clearTimeout(timer);
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useLenis();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [engine] = useState(() => new TransitionEngine());
  const [heldPath, setHeldPath] = useState<string | null>(null);
  const currentPath = useRef(pathname);
  const nextIsPopState = useRef(false);
  const scrollPositions = useRef(new Map<string, number>());

  useEffect(() => {
    engine.connect({
      overlay: () => overlayRef.current,
      hold: setHeldPath,
      push: (path) => router.push(path as Route, { scroll: false }),
    });
    return () => engine.connect(null);
  }, [engine, router]);

  useEffect(() => engine.setLenis(lenis), [engine, lenis]);

  useLayoutEffect(() => engine.setPath(pathname), [engine, pathname]);

  useEffect(() => {
    history.scrollRestoration = "manual";

    let frame = 0;
    const rememberScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        scrollPositions.current.set(currentPath.current, window.scrollY);
      });
    };
    const onPopState = () => {
      nextIsPopState.current = true;
      engine.popstate();
    };
    const onPageShow = (event: PageTransitionEvent) => {
      // Back from another site via the browser's page cache.
      if (event.persisted) engine.stop();
    };

    window.addEventListener("scroll", rememberScroll, { passive: true });
    // Through the boot script's listener, which runs before Next's.
    setPopstateHandler(onPopState);
    window.addEventListener("keydown", engine.escape);
    window.addEventListener("pageshow", onPageShow);
    const cancelPreload = whenIdle(() => {
      loadChoreographies().catch(() => {
        // Tried again at the first transition.
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      cancelPreload();
      window.removeEventListener("scroll", rememberScroll);
      setPopstateHandler(null);
      window.removeEventListener("keydown", engine.escape);
      window.removeEventListener("pageshow", onPageShow);
      engine.stop();
    };
  }, [engine]);

  // Runs after the new page is in the DOM and before the browser paints it.
  useLayoutEffect(() => {
    if (pathname === currentPath.current) return;

    const top = nextIsPopState.current
      ? (scrollPositions.current.get(pathname) ?? 0)
      : 0;
    nextIsPopState.current = false;
    currentPath.current = pathname;

    if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
    else window.scrollTo(0, top);

    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [pathname, lenis]);

  const visiblePath = heldPath ?? pathname;
  const value = useMemo(
    () => ({ overlayRef, visiblePath, navigate: engine.navigate }),
    [engine, visiblePath],
  );

  return (
    <TransitionContext.Provider value={value}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransition(): TransitionContextValue {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error("useTransition must be used inside TransitionProvider");
  }
  return context;
}
