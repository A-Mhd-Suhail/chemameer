/* =============================================================
   CHEMAMEER · Scene 2 — From Complexity to Clarity (pinned)
   Headline: "Understand What You Once Found Difficult."
   Sequence:
     - Complex molecule visible
     - Bonds break — atoms pull outward (using dx/dy data attributes)
     - Labels appear on each atom
     - Atoms travel inward to a simplified arrangement
     - Simplified bonds form
     - Headline reveals simplified message
     - Explanations revealed
   ============================================================= */

import { useLayoutEffect, useRef } from "react";
import { buildCourseTimeline } from "../../animations/courseTimeline";
import { prefersReducedMotion } from "../../animations/gsapConfig";
import "./scene.css";

const HEADLINE_WORDS = ["Understand", "What", "You", "Once", "Found", "Difficult."];

const EXPLAIN = [
  "Complex molecules break into the atoms they are made of.",
  "Each atom is labelled — its role becomes visible.",
  "Atoms reassemble into a simpler, recognisable pattern.",
  "The concept becomes legible — and learnable.",
];

// Complex molecule — a stylised benzene ring with substituents.
// dx/dy is the outward offset during the "break apart" phase.
const ATOMS = [
  { id: 0, x: 0,    y: -70,  r: 16, label: "C",  c: "#1f4cff", dx: -30,  dy: -70 },
  { id: 1, x: 60,   y: -35,  r: 14, label: "C",  c: "#1f4cff", dx:  90,  dy: -50 },
  { id: 2, x: 60,   y:  35,  r: 14, label: "C",  c: "#1f4cff", dx:  90,  dy:  50 },
  { id: 3, x: 0,    y:  70,  r: 16, label: "C",  c: "#1f4cff", dx: -30,  dy:  80 },
  { id: 4, x: -60,  y:  35,  r: 14, label: "C",  c: "#1f4cff", dx: -100, dy:  50 },
  { id: 5, x: -60,  y: -35,  r: 14, label: "C",  c: "#1f4cff", dx: -100, dy: -50 },
  { id: 6, x: 110,  y: -90,  r: 12, label: "OH", c: "#ff6b3d", dx:  150, dy: -130 },
  { id: 7, x: 110,  y:  90,  r: 12, label: "COOH", c: "#2ad4ff", dx: 160, dy: 130 },
];

const BONDS: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 6], [2, 7],
];

// Simplified arrangement: three labelled atoms in a row.
const SIMPLE = [
  { id: 0, x: -110, y: 0, r: 22, label: "OH",  c: "#ff6b3d" },
  { id: 1, x:    0, y: 0, r: 26, label: "C",   c: "#1f4cff" },
  { id: 2, x:  110, y: 0, r: 22, label: "COOH", c: "#2ad4ff" },
];

export function ComplexityToClarityScene() {
  const root = useRef<HTMLElement | null>(null);

  // useLayoutEffect — NOT useEffect. The pinned ScrollTrigger wraps this
  // section in a pin-spacer (moving the DOM node). The revert() cleanup must
  // run synchronously during React's deletion phase (before the DOM node is
  // removed), otherwise React's removeChild() throws "not a child of this
  // node" and the whole app crashes on SPA navigation.
  useLayoutEffect(() => {
    if (!root.current || prefersReducedMotion()) return;
    // buildCourseTimeline returns a revert() that kills the timeline AND its
    // pinned ScrollTrigger — prevents duplicate pin-spacers after unmount.
    const revert = buildCourseTimeline(root.current);
    return () => {
      revert?.();
    };
  }, []);

  return (
    <section ref={root} id="experience-concept" className="scene scene--2 section--cream" aria-labelledby="s2-title">
      <div className="container scene__inner scene__inner--col">
        <div className="scene__head scene__head--center">
          <p className="eyebrow">Scene 02 · From Complexity to Clarity</p>
          <h2 id="s2-title" className="display scene__title" data-scene2-headline>
            {HEADLINE_WORDS.map((w, i) => (
              <span key={i} className="scene__word-wrap">
                <span className="scene__word">{w}</span>
              </span>
            ))}
          </h2>
          <p
            className="display scene__title-2"
            data-scene2-headline-2
            style={{ opacity: 0, transform: "translateY(8px)" }}
          >
            And what was complex becomes <em style={{ fontStyle: "italic" }}>obvious</em>.
          </p>
        </div>

        <div className="scene__stage scene__stage--s2" data-complex-molecule>
          {/* Complex molecule */}
          <svg viewBox="-200 -200 400 400" className="scene__svg scene__svg--s2" role="presentation">
            <defs>
              <linearGradient id="s2-bond-grad" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#0a1733" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#1f4cff" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            {/* Complex bonds */}
            <g stroke="url(#s2-bond-grad)" strokeWidth="2.2" data-bonds>
              {BONDS.map(([a, b], i) => (
                <line
                  key={`bond-${i}`}
                  data-bond
                  x1={ATOMS[a].x}
                  y1={ATOMS[a].y}
                  x2={ATOMS[b].x}
                  y2={ATOMS[b].y}
                />
              ))}
            </g>

            {/* Simplified bonds (start hidden, animate in) */}
            <g stroke="#1f4cff" strokeWidth="3" opacity="0.9">
              <line data-simple-bond x1={SIMPLE[0].x} y1="0" x2={SIMPLE[1].x} y2="0" />
              <line data-simple-bond x1={SIMPLE[1].x} y1="0" x2={SIMPLE[2].x} y2="0" />
            </g>

            {/* Complex atoms */}
            <g>
              {ATOMS.map((a) => (
                <g
                  key={`atom-${a.id}`}
                  data-atom
                  data-dx={a.dx}
                  data-dy={a.dy}
                  transform={`translate(${a.x} ${a.y})`}
                >
                  <circle r={a.r} fill={a.c} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                  <text
                    textAnchor="middle"
                    dy="4"
                    fontFamily="var(--font-body)"
                    fontSize="10"
                    fontWeight="700"
                    fill="#ffffff"
                  >
                    {a.label}
                  </text>
                  <text
                    data-label
                    y={a.r + 14}
                    textAnchor="middle"
                    fontFamily="var(--font-body)"
                    fontSize="9"
                    fill="#0a1733"
                    opacity="0"
                  >
                    {a.label}
                  </text>
                </g>
              ))}
            </g>

            {/* Simplified atoms (hidden until the reassembly phase) */}
            <g>
              {SIMPLE.map((a) => (
                <g
                  key={`simple-${a.id}`}
                  data-atom
                  data-simple-atom
                  data-dx={0}
                  data-dy={0}
                  transform={`translate(${a.x} ${a.y})`}
                >
                  <circle r={a.r} fill={a.c} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                  <text
                    textAnchor="middle"
                    dy="4"
                    fontFamily="var(--font-body)"
                    fontSize="11"
                    fontWeight="700"
                    fill="#ffffff"
                  >
                    {a.label}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        <ol className="scene__explain scene__explain--s2" data-scene2-explain>
          {EXPLAIN.map((line, i) => (
            <li key={i}>
              <span className="scene__explain-tag">{String(i + 1).padStart(2, "0")}</span>
              <p>{line}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
