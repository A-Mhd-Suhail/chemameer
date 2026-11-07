/* =============================================================
   CHEMAMEER · LoadingScreen — used for Suspense fallback
   ============================================================= */

import { BrandMark } from "./BrandMark";

export function LoadingScreen() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-4)",
      }}
    >
      <span className="brand-pulse">
        <BrandMark variant="light" showWordmark={false} size={56} />
      </span>
      <p className="muted" style={{ fontSize: "var(--step--1)" }}>
        Loading…
      </p>
    </div>
  );
}
