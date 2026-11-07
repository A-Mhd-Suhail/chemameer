/* =============================================================
   CHEMAMEER · BookingPage
   - Demo & Regular class request form
   - Reads pre-fill from URL (?category=&class_or_exam=&booking_type=)
   - Conditional fields for school (1–12) / JEE / NEET
   - Client validation + server submission via useBooking
   - On success → redirect to /booking/success?ref=...
   ============================================================= */

import { cloneElement, isValidElement, useMemo, useId, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CalendarCheck, ClipboardList, AlertCircle, CheckCircle2 } from "lucide-react";
import { useBooking } from "../hooks/useBooking";
import { CATEGORIES, SCHOOL_COURSES, JEE_COURSES, NEET_COURSES } from "../data/catalog";
import type { BookingCategory, BookingInput, BookingType, LearningMode } from "../types/booking";
import "./BookingPage.css";

// Computed once per module load — stable and pure within a render pass.
// Uses the visitor's LOCAL date (not UTC), so "earliest" is correct in IST
// and every other timezone.
const todayISO = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000)
  .toISOString()
  .split("T")[0];

const VALID_CATEGORIES: BookingCategory[] = ["school", "jee", "neet"];

const LEARNING_MODES: { value: LearningMode; label: string }[] = [
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline (in-person)" },
  { value: "hybrid", label: "Hybrid" },
];

interface FormState {
  booking_type: BookingType;
  student_name: string;
  student_email: string;
  phone_number: string;
  guardian_phone: string;
  category: BookingCategory | "";
  class_or_exam: string;
  subject: string;
  learning_mode: LearningMode | "";
  preferred_date: string;
  preferred_time: string;
  message: string;
}

const EMPTY: FormState = {
  booking_type: "demo",
  student_name: "",
  student_email: "",
  phone_number: "",
  guardian_phone: "",
  category: "",
  class_or_exam: "",
  subject: "",
  learning_mode: "",
  preferred_date: "",
  preferred_time: "",
  message: "",
};

