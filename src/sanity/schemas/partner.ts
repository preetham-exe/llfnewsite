import { defineField, defineType } from "sanity";

/**
 * An organisation LLF builds libraries with. The libraries listed under it
 * on Partners come from each library's Partner field.
 */
export const partner = defineType({
  name: "partner",
  title: "Partner",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Web address",
      type: "slug",
      description: "Press Generate to make it from the name.",
      options: { source: "name", maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "about",
      title: "Who they are",
      type: "text",
      rows: 2,
      description: "One line.",
    }),
    defineField({
      name: "produced",
      title: "What we have made together",
      type: "text",
      rows: 2,
      description: "What the partnership has produced so far.",
    }),
    defineField({
      name: "website",
      title: "Website",
      type: "url",
      description: "Only if they are happy for it to be linked.",
    }),
  ],
  orderings: [
    {
      title: "Name",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
  ],
});
