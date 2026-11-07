/* =============================================================
   CHEMAMEER · Why Us section
   Factual, configurable benefits — no invented stats.
   ============================================================= */

import { Compass, Eye, ListChecks, FlaskConical, Map } from "lucide-react";
import { SectionHeading } from "../common/SectionHeading";
import "./WhyUs.css";

const BENEFITS = [
  {
    icon: Eye,
    title: "Concept-focused learning",
    body: "Every topic is built from first principles so understanding lasts beyond the exam.",
  },
  {
    icon: FlaskConical,
    title: "Visual explanations",
    body: "Diagrams, animations and structured illustrations make abstract ideas concrete.",
  },
  {
    icon: ListChecks,
    title: "Structured preparation",
    body: "Each programme has a clear progression — no guesswork about what to study next.",
  },
  {
    icon: Compass,
    title: "Subject-based learning",
    body: "Choose by subject or by class — the path adapts to where you actually need help.",
  },
  {
    icon: Map,
    title: "Learning guidance",
    body: "Mentor support points you to the next step, instead of leaving you to figure it out alone.",
  },
];

export function WhyUs() {
  return (
    <section className="section section--cream why" id="why" aria-labelledby="why-title">
      <div className="container">
        <SectionHeading
          eyebrow="Why CHEMAMEER"
          title="Built around how understanding actually forms."
          lead="We don’t promise magic results. We promise a structure that makes concepts stick — visually, conceptually, and step by step."
        />

        <ul className="why__grid">
          {BENEFITS.map((b) => (
            <li key={b.title} className="why__card">
              <span className="why__icon" aria-hidden>
                <b.icon size={22} />
              </span>
              <h3 className="display why__title">{b.title}</h3>
              <p className="why__body">{b.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
