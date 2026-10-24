import { defineField, defineType } from "sanity";

/** A piece of writing in Stories. Its page is /stories/<web address>. */
export const story = defineType({
  name: "story",
  title: "Story",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .warning("Until it has a title, the site shows a TODO in its place."),
    }),
    defineField({
      name: "slug",
      title: "Web address",
      type: "slug",
      description:
        "The end of its page's address, after /stories/. Press Generate to make it from the title.",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "dek",
      title: "In one sentence",
      type: "text",
      rows: 2,
      description: "What the story is about, shown under its title.",
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      description: "A child's first name only, shared with permission.",
    }),
    defineField({ name: "publishedOn", title: "Published", type: "date" }),
    defineField({
      name: "library",
      title: "Library",
      type: "reference",
      to: [{ type: "library" }],
      description: "If it is about one of the libraries.",
    }),
    defineField({ name: "cover", title: "Photo or drawing", type: "photo" }),
    defineField({ name: "body", title: "Story", type: "richText" }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "publishedDesc",
      by: [{ field: "publishedOn", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", author: "author", media: "cover" },
    prepare: ({ title, author, media }) => ({
      title: title || "Untitled story",
      subtitle: author,
      media,
    }),
  },
});
