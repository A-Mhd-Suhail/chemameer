/* =============================================================
   CHEMAMEER · Hero timeline
   Initial entrance animation. NOT scroll-driven — this is the
   immediate "stage reveal" the user sees on first paint. The
   scroll-driven cinematic scenes live in their own components.

   IMPORTANT (React StrictMode safety):
   - Animations use fromTo() with EXPLICIT end states, never from().
     A from() tween reads its end value from the element's current
     style — if a previous (killed) run left `opacity: 0` inline,
     the new tween would animate 0 → 0 and the hero would stay
     invisible forever.
   - The caller must clean up with ctx.revert() (restores inline
     styles) instead of tl.kill() (freezes current state).
   ============================================================= */

import { gsap, prefersReducedMotion } from "./gsapConfig";

/** Build the hero entrance timeline inside a scoped gsap.context. */
export function playHeroTimeline(root: HTMLElement): gsap.Context | null {
  if (prefersReducedMotion()) return null;

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      "[data-hero-eyebrow]",
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 },
    )
      .fromTo(
        "[data-hero-title] .word",
        { yPercent: 120, opacity: 0 },
        { yPercent: 0, opacity: 1, stagger: 0.08, duration: 0.9 },
        "-=0.2",
      )
      .fromTo(
        "[data-hero-lead]",
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        "-=0.4",
      )
      .fromTo(
        "[data-hero-cta] > *",
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6 },
        "-=0.3",
      )
      .fromTo(
        "[data-hero-visual] .reveal",
        { y: 24, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, stagger: 0.12, duration: 0.9 },
        "-=0.7",
      )
      .fromTo(
        "[data-hero-marquee]",
        { opacity: 0 },
        { opacity: 1, duration: 0.8 },
        "-=0.4",
      );
  }, root);

  return ctx;
}
