/* =============================================================
   CHEMAMEER · AboutPage
   ============================================================= */

import { Link } from "react-router-dom";
import { SectionHeading } from "../components/common/SectionHeading";
import { AtomIcon, BookIcon, DnaIcon, CompassIcon, SparkIcon } from "../components/common/Icons";
import { FinalCta } from "../components/common/FinalCta";
import "../components/courses/Categories.css"; // reuse grid

const VALUES = [
  {
    icon: CompassIcon,
    title: "Clarity over coverage",
    body: "We would rather explain one concept properly than skim ten. Speed comes from understanding, not the other way around.",
  },
  {
    icon: BookIcon,
    title: "Curriculum-aligned, not curriculum-trapped",
    body: "We follow the syllabus closely, but we explain the why behind every formula — so the syllabus becomes a map, not a wall.",
  },
  {
    icon: AtomIcon,
    title: "Visual by default",
    body: "Diagrams, animations and structured illustrations are not decoration. They are how most students actually understand science.",
  },
  {
    icon: DnaIcon,
    title: "Concept-first across PCM/B",
    body: "Physics, Chemistry, Mathematics and Biology are taught as connected ideas — not as four unrelated subjects.",
  },
  {
    icon: SparkIcon,
    title: "Honest progress",
    body: "No fake success rates. We measure progress by what you can explain in your own words.",
  },
];

export function AboutPage() {
  return (
    <>
      <section className="section section--dark" style={{ paddingTop: "calc(var(--header-h) + var(--space-9))" }}>
        <div className="container">
          <SectionHeading
            as="h1"
            eyebrow="About CHEMAMEER"
            title="Where Science Comes Alive."
            lead="CHEMAMEER — displayed as CHEM ANIMATED — is a premium educational platform built around a single belief: most students don’t fail science because it’s hard. They fail because it’s explained badly."
            variant="dark"
          />
          <div style={{ marginTop: "var(--space-6)", maxWidth: "62ch" }}>
            <p style={{ color: "rgba(246,241,230,0.78)", fontSize: "var(--step-1)", lineHeight: 1.7 }}>
              We exist to fix that — with visual explanations, structured preparation, and concept-first
              teaching across Classes 1–12, JEE and NEET. We don’t promise shortcuts. We promise that
              the path will be clear, the explanations will be honest, and the visual storytelling will
              make difficult topics genuinely understandable.
            </p>
          </div>
          <div className="cluster" style={{ marginTop: "var(--space-6)" }}>
            <Link to="/courses" className="btn btn--primary btn--lg">Explore Programs</Link>
            <Link to="/booking" className="btn btn--light btn--lg">Book a Demo Class</Link>
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <SectionHeading
            eyebrow="What we stand for"
            title="Five things we won’t compromise on."
          />
          <ul className="why__grid" style={{ marginTop: "var(--space-7)" }}>
            {VALUES.map((v) => (
              <li key={v.title} className="why__card">
                <span className="why__icon" aria-hidden>
                  <v.icon size={22} />
                </span>
                <h3 className="display why__title">{v.title}</h3>
                <p className="why__body">{v.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
