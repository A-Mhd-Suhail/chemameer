/* =============================================================
   CHEMAMEER · Original SVG icons
   Small, brand-aligned icon components for use in cards / hero.
   ============================================================= */

import type { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

const base = (size = 24): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export function AtomIcon({ size = 24, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)" />
    </svg>
  );
}

export function BeakerIcon({ size = 24, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M9 3h6" />
      <path d="M10 3v6L5.5 18a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 9V3" />
      <path d="M8 14h8" />
    </svg>
  );
}

export function DnaIcon({ size = 24, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M7 3c0 4 10 6 10 9s-10 5-10 9" />
      <path d="M17 3c0 4-10 6-10 9s10 5 10 9" />
      <path d="M8.5 6h7M9 9h6M9 15h6M8.5 18h7" />
    </svg>
  );
}

export function BookIcon({ size = 24, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H5.5A1.5 1.5 0 0 0 4 21.5z" />
      <path d="M4 19.5A1.5 1.5 0 0 1 5.5 18H20" />
      <path d="M9 7h7M9 11h7" />
    </svg>
  );
}

export function CompassIcon({ size = 24, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5 13 13l-4.5 2.5L11 11z" fill="currentColor" stroke="none" opacity="0.85" />
    </svg>
  );
}

export function SparkIcon({ size = 24, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
      <circle cx="12" cy="12" r="2.2" />
    </svg>
  );
}

export function MoleculeIcon({ size = 48, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden {...rest}>
      <g stroke="currentColor" strokeWidth="1.5" opacity="0.9">
        <line x1="14" y1="14" x2="24" y2="24" />
        <line x1="34" y1="14" x2="24" y2="24" />
        <line x1="24" y1="36" x2="24" y2="24" />
        <line x1="14" y1="14" x2="34" y2="14" opacity="0.5" />
      </g>
      <circle cx="14" cy="14" r="4" fill="var(--cobalt)" />
      <circle cx="34" cy="14" r="4" fill="var(--cyan)" />
      <circle cx="24" cy="24" r="5" fill="var(--accent)" />
      <circle cx="24" cy="36" r="4" fill="var(--ink-navy)" />
    </svg>
  );
}
