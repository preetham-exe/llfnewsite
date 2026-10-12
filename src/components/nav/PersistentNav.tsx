"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type KeyboardEvent } from "react";

import { Monogram } from "@/components/brand/Monogram";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { useTransition } from "@/components/transition/TransitionProvider";
import { books } from "@/content/books";
import { site } from "@/content/site";

import { DonateButton } from "./DonateButton";

/**
 * The persistent top bar. It lives in the root layout and never unmounts.
 * On the shelf it shows the name and Donate; on every other page it shows
 * Back to the shelf, the sections, and Donate. It follows the page on
 * screen, so during a transition it changes when the new page shows. The
 * mobile menu is a <details> element, so it opens without JavaScript;
 * Escape closes it.
 */
export function PersistentNav() {
  const pathname = usePathname();
  const { visiblePath } = useTransition();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const onShelf = visiblePath === "/";
  const sections = books.filter((book) => book.id !== "donate");

  const isCurrent = (href: string) =>
    visiblePath === href || visiblePath.startsWith(`${href}/`);

  useEffect(() => {
    if (menuRef.current) menuRef.current.open = false;
  }, [pathname]);

  const closeMenu = (event: KeyboardEvent<HTMLDetailsElement>) => {
    const menu = menuRef.current;
    if (event.key !== "Escape" || !menu?.open) return;
    // Handled here, so Escape does not also close the book.
    event.preventDefault();
    menu.open = false;
    menu.querySelector("summary")?.focus();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-(--z-nav) h-(--nav-height) border-b border-paper-edge bg-paper font-sans text-ui">
      <div className="mx-auto flex h-full max-w-page items-center justify-between gap-4 px-4 sm:px-6">
        {onShelf ? (
          <TransitionLink
            href="/"
            aria-label={site.name}
            className="inline-flex items-center gap-2.5 font-serif text-[1.0625rem] smallcaps whitespace-nowrap text-navy no-underline"
          >
            <Monogram className="h-6 shrink-0" />
            {/* "Foundation" waits for room beside Donate. */}
            <span>
              Literate Lives
              <span className="hidden sm:inline"> Foundation</span>
            </span>
          </TransitionLink>
        ) : (
          <TransitionLink
            href="/"
            className="inline-flex min-h-10 items-center gap-2 no-underline hover:underline"
          >
            <span aria-hidden="true">←</span>
            Back to the shelf
          </TransitionLink>
        )}

        {!onShelf && (
          <nav aria-label="Sections" className="hidden lg:block">
            <ul className="flex items-center gap-5">
              {sections.map((book) => (
                <li key={book.id}>
                  <TransitionLink
                    href={book.href}
                    aria-current={isCurrent(book.href) ? "page" : undefined}
                    className="no-underline hover:underline aria-[current=page]:underline"
                  >
                    {book.spineTitle}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="flex items-center gap-2">
          {!onShelf && (
            <details
              ref={menuRef}
              onKeyDown={closeMenu}
              className="relative lg:hidden"
            >
              <summary className="flex min-h-10 cursor-pointer list-none items-center px-3 [&::-webkit-details-marker]:hidden">
                Menu
              </summary>
              <nav
                aria-label="Sections"
                className="absolute top-full right-0 mt-2 w-60 border border-paper-edge bg-paper py-2 shadow-[0_8px_24px_rgb(31_26_21/0.12)]"
              >
                <ul>
                  {books.map((book) => (
                    <li key={book.id}>
                      <TransitionLink
                        href={book.href}
                        aria-current={isCurrent(book.href) ? "page" : undefined}
                        className="block px-4 py-2.5 no-underline hover:bg-paper-shade aria-[current=page]:underline"
                      >
                        {book.spineTitle}
                      </TransitionLink>
                    </li>
                  ))}
                </ul>
              </nav>
            </details>
          )}
          <DonateButton current={isCurrent("/donate")} />
        </div>
      </div>
      {/* Dims the bar with the rest of the screen while a book is out. */}
      <span
        aria-hidden="true"
        data-nav-veil=""
        className="pointer-events-none absolute inset-x-0 top-0 -bottom-px bg-ink opacity-0"
      />
    </header>
  );
}
