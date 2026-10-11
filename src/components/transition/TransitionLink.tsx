"use client";

import type { Route } from "next";
import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type TransitionLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & {
  href: Route;
  children: ReactNode;
  /**
   * `true` prefetches the whole page, URL data included. Use it for links to
   * library and story pages, so those navigations are instant.
   */
  prefetch?: boolean | "auto" | null;
};

/**
 * Every internal link goes through this, so the transition system controls
 * scrolling (Next's own scroll is off). It renders a plain <a>, so it works
 * without JavaScript. Phase 3 adds the book and crossfade transitions here,
 * using Link's onNavigate, which only fires for same-tab client navigations.
 */
export function TransitionLink({
  href,
  children,
  ...rest
}: TransitionLinkProps) {
  return (
    <Link href={href} scroll={false} {...rest}>
      {children}
    </Link>
  );
}
