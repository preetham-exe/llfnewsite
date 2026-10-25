import { defineField, defineType } from "sanity";

/** A month (2026-04) or a full date (2026-04-12). */
const MONTH_OR_DATE = /^\d{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?$/;

/**
 * Photos for the Gallery that belong to no library: a book drive, a day with
 * volunteers, an event. Photos added to a library appear in the Gallery by
 * themselves; these join them, newest first.
 */
export const moment = defineType({
  name: "moment",
  title: "Gallery moment",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "What it was",
      type: "string",
      description: "For example: Book collection drive.",
      validation: (rule) =>
        rule
          .required()
          .warning(
            "Until it has a name, the Gallery shows a TODO in its place.",
          ),
    }),
    defineField({
      name: "date",
      title: "When",
      type: "string",
      description:
        "Year and month, like 2026-03, or the full date, like 2026-03-14. Sets its place in the Gallery.",
      validation: (rule) =>
        rule.custom(
          (value) =>
            !value ||
            MONTH_OR_DATE.test(String(value)) ||
            "Write it as year and month, like 2026-03, or the full date, like 2026-03-14.",
        ),
    }),
    defineField({
      name: "place",
      title: "Where",
      type: "string",
      description: "Optional. For example: Hyderabad.",
    }),
    defineField({
      name: "photos",
      title: "Photos",
      type: "array",
      of: [{ type: "photo" }],
      options: { layout: "grid" },
      description:
        "Each becomes a plate in the Gallery, in this order. Children's faces only with consent: prefer photos where they cannot be recognised.",
      validation: (rule) => rule.min(1).error("Add at least one photo."),
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", date: "date", media: "photos.0" },
    prepare: ({ title, date, media }) => ({
      title: title || "Untitled moment",
      subtitle: date,
      media,
    }),
  },
});
