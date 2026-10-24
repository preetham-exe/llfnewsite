import Image from "next/image";

import { isTodo } from "@/content/helpers";
import type { Picture } from "@/content/types";

import { Txt } from "./Txt";

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
 * photo arrives. Both reserve their space, so nothing shifts as they load,
 * and a photo from Sanity shows a blurred copy of itself until it does.
 * A portrait photo is kept narrower (26rem at most, and its `sizes` say
 * so), so it never fills more than a screen.
 */
export function PictureFrame({
  picture,
  sizes,
  preload = false,
  className = "",
}: PictureFrameProps) {
  if (picture._type === "photo") {
    const portrait = picture.height > picture.width;
    return (
      <figure className={`${portrait ? "max-w-[26rem]" : ""} ${className}`}>
        <Image
          src={picture.src}
          width={picture.width}
          height={picture.height}
          alt={picture.alt}
          sizes={portrait ? "(min-width: 28rem) 26rem, 100vw" : sizes}
          preload={preload}
          {...(picture.lqip
            ? { placeholder: "blur", blurDataURL: picture.lqip }
            : {})}
          className="h-auto w-full"
        />
        {picture.caption && (
          <figcaption className="mt-3 font-sans text-caption text-ink-soft">
            <Txt>{picture.caption}</Txt>
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
