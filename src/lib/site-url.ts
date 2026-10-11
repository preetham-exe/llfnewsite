/**
 * The one place the site's own address comes from.
 *
 * 1. NEXT_PUBLIC_SITE_URL, set on Vercel Production once the domain is live.
 * 2. Otherwise the Vercel production URL, so previews still point canonical
 *    links at production rather than at themselves.
 * 3. Otherwise localhost for development.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProduction) return `https://${vercelProduction}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

/** Search engines are kept out until launch. Set SITE_INDEXABLE=true then. */
export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === "true";

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}
