/* =============================================================
   CHEMAMEER · GSAP setup
   Single registration point. Reduced-motion aware.
   ============================================================= */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Sensible defaults that feel cinematic without being sluggish.
gsap.defaults({
  ease: "power3.out",
  duration: 0.8,
});

ScrollTrigger.config({
  // Ignore mobile resize jitter from URL bar show/hide.
  ignoreMobileResize: true,
});

/** True when the visitor has requested reduced motion. */
export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

export { gsap, ScrollTrigger };
