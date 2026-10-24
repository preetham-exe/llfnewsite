import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

import { Txt } from "@/components/ui/Txt";
import type { Photo, Todo } from "@/content/types";

/*
 * Objects for the margins of the pages: each page has its own small set,
 * placed with <Margin>. Specific to LLF and slightly imperfect: small
 * rotations, real paper. Decorative ones are hidden from assistive
 * technology (they only echo the text beside them); the ones that carry
 * something of their own (a photo, a library's facts) are not.
 * Drawn artwork lives in public/marginalia.
 */

function Artwork({
  name,
  width,
  height,
  className,
  tilt,
}: {
  name: string;
  width: number;
  height: number;
  className: string;
  /** Its rotation (deg), where the default for its kind will not do. */
  tilt?: number;
}) {
  return (
    <Image
      src={`/marginalia/${name}.svg`}
      width={width}
      height={height}
      alt=""
      aria-hidden="true"
      unoptimized
      className={className}
      style={
        tilt === undefined
          ? undefined
          : ({ "--tilt": `${tilt}deg` } as CSSProperties)
      }
    />
  );
}

/* ---------- Lying in the margin ---------- */

export function Pencil({ tilt }: { tilt?: number }) {
  return (
    <Artwork
      name="pencil"
      width={240}
      height={28}
      className="lying-object"
      tilt={tilt}
    />
  );
}

export function InkPen({ tilt }: { tilt?: number }) {
  return (
    <Artwork
      name="ink-pen"
      width={260}
      height={30}
      className="lying-object"
      tilt={tilt}
    />
  );
}

export function Ruler() {
  return (
    <Artwork name="ruler" width={300} height={34} className="ruler-object" />
  );
}

/** A peepal leaf, pressed between the pages. */
export function PressedLeaf() {
  return (
    <Artwork
      name="pressed-leaf"
      width={100}
      height={142}
      className="leaf-object"
    />
  );
}

function PaperClip() {
  return (
    <Artwork name="paper-clip" width={20} height={72} className="paper-clip" />
  );
}

/* ---------- Photos and cards ---------- */

/** A photo from one of the libraries, as a polaroid taped into the book. */
export function Polaroid({
  photo,
  caption,
}: {
  photo: Photo;
  caption: string | Todo;
}) {
  return (
    <figure className="polaroid">
      <span aria-hidden="true" className="polaroid__tape" />
      <Image
        src={photo.src}
        width={photo.width}
        height={photo.height}
        alt={photo.alt}
        sizes="17rem"
        className="block aspect-square h-auto w-full object-cover"
      />
      <figcaption className="polaroid__caption">
        <Txt>{caption}</Txt>
      </figcaption>
    </figure>
  );
}

/** A note on an index card. Echoes the text beside it, so it is decorative. */
export function NoteCard({ children }: { children: string | Todo }) {
  return (
    <div aria-hidden="true" className="note-card">
      <Txt>{children}</Txt>
    </div>
  );
}

/**
 * The date-due card from a library book's pocket, clipped into the margin.
 * Its stamps are real opening months (only confirmed ones are passed in).
 */
export function DateDueCard({ stamps }: { stamps: readonly string[] }) {
  return (
    <div aria-hidden="true" className="date-due">
      <svg className="date-due__card" viewBox="0 0 100 150" focusable="false">
        <rect
          x="0.5"
          y="0.5"
          width="99"
          height="149"
          rx="2"
          className="date-due__paper"
        />
        <text x="50" y="16" textAnchor="middle" className="date-due__heading">
          DATE DUE
        </text>
        {Array.from({ length: 9 }, (_, row) => (
          <line
            key={row}
            x1="6"
            x2="94"
            y1={26 + row * 13.5}
            y2={26 + row * 13.5}
            className="date-due__rule"
          />
        ))}
        <line x1="56" x2="56" y1="26" y2="134" className="date-due__rule" />
        {stamps.map((stamp, index) => (
          <text
            key={stamp}
            x="31"
            y={36.5 + index * 27}
            textAnchor="middle"
            transform={`rotate(${index % 2 ? 3 : -4} 31 ${34 + index * 27})`}
            className="date-due__stamp"
          >
            {stamp}
          </text>
        ))}
      </svg>
      <PaperClip />
    </div>
  );
}

