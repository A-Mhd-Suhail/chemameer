/* =============================================================
   CHEMAMEER · Admin service
   - Verifies admin session (Supabase auth or local preview)
   - Lists bookings (from Supabase when configured, else from
     localStorage mock created by useBooking)
   - Updates booking status, retries failed emails
   ============================================================= */

import { isSupabaseConfigured, getSupabase } from "../lib/supabase";
import type { BookingRecord, BookingStatus } from "../types/booking";

const LOCAL_KEY = "chemameer:bookings:local";
const PREVIEW_KEY = "chemameer:admin:preview";

/** Safe read of the local mock store — corrupt JSON must never crash the dashboard. */
function readLocalBookings(): BookingRecord[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    return Array.isArray(parsed) ? (parsed as BookingRecord[]) : [];
  } catch {
    return [];
  }
}

export interface AdminSession {
  email: string;
  preview: boolean;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  // Local preview mode (clearly marked — never in production).
  if (sessionStorage.getItem(PREVIEW_KEY) === "1") {
    return { email: "preview@chemameer.local", preview: true };
  }

  if (!isSupabaseConfigured) return null;
  const sb = await getSupabase();
  if (!sb) return null;

  const { data } = await sb.auth.getSession();
  if (!data.session?.user) return null;
  return {
    email: data.session.user.email ?? "admin@chemameer",
    preview: false,
  };
}

export async function signOut(): Promise<void> {
  sessionStorage.removeItem(PREVIEW_KEY);
  const sb = await getSupabase();
  if (sb) await sb.auth.signOut();
}

export interface ListBookingsOpts {
  search?: string;
  category?: string;
  status?: string;
  booking_type?: string;
}

export async function listBookings(opts: ListBookingsOpts = {}): Promise<BookingRecord[]> {
  const sb = await getSupabase();
  if (isSupabaseConfigured && sb) {
    let query = sb
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (opts.category) query = query.eq("category", opts.category);
    if (opts.status) query = query.eq("status", opts.status);
    if (opts.booking_type) query = query.eq("booking_type", opts.booking_type);
    if (opts.search) {
      query = query.or(
        `student_name.ilike.%${opts.search}%,student_email.ilike.%${opts.search}%,booking_reference.ilike.%${opts.search}%`,
      );
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as BookingRecord[];
  }

  // Mock: read from localStorage.
  let items: BookingRecord[] = readLocalBookings();
  if (opts.category) items = items.filter((b) => b.category === opts.category);
  if (opts.status) items = items.filter((b) => b.status === opts.status);
  if (opts.booking_type) items = items.filter((b) => b.booking_type === opts.booking_type);
  if (opts.search) {
    const q = opts.search.toLowerCase();
    items = items.filter(
      (b) =>
        b.student_name.toLowerCase().includes(q) ||
        b.student_email.toLowerCase().includes(q) ||
        b.booking_reference.toLowerCase().includes(q),
    );
  }
  return items.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  notes?: string,
): Promise<void> {
  if (isSupabaseConfigured) {
    const sb = await getSupabase();
    if (sb) {
      const payload: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (notes !== undefined) payload.admin_notes = notes;
      const { error } = await sb.from("bookings").update(payload).eq("id", id);
      if (error) throw error;
      return;
    }
  }

  const items: BookingRecord[] = readLocalBookings();
  const idx = items.findIndex((b) => b.id === id);
  if (idx >= 0) {
    items[idx] = {
      ...items[idx],
      status,
      admin_notes: notes ?? items[idx].admin_notes,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  }
}

export async function retryEmail(id: string): Promise<{ ok: boolean; error?: string }> {
  const sb = await getSupabase();
  if (isSupabaseConfigured && sb) {
    const { error } = await sb.functions.invoke("submit-booking", {
      body: { mode: "retry_email", booking_id: id },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }
  // Mock: just mark as delivered locally.
  const items: BookingRecord[] = readLocalBookings();
  const idx = items.findIndex((b) => b.id === id);
  if (idx >= 0) {
    items[idx].email_delivered = true;
    items[idx].email_error = null;
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  }
  return { ok: true };
}

export function exportBookingsCsv(rows: BookingRecord[]): string {
  const cols = [
    "reference",
    "type",
    "name",
    "email",
    "phone",
    "guardian_phone",
    "category",
    "class_or_exam",
    "subject",
    "mode",
    "preferred_date",
    "preferred_time",
    "status",
    "email_delivered",
    "created_at",
  ];
  const escape = (s: unknown) => `"${String(s ?? "").replace(/"/g, '""')}"`;
  const lines = [cols.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.booking_reference,
        r.booking_type,
        r.student_name,
        r.student_email,
        r.phone_number,
        r.guardian_phone ?? "",
        r.category,
        r.class_or_exam,
        r.subject,
        r.learning_mode,
        r.preferred_date,
        r.preferred_time,
        r.status,
        r.email_delivered,
        r.created_at,
      ]
        .map(escape)
        .join(","),
    );
  }
  return lines.join("\n");
}
