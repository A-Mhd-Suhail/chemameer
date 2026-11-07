/* =============================================================
   CHEMAMEER · BrandMark
   Original logo: a stylised hexagonal "atom-meets-molecule" mark
   inside a rounded square, paired with the wordmark.
   No external assets — pure SVG.
   ============================================================= */

import { Link } from "react-router-dom";

interface BrandMarkProps {
  variant?: "light" | "dark";
  showWordmark?: boolean;
  size?: number;
  to?: string;
  ariaLabel?: string;
}

export function BrandMark({
  variant = "light",
  showWordmark = true,
  size = 40,
  to = "/",
  ariaLabel = "CHEMAMEER — home",
}: BrandMarkProps) {
  const fg = variant === "dark" ? "#f6f1e6" : "#0a1733";
  const accent = "#1f4cff";
  const accent2 = "#2ad4ff";

  return (
    <Link
      to={to}
      className="brandmark"
      aria-label={ariaLabel}
      style={{ display: "inline-flex", alignItems: "center", gap: "0.7em" }}
    >
      <span
        className="brandmark__icon"
        style={{ width: size, height: size, display: "inline-block" }}
      >
        <svg
          viewBox="0 0 48 48"
          role="img"
          aria-hidden="true"
          width="100%"
          height="100%"
          fill="none"
        >
          {/* Rounded vessel */}
          <rect x="1" y="1" width="46" height="46" rx="13" fill={accent} />
          <rect
            x="1"
            y="1"
            width="46"
            height="46"
            rx="13"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1"
          />

          {/* Hexagonal molecule with electron orbits */}
          <g transform="translate(24 24)">
            {/* Outer orbit */}
            <ellipse
              cx="0"
              cy="0"
              rx="15"
              ry="6.5"
              stroke={accent2}
              strokeWidth="1.4"
              opacity="0.85"
              transform="rotate(28)"
            />
            <ellipse
              cx="0"
              cy="0"
              rx="15"
              ry="6.5"
              stroke={accent2}
              strokeWidth="1.4"
              opacity="0.65"
              transform="rotate(-28)"
            />
            {/* Hexagon ring */}
            <g stroke="#f6f1e6" strokeWidth="1.6" fill="none">
              <polygon
                points="0,-8 6.93,-4 6.93,4 0,8 -6.93,4 -6.93,-4"
                opacity="0.95"
              />
            </g>
            {/* Bond vertices */}
            {[
              [0, -8],
              [6.93, -4],
              [6.93, 4],
              [0, 8],
              [-6.93, 4],
              [-6.93, -4],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="1.8" fill="#f6f1e6" />
            ))}
            {/* Centre nucleus */}
            <circle cx="0" cy="0" r="3" fill={accent2} />
          </g>
        </svg>
      </span>

      {showWordmark && (
        <span
          className="brandmark__wordmark"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "1.15rem",
            letterSpacing: "-0.01em",
            color: fg,
            lineHeight: 1,
            display: "inline-flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <span>CHEMAMEER</span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: variant === "dark" ? "rgba(246,241,230,0.55)" : "var(--muted)",
              fontWeight: 500,
            }}
          >
            CHEM ANIMATED
          </span>
        </span>
      )}
    </Link>
  );
}
