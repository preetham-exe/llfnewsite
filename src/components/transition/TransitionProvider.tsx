"use client";

import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

import { ScrollTrigger } from "@/lib/gsap";

/*
 * Owns navigation between pages. It lives in the root layout and never
 * unmounts.
 *
 * Phase 0: scroll handling only. Following a link opens the new page at the
 * top; back and forward return to where the reader was on that page.
 * Phase 3 adds the state machine and the book-opening timeline here.
 */

type TransitionState = "idle";

type TransitionContextValue = {
  state: TransitionState;
  overlayRef: RefObject<HTMLDivElement | null>;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lenis = useLenis();
  const overlayRef = useRef<HTMLDivElement>(null);
  const currentPath = useRef(pathname);
  const nextIsPopState = useRef(false);
  const scrollPositions = useRef(new Map<string, number>());

  useEffect(() => {
    history.scrollRestoration = "manual";

    let frame = 0;
    const rememberScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        scrollPositions.current.set(currentPath.current, window.scrollY);
      });
    };
    const markPopState = () => {
      nextIsPopState.current = true;
    };

    window.addEventListener("scroll", rememberScroll, { passive: true });
    window.addEventListener("popstate", markPopState);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", rememberScroll);
      window.removeEventListener("popstate", markPopState);
    };
  }, []);

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

  const value = useMemo(() => ({ state: "idle" as const, overlayRef }), []);

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
