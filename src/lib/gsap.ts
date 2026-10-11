/**
 * GSAP setup shared by every client component that animates.
 *
 * Each plugin is registered exactly once, in the module that owns it, so a
 * page only downloads the plugins it uses:
 *   - here: ScrollTrigger, CustomEase and useGSAP (used everywhere)
 *   - gsap-flip.ts: Flip (the book transition)
 *   - gsap-split.ts: SplitText (headline reveals)
 *   - gsap-draw.ts: DrawSVGPlugin (pencil marks)
 *
 * Import only from client components.
 */
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { easeCurves } from "@/motion/tokens";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase);
  for (const [name, path] of Object.entries(easeCurves)) {
    CustomEase.create(name, path);
  }
}

export { CustomEase, gsap, ScrollTrigger, useGSAP };
