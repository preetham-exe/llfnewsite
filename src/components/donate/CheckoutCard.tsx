"use client";

import { useId, useRef } from "react";

import { Txt } from "@/components/ui/Txt";
import { isTodo } from "@/content/helpers";
import type { donate } from "@/content/pages";
import { stampDate } from "@/lib/format";
import { useGSAP } from "@/lib/gsap";
import { gsap } from "@/lib/gsap-draw";
import { checkout, ease, transition } from "@/motion/tokens";

type CheckoutCardProps = {
  copy: (typeof donate)["checkout"];
  /** The Milaap campaign, or a TODO until there is one. */
  destination: string;
};

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Shows the pencil circle round the chosen gift (drawn, or simply there)
 * and rubs out any other.
 */
function circleGift(root: HTMLElement, input: HTMLInputElement, draw: boolean) {
  root.querySelectorAll<SVGSVGElement>(".checkout__circle").forEach((svg) => {
    gsap.killTweensOf(svg.querySelectorAll("path"));
    gsap.set(svg, { visibility: "hidden" });
  });
  const svg = input
    .closest(".checkout__option")
    ?.querySelector<SVGSVGElement>(".checkout__circle");
  if (!svg) return;
  const strokes = svg.querySelectorAll("path");
  gsap.set(svg, { visibility: "visible" });
  if (!draw || reducedMotion()) {
    gsap.set(strokes, { drawSVG: "100%" });
    return;
  }
  gsap.fromTo(
    strokes,
    { drawSVG: "0%" },
    { drawSVG: "100%", duration: checkout.circle, ease: ease.inOut },
  );
}

/**
 * The library checkout card on Donate: the card from a library book's
 * pocket, with gifts on its ruled lines instead of borrowers. Choosing one
 * circles it in pencil. Check out is a real link to Milaap, so it works
 * without JavaScript. With JavaScript a rubber stamp first comes down on the
 * card, printing THANK YOU and today's date, and the visitor leaves for
 * Milaap as the ink shows, in the same tab (new tabs are unreliable in the
 * Instagram and WhatsApp browsers most donors arrive from). Until there is a
 * Milaap link, Check out stamps the card and says so.
 */
