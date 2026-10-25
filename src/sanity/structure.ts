import type { StructureResolver } from "sanity/structure";

/** The Studio's sidebar: each kind of content, libraries in order. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Libraries")
        .schemaType("library")
        .child(
          S.documentTypeList("library")
            .title("Libraries")
            .defaultOrdering([{ field: "number", direction: "asc" }]),
        ),
      S.listItem()
        .title("Stories")
        .schemaType("story")
        .child(
          S.documentTypeList("story")
            .title("Stories")
            .defaultOrdering([{ field: "publishedOn", direction: "desc" }]),
        ),
      S.listItem()
        .title("Gallery moments")
        .schemaType("moment")
        .child(
          S.documentTypeList("moment")
            .title("Gallery moments")
            .defaultOrdering([{ field: "date", direction: "desc" }]),
        ),
      S.listItem()
        .title("Partners")
        .schemaType("partner")
        .child(
          S.documentTypeList("partner")
            .title("Partners")
            .defaultOrdering([{ field: "name", direction: "asc" }]),
        ),
    ]);
