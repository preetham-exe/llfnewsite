import { libraries } from "@/content/libraries";
import { isTodo } from "@/content/helpers";

/*
 * Objects that sit on shelves and in margins. Decorative: hidden from
 * assistive technology.
 */

const stampFormat = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * A library date-due card. Its stamps are the opening months of LLF's
 * libraries (only the ones confirmed so far). Used in the margins of The
 * Libraries from Phase 5.
 */
export function LibraryCard() {
  const stamps = libraries
    .map((library) => library.openedOn)
    .filter((date) => !isTodo(date))
    .map((date) =>
      stampFormat
        .format(new Date(`${date.slice(0, 7)}-01T00:00:00Z`))
        .toUpperCase(),
    );

  return (
    <svg
      aria-hidden="true"
      className="library-card"
      viewBox="0 0 100 150"
      focusable="false"
    >
      <rect
        x="0.5"
        y="0.5"
        width="99"
        height="149"
        rx="2"
        className="library-card__paper"
      />
      <text x="50" y="16" textAnchor="middle" className="library-card__heading">
        DATE DUE
      </text>
      {Array.from({ length: 9 }, (_, row) => (
        <line
          key={row}
          x1="6"
          x2="94"
          y1={26 + row * 13.5}
          y2={26 + row * 13.5}
          className="library-card__rule"
        />
      ))}
      <line x1="40" x2="40" y1="26" y2="134" className="library-card__rule" />
      {stamps.map((stamp, index) => (
        <text
          key={stamp}
          x="23"
          y={36.5 + index * 27}
          textAnchor="middle"
          transform={`rotate(${index % 2 ? 3 : -4} 23 ${34 + index * 27})`}
          className="library-card__stamp"
        >
          {stamp}
        </text>
      ))}
    </svg>
  );
}
