/*
 * Copies the seed content in src/content into Sanity: the five partners,
 * three libraries (with the QCity photo), the first story and the Gallery's
 * first moment (the two photos already on the site). Run it once,
 * from the repo root, after signing in to Sanity:
 *
 *     pnpm sanity login
 *     pnpm sanity:seed
 *
 * It only creates what is not there yet (by ID), so running it again never
 * overwrites anything edited in the Studio. With --dry-run it prints the
 * documents instead of writing them.
 *
 * Text fields keep their TODO notes ("TODO: City of Library #1"), so the
 * Studio shows what is still needed. Fields that cannot hold a note
 * (numbers, dates, sizes, links) are left empty, and the site marks them
 * TODO as before. Placeholder pictures are not copied.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

import { getCliClient } from "sanity/cli";

import { isTodo } from "../../src/content/helpers";
import { libraries } from "../../src/content/libraries";
import { moments } from "../../src/content/moments";
import { partners } from "../../src/content/partners";
import { stories } from "../../src/content/stories";
import type { Picture, Todo } from "../../src/content/types";
import { apiVersion, dataset, projectId } from "../../src/sanity/env";

type SeedDocument = { _id: string; _type: string } & Record<string, unknown>;

if (!projectId) {
  console.error(
    "No project ID yet: put NEXT_PUBLIC_SANITY_PROJECT_ID=<the project ID> in .env.local. It is on the project's page at sanity.io/manage.",
  );
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const client = getCliClient({ apiVersion });

/** A value only if it is known: not a TODO note. */
const known = <T>(value: T) =>
  isTodo(value) ? undefined : (value as Exclude<T, Todo>);

const slug = (current: string) => ({ _type: "slug", current });
const reference = (id: string) => ({ _type: "reference", _ref: id });

/**
 * Uploads a photo from public/ (already cleaned by prepare_photo.py). A key
 * only for one in a list of photos.
 */
async function photo(picture: Picture, key?: string) {
  if (picture._type !== "photo") return undefined;
  const file = await readFile(path.join("public", picture.src));
  const asset = dryRun
    ? { _id: `(upload of ${picture.src})` }
    : await client.assets.upload("image", file, {
        filename: "photo.jpg",
        contentType: "image/jpeg",
        extract: ["lqip"],
      });
  return {
    _type: "photo",
    ...(key ? { _key: key } : {}),
    asset: reference(asset._id),
    alt: picture.alt,
    caption: picture.caption,
  };
}

async function main() {
  const partnerIds = new Map(partners.map((p) => [p.slug, p._id]));
  const libraryIds = new Map(libraries.map((l) => [l.slug, l._id]));

  const documents: SeedDocument[] = [
    ...partners.map((partner) => ({
      _id: partner._id,
      _type: "partner",
      name: partner.name,
      slug: slug(partner.slug),
      about: partner.about,
      produced: partner.produced,
      website: known(partner.website) ?? undefined,
    })),
    ...(await Promise.all(
      libraries.map(async (library) => {
        const photos = await Promise.all(
          library.photos.map((picture, index) =>
            photo(picture, `photo-${index}`),
          ),
        );
        const partner = known(library.partner);
        return {
          _id: library._id,
          _type: "library",
          number: library.number,
          name: library.name,
          slug: slug(library.slug),
          city: library.city,
          partner: partner
            ? reference(partnerIds.get(partner.slug) ?? partner.slug)
            : undefined,
          openedOn: known(library.openedOn),
          booksPlaced: known(library.booksPlaced),
          childrenServed: known(library.childrenServed),
          size: known(library.size),
          summary: library.summary,
          photos: photos.some(Boolean)
            ? photos.filter((item) => item !== undefined)
            : undefined,
          launchDay: library.launchDay,
        };
      }),
    )),
    ...(await Promise.all(
      stories.map(async (story) => ({
        _id: story._id,
        _type: "story",
        title: story.title,
        slug: slug(story.slug),
        dek: story.dek,
        author: story.author,
        publishedOn: known(story.publishedOn),
        library: story.library
          ? reference(libraryIds.get(story.library.slug) ?? story.library.slug)
          : undefined,
        cover: story.cover ? await photo(story.cover) : undefined,
        body: story.body,
      })),
    )),
    ...(await Promise.all(
      moments.map(async (moment) => ({
        _id: moment._id,
        _type: "moment",
        title: moment.title,
        date: known(moment.date),
        place: moment.place ?? undefined,
        photos: (
          await Promise.all(
            moment.photos.map((picture, index) =>
              photo(picture, `photo-${index}`),
            ),
          )
        ).filter((item) => item !== undefined),
      })),
    )),
  ];

  if (dryRun) {
    console.log(JSON.stringify(documents, null, 2));
    return;
  }

  const transaction = client.transaction();
  for (const document of documents) transaction.createIfNotExists(document);
  await transaction.commit();
  console.log(
    `Seeded ${projectId}/${dataset}: ${documents.length} documents. Any that were already there were left as they were.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
