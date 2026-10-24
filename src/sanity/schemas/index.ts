import { library } from "./library";
import { partner } from "./partner";
import { photo } from "./photo";
import { richText } from "./richText";
import { story } from "./story";

/** Everything the Studio edits. */
export const schemaTypes = [library, story, partner, photo, richText];
