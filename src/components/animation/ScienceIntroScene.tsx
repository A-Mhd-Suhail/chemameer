/* =============================================================
   CHEMAMEER · Scene 1 — Science Introduction (pinned)
   Headline: "Science Is Everywhere."
   Sequence:
     - Headline splits into individual words
     - Scientific illustrations fade in
     - Molecular structures assemble
     - Bonds connect
     - Camera-like composition moves forward
     - Explanations reveal in sequence
   ============================================================= */

import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../../animations/gsapConfig";
import "./scene.css";

const HEADLINE_WORDS = ["Science", "Is", "Everywhere."];

const EXPLAINER = [
  { tag: "01", title: "Observe", body: "Every reaction begins with what we can see and measure." },
  { tag: "02", title: "Question", body: "Curiosity turns an observation into a problem worth solving." },
  { tag: "03", title: "Model", body: "We build mental pictures — atoms, bonds, fields — to predict what comes next." },
];

export function ScienceIntroScene() {
  const root = useRef<HTMLElement | null>(null);

  // useLayoutEffect — NOT useEffect. The pinned ScrollTrigger wraps this
  // section in a pin-spacer (moving the DOM node). The revert() cleanup must
  // run synchronously during React's deletion phase (before the DOM node is
  // removed), otherwise React's removeChild() throws "not a child of this
  // node" and the whole app crashes on SPA navigation.
  useLayoutEffect(() => {
    if (!root.current || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=1800",
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // 1) Headline split words.
      tl.from("[data-s1-word]", {
        yPercent: 130,
        opacity: 0,
        stagger: 0.08,
        duration: 0.5,
      })
        // 2) Background illustrations appear.
        .from("[data-s1-blob]", {
          opacity: 0,
          scale: 0.6,
          stagger: 0.05,
          duration: 0.4,
        }, 0)
        // 3) Molecule assembles — atoms from random positions.
        .from("[data-s1-atom]", {
          x: (_i: number, el: HTMLElement) => Number(el.dataset.fromX) || 0,
          y: (_i: number, el: HTMLElement) => Number(el.dataset.fromY) || 0,
          opacity: 0,
          stagger: 0.04,
          duration: 0.5,
        }, 0.2)
        // 4) Bonds connect (fade in instead of drawSVG — that's a paid plugin).
        .from("[data-s1-bond]", {
          opacity: 0,
          stagger: 0.04,
          duration: 0.4,
        }, 0.55)
        // 5) Camera pushes forward — scale + parallax.
        .to("[data-s1-stage]", {
          scale: 1.08,
          duration: 0.6,
          ease: "power2.inOut",
        }, 0.7)
        .to("[data-s1-blob-1]", { yPercent: -8, xPercent: 4, duration: 0.6 }, 0.7)
        .to("[data-s1-blob-2]", { yPercent: 6, xPercent: -4, duration: 0.6 }, 0.7)
        // 6) Explanations reveal in sequence.
        .from("[data-s1-explain]", {
          opacity: 0,
          y: 24,
          stagger: 0.18,
          duration: 0.4,
        }, 1.1);

      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="experience-visual" className="scene scene--1 section--dark" aria-labelledby="s1-title">
      <div className="scene__bg" aria-hidden>
        <div className="scene__blob scene__blob--1" data-s1-blob data-s1-blob-1 />
        <div className="scene__blob scene__blob--2" data-s1-blob data-s1-blob-2 />
      </div>

      <div className="container scene__inner" data-s1-stage>
        <div className="scene__head">
          <p className="eyebrow">Scene 01 · Science Introduction</p>
          <h2 id="s1-title" className="display scene__title">
            {HEADLINE_WORDS.map((w, i) => (
              <span key={i} className="scene__word-wrap">
                <span className="scene__word" data-s1-word>{w}</span>
              </span>
            ))}
          </h2>
        </div>

        <div className="scene__stage">
          {/* Assembling molecule */}
          <svg viewBox="0 0 600 360" className="scene__svg" role="presentation">
            <defs>
              <linearGradient id="s1-bond-grad" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#2ad4ff" />
                <stop offset="100%" stopColor="#1f4cff" />
              </linearGradient>
            </defs>
            <g transform="translate(300 180)">
              {/* Bonds */}
              <g stroke="url(#s1-bond-grad)" strokeWidth="2.4" fill="none" opacity="0.85">
                <line data-s1-bond x1="0" y1="0" x2="-90" y2="-60" />
                <line data-s1-bond x1="0" y1="0" x2="90" y2="-60" />
                <line data-s1-bond x1="0" y1="0" x2="-110" y2="60" />
                <line data-s1-bond x1="0" y1="0" x2="110" y2="60" />
                <line data-s1-bond x1="-90" y1="-60" x2="90" y2="-60" />
              </g>

              {/* Atoms */}
              {[
                { x: 0, y: 0, r: 22, c: "#1f4cff", label: "C", fromX: 0, fromY: -120 },
                { x: -90, y: -60, r: 16, c: "#2ad4ff", label: "H", fromX: -180, fromY: -120 },
                { x: 90, y: -60, r: 16, c: "#2ad4ff", label: "H", fromX: 180, fromY: -120 },
                { x: -110, y: 60, r: 18, c: "#ff6b3d", label: "O", fromX: -200, fromY: 140 },
                { x: 110, y: 60, r: 18, c: "#ff6b3d", label: "O", fromX: 200, fromY: 140 },
              ].map((a, i) => (
                <g
                  key={i}
                  data-s1-atom
                  data-from-x={a.fromX}
                  data-from-y={a.fromY}
                  transform={`translate(${a.x} ${a.y})`}
                >
                  <circle r={a.r} fill={a.c} stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
                  <text
                    textAnchor="middle"
                    dy="4"
                    fontFamily="var(--font-body)"
                    fontSize="11"
                    fontWeight="700"
                    fill="#0a1733"
                  >
                    {a.label}
                  </text>
                </g>
              ))}
            </g>
          </svg>

          {/* Floating formula chips */}
          <div className="scene__chips" aria-hidden>
            <span className="chip" data-s1-blob>H₂O</span>
            <span className="chip" data-s1-blob>CO₂</span>
            <span className="chip" data-s1-blob>NaCl</span>
            <span className="chip" data-s1-blob>C₆H₁₂O₆</span>
            <span className="chip" data-s1-blob>NH₃</span>
          </div>
        </div>

        <ol className="scene__explain">
          {EXPLAINER.map((e) => (
            <li key={e.tag} data-s1-explain>
              <span className="scene__explain-tag">{e.tag}</span>
              <h3 className="display scene__explain-title">{e.title}</h3>
              <p className="scene__explain-body">{e.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
