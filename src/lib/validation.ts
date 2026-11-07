/* =============================================================
   CHEMAMEER · Validation utilities
   Pure functions, framework-agnostic.
   ============================================================= */

import type { BookingInput } from "../types/booking";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+]?[\d\s\-()]{7,16}$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export type FieldErrors = Partial<Record<keyof BookingInput, string>>;

export function validateBooking(input: BookingInput): FieldErrors {
  const errors: FieldErrors = {};

  if (!input.student_name || input.student_name.trim().length < 2) {
    errors.student_name = "Please enter the student's full name.";
  }
  if (!input.student_email || !EMAIL_RE.test(input.student_email)) {
    errors.student_email = "Please enter a valid email address.";
  }
  if (!input.phone_number || !PHONE_RE.test(input.phone_number)) {
    errors.phone_number = "Please enter a valid phone number.";
  }
  if (input.guardian_phone && !PHONE_RE.test(input.guardian_phone)) {
    errors.guardian_phone = "Please enter a valid guardian phone number.";
  }
  if (!input.category) errors.category = "Please choose a category.";
  if (!input.class_or_exam || input.class_or_exam.trim().length < 2) {
    errors.class_or_exam = "Please choose a class or exam.";
  }
  if (!input.subject || input.subject.trim().length < 2) {
    errors.subject = "Please choose a subject.";
  }
  if (!input.learning_mode) errors.learning_mode = "Please select a learning mode.";
  if (!input.preferred_date || !ISO_DATE_RE.test(input.preferred_date)) {
    errors.preferred_date = "Please choose a valid date.";
  } else {
    const chosen = new Date(input.preferred_date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (chosen.getTime() < today.getTime()) {
      errors.preferred_date = "Please choose a date in the future.";
    }
  }
  if (!input.preferred_time || !TIME_RE.test(input.preferred_time)) {
    errors.preferred_time = "Please choose a valid time.";
  }
  if (input.message && input.message.length > 2000) {
    errors.message = "Message is too long (max 2000 characters).";
  }
  return errors;
}

export function isBookingValid(input: BookingInput): boolean {
  return Object.keys(validateBooking(input)).length === 0;
}

/** Generate a short, human-friendly booking reference. */
export function generateBookingReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars
  const ts = Date.now().toString(36).slice(-4).toUpperCase();
  let rnd = "";
  for (let i = 0; i < 4; i++) {
    rnd += chars[Math.floor(Math.random() * chars.length)];
  }
  return `CHM-${ts}-${rnd}`;
}
