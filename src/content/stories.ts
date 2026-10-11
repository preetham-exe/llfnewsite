import { paragraphs, todo } from "./helpers";
import type { Story } from "./types";

/*
 * Stories. Moves to Sanity in Phase 8.
 * With Cache Components, /stories/[slug] needs at least one entry to build,
 * so this placeholder stays until the first real story replaces it.
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
    cover: {
      _type: "photoPlaceholder",
      aspectRatio: 3 / 2,
      label: "Photo or drawing for the first story",
      alt: todo("Describe the image for the first story"),
    },
    body: paragraphs(
      "first-story-body",
      todo(
        "The first story. Writing from the team, or from a child at one of our libraries, shared with permission.",
      ),
    ),
  },
];

export function getStory(slug: string): Story | undefined {
  return stories.find((story) => story.slug === slug);
}
