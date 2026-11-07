/* =============================================================
   CHEMAMEER · SectionHeading
   Shared section header: eyebrow + title + optional lead.
   ============================================================= */

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  variant?: "light" | "dark";
  as?: "h1" | "h2" | "h3";
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  variant = "light",
  as: Tag = "h2",
}: SectionHeadingProps) {
  return (
    <div
      data-section-heading
      style={{
        textAlign: align,
        maxWidth: align === "center" ? "62ch" : "none",
        marginInline: align === "center" ? "auto" : "0",
      }}
    >
      {eyebrow && <p className="eyebrow" style={{ marginBottom: "var(--space-4)" }}>{eyebrow}</p>}
      <Tag
        className="display"
        style={{
          fontSize: "var(--step-6)",
          color: variant === "dark" ? "var(--ivory)" : "var(--ink-navy)",
        }}
      >
        {title}
      </Tag>
      {lead && (
        <p
          className="lead"
          style={{
            marginTop: "var(--space-4)",
            color: variant === "dark" ? "rgba(246,241,230,0.7)" : "var(--muted)",
          }}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
