/* =============================================================
   CHEMAMEER · CourseCategoryPage
   Lists all courses in one category (school | jee | neet).
   Route: /courses/school · /courses/jee · /courses/neet
   ============================================================= */

import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, BookOpen } from "lucide-react";
import { CATEGORIES, getCoursesByCategory } from "../data/catalog";
import type { BookingCategory } from "../types/booking";
import { FinalCta } from "../components/common/FinalCta";
import "./CoursesPage.css";

const VALID: BookingCategory[] = ["school", "jee", "neet"];

const CATEGORY_COPY: Record<BookingCategory, { lead: string }> = {
  school: {
    lead: "Concept-first guidance for every grade — pick a class to see its subjects, learning modes, and booking options.",
  },
  jee: {
    lead: "Structured preparation for JEE — from an early foundation track to full Main and Advanced programmes.",
  },
  neet: {
    lead: "Biology-centred preparation for NEET — an early foundation track plus the full NEET-UG programme.",
  },
};

export function CourseCategoryPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Static routes (/courses/jee etc.) carry no params — read the slug from the path.
  const categoryId = location.pathname.split("/")[2] ?? "";
  const valid = VALID.includes(categoryId as BookingCategory);
  useEffect(() => {
    if (!valid) navigate("/courses", { replace: true });
  }, [valid, navigate]);

  if (!valid) return null;

  const category = CATEGORIES.find((c) => c.id === categoryId)!;
  const courses = getCoursesByCategory(categoryId as BookingCategory);
  const copy = CATEGORY_COPY[categoryId as BookingCategory];

  return (
    <>
      <section
        className="section section--dark"
        style={{ paddingTop: "calc(var(--header-h) + var(--space-7))" }}
      >
        <div className="container">
          <Link to="/courses" className="back-link">
            ← All programs
          </Link>
          <p className="eyebrow" style={{ marginTop: "var(--space-4)" }}>{category.short}</p>
          <h1 className="display" style={{ fontSize: "var(--step-6)", marginBlock: "var(--space-3) var(--space-4)" }}>
            {category.label}
          </h1>
          <p className="lead" style={{ color: "rgba(246,241,230,0.78)", maxWidth: "62ch" }}>
            {copy.lead}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={`courses__grid ${categoryId === "school" ? "courses__grid--school" : ""}`}>
            {courses.map((c) => (
              <Link key={c.id} to={`/courses/${c.id}`} className="course-card">
                <p className="eyebrow course-card__eyebrow">{c.level}</p>
                <h2 className="display course-card__title">{c.display_label}</h2>
                <p className="course-card__blurb">{c.blurb}</p>
                <p className="course-card__meta">
                  <BookOpen size={13} aria-hidden style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />
                  <strong>{c.subjects.length}</strong> subjects
                  {c.duration_weeks ? <> · <strong>{c.duration_weeks}</strong> weeks</> : null}
                </p>
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

      <FinalCta />
    </>
  );
}
