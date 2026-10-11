import { SplitText } from "gsap/SplitText";

import { gsap } from "./gsap";

if (typeof window !== "undefined") gsap.registerPlugin(SplitText);

export { gsap, SplitText };
