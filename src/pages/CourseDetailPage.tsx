/* =============================================================
   CHEMAMEER · CourseDetailPage
   Shows a single course, its subjects, learning modes,
   and lets the user book a demo or regular class.
   ============================================================= */

import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarCheck, ClipboardList, CheckCircle2, BookOpen } from "lucide-react";
import { CATEGORIES, getCourseById } from "../data/catalog";
import { useEffect } from "react";
import "./CourseDetailPage.css";

export function CourseDetailPage() {
  const { courseId = "" } = useParams();
  const navigate = useNavigate();
  const course = getCourseById(courseId);

  useEffect(() => {
    if (!course) navigate("/404", { replace: true });
  }, [course, navigate]);

  if (!course) return null;

  const categoryLabel =
    CATEGORIES.find((c) => c.id === course.category)?.label ?? course.category;

  const bookingState = {
    category: course.category,
    class_or_exam: course.level,
  };
  const bookingQuery = new URLSearchParams({
    category: bookingState.category,
    class_or_exam: bookingState.class_or_exam,
  }).toString();

  return (
    <>
      <section
        className="section section--dark"
        style={{ paddingTop: "calc(var(--header-h) + var(--space-7))" }}
      >
        <div className="container">
          <Link to="/courses" className="back-link">
            <ArrowLeft size={16} aria-hidden />
            All programs
          </Link>

          <p className="eyebrow" style={{ marginTop: "var(--space-4)" }}>{course.level}</p>
          <h1 className="display course-detail__title">{course.display_label}</h1>
          <p className="lead course-detail__lead">{course.description}</p>

          <div className="cluster" style={{ marginTop: "var(--space-5)" }}>
            <Link
              to={`/booking?${bookingQuery}&booking_type=demo`}
              className="btn btn--primary btn--lg"
            >
              <CalendarCheck size={18} aria-hidden />
              Book a Demo Class
            </Link>
            <Link
              to={`/booking?${bookingQuery}&booking_type=regular`}
              className="btn btn--light btn--lg"
            >
              <ClipboardList size={18} aria-hidden />
              Request Regular Classes
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container course-detail__grid">
          <div className="course-detail__panel">
            <p className="eyebrow">Subjects</p>
            <h2 className="display course-detail__subtitle">What you’ll learn</h2>
            <ul className="subject-list">
              {course.subjects.map((s) => (
                <li key={s.id} className="subject-list__item">
                  <span className="subject-list__icon">
                    <BookOpen size={18} />
                  </span>
                  <div>
                    <h3 className="subject-list__name">{s.name}</h3>
                    <p className="subject-list__blurb">{s.blurb}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <aside className="course-detail__aside">
            <div className="course-detail__card">
              <h3 className="display course-detail__card-title">Programme at a glance</h3>
              <dl className="course-detail__dl">
                <div>
                  <dt>Category</dt>
                  <dd>{categoryLabel}</dd>
                </div>
                <div>
                  <dt>Programme</dt>
                  <dd>{course.level}</dd>
                </div>
                <div>
                  <dt>Learning modes</dt>
                  <dd>{course.modes.join(", ")}</dd>
                </div>
                {course.duration_weeks && (
                  <div>
                    <dt>Indicative duration</dt>
                    <dd>{course.duration_weeks} weeks</dd>
                  </div>
                )}
                <div>
                  <dt>Subjects</dt>
                  <dd>{course.subjects.length}</dd>
                </div>
              </dl>

              <h4 className="course-detail__hl-head">Highlights</h4>
              <ul className="course-detail__hl">
                {course.highlights.map((h) => (
                  <li key={h}>
                    <CheckCircle2 size={16} aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>

              <p className="course-detail__note">
                Exact batch schedule and availability are confirmed by the academic
                team at enrolment.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
