import { defineCliConfig } from "sanity/cli";

import { dataset, projectId } from "./src/sanity/env";

/**
 * For Sanity's command line (pnpm sanity ...), which reads the project ID
 * from .env.local. The site uses it once, to seed the content
 * (pnpm sanity:seed); the Studio itself is part of the site, at /studio.
 */
export default defineCliConfig({ api: { projectId, dataset } });
