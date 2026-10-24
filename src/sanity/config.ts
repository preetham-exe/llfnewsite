import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { dataset, projectId } from "./env";
import { photoFromDevice } from "./PhotoFromDevice";
import { schemaTypes } from "./schemas";
import { structure } from "./structure";

/** The Studio at /studio, where Libraries, Stories and Partners are edited. */
export default defineConfig({
  name: "default",
  title: "Literate Lives Foundation",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool({ structure })],
  schema: { types: schemaTypes },
  form: {
    image: {
      // Every photo comes in through photoFromDevice, which removes its
      // location and camera details first. A direct upload would keep them.
      directUploads: false,
      assetSources: () => [photoFromDevice],
    },
  },
});
