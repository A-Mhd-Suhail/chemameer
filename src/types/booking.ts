/* =============================================================
   CHEMAMEER · Booking types
   ============================================================= */

export type BookingCategory = "school" | "jee" | "neet";
export type BookingType = "demo" | "regular";
export type LearningMode = "online" | "offline" | "hybrid";
export type BookingStatus =
  | "new"
  | "pending"
  | "confirmed"
  | "rescheduled"
  | "completed"
  | "enrolled"
  | "cancelled";

export interface BookingInput {
  student_name: string;
  student_email: string;
  phone_number: string;
  guardian_phone?: string | null;
  category: BookingCategory;
  class_or_exam: string; // e.g. "Class 10" or "JEE Main"
  subject: string;
  learning_mode: LearningMode;
  preferred_date: string; // ISO date
  preferred_time: string; // HH:mm
  message?: string | null;
  booking_type: BookingType;
}

export interface BookingRecord extends BookingInput {
  id: string;
  booking_reference: string;
  status: BookingStatus;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  email_delivered: boolean;
  email_error?: string | null;
}

export interface BookingResult {
  ok: boolean;
  booking_reference?: string;
  error?: string;
  fieldErrors?: Partial<Record<keyof BookingInput, string>>;
}
