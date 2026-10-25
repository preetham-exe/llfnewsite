import { paragraphs, todo } from "./helpers";
import type { Story } from "./types";

/*
 * The seed: the stories as Sanity started with them (scripts/sanity/seed.ts
 * imports these), and what the site shows until a Sanity project is set up.
 * Pages read them through src/lib/content.ts. The placeholder stays until the
 * first real story replaces it.
 */
export const stories: Story[] = [
  {
    _id: "first-story",
    _type: "story",
    slug: "first-story",
    title: todo("Title of the first story"),
    dek: todo("One sentence that says what the story is about"),
    author: todo("Author's name, or first name only for a child"),
    publishedOn: todo("Publication date"),
    library: null,
    cover: null,
    body: paragraphs(
      "first-story-body",
      todo(
        "The first story. Writing from the team, or from a child at one of our libraries, shared with permission.",
      ),
    ),
  },
];
