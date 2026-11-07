/* =============================================================
   CHEMAMEER · ReducedMotionNotice
   Inline status region for screen-reader feedback.
   ============================================================= */

interface StatusProps {
  role?: "status" | "alert";
  children: React.ReactNode;
}

export function Status({ role = "status", children }: StatusProps) {
  return (
    <div role={role} aria-live="polite" className="sr-only">
      {children}
    </div>
  );
}
