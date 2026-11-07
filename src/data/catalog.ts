/* =============================================================
   CHEMAMEER · Course catalogue
   All entries are intentionally configurable placeholders.
   An administrator can override these via Supabase (see migrations).
   No fake schedules or availability are included.
   ============================================================= */

import type { BookingCategory } from "../types/booking";
import type { CategoryDef, Course } from "../types/course";

export const CATEGORIES: CategoryDef[] = [
  {
    id: "school",
    label: "School Education",
    short: "Classes 1–12",
    blurb: "Concept-first guidance across all classes — aligned to school curriculum.",
    icon: "school",
  },
  {
    id: "jee",
    label: "JEE Preparation",
    short: "JEE Main & Advanced",
    blurb: "Structured preparation for the Joint Entrance Examination.",
    icon: "atom",
  },
  {
    id: "neet",
    label: "NEET Preparation",
    short: "NEET-UG",
    blurb: "Conceptual depth and practice for the NEET-UG medical entrance.",
    icon: "dna",
  },
];

const SHARED_SUBJECTS = {
  core_sci: [
    { id: "phy", name: "Physics", short: "Phy", blurb: "Mechanics, optics, electricity & modern physics." },
    { id: "chem", name: "Chemistry", short: "Chem", blurb: "Physical, organic and inorganic chemistry." },
    { id: "bio", name: "Biology", short: "Bio", blurb: "Botany, zoology and human physiology." },
    { id: "math", name: "Mathematics", short: "Math", blurb: "Algebra, geometry, calculus & statistics." },
  ],
  early: [
    { id: "evs", name: "Environmental Studies", short: "EVS", blurb: "Awareness of the natural world." },
    { id: "gk", name: "General Knowledge", short: "GK", blurb: "Curiosity-driven awareness building." },
    { id: "eng", name: "English", short: "Eng", blurb: "Reading, writing & comprehension." },
  ],
};

function schoolCourse(klass: number): Course {
  const isPrimary = klass <= 5;
  const isMiddle = klass >= 6 && klass <= 8;
  const subjects = isPrimary
    ? [...SHARED_SUBJECTS.early, SHARED_SUBJECTS.core_sci[0], SHARED_SUBJECTS.core_sci[3]]
    : isMiddle
      ? SHARED_SUBJECTS.core_sci
      : SHARED_SUBJECTS.core_sci;
  return {
    id: `school-${klass}`,
    category: "school",
    level: `Class ${klass}`,
    display_label: `Class ${klass} — ${isPrimary ? "Foundation" : isMiddle ? "Core" : "Advanced"} Programme`,
    blurb: `Curriculum-aligned concept guidance for Class ${klass}.`,
    description: `A structured concept-first programme for Class ${klass}, focused on clarity rather than rote memorisation. The exact syllabus and schedule are configured by the academic team and confirmed at enrolment.`,
    subjects,
    modes: ["online", "offline", "hybrid"],
    highlights: [
      "Concept-first teaching style",
      "Visual explanations & worked examples",
      "Mode-flexible (online / offline / hybrid)",
    ],
  };
}

export const SCHOOL_COURSES: Course[] = Array.from({ length: 12 }, (_, i) => schoolCourse(i + 1));

export const JEE_COURSES: Course[] = [
  {
    id: "jee-foundation",
    category: "jee",
    level: "JEE Foundation (Class 9–10)",
    display_label: "JEE Foundation",
    blurb: "Early preparation building the conceptual base for JEE.",
    description:
      "A foundation programme that introduces JEE-relevant thinking early, without the pressure of the full syllabus. Suitable for Class 9–10 students looking to build depth in Physics, Chemistry and Mathematics.",
    subjects: SHARED_SUBJECTS.core_sci,
    modes: ["online", "hybrid"],
    duration_weeks: 36,
    highlights: ["JEE-aligned conceptual base", "PMC focus", "Progressive difficulty"],
  },
  {
    id: "jee-main",
    category: "jee",
    level: "JEE Main",
    display_label: "JEE Main Programme",
    blurb: "Full-spectrum preparation for the JEE Main examination.",
    description:
      "A focused preparation programme covering Physics, Chemistry and Mathematics for JEE Main. The exact batch schedule is configured by the academic team.",
    subjects: SHARED_SUBJECTS.core_sci,
    modes: ["online", "offline", "hybrid"],
    duration_weeks: 64,
    highlights: ["PCM full coverage", "Concept + practice balance", "Mock-test rhythm"],
  },
  {
    id: "jee-advanced",
    category: "jee",
    level: "JEE Advanced",
    display_label: "JEE Advanced Track",
    blurb: "Advanced problem-solving for serious JEE Advanced aspirants.",
    description:
      "An advanced track layered over the JEE Main programme, focused on rigorous problem-solving and conceptual depth suitable for JEE Advanced.",
    subjects: SHARED_SUBJECTS.core_sci,
    modes: ["online", "offline"],
    duration_weeks: 80,
    highlights: ["Rigorous problem sets", "Conceptual depth", "Mentor review"],
  },
];

export const NEET_COURSES: Course[] = [
  {
    id: "neet-foundation",
    category: "neet",
    level: "NEET Foundation (Class 9–10)",
    display_label: "NEET Foundation",
    blurb: "Early foundation building with Biology at the centre.",
    description:
      "An early foundation programme for Class 9–10 students targeting NEET, with Biology at the centre supported by Physics and Chemistry.",
    subjects: SHARED_SUBJECTS.core_sci,
    modes: ["online", "hybrid"],
    duration_weeks: 36,
    highlights: ["Biology-first approach", "Concept base", "Cross-subject support"],
  },
  {
    id: "neet-ug",
    category: "neet",
    level: "NEET-UG",
    display_label: "NEET-UG Programme",
    blurb: "Complete preparation for the NEET-UG medical entrance.",
    description:
      "A full-spectrum preparation programme covering Physics, Chemistry and Biology for NEET-UG. The exact batch schedule is configured by the academic team.",
    subjects: SHARED_SUBJECTS.core_sci,
    modes: ["online", "offline", "hybrid"],
    duration_weeks: 72,
    highlights: ["PCB full coverage", "Biology deep-dive", "NCERT-aligned revision"],
  },
];

export const ALL_COURSES: Course[] = [...SCHOOL_COURSES, ...JEE_COURSES, ...NEET_COURSES];

export function getCourseById(id: string): Course | undefined {
  return ALL_COURSES.find((c) => c.id === id);
}

export function getCoursesByCategory(category: BookingCategory): Course[] {
  if (category === "school") return SCHOOL_COURSES;
  if (category === "jee") return JEE_COURSES;
  return NEET_COURSES;
}
