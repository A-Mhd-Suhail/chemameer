/* =============================================================
   CHEMAMEER · Scene 3 — Learning Journey (pinned, horizontal)
   Headline: "Learn. Explore. Experience."
   Stages: Explore → Understand → Practice → Improve → Achieve
   Ends: "Your Learning Journey Starts Here."
   ============================================================= */

import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../../animations/gsapConfig";
import "./scene.css";

const STAGES = [
  {
    id: "explore",
    tag: "Stage 01",
    title: "Explore",
    body: "Browse Classes 1–12, JEE and NEET programmes. Pick a class, an exam track, or a single subject.",
    visual: "explore",
    accent: "#1f4cff",
  },
  {
    id: "understand",
    tag: "Stage 02",
    title: "Understand",
    body: "Concept-first explanations turn difficult topics into clear mental models — visually, not by rote.",
    visual: "understand",
    accent: "#2ad4ff",
  },
  {
    id: "practice",
    tag: "Stage 03",
    title: "Practice",
    body: "Work through structured problems designed to reinforce understanding and expose gaps.",
    visual: "practice",
    accent: "#ff6b3d",
  },
  {
    id: "improve",
    tag: "Stage 04",
    title: "Improve",
    body: "Targeted revision closes the gaps. Your mentor points you to what matters next.",
    visual: "improve",
    accent: "#2ad4ff",
  },
  {
    id: "achieve",
    tag: "Stage 05",
    title: "Achieve",
    body: "Confidence comes from clarity. The same concepts that looked impossible now feel obvious.",
    visual: "achieve",
    accent: "#1f4cff",
  },
];

