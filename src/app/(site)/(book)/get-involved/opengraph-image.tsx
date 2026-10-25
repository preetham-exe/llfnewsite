import {
  sectionAlt,
  sectionCover,
  shareSize,
  shareType,
} from "@/lib/share-image";

export const alt = sectionAlt("get-involved");
export const size = shareSize;
export const contentType = shareType;

export default function Image() {
  return sectionCover("get-involved");
}
