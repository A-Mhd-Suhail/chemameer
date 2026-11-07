/* =============================================================
   CHEMAMEER · Course & category types
   ============================================================= */

import type { BookingCategory, LearningMode } from "./booking";

export interface Subject {
  id: string;
  name: string;
  short: string;
  blurb: string;
}

export interface Course {
  id: string;
  category: BookingCategory;
  level: string;         // e.g. "Class 10" or "JEE Main"
  display_label: string; // e.g. "Class 10 — Foundation"
  blurb: string;
  description: string;
  subjects: Subject[];
  modes: LearningMode[];
  duration_weeks?: number;
  highlights: string[];
}

export interface CategoryDef {
  id: BookingCategory;
  label: string;
  short: string;
  blurb: string;
  icon: "school" | "atom" | "dna";
}
