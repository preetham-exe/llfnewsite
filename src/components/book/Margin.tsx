import Image from "next/image";
import type { ReactNode } from "react";

import { Txt } from "@/components/ui/Txt";
import type { Photo, Todo } from "@/content/types";

type MarginProps = {
  children: ReactNode;
  /** How far it drifts against the scroll (px): marginalia in the tokens. */
  drift: number;
  /** Narrower than the page's margin, or set in from its edge. */
  variant?: "narrow" | "inset";
};

/**
 * An object in the page's margin. Place it among a page's children just
 * before the text it belongs beside: on wide screens it sits on the left page
 * level with that text, on narrower ones between the blocks of text.
 */
export function Margin({ children, drift, variant }: MarginProps) {
  return (
    <div
      data-drift={drift}
      className={[
        "spread__left spread__margin",
        variant && `spread__margin--${variant}`,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

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

/** A pencil, lying in the margin. Decorative. */
export function Pencil() {
  return (
    <Image
      src="/marginalia/pencil.svg"
      width={240}
      height={28}
      alt=""
      aria-hidden="true"
      unoptimized
      className="pencil-object"
    />
  );
}
