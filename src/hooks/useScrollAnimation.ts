/* =============================================================
   CHEMAMEER · useScrollAnimation hook
   A safe wrapper around gsap.context for component-scoped timelines.
   - Reverts on unmount (no leaks).
   - Rebuilds on root element change.
   - Skips entirely when prefers-reduced-motion is on.
   ============================================================= */

import { useEffect, useRef, type DependencyList } from "react";
import { gsap, prefersReducedMotion } from "../animations/gsapConfig";

type Builder = (root: HTMLElement) => void;

export function useScrollAnimation(
  builder: Builder,
  deps: DependencyList = [],
): React.RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => builder(root!), root);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
