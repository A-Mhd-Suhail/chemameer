/* =============================================================
   CHEMAMEER · Public env config (NO Supabase client import)
   Safe to read on any page — does not pull in @supabase/supabase-js.
   ============================================================= */

export const SITE_URL: string =
  (import.meta.env.VITE_SITE_URL as string | undefined) ??
  (typeof window !== "undefined" ? window.location.origin : "");

export const CONTACT_EMAIL: string =
  (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) ?? "hello@chemameer.example";

export const CONTACT_PHONE: string =
  (import.meta.env.VITE_CONTACT_PHONE as string | undefined) ?? "";

export const SUPABASE_URL: string | undefined =
  import.meta.env.VITE_SUPABASE_URL as string | undefined;

export const SUPABASE_ANON_KEY: string | undefined =
  import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured: boolean = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
