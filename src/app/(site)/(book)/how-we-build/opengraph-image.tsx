import {
  sectionAlt,
  sectionCover,
  shareSize,
  shareType,
} from "@/lib/share-image";

export const alt = sectionAlt("how-we-build");
export const size = shareSize;
export const contentType = shareType;

export default function Image() {
  return sectionCover("how-we-build");
}
