"use client";

import { useLenis } from "lenis/react";
import Image from "next/image";
import { type PointerEvent, useEffect, useRef } from "react";

import { Txt } from "@/components/ui/Txt";
import type { gallery as galleryCopy } from "@/content/pages";
import { formatDate } from "@/lib/format";
import { type Plate, roman } from "@/lib/gallery";
import { gsap, useGSAP } from "@/lib/gsap";
import { ease, gallery, transition } from "@/motion/tokens";

type PlateViewerProps = {
  plates: Plate[];
  index: number;
  copy: typeof galleryCopy;
  onChange: (index: number) => void;
  onClose: (index: number) => void;
};

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * One plate at a time, large, on the book's cloth: the arrow keys, the
 * buttons or a swipe move to the next or previous plate, and Escape, Close
 * or a click beside the plate puts it back. A native modal dialog, so focus
 * stays inside it and the page behind cannot be reached. It rises a little
 * as it opens and fades as it closes; with reduced motion it only fades.
 */
export function PlateViewer({
  plates,
  index,
  copy,
  onChange,
  onClose,
}: PlateViewerProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const figure = useRef<HTMLElement>(null);
  const swipeFrom = useRef<number | null>(null);
  const closing = useRef(false);
  const shown = useRef<number | null>(null);
  const lenis = useLenis();
  const plate = plates[index];

  // Open as it mounts, with focus on its first control. If the page goes
  // (a link, the back button) it shuts.
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (!element.open) element.showModal();
    if (!element.contains(document.activeElement)) {
      element.querySelector<HTMLElement>("button:not(:disabled)")?.focus();
    }
    return () => element.close();
  }, []);

  // The page behind keeps still while a plate is open.
  useEffect(() => {
    lenis?.stop();
    return () => lenis?.start();
  }, [lenis]);

  // Rises as it opens; crossfades from one plate to the next. Opacity only,
  // never visibility: a hidden dialog cannot take focus as it opens.
  useGSAP(
    () => {
      const element = dialog.current;
      if (!element || !figure.current) return;
      const first = shown.current === null;
      shown.current = index;
      if (reducedMotion()) {
        if (first) {
          gsap.from(element, {
            opacity: 0,
            duration: transition.reducedFade,
          });
        }
        return;
      }
      if (first) {
        gsap
          .timeline()
          .from(element, {
            opacity: 0,
            duration: gallery.viewer.open,
            ease: ease.soft,
          })
          .from(
            figure.current,
            {
              scale: gallery.viewer.rise,
              duration: gallery.viewer.open,
              ease: ease.settle,
            },
            0,
          );
      } else {
        gsap.from(figure.current, {
          opacity: 0,
          duration: gallery.viewer.change,
          ease: ease.soft,
        });
      }
    },
    { dependencies: [index], scope: dialog },
  );

  if (!plate) return null;

  const close = () => {
    const element = dialog.current;
    if (closing.current || !element) return;
    closing.current = true;
    gsap.to(element, {
      opacity: 0,
      duration: reducedMotion() ? transition.reducedFade : gallery.viewer.close,
      ease: ease.softIn,
      onComplete: () => {
        // Shut first: a dialog gives focus back to whatever had it before
        // it opened, and onClose then moves it to the plate.
        element.close();
        onClose(index);
      },
    });
  };
  const step = (by: number) => {
    const next = index + by;
    if (next >= 0 && next < plates.length) onChange(next);
  };

  const onPointerDown = (event: PointerEvent) => {
    swipeFrom.current = event.pointerType === "mouse" ? null : event.clientX;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (swipeFrom.current === null) return;
    const moved = event.clientX - swipeFrom.current;
    swipeFrom.current = null;
    if (Math.abs(moved) >= gallery.viewer.swipe) step(moved < 0 ? 1 : -1);
  };

  const position = `${copy.plate} ${plate.numeral} ${copy.of} ${roman(plates.length)}`;

  return (
    <dialog
      ref={dialog}
      aria-label={position}
      className="viewer cloth cloth-navy lettering-cream"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") step(1);
        if (event.key === "ArrowLeft") step(-1);
      }}
      onClick={(event) => {
        // Beside the plate, not on it or a control.
        if (event.target === event.currentTarget) close();
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <figure ref={figure} className="viewer__plate">
        <div className="viewer__sheet">
          <Image
            key={plate.anchor}
            src={plate.photo.src}
            width={plate.photo.width}
            height={plate.photo.height}
            alt={plate.photo.alt}
            sizes="(min-width: 64rem) 75vw, 100vw"
            className="viewer__image"
            {...(plate.photo.lqip
              ? { placeholder: "blur", blurDataURL: plate.photo.lqip }
              : {})}
          />
        </div>
        <figcaption className="viewer__caption">
          <span className="viewer__numeral">{position}</span>
          {plate.caption && (
            <span className="viewer__text">
              <Txt>{plate.caption}</Txt>
            </span>
          )}
          <span className="viewer__from">
            <Txt>{plate.from}</Txt>
            {", "}
            <Txt>{formatDate(plate.when)}</Txt>
          </span>
        </figcaption>
      </figure>

      <div className="viewer__controls">
        {plates.length > 1 && (
          <>
            <button
              type="button"
              className="viewer__button viewer__button--previous"
              disabled={index === 0}
              onClick={() => step(-1)}
            >
              <span aria-hidden="true">&larr;</span>
              <span className="sr-only">{copy.previous}</span>
            </button>
            <button
              type="button"
              className="viewer__button viewer__button--next"
              disabled={index === plates.length - 1}
              onClick={() => step(1)}
            >
              <span aria-hidden="true">&rarr;</span>
              <span className="sr-only">{copy.next}</span>
            </button>
          </>
        )}
        <button
          type="button"
          className="viewer__button viewer__button--close"
          onClick={close}
        >
          {copy.close}
        </button>
      </div>

      <p aria-live="polite" className="sr-only">
        {position}
      </p>
    </dialog>
  );
}
