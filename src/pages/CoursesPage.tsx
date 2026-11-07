/* =============================================================
   CHEMAMEER · CoursesPage
   Lists all three categories with their courses.
   ============================================================= */

import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SectionHeading } from "../components/common/SectionHeading";
import {
  CATEGORIES,
  SCHOOL_COURSES,
  JEE_COURSES,
  NEET_COURSES,
} from "../data/catalog";
import { AtomIcon, BookIcon, DnaIcon } from "../components/common/Icons";
import { FinalCta } from "../components/common/FinalCta";
import "./CoursesPage.css";

const ICON_MAP = { school: BookIcon, atom: AtomIcon, dna: DnaIcon };
const COURSE_MAP = {
  school: SCHOOL_COURSES,
  jee: JEE_COURSES,
  neet: NEET_COURSES,
};

export function CoursesPage() {
  return (
    <>
      <section
        className="section section--dark"
        style={{ paddingTop: "calc(var(--header-h) + var(--space-9))" }}
      >
        <div className="container">
          <SectionHeading
            as="h1"
            eyebrow="Programs"
            title="Every path is configurable."
            lead="Browse Classes 1–12, JEE preparation tracks and NEET preparation tracks. Each programme lists its subjects and learning modes — exact schedules are confirmed by the academic team at enrolment."
            variant="dark"
          />
        </div>
      </section>

      {CATEGORIES.map((cat) => {
        const Icon = ICON_MAP[cat.icon];
        const courses = COURSE_MAP[cat.id];
        return (
          <section key={cat.id} className={`section ${cat.id === "jee" ? "section--cream" : ""}`}>
            <div className="container">
              <header className="courses__head">
                <span className="courses__icon">
                  <Icon size={28} />
                </span>
                <div>
                  <p className="eyebrow">{cat.short}</p>
                  <h2 className="display courses__title">{cat.label}</h2>
                  <p className="courses__blurb">{cat.blurb}</p>
                </div>
              </header>

              <div className={`courses__grid ${cat.id === "school" ? "courses__grid--school" : ""}`}>
                {courses.map((c) => (
                  <Link key={c.id} to={`/courses/${c.id}`} className="course-card">
                    <p className="eyebrow course-card__eyebrow">{c.level}</p>
                    <h3 className="display course-card__title">{c.display_label}</h3>
                    <p className="course-card__blurb">{c.blurb}</p>
                    {c.duration_weeks && (
                      <p className="course-card__meta">
                        <strong>{c.duration_weeks}</strong> weeks ·{" "}
                        <strong>{c.subjects.length}</strong> subjects
                      </p>
                    )}
                    {!c.duration_weeks && (
                      <p className="course-card__meta">
                        <strong>{c.subjects.length}</strong> subjects
                      </p>
                    )}
                    <ul className="course-card__highlights">
                      {c.highlights.slice(0, 3).map((h) => (
                        <li key={h}>
                          <CheckCircle2 size={14} aria-hidden />
                          {h}
                        </li>
                      ))}
                    </ul>
                    <span className="course-card__cta">
                      View programme
                      <ArrowRight size={16} aria-hidden />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <FinalCta />
    </>
  );
}
