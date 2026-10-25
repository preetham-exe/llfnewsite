import { cacheLife, cacheTag } from "next/cache";

import { libraries } from "@/content/libraries";
import { moments } from "@/content/moments";
import { partners } from "@/content/partners";
import { stories } from "@/content/stories";
import { client } from "@/sanity/client";
import {
  type Content,
  mapContent,
  type RawContent,
  sortContent,
} from "@/sanity/map";
import { contentQuery } from "@/sanity/queries";

import { galleryPlates } from "./gallery";

/**
 * The cache tag on everything read from Sanity. Publishing in the Studio
 * calls the webhook at /api/revalidate, which clears it, so each page that
 * shows the content is rebuilt on its next visit.
 */
export const CONTENT_TAG = "sanity";

/**
 * Libraries, stories, partners and gallery moments: from Sanity once a
 * project ID is set, from the seed in src/content until then. A project with
 * nothing in it yet (before `pnpm sanity:seed`) also shows the seed, so
 * setting the project ID first never empties the site. One cached read serves
 * every page. It also refreshes itself daily, in case a webhook is ever
 * missed.
 */
async function content(): Promise<Content> {
  "use cache";
  cacheLife("days");
  cacheTag(CONTENT_TAG);
  const seed = () => sortContent({ libraries, stories, partners, moments });
  if (!client) return seed();
  const raw = await client.fetch<RawContent>(contentQuery);
  const empty = [
    raw.libraries,
    raw.stories,
    raw.partners,
    raw.moments ?? [],
  ].every((documents) => documents.length === 0);
  return empty ? seed() : mapContent(raw);
}

export async function getLibraries() {
  return (await content()).libraries;
}

export async function getLibrary(slug: string) {
  return (await content()).libraries.find((library) => library.slug === slug);
}

export async function getStories() {
  return (await content()).stories;
}

export async function getStory(slug: string) {
  return (await content()).stories.find((story) => story.slug === slug);
}

export async function getPartners() {
  return (await content()).partners;
}

/** The Gallery's plates: every library's photos and every moment's. */
export async function getPlates() {
  return galleryPlates(await content());
}
