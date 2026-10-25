/**
 * Sanity's settings, from the environment (see .env.example). With a project
 * ID, Libraries, Stories and Partners come from Sanity. Without one the site
 * shows the seed content in src/content, and the Studio says it is not
 * connected. The tests use a stand-in for Sanity (e2e/mock-sanity.mjs).
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

/** The API version the queries are written against, as Sanity asks. */
export const apiVersion = "2026-10-01";

export const sanityConfigured = projectId.length > 0;
