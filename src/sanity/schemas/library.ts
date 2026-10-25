import { defineField, defineType } from "sanity";

/** A month (2026-04) or a full date (2026-04-12). */
const MONTH_OR_DATE = /^\d{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?$/;

/** Filled in, and not a note of what is still to come ("TODO: ..."). */
const known = (value: unknown): value is string =>
  typeof value === "string" && value !== "" && !value.startsWith("TODO:");

/** A library LLF has built. Its page is /libraries/<web address>. */
export const library = defineType({
  name: "library",
  title: "Library",
  type: "document",
  fields: [
    defineField({
      name: "number",
      title: "Library number",
      type: "number",
      description:
        "1 for the first library, 2 for the second, and so on, in the order they opened.",
      validation: (rule) => rule.required().integer().min(1),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description:
        "As the site should show it, for example: QCity Community Library.",
      validation: (rule) =>
        rule
          .required()
          .warning("Until it has a name, the site shows a TODO in its place."),
    }),
    defineField({
      name: "slug",
      title: "Web address",
      type: "slug",
      description:
        "The end of its page's address, after /libraries/. Press Generate to make it from the name.",
      options: { source: "name", maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "city", title: "City", type: "string" }),
    defineField({
      name: "partner",
      title: "Partner",
      type: "reference",
      to: [{ type: "partner" }],
      description: "The organisation it was built with.",
    }),
    defineField({
      name: "openedOn",
      title: "Opened",
      type: "string",
      description:
        "Year and month, like 2026-04, or the full date, like 2026-04-12.",
      validation: (rule) =>
        rule.custom(
          (value) =>
            !value ||
            MONTH_OR_DATE.test(String(value)) ||
            "Write it as year and month, like 2026-04, or the full date, like 2026-04-12.",
        ),
    }),
    defineField({
      name: "booksPlaced",
      title: "Books placed",
      type: "number",
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: "childrenServed",
      title: "Children served",
      type: "number",
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: "size",
      title: "Size",
      type: "string",
      options: {
        list: [
          { title: "Small: 150 to 200 books, 1 to 2 shelves", value: "small" },
          {
            title: "Medium: 300 to 400 books, 3 to 4 shelves",
            value: "medium",
          },
          {
            title: "Large: 600 or more books, 5 or more shelves",
            value: "large",
          },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      description:
        "One or two sentences, shown on The Libraries and at the top of its page.",
    }),
    defineField({
      name: "photos",
      title: "Photos",
      type: "array",
      of: [{ type: "photo" }],
      options: { layout: "grid" },
      description:
        "The first shows first on its page. They also appear in the Gallery. Children's faces only with the partner's consent: prefer photos where they cannot be recognised.",
    }),
    defineField({
      name: "launchDay",
      title: "Launch day",
      type: "richText",
      description: "A short account of the day it opened.",
    }),
  ],
  orderings: [
    {
      title: "Library number",
      name: "numberAsc",
      by: [{ field: "number", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      name: "name",
      number: "number",
      city: "city",
      media: "photos.0",
    },
    prepare: ({ name, number, city, media }) => {
      const label = `Library #${number ?? "?"}`;
      return {
        title: known(name) ? name : label,
        subtitle: [known(name) ? label : null, known(city) ? city : null]
          .filter(Boolean)
          .join(", "),
        media,
      };
    },
  },
});
