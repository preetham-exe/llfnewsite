import { Txt } from "@/components/ui/Txt";
import type { Todo } from "@/content/types";

/**
 * A line of page copy. A phrase written [[like this]] gets a pencil
 * underline, drawn by hand as it comes into view (SpreadMotion animates it;
 * without JavaScript, or with reduced motion, it is simply there). Use it
 * once or twice a page, for the phrase that matters most.
 */
export function Prose({ children }: { children: string | Todo }) {
  const parts = children.split(/\[\[(.+?)\]\]/);
  if (parts.length === 1) return <Txt>{children}</Txt>;
  return (
    <>
      {parts.map((part, index) =>
        // Split keeps the captured phrases at the odd positions.
        index % 2 === 1 ? (
          <PencilMark key={index}>{part}</PencilMark>
        ) : (
          part && <Txt key={index}>{part}</Txt>
        ),
      )}
    </>
  );
}

function PencilMark({ children }: { children: string }) {
  return (
    <span className="pencil-mark">
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
        className="pencil-mark__line"
      >
        {/* Two passes, slightly apart, as a pencil goes over a line. */}
        <path
          data-pencil=""
          d="M1 6.2 C 18 4.8, 34 5.6, 52 5 S 84 4.2, 99 5.4"
          strokeWidth="1.5"
          opacity="0.85"
        />
        <path
          data-pencil=""
          d="M4 7.6 C 24 6.4, 46 7.2, 66 6.5 S 90 6.2, 97 6.9"
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>
    </span>
  );
}