/**
 * A library catalogue card: a library's facts, typed on a ruled card. This
 * one is content, read like any other list.
 */
export function CatalogueCard({
  heading,
  facts,
}: {
  heading: string;
  facts: { term: string; detail: ReactNode }[];
}) {
  return (
    <div className="catalogue-card">
      <p className="catalogue-card__heading">{heading}</p>
      <dl className="figures-lining">
        {facts.map((fact) => (
          <div key={fact.term} className="catalogue-card__row">
            <dt>{fact.term}</dt>
            <dd>{fact.detail}</dd>
          </div>
        ))}
      </dl>
      <PaperClip />
    </div>
  );
}

/** An index card with the steps ticked off in pencil. Decorative. */
export function Checklist({
  heading,
  items,
}: {
  heading: string;
  items: readonly string[];
}) {
  return (
    <div aria-hidden="true" className="checklist">
      <p className="checklist__heading">{heading}</p>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <svg viewBox="0 0 16 16" className="checklist__tick">
              <path d="M2.5 8.5 L6.2 12 L13.5 3.5" />
            </svg>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The books along one shelf of the sketch, as a quick hand draws them: each
 * one's edge and top, left to right, the last one leaning on the rest. The
 * same seed always gives the same row.
 */
function shelfRow(floor: number, room: number, seed: number): string[] {
  let state = seed;
  const random = () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
  const strokes: string[] = [];
  const stop = 148 + random() * 20;
  let x = 35 + random() * 3;
  let height = 0;
  while (x < stop) {
    const width = 3 + random() * 3.6;
    height = room * (0.56 + random() * 0.3);
    strokes.push(
      `M${x.toFixed(1)} ${floor} V${(floor - height).toFixed(1)} h${width.toFixed(1)}`,
    );
    x += width;
  }
  strokes.push(`M${x.toFixed(1)} ${floor} V${(floor - height).toFixed(1)}`);

  // The last book leans on the row, standing on one corner, its top
  // corner resting against the last upright book just below its top.
  const tilt = (20 * Math.PI) / 180;
  const [sin, cos] = [Math.sin(tilt), Math.cos(tilt)];
  const width = 5;
  const length = (height * 0.88) / cos;
  const foot = x + length * sin;
  const point = (px: number, py: number) => `${px.toFixed(1)} ${py.toFixed(1)}`;
  strokes.push(
    `M${point(foot, floor)} L${point(x, floor - length * cos)} L${point(x + width * cos, floor - length * cos - width * sin)} L${point(foot + width * cos, floor - width * sin)}`,
  );
  return strokes;
}

/** The shelves of the sketch: [floor, room above it], top to bottom. */
const SKETCH_SHELVES = [
  [62, 45],
  [106, 44],
  [150, 44],
  [205, 55],
] as const;

/**
 * A pencil sketch of a bookcase with its measurements, drawn line by line
 * as it comes into view (SpreadMotion): the case first, then the books in
 * quick strokes. The labels are the page's own facts: the size under it,
 * the number of shelves along its height.
 */
export function ShelfSketch({
  size,
  books,
  shelves,
}: {
  size: string;
  books: string;
  shelves: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 250 238"
      className="pencil-sketch"
      focusable="false"
    >
      {/* The case, a little over-drawn at the corners, as sketches are. */}
      <path data-pencil="" d="M27 17 L199 15.5" />
      <path data-pencil="" d="M30 13 L31.5 207" />
      <path data-pencil="" d="M196 12 L197.5 207" />
      <path data-pencil="" d="M26 205 L201 205.5" />
      {[62, 106, 150].map((y, index) => (
        <path
          key={y}
          data-pencil=""
          d={`M31 ${y + index * 0.4} L197 ${y - 0.6}`}
        />
      ))}
      {/* Its height, marked off along the side. */}
      <path data-pencil="" d="M215 15 V205" />
      <path data-pencil="" d="M209 15 H221 M209 205 H221" />
      <path
        data-pencil=""
        d="M211 21 L215 15 L219 21 M211 199 L215 205 L219 199"
      />
      {SKETCH_SHELVES.flatMap(([floor, room], shelf) =>
        shelfRow(floor, room, 7 + shelf * 101).map((d, index) => (
          <path key={`${shelf}-${index}`} data-pencil="quick" d={d} />
        )),
      )}
      <text
        transform="translate(232 110) rotate(-90)"
        textAnchor="middle"
        className="pencil-sketch__note"
      >
        {shelves}
      </text>
      <text
        x="114"
        y="224"
        textAnchor="middle"
        className="pencil-sketch__label"
      >
        {size}
      </text>
      <text x="114" y="236" textAnchor="middle" className="pencil-sketch__note">
        {books}
      </text>
    </svg>
  );
}

/** A stack of letters, the top one sealed in wax with the LLF monogram. */
export function Letters() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 170"
      className="letters"
      focusable="false"
    >
      <g transform="rotate(-7 110 90)">
        <rect
          x="18"
          y="40"
          width="176"
          height="112"
          rx="2"
          className="letters__paper letters__paper--back"
        />
      </g>
      <g transform="rotate(4 110 90)">
        <rect
          x="22"
          y="30"
          width="176"
          height="112"
          rx="2"
          className="letters__paper letters__paper--middle"
        />
        <path d="M22 30 L110 92 L198 30" className="letters__flap" />
      </g>
      <g transform="rotate(-2 110 90)">
        <rect
          x="20"
          y="22"
          width="176"
          height="112"
          rx="2"
          className="letters__paper"
        />
        <path d="M20 22 L108 86 L196 22" className="letters__flap" />
        {/* The seal: wax pooled a little unevenly, the monogram pressed in. */}
        <path
          d="M108 70 c7.5 -0.4 13.6 4.6 14.4 11.8 c0.9 7.6 -4.4 14.6 -12.2 15.2 c-8.4 0.7 -15.4 -5.2 -15.6 -12.8 c-0.2 -7.6 5.6 -13.8 13.4 -14.2 z"
          className="letters__wax"
        />
        <circle cx="107.5" cy="83.5" r="9.4" className="letters__wax-ring" />
        <use
          href="#llf-monogram"
          x="99"
          y="78.5"
          width="17"
          height="10"
          className="letters__mark"
        />
      </g>
    </svg>
  );
}

