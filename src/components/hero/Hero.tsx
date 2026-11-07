/* =============================================================
   CHEMAMEER · Hero
   - Headline "Where Science Comes Alive."
   - Original SVG composition: orbiting molecule + periodic-strip
   - GSAP entrance timeline (see heroTimeline.ts)
   - Static fallback when GSAP/reduced-motion disabled
   ============================================================= */

import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { playHeroTimeline } from "../../animations/heroTimeline";
import { prefersReducedMotion } from "../../animations/gsapConfig";
import "./Hero.css";

const TITLE_WORDS = ["Where", "Science", "Comes", "Alive."];

const PERIODIC = ["H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne"];

export function Hero() {
  const root = useRef<HTMLElement | null>(null);

  // useLayoutEffect + gsap.context + ctx.revert() — the canonical GSAP+React
  // pattern. revert() RESTORES the elements' inline styles on unmount, which
  // keeps the entrance animation correct under React StrictMode (dev double-
  // mount) and prevents frozen/hidden states after navigation.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = playHeroTimeline(el);
    return () => ctx?.revert();
  }, []);

  return (
    <section ref={root} className="hero section section--dark" aria-labelledby="hero-title">
      <div className="container hero__inner">
        <div className="hero__content">
          <p className="eyebrow" data-hero-eyebrow>
            CHEM ANIMATED · Premium Educational Platform
          </p>

          <h1 id="hero-title" className="display hero__title" data-hero-title>
            {TITLE_WORDS.map((w, i) => (
              <span key={i} className="word-wrap" aria-hidden={false}>
                <span className="word">{w}</span>
              </span>
            ))}
          </h1>

          <p className="lead hero__lead" data-hero-lead>
            Discover a smarter way to learn through engaging teaching, visual
            explanations, and structured academic guidance — for Classes 1–12,
            JEE &amp; NEET.
          </p>

          <div className="cluster hero__cta" data-hero-cta>
            <Link to="/courses" className="btn btn--primary btn--lg">
              Explore Programs
              <span className="btn__icon"><ArrowRight size={18} aria-hidden /></span>
            </Link>
            <Link to="/booking" className="btn btn--light btn--lg">
              <span className="btn__icon"><CalendarCheck size={18} aria-hidden /></span>
              Book a Demo Class
            </Link>
          </div>

          <ul className="hero__points" data-hero-points>
            <li><span className="hero__dot" />Concept-first teaching</li>
            <li><span className="hero__dot" />Visual explanations</li>
            <li><span className="hero__dot" />Structured preparation</li>
          </ul>
        </div>

        {/* Original SVG composition */}
        <div className="hero__visual" data-hero-visual aria-hidden>
          <HeroMolecule />
          <HeroBondRing />
        </div>
      </div>

      {/* Periodic-strip marquee */}
      <div className="hero__marquee" data-hero-marquee aria-hidden>
        <div className="marquee-track">
          {[...PERIODIC, ...PERIODIC, ...PERIODIC, ...PERIODIC].map((sym, i) => (
            <span key={i} className="hero__marquee-cell">
              <span className="hero__marquee-num">{i % PERIODIC.length + 1}</span>
              <span className="hero__marquee-sym">{sym}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="hero__scrollhint" aria-hidden>
        <span>Scroll to explore</span>
        <span className="hero__scrollline" />
      </div>
    </section>
  );
}

/* ---------- SVG composition pieces ---------- */

function HeroMolecule() {
  // Hexagonal ring of atoms + central nucleus + 2 outer orbits.
  const atoms = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return { x: Math.cos(a) * 90, y: Math.sin(a) * 90 };
  });

  return (
    <svg viewBox="0 0 360 360" className="hero__svg reveal" role="presentation">
      <defs>
        <radialGradient id="hero-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2ad4ff" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#1f4cff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#1f4cff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hero-bond" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#2ad4ff" />
          <stop offset="100%" stopColor="#1f4cff" />
        </linearGradient>
      </defs>

      {/* Aura */}
      <circle cx="180" cy="180" r="170" fill="url(#hero-glow)" />

      {/* Outer orbits */}
      <g transform="translate(180 180)">
        <ellipse rx="150" ry="58" fill="none" stroke="#2ad4ff" strokeOpacity="0.45" strokeWidth="1" transform="rotate(20)" />
        <ellipse rx="150" ry="58" fill="none" stroke="#2ad4ff" strokeOpacity="0.3" strokeWidth="1" transform="rotate(-30)" />
        <ellipse rx="150" ry="58" fill="none" stroke="#2ad4ff" strokeOpacity="0.18" strokeWidth="1" transform="rotate(80)" />
      </g>

      {/* Bonds */}
      <g transform="translate(180 180)" stroke="url(#hero-bond)" strokeWidth="2" fill="none">
        {atoms.map((p, i) => (
          <line key={`b1-${i}`} x1="0" y1="0" x2={p.x} y2={p.y} opacity="0.65" />
        ))}
        {atoms.map((p, i) => {
          const next = atoms[(i + 1) % atoms.length];
          return (
            <line key={`b2-${i}`} x1={p.x} y1={p.y} x2={next.x} y2={next.y} opacity="0.55" />
          );
        })}
      </g>

      {/* Atoms */}
      <g transform="translate(180 180)">
        {atoms.map((p, i) => (
          <g key={`a-${i}`} transform={`translate(${p.x} ${p.y})`}>
            <circle r="14" fill="#0a1733" stroke="#2ad4ff" strokeWidth="1.5" />
            <text
              textAnchor="middle"
              dy="4"
              fontFamily="var(--font-body)"
              fontSize="11"
              fontWeight="600"
              fill="#f6f1e6"
            >
              {["C", "H", "O", "N", "Na", "Cl"][i % 6]}
            </text>
          </g>
        ))}
        {/* Centre nucleus */}
        <circle r="22" fill="#1f4cff" stroke="#2ad4ff" strokeWidth="2" />
        <circle r="6" fill="#f6f1e6" />
      </g>
    </svg>
  );
}

function HeroBondRing() {
  return (
    <svg
      viewBox="0 0 200 60"
      className="hero__bondring reveal"
      aria-hidden
      style={{ marginTop: "var(--space-5)" }}
    >
      <g stroke="#2ad4ff" strokeOpacity="0.6" strokeWidth="1.4" fill="none">
        <path d="M5,30 Q30,5 55,30 T105,30 T155,30 T205,30" />
        <path d="M5,30 Q30,55 55,30 T105,30 T155,30 T205,30" />
      </g>
      <g fill="#2ad4ff">
        {[5, 55, 105, 155, 205].map((x, i) => (
          <circle key={i} cx={x} cy="30" r="4" />
        ))}
      </g>
    </svg>
  );
}
