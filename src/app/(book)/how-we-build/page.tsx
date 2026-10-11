import { BookPage } from "@/components/book/BookPage";
import { Sections } from "@/components/book/Sections";
import { howWeBuild } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: howWeBuild.title,
  description: howWeBuild.description,
  path: "/how-we-build",
});

export default function HowWeBuildPage() {
  return (
    <BookPage
      book="how-we-build"
      title={howWeBuild.title}
      lede={howWeBuild.lede}
    >
      <Sections sections={howWeBuild.sections} />
    </BookPage>
  );
}
