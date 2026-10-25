import { getPlates } from "@/lib/content";
import {
  sectionAlt,
  sectionCover,
  shareSize,
  shareType,
} from "@/lib/share-image";

export const alt = sectionAlt("gallery");
export const size = shareSize;
export const contentType = shareType;

/** The Gallery's cover, with its newest plate tipped in. */
export default async function Image() {
  const [newest] = await getPlates();
  return sectionCover("gallery", newest?.photo);
}
