import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components with Partial Prefetching is the Next.js 16.4 model. The
  // root layout also sets `ensureStatic = "navigation"`, so the build fails if
  // any page stops being fully static.
  cacheComponents: true,
  partialPrefetching: true,
  typedRoutes: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
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
