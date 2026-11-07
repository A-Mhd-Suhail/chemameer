/* =============================================================
   CHEMAMEER · useBooking hook
   Handles demo & regular class booking submission.
   - Validates client-side first.
   - Calls the Supabase Edge Function when configured.
   - Falls back to a local mock that returns a reference (so the
   *   form is testable end-to-end before Supabase is provisioned).
   - Prevents double submission.
   ============================================================= */

import { useCallback, useState } from "react";
import type { BookingInput, BookingResult } from "../types/booking";
import { generateBookingReference, validateBooking, type FieldErrors } from "../lib/validation";
import { isSupabaseConfigured, getSupabase } from "../lib/supabase";

const LOCAL_KEY = "chemameer:bookings:local";

/** Safe read of the local mock store — corrupt JSON must never crash the form. */
function readLocalBookings(): Record<string, unknown>[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

/** crypto.randomUUID() is only available in secure contexts; fall back safely. */
function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

interface UseBookingState {
  submitting: boolean;
  result: BookingResult | null;
  fieldErrors: FieldErrors;
  submit: (input: BookingInput) => Promise<BookingResult>;
  reset: () => void;
}

export function useBooking(): UseBookingState {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const submit = useCallback(async (input: BookingInput): Promise<BookingResult> => {
    if (submitting) return { ok: false, error: "Submission already in progress." };
    const errors = validateBooking(input);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: errors };
    }

    setSubmitting(true);

    try {
      // Prefer the real Edge Function if Supabase is configured.
      const sb = await getSupabase();
      if (isSupabaseConfigured && sb) {
        const { data, error } = await sb.functions.invoke("submit-booking", {
          body: input,
        });
        if (error) {
          const r: BookingResult = {
            ok: false,
            error: error.message || "Booking service is unavailable. Please try again.",
          };
          setResult(r);
          return r;
        }
        const r: BookingResult = {
          ok: true,
          booking_reference: (data as { booking_reference?: string })?.booking_reference,
        };
        setResult(r);
        return r;
      }

      // Fallback: simulate the server round-trip locally so the
      // booking flow is testable before backend deployment.
      await new Promise((res) => setTimeout(res, 900));
      const ref = generateBookingReference();
      // Persist locally so the admin mock can read it.
      try {
        const list = readLocalBookings();
        list.push({
          ...input,
          id: makeId(),
          booking_reference: ref,
          status: "new",
          created_at: new Date().toISOString(),
          email_delivered: false,
        });
        localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
      } catch {
        /* ignore quota errors */
      }
      const r: BookingResult = { ok: true, booking_reference: ref };
      setResult(r);
      return r;
    } catch (err) {
      const r: BookingResult = {
        ok: false,
        error: err instanceof Error ? err.message : "Unexpected error.",
      };
      setResult(r);
      return r;
    } finally {
      setSubmitting(false);
    }
  }, [submitting]);

  const reset = useCallback(() => {
    setResult(null);
    setFieldErrors({});
  }, []);

  return { submitting, result, fieldErrors, submit, reset };
}
