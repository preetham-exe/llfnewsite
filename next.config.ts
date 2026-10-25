import type { NextConfig } from "next";

import { dataset, projectId } from "./src/sanity/env";

const nextConfig: NextConfig = {
  // Cache Components with Partial Prefetching is the Next.js 16.4 model. The
  // root layout also sets `ensureStatic = "navigation"`, so the build fails if
  // any page stops being fully static.
  cacheComponents: true,
  partialPrefetching: true,
  typedRoutes: true,
  poweredByHeader: false,
  // Every bot gets the prerendered page, as people do. By default Next
  // re-renders each page on the server for "HTML-limited" bots (Lighthouse,
  // Bingbot, link previews), bypassing the cache, to put streamed metadata
  // in the head; here every page is static and its metadata is already
  // there. That re-render also names the homepage "/index", so it rendered
  // the wrong nav and failed to hydrate (Next 16.4.2).
  htmlLimitedBots: /(?!)/,
  images: {
    formats: ["image/avif", "image/webp"],
    // Photos uploaded in the Studio, from this project's dataset only.
    remotePatterns: projectId
      ? [
          {
            protocol: "https",
            hostname: "cdn.sanity.io",
            pathname: `/images/${projectId}/${dataset}/**`,
          },
        ]
      : [],
  },
  experimental: {
    // A 404 for unmatched addresses that sits outside the root layout
    // (app/global-not-found.tsx), so the site's styles never reach the Studio.
    globalNotFound: true,
    // Turbopack's build cache (on by default since 16.3) served stale CSS
    // twice: Tailwind's loader does not tell it about every input, so a new
    // @import or a changed @custom-variant was missed. Vercel restores that
    // cache between deploys, so it is off: builds are slower, never stale.
    turbopackFileSystemCacheForBuild: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
