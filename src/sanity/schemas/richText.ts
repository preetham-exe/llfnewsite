import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Text for a launch day or a story: paragraphs, two levels of heading,
 * quotes, italics and links. No bold: the site's typeface has one weight,
 * and emphasis is italic.
 */
export const richText = defineType({
  name: "richText",
  title: "Text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Paragraph", value: "normal" },
        { title: "Heading", value: "h2" },
        { title: "Small heading", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [],
      marks: {
        decorators: [{ title: "Italic", value: "em" }],
        annotations: [
          {
            name: "link",
            title: "Link",
            type: "object",
            fields: [
              defineField({
                name: "href",
                title: "Address",
                type: "url",
                validation: (rule) =>
                  rule.required().uri({ scheme: ["http", "https", "mailto"] }),
              }),
            ],
          },
        ],
      },
    }),
  ],
});
