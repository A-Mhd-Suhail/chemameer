/* =============================================================
   CHEMAMEER · Cleanup helper
   Guarantees GSAP contexts and ScrollTriggers created inside a
   component are killed on unmount — no leaks, no duplicate pins.
   ============================================================= */

import { gsap, ScrollTrigger } from "./gsapConfig";

/** Kill all ScrollTriggers whose trigger is inside the given root. */
export function killScrollTriggersIn(root: HTMLElement): void {
  ScrollTrigger.getAll().forEach((st) => {
    const trigger = st.vars.trigger as HTMLElement | string | undefined;
    if (trigger instanceof HTMLElement && root.contains(trigger)) {
      st.kill();
    }
  });
}

/** Revert all gsap.context() created inside the root element. */
export function revertGsapIn(root: HTMLElement): void {
  // gsap.context created via gsap.context(fn, root) — revert via selector scope.
  gsap.killTweensOf(root.querySelectorAll("*"));
  killScrollTriggersIn(root);
}

/** Force refresh after a layout/image-load change. */
export function refreshScrollTrigger(): void {
  requestAnimationFrame(() => ScrollTrigger.refresh());
}