export function LearningJourneyScene() {
  const root = useRef<HTMLElement | null>(null);

  // useLayoutEffect — NOT useEffect. The pinned ScrollTrigger wraps this
  // section in a pin-spacer (moving the DOM node). The revert() cleanup must
  // run synchronously during React's deletion phase (before the DOM node is
  // removed), otherwise React's removeChild() throws "not a child of this
  // node" and the whole app crashes on SPA navigation.
  useLayoutEffect(() => {
    if (!root.current || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const track = root.current!.querySelector<HTMLElement>("[data-stages-track]");
      if (!track) return;

      const totalWidth = () => track.scrollWidth - window.innerWidth;

      // Progress dots — activate the dot matching the scroll progress.
      const dots = Array.from(
        root.current!.querySelectorAll<HTMLElement>("[data-dot]"),
      );
      const setDot = (idx: number) => {
        dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
      };
      setDot(0);

      const tl = gsap.to(track, {
        x: () => -totalWidth(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${totalWidth() + window.innerHeight * 0.2}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(
              dots.length - 1,
              Math.max(0, Math.round(self.progress * (dots.length - 1))),
            );
            setDot(idx);
          },
        },
      });

      // Per-stage reveal of inner content.
      STAGES.forEach((_, i) => {
        gsap.from(`[data-stage="${i}"] [data-stage-reveal]`, {
          y: 30,
          opacity: 0,
          stagger: 0.08,
          duration: 0.6,
          scrollTrigger: {
            trigger: `[data-stage="${i}"]`,
            containerAnimation: tl,
            start: "left center",
            toggleActions: "play none none reverse",
          },
        });
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="experience-interactive" className="scene scene--3 section--dark" aria-labelledby="s3-title">
      <div className="scene__head scene__head--center scene__head--sticky">
        <p className="eyebrow">Scene 03 · The CHEMAMEER Experience</p>
        <h2 id="s3-title" className="display scene__title scene__title--s3">
          Learn. Explore. <span className="scene__title-accent">Experience.</span>
        </h2>
      </div>

      <div className="scene__stages-viewport">
        <div className="scene__stages-track" data-stages-track>
          {STAGES.map((s, i) => (
            <article key={s.id} className="scene__stage" data-stage={i}>
              <div className="scene__stage-inner">
                <p className="eyebrow" data-stage-reveal>{s.tag}</p>
                <h3 className="display scene__stage-title" data-stage-reveal>
                  {s.title}
                </h3>
                <p className="scene__stage-body" data-stage-reveal>{s.body}</p>
                <StageVisual variant={s.visual} accent={s.accent} />
              </div>
            </article>
          ))}

          {/* Closing panel */}
          <article className="scene__stage scene__stage--final" data-stage={STAGES.length}>
            <div className="scene__stage-inner scene__stage-inner--final">
              <p className="eyebrow" data-stage-reveal>Final</p>
              <h3 className="display scene__final-title" data-stage-reveal>
                Your Learning Journey Starts Here.
              </h3>
              <p className="scene__final-lead" data-stage-reveal>
                Explore our programmes or book a demo class today.
              </p>
              <div className="cluster" data-stage-reveal>
                <Link to="/courses" className="btn btn--light btn--lg">
                  Explore Programs
                  <span className="btn__icon"><ArrowRight size={18} aria-hidden /></span>
                </Link>
                <Link to="/booking" className="btn btn--primary btn--lg">
                  <span className="btn__icon"><CalendarCheck size={18} aria-hidden /></span>
                  Book a Demo Class
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* Progress dots */}
      <ol className="scene__dots" aria-hidden>
        {STAGES.map((s, i) => (
          <li key={s.id} data-dot={i}>{s.title}</li>
        ))}
        <li data-dot={STAGES.length}>Start</li>
      </ol>
    </section>
  );
}

/* ---------- Stage visual variants ---------- */

function StageVisual({ variant, accent }: { variant: string; accent: string }) {
  const common = {
    width: 200,
    height: 200,
    viewBox: "0 0 200 200",
    fill: "none" as const,
    role: "presentation" as const,
    style: { color: accent },
  };
  switch (variant) {
    case "explore":
      return (
        <svg {...common} className="scene__stage-visual" data-stage-reveal aria-hidden>
          <circle cx="100" cy="100" r="64" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
          <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="1.4" opacity="0.85" />
          <circle cx="100" cy="100" r="12" fill="currentColor" />
          <line x1="100" y1="36" x2="100" y2="24" stroke="currentColor" strokeWidth="1.4" />
          <line x1="100" y1="176" x2="100" y2="164" stroke="currentColor" strokeWidth="1.4" />
          <line x1="36" y1="100" x2="24" y2="100" stroke="currentColor" strokeWidth="1.4" />
          <line x1="176" y1="100" x2="164" y2="100" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    case "understand":
      return (
        <svg {...common} className="scene__stage-visual" data-stage-reveal aria-hidden>
          <g transform="translate(100 100)" stroke="currentColor" strokeWidth="1.4" fill="none">
            <polygon points="0,-50 43.3,-25 43.3,25 0,50 -43.3,25 -43.3,-25" opacity="0.7" />
            <polygon points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15" opacity="0.95" />
            <line x1="0" y1="-50" x2="0" y2="-30" />
            <line x1="43.3" y1="-25" x2="26" y2="-15" />
            <line x1="43.3" y1="25" x2="26" y2="15" />
            <line x1="0" y1="50" x2="0" y2="30" />
            <line x1="-43.3" y1="25" x2="-26" y2="15" />
            <line x1="-43.3" y1="-25" x2="-26" y2="-15" />
          </g>
          <circle cx="100" cy="100" r="6" fill="currentColor" />
        </svg>
      );
    case "practice":
      return (
        <svg {...common} className="scene__stage-visual" data-stage-reveal aria-hidden>
          <g stroke="currentColor" strokeWidth="1.4" fill="none">
            <rect x="40" y="40" width="120" height="120" rx="8" opacity="0.4" />
            <path d="M60 100 L88 128 L140 76" opacity="0.95" strokeWidth="2.4" />
          </g>
          <circle cx="60" cy="100" r="4" fill="currentColor" />
          <circle cx="88" cy="128" r="4" fill="currentColor" />
          <circle cx="140" cy="76" r="4" fill="currentColor" />
        </svg>
      );
    case "improve":
      return (
        <svg {...common} className="scene__stage-visual" data-stage-reveal aria-hidden>
          <g stroke="currentColor" strokeWidth="1.6" fill="none">
            <path d="M30 150 L70 110 L100 130 L160 60" opacity="0.95" />
            <path d="M30 110 L70 70 L100 90 L160 20" opacity="0.5" />
          </g>
          {[30, 70, 100, 160].map((x, i) => (
            <circle key={i} cx={x} cy={150 - i * 20 - (i === 3 ? 50 : 0)} r="4" fill="currentColor" />
          ))}
          <path d="M150 30 L165 18 L160 38 Z" fill="currentColor" />
        </svg>
      );
    case "achieve":
    default:
      return (
        <svg {...common} className="scene__stage-visual" data-stage-reveal aria-hidden>
          <g stroke="currentColor" strokeWidth="1.4" fill="none">
            <circle cx="100" cy="80" r="32" opacity="0.95" />
            <path d="M68 80 L68 140 Q68 158 100 158 Q132 158 132 140 L132 80" opacity="0.95" />
            <path d="M88 95 L100 108 L116 88" strokeWidth="2.2" />
          </g>
        </svg>
      );
  }
}
