import Image from "next/image";

import { isTodo } from "@/content/helpers";
import type { Picture } from "@/content/types";

type PictureFrameProps = {
  picture: Picture;
  /** The `sizes` attribute for responsive images. */
  sizes: string;
  /** Preload: only for the main image above the fold. */
  preload?: boolean;
  className?: string;
};

/**
 * A photo, or a labelled placeholder with the same proportions until the real
 * photo arrives. Both reserve their space, so nothing shifts as they load.
 */
export function PictureFrame({
  picture,
  sizes,
  preload = false,
  className = "",
}: PictureFrameProps) {
  if (picture._type === "photo") {
    return (
      <figure className={className}>
        <Image
          src={picture.src}
          width={picture.width}
          height={picture.height}
          alt={picture.alt}
          sizes={sizes}
          preload={preload}
          className="h-auto w-full"
        />
        {picture.caption && (
          <figcaption className="mt-3 font-sans text-caption text-ink-soft">
            {picture.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className={className}>
      <div
        role="img"
        aria-label={isTodo(picture.alt) ? picture.label : picture.alt}
        style={{ aspectRatio: picture.aspectRatio }}
        className="flex w-full items-center justify-center border border-dashed border-paper-edge bg-paper-shade p-6 text-center"
      >
        <span className="font-sans text-caption text-ink-soft">
          {picture.label}
          <span className="mt-1 block text-stamp">Placeholder</span>
        </span>
      </div>
    </figure>
  );
}
