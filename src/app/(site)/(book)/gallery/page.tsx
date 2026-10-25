import { BookPage } from "@/components/book/BookPage";
import { Plates } from "@/components/gallery/Plates";
import { gallery } from "@/content/pages";
import { getPlates } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: gallery.title,
  description: gallery.description,
  path: "/gallery",
});

export default async function GalleryPage() {
  const plates = await getPlates();

  return (
    <BookPage book="gallery" title={gallery.title} lede={gallery.lede}>
      <Plates plates={plates} copy={gallery} />
    </BookPage>
  );
}
