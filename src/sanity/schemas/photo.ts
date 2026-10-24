import { defineField, defineType } from "sanity";

/**
 * A photo, with what it shows for people who cannot see it. The site shows
 * each photo whole, so there is no crop or hotspot to set. Photos come in
 * through PhotoFromDevice, cleaned of location and camera details, and
 * Sanity keeps only their size and a tiny blurred copy to show while they
 * load (lqip), never the original file name.
 */
export const photo = defineType({
  name: "photo",
  title: "Photo",
  type: "image",
  options: {
    accept: "image/*",
    metadata: ["lqip"],
    storeOriginalFilename: false,
  },
  fields: [
    defineField({
      name: "alt",
      title: "Description",
      type: "string",
      description:
        "What the photo shows, for people who cannot see it. For example: Children choose books from new shelves.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
      description: "Shown under the photo. Optional.",
    }),
  ],
});
