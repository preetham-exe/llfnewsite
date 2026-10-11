import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

import { gsap } from "./gsap";

if (typeof window !== "undefined") gsap.registerPlugin(DrawSVGPlugin);

export { DrawSVGPlugin, gsap };
