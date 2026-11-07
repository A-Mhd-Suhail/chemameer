// =============================================================
// CHEMAMEER · submit-booking Edge Function (Deno)
// Accepts a booking request, validates, inserts, and triggers
// Resend emails to admin + student.
// Anti-spam: per-IP rate limit, honeypot, simple payload check.
// On email failure: booking is still saved, error is recorded.
// Supports `mode: "retry_email"` for admin retries.
// =============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---- Env vars (set in Supabase → Edge Functions → Secrets) ----
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "CHEMAMEER <bookings@chemameer.example>";
const ADMIN_NOTIFICATION_EMAIL = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") ?? "";

// ---- In-memory rate limit (per cold-start instance) ----
// For production-grade rate limiting, use a Redis/Upstash-backed store.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_PER_IP = 5;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || cur.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  cur.count++;
  return cur.count > RATE_MAX_PER_IP;
}

// ---- Validation (mirrors src/lib/validation.ts) ----
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+]?[\d\s\-()]{7,16}$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

interface BookingInput {
  booking_type: "demo" | "regular";
  student_name: string;
  student_email: string;
  phone_number: string;
  guardian_phone?: string | null;
  category: "school" | "jee" | "neet";
  class_or_exam: string;
  subject: string;
  learning_mode: "online" | "offline" | "hybrid";
  preferred_date: string;
  preferred_time: string;
  message?: string | null;
}

interface RetryInput {
  mode: "retry_email";
  booking_id: string;
}

function validate(input: BookingInput): Record<string, string> {
  const e: Record<string, string> = {};
  if (!input.student_name || input.student_name.trim().length < 2) e.student_name = "Name is required.";
  if (!input.student_email || !EMAIL_RE.test(input.student_email)) e.student_email = "Valid email required.";
  if (!input.phone_number || !PHONE_RE.test(input.phone_number)) e.phone_number = "Valid phone required.";
  if (input.guardian_phone && !PHONE_RE.test(input.guardian_phone)) e.guardian_phone = "Invalid guardian phone.";
  if (!input.class_or_exam) e.class_or_exam = "Class / exam required.";
  if (!input.subject) e.subject = "Subject required.";
  if (!input.preferred_date || !ISO_DATE_RE.test(input.preferred_date)) e.preferred_date = "Valid date required.";
  if (!input.preferred_time || !TIME_RE.test(input.preferred_time)) e.preferred_time = "Valid time required.";
  if (input.message && input.message.length > 2000) e.message = "Message too long.";
  return e;
}

function generateRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const ts = Date.now().toString(36).slice(-4).toUpperCase();
  let rnd = "";
  for (let i = 0; i < 4; i++) rnd += chars[Math.floor(Math.random() * chars.length)];
  return `CHM-${ts}-${rnd}`;
}

// ---- Email via Resend ----
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend ${res.status}: ${text}`);
  }
}

function adminEmailHtml(input: BookingInput, ref: string): string {
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:auto;color:#0a1733;">
      <h2 style="color:#1f4cff;">New CHEMAMEER Booking — ${ref}</h2>
      <p>A new ${input.booking_type} booking request has been received.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        ${rowHtml("Student", input.student_name)}
        ${rowHtml("Email", input.student_email)}
        ${rowHtml("Phone", input.phone_number)}
        ${input.guardian_phone ? rowHtml("Guardian phone", input.guardian_phone) : ""}
        ${rowHtml("Category", input.category)}
        ${rowHtml("Class / Exam", input.class_or_exam)}
        ${rowHtml("Subject", input.subject)}
        ${rowHtml("Learning mode", input.learning_mode)}
        ${rowHtml("Preferred date", input.preferred_date)}
        ${rowHtml("Preferred time", input.preferred_time)}
        ${rowHtml("Booking type", input.booking_type)}
      </table>
      ${input.message ? `<p><strong>Message:</strong><br/>${escapeHtml(input.message)}</p>` : ""}
      <p style="color:#6b6f7d;font-size:12px;margin-top:24px;">Review this booking in the CHEMAMEER admin dashboard.</p>
    </div>
  `;
}

function studentEmailHtml(input: BookingInput, ref: string): string {
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:auto;color:#0a1733;">
      <h2 style="color:#1f4cff;">CHEMAMEER — Your Booking Request Has Been Received</h2>
      <p>Hi ${escapeHtml(input.student_name)},</p>
      <p>We’ve received your ${input.booking_type} booking request. Your reference is:</p>
      <p style="font-family:monospace;font-size:18px;background:#0a1733;color:#2ad4ff;padding:12px 16px;border-radius:6px;display:inline-block;">${ref}</p>
      <p><strong>Summary:</strong></p>
      <ul style="font-size:14px;color:#0a1733;">
        <li>Programme: ${escapeHtml(input.class_or_exam)}</li>
        <li>Subject: ${escapeHtml(input.subject)}</li>
        <li>Booking type: ${input.booking_type}</li>
        <li>Preferred: ${input.preferred_date} at ${input.preferred_time}</li>
      </ul>
      <p>This is a <strong>request</strong> — the academic team will review it and reach out to confirm your slot.</p>
      <p style="color:#6b6f7d;font-size:12px;margin-top:24px;">— The CHEMAMEER Team</p>
    </div>
  `;
}

function rowHtml(label: string, value: string): string {
  return `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#6b6f7d;width:180px;">${escapeHtml(label)}</td><td style="padding:8px 0;border-bottom:1px solid #eee;">${escapeHtml(value)}</td></tr>`;
}