export function CheckoutCard({ copy, destination }: CheckoutCardProps) {
  const scope = useRef<HTMLDivElement>(null);
  const id = useId();
  const url = isTodo(destination) ? null : destination;
  const leaving = copy.leaving;

  useGSAP(
    (_, contextSafe) => {
      const root = scope.current;
      if (!root || !contextSafe) return;
      const stamp = root.querySelector<SVGSVGElement>(".checkout__stamp");
      const ink = root.querySelector<HTMLElement>(".checkout__ink");
      const date = root.querySelector<HTMLElement>(".checkout__ink-date");
      const live = root.querySelector<HTMLElement>("[data-checkout-live]");
      const button = root.querySelector<HTMLElement>(".checkout__button");
      const radios = [
        ...root.querySelectorAll<HTMLInputElement>(".checkout__radio"),
      ];
      let busy = false;

      // A gift the browser kept chosen (coming back to the page) keeps its
      // circle.
      const chosen = radios.find((radio) => radio.checked);
      if (chosen) circleGift(root, chosen, false);

      const choose = contextSafe((event: Event) => {
        circleGift(root, event.currentTarget as HTMLInputElement, true);
      });

      const checkOut = contextSafe((event: MouseEvent) => {
        // A new tab or window is the browser's business: no stamp.
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        event.preventDefault();
        if (busy) return;
        busy = true;

        let gone = false;
        const leave = () => {
          if (gone || !url) return;
          gone = true;
          window.location.assign(url);
        };
        // Whatever happens to the stamp, the visitor leaves on time.
        if (url) window.setTimeout(leave, checkout.leaveBy * 1000);
        // Without a Milaap link yet, the card can be stamped again.
        const done = () => {
          if (!url) busy = false;
        };

        if (date) date.textContent = stampDate(new Date());
        if (live) live.textContent = leaving;
        if (!stamp || !ink) {
          leave();
          done();
          return;
        }

        if (reducedMotion()) {
          gsap.to(ink, {
            autoAlpha: 1,
            duration: transition.reducedFade,
            onComplete: () => {
              leave();
              done();
            },
          });
          return;
        }

        const S = checkout.stamp;
        gsap
          .timeline({ onComplete: done })
          .set(stamp, {
            autoAlpha: 1,
            y: -S.height,
            rotation: S.tilt,
            scaleX: 1,
            scaleY: 1,
            transformOrigin: "50% 100%",
          })
          // It lifts, then drops onto the card.
          .to(stamp, {
            y: -(S.height + S.liftBy),
            duration: S.lift,
            ease: ease.settle,
          })
          .to(stamp, {
            y: 0,
            rotation: S.tilt / 3,
            duration: S.drop,
            ease: ease.stamp,
          })
          // It squashes a little as it lands, and the ink takes.
          .to(stamp, {
            scaleY: S.squashTo,
            scaleX: 2 - S.squashTo,
            duration: S.squash,
            ease: ease.out,
          })
          .fromTo(
            ink,
            { autoAlpha: 0, scale: 1.04 },
            { autoAlpha: 1, scale: 1, duration: S.squash + S.settle },
            "<",
          )
          .to(stamp, {
            scaleX: 1,
            scaleY: 1,
            duration: S.settle,
            ease: ease.settle,
          })
          // Off to Milaap as the stamp lifts away from the impression.
          .call(leave)
          .to(stamp, {
            y: -S.height,
            autoAlpha: 0,
            duration: S.away,
            ease: ease.settle,
          });
      });

      // Back from Milaap through the browser's page cache: a fresh card.
      const reset = (event: PageTransitionEvent) => {
        if (!event.persisted) return;
        busy = false;
        const marks = [stamp, ink].filter((mark) => mark !== null);
        if (marks.length) gsap.set(marks, { autoAlpha: 0 });
        if (live) live.textContent = "";
      };

      radios.forEach((radio) => radio.addEventListener("change", choose));
      button?.addEventListener("click", checkOut);
      window.addEventListener("pageshow", reset);
      return () => {
        radios.forEach((radio) => radio.removeEventListener("change", choose));
        button?.removeEventListener("click", checkOut);
        window.removeEventListener("pageshow", reset);
      };
    },
    { scope, dependencies: [url, leaving] },
  );

  return (
    <div ref={scope} className="checkout">
      <div className="checkout__card">
        <dl aria-hidden="true" className="checkout__head">
          <div>
            <dt>{copy.labels.author}</dt>
            <dd>{copy.author}</dd>
          </div>
          <div>
            <dt>{copy.labels.title}</dt>
            <dd>{copy.work}</dd>
          </div>
        </dl>

        <fieldset className="checkout__gifts">
          <legend className="sr-only">{copy.legend}</legend>
          <p aria-hidden="true" className="checkout__heads">
            <span>{copy.legend}</span>
            <span>{copy.amountHead}</span>
          </p>
          {copy.options.map((option) => (
            <label key={option.id} className="checkout__option">
              <input
                type="radio"
                name="gift"
                value={option.id}
                className="checkout__radio"
              />
              <span className="checkout__gift">
                {option.gift}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 100 30"
                  preserveAspectRatio="none"
                  focusable="false"
                  className="checkout__circle"
                >
                  {/* A loop round the words, overshooting where it began. */}
                  <path d="M9 6 C30 0.5, 76 0, 93 7.5 C104 13, 97 26, 70 28.4 C44 30.4, 9 29.4, 3.5 20 C-1 12, 11 4.4, 29 2.6" />
                </svg>
              </span>
              <span className="checkout__amount figures-lining">
                <Txt>{option.amount}</Txt>
              </span>
            </label>
          ))}
        </fieldset>

        {/* The next empty line, where the stamp comes down. */}
        <div aria-hidden="true" className="checkout__blank">
          <div className="checkout__ink">
            <span className="checkout__ink-word">{copy.stamp}</span>
            <span className="checkout__ink-date" />
          </div>
          <svg
            viewBox="0 0 120 116"
            focusable="false"
            className="checkout__stamp"
          >
            <ellipse cx="60" cy="19" rx="23" ry="17" className="stamp__knob" />
            <ellipse cx="53" cy="13" rx="9" ry="5" className="stamp__shine" />
            <path d="M49 33 H71 L74 66 H46 Z" className="stamp__neck" />
            <rect
              x="14"
              y="64"
              width="92"
              height="40"
              rx="4"
              className="stamp__block"
            />
            <rect
              x="14"
              y="64"
              width="92"
              height="7"
              rx="3"
              className="stamp__bevel"
            />
            <rect
              x="17"
              y="104"
              width="86"
              height="11"
              rx="1.5"
              className="stamp__rubber"
            />
            <rect
              x="17"
              y="113"
              width="86"
              height="3"
              className="stamp__inked"
            />
          </svg>
        </div>
      </div>

      <div className="checkout__action">
        {url ? (
          <a
            href={url}
            aria-describedby={`${id}-note`}
            className="checkout__button"
          >
            {copy.action}
          </a>
        ) : (
          <button
            type="button"
            aria-describedby={`${id}-note`}
            className="checkout__button"
          >
            {copy.action}
          </button>
        )}
        <p id={`${id}-note`} className="checkout__note">
          {copy.note}
        </p>
        {!url && (
          <p className="checkout__note">
            <Txt>{destination}</Txt>
          </p>
        )}
        <p data-checkout-live="" aria-live="polite" className="sr-only" />
      </div>
    </div>
  );
}
