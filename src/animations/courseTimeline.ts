/* =============================================================
   CHEMAMEER · Course transformation timeline (Scene 2 — pinned)
   "Understand What You Once Found Difficult."
   A complex molecule breaks into labelled atoms, then reassembles
   into a simpler, legible concept.
   ============================================================= */

import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsapConfig";

/**
 * Builds the pinned Scene-2 timeline inside a gsap.context() and returns a
 * revert() function that kills the timeline AND its ScrollTrigger on unmount
 * (prevents leaked pin-spacers / duplicate pins after route changes).
 * Returns null when reduced motion is requested.
 */
export function buildCourseTimeline(root: HTMLElement): (() => void) | null {
  if (prefersReducedMotion()) return null;

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: "+=1600",
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // 1) Headline split.
    tl.from("[data-scene2-headline] .scene__word", {
      yPercent: 110,
      opacity: 0,
      stagger: 0.08,
      duration: 0.4,
    })
      // 2) Complex molecule visible.
      .from("[data-complex-molecule]", { opacity: 0, scale: 0.92, duration: 0.4 }, 0)
      // 3) Bonds break — pull atoms outward.
      .to("[data-atom]", {
        x: (_i: number, el: HTMLElement) => (Number(el.dataset.dx) || 0),
        y: (_i: number, el: HTMLElement) => (Number(el.dataset.dy) || 0),
        duration: 0.5,
        stagger: 0.02,
      }, 0.4)
      // 4) Bonds fade out as they separate.
      .to("[data-bond]", { opacity: 0, duration: 0.3 }, 0.4)
      // 5) Labels appear.
      .from("[data-label]", { opacity: 0, y: 8, duration: 0.25, stagger: 0.04 }, 0.7)
      // 6) Atoms travel inward to a simplified arrangement.
      .to("[data-atom]", {
        x: 0, y: 0, duration: 0.5, stagger: 0.02, ease: "power3.inOut",
      }, 1.1)
      // 6b) Simplified atoms appear as the arrangement forms.
      .from("[data-simple-atom]", {
        opacity: 0, y: 14, duration: 0.35, stagger: 0.05,
      }, 1.25)
      // 7) Simplified bonds form.
      .from("[data-simple-bond]", { opacity: 0, scale: 0.4, duration: 0.3, stagger: 0.04 }, 1.4)
      // 8) Headline reveals simplified message.
      .to("[data-scene2-headline-2]", { opacity: 1, y: 0, duration: 0.4 }, 1.5)
      .from("[data-scene2-explain] li", { opacity: 0, y: 12, stagger: 0.08, duration: 0.4 }, 1.6);
  }, root);

  requestAnimationFrame(() => ScrollTrigger.refresh());
  return () => ctx.revert();
}