function escapeHtml(s: string): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]!));
}

// ---- CORS ----
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ---- Main handler ----
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // Rate limit by IP.
  const ip = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for") ?? "unknown";
  if (rateLimited(ip)) {
    return new Response(JSON.stringify({ error: "Too many requests. Please try again shortly." }), {
      status: 429, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON." }), {
      status: 400, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // Admin retry mode.
  if ((body as RetryInput)?.mode === "retry_email") {
    return handleRetry((body as RetryInput).booking_id);
  }

  const input = body as BookingInput;
  const errors = validate(input);
  if (Object.keys(errors).length > 0) {
    return new Response(JSON.stringify({ error: "Validation failed.", fieldErrors: errors }), {
      status: 422, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // Honeypot: if message contains obvious spam markers, silently accept but skip email.
  const looksLikeSpam = /viagra|casino|crypto|https?:\/\//i.test(input.message ?? "") && input.message.length > 200;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const booking_reference = generateRef();

  // Insert booking.
  const { data: bookingRow, error: insertError } = await supabase
    .from("bookings")
    .insert({
      booking_reference,
      booking_type: input.booking_type,
      student_name: input.student_name,
      student_email: input.student_email,
      phone_number: input.phone_number,
      guardian_phone: input.guardian_phone ?? null,
      category: input.category,
      class_or_exam: input.class_or_exam,
      subject: input.subject,
      learning_mode: input.learning_mode,
      preferred_date: input.preferred_date,
      preferred_time: input.preferred_time,
      message: input.message ?? null,
      status: "new",
      email_delivered: false,
    })
    .select("id")
    .single();

  if (insertError) {
    return new Response(JSON.stringify({ error: "Could not save booking.", detail: insertError.message }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // Send emails — failures do NOT roll back the booking.
  let emailDelivered = false;
  let emailError: string | null = null;
  if (!looksLikeSpam) {
    try {
      const tasks: Promise<void>[] = [];
      if (ADMIN_NOTIFICATION_EMAIL) {
        tasks.push(
          sendEmail(
            ADMIN_NOTIFICATION_EMAIL,
            `New CHEMAMEER Booking — ${booking_reference}`,
            adminEmailHtml(input, booking_reference),
          ),
        );
      }
      tasks.push(
        sendEmail(
          input.student_email,
          "CHEMAMEER — Your Booking Request Has Been Received",
          studentEmailHtml(input, booking_reference),
        ),
      );
      await Promise.all(tasks);
      emailDelivered = true;
    } catch (err) {
      emailError = err instanceof Error ? err.message : String(err);
    }
  }

  // Update booking record with delivery status.
  await supabase
    .from("bookings")
    .update({ email_delivered: emailDelivered, email_error: emailError })
    .eq("id", bookingRow.id);

  // Record notification rows for audit / retry.
  await supabase.from("booking_notifications").insert([
    {
      booking_id: bookingRow.id,
      channel: "admin_email",
      recipient: ADMIN_NOTIFICATION_EMAIL,
      subject: `New CHEMAMEER Booking — ${booking_reference}`,
      delivered: emailDelivered,
      error: emailError,
      attempted_at: new Date().toISOString(),
      delivered_at: emailDelivered ? new Date().toISOString() : null,
    },
    {
      booking_id: bookingRow.id,
      channel: "student_email",
      recipient: input.student_email,
      subject: "CHEMAMEER — Your Booking Request Has Been Received",
      delivered: emailDelivered,
      error: emailError,
      attempted_at: new Date().toISOString(),
      delivered_at: emailDelivered ? new Date().toISOString() : null,
    },
  ]);

  // Activity log.
  await supabase.from("activity_logs").insert({
    actor: "anon",
    action: "booking_submitted",
    target_booking: bookingRow.id,
    meta: { booking_reference, email_delivered: emailDelivered, email_error: emailError },
  });

  return new Response(
    JSON.stringify({ ok: true, booking_reference, email_delivered: emailDelivered }),
    { status: 200, headers: { ...CORS, "Content-Type": "application/json" } },
  );
});

async function handleRetry(bookingId: string): Promise<Response> {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();
  if (error || !booking) {
    return new Response(JSON.stringify({ ok: false, error: "Booking not found." }), {
      status: 404, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
  try {
    if (ADMIN_NOTIFICATION_EMAIL) {
      await sendEmail(
        ADMIN_NOTIFICATION_EMAIL,
        `New CHEMAMEER Booking — ${booking.booking_reference}`,
        adminEmailHtml(booking as unknown as BookingInput, booking.booking_reference),
      );
    }
    await sendEmail(
      booking.student_email,
      "CHEMAMEER — Your Booking Request Has Been Received",
      studentEmailHtml(booking as unknown as BookingInput, booking.booking_reference),
    );
    await supabase
      .from("bookings")
      .update({ email_delivered: true, email_error: null })
      .eq("id", bookingId);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await supabase
      .from("bookings")
      .update({ email_delivered: false, email_error: msg })
      .eq("id", bookingId);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
}

// =============================================================
// Emails are sent via the Resend REST API (sendEmail above).
// =============================================================
