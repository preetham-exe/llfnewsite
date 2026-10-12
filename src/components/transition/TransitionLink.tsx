"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRef, type AnchorHTMLAttributes, type ReactNode } from "react";

import { useTransition } from "./TransitionProvider";

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
 * Every internal link goes through this. It renders a plain <a>, so it works
 * without JavaScript and opens in a new tab as usual. For a same-tab client
 * navigation (Link's onNavigate) it lets the transition engine copy the
 * screen first, then Link navigates as normal. Scrolling is the
 * transition's job, so Next's own scroll is off.
 */
export function TransitionLink({
  href,
  children,
  ...rest
}: TransitionLinkProps) {
  const { navigate } = useTransition();
  const ref = useRef<HTMLAnchorElement>(null);

  return (
    <Link
      href={href}
      ref={ref}
      scroll={false}
      onNavigate={() => navigate(href, ref.current)}
      {...rest}
    >
      {children}
    </Link>
  );
}