/** Sticky notes, one for each way to help. Decorative. */
export function StickyNotes({ notes }: { notes: readonly string[] }) {
  return (
    <div aria-hidden="true" className="sticky-notes">
      {notes.map((note) => (
        <span key={note} className="sticky-note">
          {note}
        </span>
      ))}
    </div>
  );
}

/** A sign-up sheet on a clipboard: the columns, no names. Decorative. */
export function SignUpSheet({
  heading,
  columns,
}: {
  heading: string;
  columns: readonly [string, string];
}) {
  return (
    <div aria-hidden="true" className="sign-up">
      <span className="sign-up__clip" />
      <div className="sign-up__sheet">
        <p className="sign-up__heading">{heading}</p>
        <div className="sign-up__columns">
          <span>{columns[0]}</span>
          <span>{columns[1]}</span>
        </div>
        {Array.from({ length: 6 }, (_, row) => (
          <span key={row} className="sign-up__row" />
        ))}
      </div>
    </div>
  );
}

/**
 * The paper pocket inside a library book's cover, its card taken out (the
 * checkout card on Donate sits on the facing page). Decorative.
 */
export function BookPocket({ name, motto }: { name: string; motto: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 150"
      focusable="false"
      className="book-pocket"
    >
      <path
        d="M4 24 H86 C92 24, 96 34, 110 34 C124 34, 128 24, 134 24 H216 V146 H4 Z"
        className="book-pocket__paper"
      />
      <path d="M4 24 H216" className="book-pocket__fold" />
      <path d="M22 108 H198 M22 113 H198" className="book-pocket__rule" />
      <text x="110" y="70" textAnchor="middle" className="book-pocket__name">
        {name}
      </text>
      <text x="110" y="92" textAnchor="middle" className="book-pocket__motto">
        {motto}
      </text>
    </svg>
  );
}

/** A page torn from a ruled notebook. Decorative. */
export function NotebookPage() {
  return <div aria-hidden="true" className="notebook-page" />;
}

/** Where a child's drawing will go, once one is shared with permission. */
export function DrawingPlaceholder({ label }: { label: Todo }) {
  return (
    <div className="drawing-placeholder">
      <Txt>{label}</Txt>
    </div>
  );
}