export function BookingPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { submitting, submit, fieldErrors, result } = useBooking();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Pre-fill from URL at initialisation (no effect needed).
  // Values are sanitised: unknown categories/types fall back to defaults and
  // a pre-selected class is only kept if it belongs to the chosen category.
  const [form, setForm] = useState<FormState>(() => {
    const rawCat = params.get("category") ?? "";
    const category: BookingCategory | "" = VALID_CATEGORIES.includes(rawCat as BookingCategory)
      ? (rawCat as BookingCategory)
      : "";
    const rawCls = params.get("class_or_exam") ?? "";
    const courseList =
      category === "school"
        ? SCHOOL_COURSES
        : category === "jee"
          ? JEE_COURSES
          : category === "neet"
            ? NEET_COURSES
            : [];
    const class_or_exam = courseList.some((c) => c.level === rawCls) ? rawCls : "";
    const bt = params.get("booking_type");
    return {
      ...EMPTY,
      category,
      class_or_exam,
      booking_type: bt === "regular" ? "regular" : "demo",
    };
  });

  // Choices for the class/exam dropdown depend on the category
  const classOrExamOptions = useMemo(() => {
    if (form.category === "school") return SCHOOL_COURSES.map((c) => c.level);
    if (form.category === "jee") return JEE_COURSES.map((c) => c.level);
    if (form.category === "neet") return NEET_COURSES.map((c) => c.level);
    return [];
  }, [form.category]);

  // Reset dependent fields — driven by the change handler, not an effect.
  const handleCategoryChange = (next: BookingCategory | "") => {
    setForm((f) => ({ ...f, category: next, class_or_exam: "", subject: "" }));
  };

  const subjectOptions = useMemo(() => {
    const list =
      form.category === "school"
        ? SCHOOL_COURSES
        : form.category === "jee"
          ? JEE_COURSES
          : form.category === "neet"
            ? NEET_COURSES
            : [];
    const course = list.find((c) => c.level === form.class_or_exam);
    return course?.subjects ?? [];
  }, [form.category, form.class_or_exam]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    const input: BookingInput = {
      booking_type: form.booking_type,
      student_name: form.student_name,
      student_email: form.student_email,
      phone_number: form.phone_number,
      guardian_phone: form.guardian_phone || null,
      category: form.category as BookingCategory,
      class_or_exam: form.class_or_exam,
      subject: form.subject,
      learning_mode: form.learning_mode as LearningMode,
      preferred_date: form.preferred_date,
      preferred_time: form.preferred_time,
      message: form.message || null,
    };
    const res = await submit(input);
    if (res.ok && res.booking_reference) {
      navigate(`/booking/success?ref=${encodeURIComponent(res.booking_reference)}`);
    }
  };

  const err = (k: keyof FormState) => (touched[k] ? fieldErrors[k as keyof typeof fieldErrors] : undefined);

  return (
    <section className="section booking" style={{ paddingTop: "calc(var(--header-h) + var(--space-7))" }}>
      <div className="container container--narrow">
        <header className="booking__head">
          <p className="eyebrow">Booking</p>
          <h1 className="display booking__title">
            {form.booking_type === "demo" ? "Book a Demo Class" : "Request Regular Classes"}
          </h1>
          <p className="lead booking__lead">
            Submit your request below. This is a booking <strong>request</strong> —
            the academic team will review it and reach out to confirm your slot.
          </p>
        </header>

        {/* Type toggle */}
        <div className="booking__tabs" role="tablist" aria-label="Booking type">
          <button
            type="button"
            role="tab"
            aria-selected={form.booking_type === "demo"}
            className={`booking__tab ${form.booking_type === "demo" ? "is-active" : ""}`}
            onClick={() => update("booking_type", "demo")}
          >
            <CalendarCheck size={16} aria-hidden />
            Demo Class
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={form.booking_type === "regular"}
            className={`booking__tab ${form.booking_type === "regular" ? "is-active" : ""}`}
            onClick={() => update("booking_type", "regular")}
          >
            <ClipboardList size={16} aria-hidden />
            Regular Classes
          </button>
        </div>

        {result && !result.ok && (
          <div className="booking__alert booking__alert--error" role="alert">
            <AlertCircle size={20} aria-hidden />
            <div>
              <strong>Could not submit booking.</strong>
              <p>{result.error}</p>
            </div>
          </div>
        )}

        <form className="booking__form" onSubmit={handleSubmit} noValidate>
          <fieldset className="booking__group">
            <legend>Student details</legend>

            <Field
              label="Student name"
              required
              error={err("student_name")}
            >
              <input
                type="text"
                autoComplete="name"
                value={form.student_name}
                onChange={(e) => update("student_name", e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, student_name: true }))}
                aria-invalid={!!err("student_name")}
              />
            </Field>

            <Field label="Student email" required error={err("student_email")}>
              <input
                type="email"
                autoComplete="email"
                value={form.student_email}
                onChange={(e) => update("student_email", e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, student_email: true }))}
                aria-invalid={!!err("student_email")}
              />
            </Field>

            <Field label="Phone number" required error={err("phone_number")}>
              <input
                type="tel"
                autoComplete="tel"
                value={form.phone_number}
                onChange={(e) => update("phone_number", e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, phone_number: true }))}
                aria-invalid={!!err("phone_number")}
              />
            </Field>

            <Field
              label="Parent / guardian phone (optional)"
              error={err("guardian_phone")}
            >
              <input
                type="tel"
                value={form.guardian_phone}
                onChange={(e) => update("guardian_phone", e.target.value)}
              />
            </Field>
          </fieldset>

          <fieldset className="booking__group">
            <legend>Programme</legend>

            <Field label="Category" required error={err("category")}>
              <select
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value as BookingCategory | "")}
                aria-invalid={!!err("category")}
              >
                <option value="">Choose a category…</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label={
                form.category === "school"
                  ? "Class"
                  : form.category === "jee"
                    ? "JEE track"
                    : form.category === "neet"
                      ? "NEET track"
                      : "Class / exam"
              }
              required
              error={err("class_or_exam")}
            >
              <select
                value={form.class_or_exam}
                onChange={(e) => update("class_or_exam", e.target.value)}
                disabled={!form.category}
                aria-invalid={!!err("class_or_exam")}
              >
                <option value="">
                  {form.category ? "Choose…" : "Pick a category first"}
                </option>
                {classOrExamOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Subject" required error={err("subject")}>
              <select
                value={form.subject}
                onChange={(e) => update("subject", e.target.value)}
                disabled={!form.class_or_exam}
                aria-invalid={!!err("subject")}
              >
                <option value="">
                  {form.class_or_exam ? "Choose…" : "Pick a class/exam first"}
                </option>
                {subjectOptions.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Learning mode" required error={err("learning_mode")}>
              <div className="booking__radios">
                {LEARNING_MODES.map((m) => (
                  <label key={m.value} className="booking__radio">
                    <input
                      type="radio"
                      name="learning_mode"
                      value={m.value}
                      checked={form.learning_mode === m.value}
                      onChange={() => update("learning_mode", m.value)}
                    />
                    <span>{m.label}</span>
                  </label>
                ))}
              </div>
            </Field>
          </fieldset>

          <fieldset className="booking__group">
            <legend>Schedule</legend>

            <Field
              label="Preferred date"
              required
              error={err("preferred_date")}
              hint={`Earliest: ${todayISO}`}
            >
              <input
                type="date"
                min={todayISO}
                value={form.preferred_date}
                onChange={(e) => update("preferred_date", e.target.value)}
                aria-invalid={!!err("preferred_date")}
              />
            </Field>

            <Field label="Preferred time" required error={err("preferred_time")}>
              <input
                type="time"
                value={form.preferred_time}
                onChange={(e) => update("preferred_time", e.target.value)}
                aria-invalid={!!err("preferred_time")}
              />
            </Field>

            <Field
              label="Additional message (optional)"
              error={err("message")}
              fullWidth
            >
              <textarea
                rows={4}
                maxLength={2000}
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                placeholder="Anything we should know before reaching out?"
              />
            </Field>
          </fieldset>

          <div className="booking__actions">
            <button
              type="submit"
              className="btn btn--primary btn--lg btn--block"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? "Submitting…" : form.booking_type === "demo" ? "Request Demo Class" : "Request Regular Classes"}
            </button>
            <p className="booking__fineprint">
              <CheckCircle2 size={14} aria-hidden />
              We never share your details. Your request is reviewed by the academic team before any confirmation.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

/* ---------- Reusable Field ---------- */

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const CONTROL_TAGS = ["input", "select", "textarea"];

function Field({ label, required, error, hint, fullWidth, children }: FieldProps) {
  // Associate the label with the control (input/select/textarea) so every
  // field is properly announced by screen readers.
  const autoId = useId();
  let controlId: string | undefined;
  let content = children;
  if (
    isValidElement(children) &&
    typeof children.type === "string" &&
    CONTROL_TAGS.includes(children.type)
  ) {
    controlId = autoId;
    content = cloneElement(children as React.ReactElement<{ id?: string }>, {
      id: autoId,
    });
  }

  return (
    <div className={`field ${fullWidth ? "field--full" : ""}`}>
      <label className="field__label" htmlFor={controlId}>
        {label}
        {required && <span aria-hidden="true" className="field__req">*</span>}
      </label>
      {content}
      {hint && <p className="field__hint">{hint}</p>}
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
