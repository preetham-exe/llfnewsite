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
