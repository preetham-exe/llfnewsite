import Image from "next/image";

import type { Photo } from "@/content/types";

type FullBleedPhotoProps = {
  photo: Photo;
  /** Where the crop keeps its focus, as a CSS object-position. */
  focus?: string;
  className?: string;
};

/**
 * A photograph across the full width of the page. Phones get a 4:3 crop,
 * larger screens a wide one; the box keeps its shape while the image loads,
 * so nothing shifts. Lazy loaded: it is always below the fold.
 */
export function FullBleedPhoto({
  photo,
  focus = "50% 50%",
  className = "",
}: FullBleedPhotoProps) {
  return (
    <figure className={className}>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-shade md:aspect-[21/9]">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: focus }}
        />
      </div>
      {photo.caption && (
        <figcaption className="mx-auto mt-3 max-w-page px-4 font-sans text-caption text-ink-soft sm:px-6">
          {photo.caption}
        </figcaption>
      )}
    </figure>
  );
}
