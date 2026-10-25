import Image from "next/image";
import type { CSSProperties } from "react";

import { TransitionLink } from "@/components/transition/TransitionLink";
import { Txt } from "@/components/ui/Txt";
import type { gallery } from "@/content/pages";
import { formatDate } from "@/lib/format";
import type { Plate } from "@/lib/gallery";

import { GalleryMotion } from "./GalleryMotion";

type PlatesProps = {
  plates: Plate[];
  copy: typeof gallery;
};

/**
 * The Gallery's plates, as in a fine book: a list of plates facing the
 * chapter title, then each photograph on its own sheet of heavier paper
 * under a tissue leaf, its number and caption on the facing page (beneath
 * it on smaller screens). Each plate links to its photo, so without
 * JavaScript it still opens large; with it, GalleryMotion turns the tissue
 * leaves back and shows the plates in a viewer.
 */
export function Plates({ plates, copy }: PlatesProps) {
  if (plates.length === 0) {
    return <p className="plates-empty">{copy.empty}</p>;
  }

  return (
    <GalleryMotion plates={plates} copy={copy}>
      <nav aria-labelledby="plate-list-heading" className="plate-list">
        <h2 id="plate-list-heading" className="plate-list__heading">
          {copy.listHeading}
        </h2>
        <ol>
          {plates.map((plate) => (
            <li key={plate.anchor}>
              <a href={`#${plate.anchor}`} className="plate-list__entry">
                <span className="plate-list__numeral">{plate.numeral}</span>
                <span className="plate-list__title">
                  <Txt>{plate.caption ?? plate.from}</Txt>
                </span>
                <span aria-hidden="true" className="plate-list__leader" />
                <span className="plate-list__when">
                  <Txt>{formatDate(plate.when)}</Txt>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {plates.map((plate, index) => (
        <PlateEntry
          key={plate.anchor}
          plate={plate}
          copy={copy}
          // The first plates may be on the first screen.
          preload={index === 0}
        />
      ))}
    </GalleryMotion>
  );
}

function PlateEntry({
  plate,
  copy,
  preload,
}: {
  plate: Plate;
  copy: typeof gallery;
  preload: boolean;
}) {
  const { photo } = plate;
  const style = { "--ratio": photo.width / photo.height } as CSSProperties;

  return (
    <figure id={plate.anchor} className="plate-entry">
      <div className="plate" style={style}>
        <a
          href={photo.src}
          data-plate={plate.number - 1}
          className="plate__open"
        >
          <span className="sr-only">{copy.view} </span>
          <Image
            src={photo.src}
            width={photo.width}
            height={photo.height}
            alt={photo.alt}
            sizes="(min-width: 48rem) 36rem, 100vw"
            preload={preload}
            className="plate__image"
            {...(photo.lqip
              ? { placeholder: "blur", blurDataURL: photo.lqip }
              : {})}
          />
        </a>
        {/* The tissue leaf, printed with the plate's number. */}
        <div aria-hidden="true" className="plate__tissue">
          <span>
            {copy.plate} {plate.numeral}
          </span>
        </div>
      </div>

      <figcaption className="plate-entry__caption">
        <p className="plate-entry__numeral">
          {copy.plate} {plate.numeral}
        </p>
        {plate.caption && (
          <p className="plate-entry__text">
            <Txt>{plate.caption}</Txt>
          </p>
        )}
        <p className="plate-entry__from">
          {plate.href ? (
            <TransitionLink href={plate.href} prefetch>
              <Txt>{plate.from}</Txt>
            </TransitionLink>
          ) : (
            <Txt>{plate.from}</Txt>
          )}
        </p>
        <p className="plate-entry__when">
          <Txt>{formatDate(plate.when)}</Txt>
          {plate.place && <>, {plate.place}</>}
        </p>
      </figcaption>
    </figure>
  );
}
