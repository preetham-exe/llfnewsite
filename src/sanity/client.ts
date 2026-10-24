import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId, sanityConfigured } from "./env";

/** Where the tests' stand-in for Sanity listens (e2e/mock-sanity.mjs). */
const apiHost = process.env.SANITY_API_HOST;

/**
 * Reads published content on the server, straight from Sanity's Content Lake
 * rather than its CDN, so a page rebuilt after the publish webhook gets what
 * was just published. The site never queries Sanity from the browser. Null
 * until a project ID is set.
 */
export const client = sanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      perspective: "published",
      ...(apiHost ? { apiHost, useProjectHostname: false } : {}),
    })
  : null;
