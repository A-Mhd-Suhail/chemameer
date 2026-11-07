/* =============================================================
   CHEMAMEER · FAQ content
   These are configurable defaults; admins can override via Supabase.
   ============================================================= */

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export const FAQS: Faq[] = [
  {
    id: "classes-available",
    question: "Which classes are available?",
    answer:
      "CHEMAMEER supports school students from Class 1 to Class 12, with curriculum-aligned concept guidance. Each class has its own subject configuration — open the Classes menu to explore.",
  },
  {
    id: "demo-class",
    question: "Is demo class booking available?",
    answer:
      "Yes. You can request a demo class through the booking form. The demo is a request — final confirmation is sent by the academic team once your slot is reviewed.",
  },
  {
    id: "choose-class",
    question: "How do I choose my class?",
    answer:
      "Open Classes → School Education, then pick your grade. For JEE or NEET, choose the relevant preparation track. Each programme lists the subjects covered and available learning modes.",
  },
  {
    id: "jee-classes",
    question: "Are JEE classes available?",
    answer:
      "Yes. We offer a JEE Foundation track, a JEE Main programme, and a JEE Advanced track. Each is configurable by the academic team.",
  },
  {
    id: "neet-classes",
    question: "Are NEET classes available?",
    answer:
      "Yes. We offer a NEET Foundation track and a full NEET-UG programme, with Biology at the centre of preparation.",
  },
  {
    id: "how-enrol",
    question: "How do I enrol?",
    answer:
      "Submit either a demo class request or a regular class enrolment request from the booking page. The academic team reviews your request and reaches out with confirmation and the next steps.",
  },
];
