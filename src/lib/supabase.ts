/* =============================================================
   CHEMAMEER · Supabase client (lazy)
   The @supabase/supabase-js library is loaded on first call to
   getSupabase(), so the homepage never pays the ~55 KB gzip cost.
   Until then, only the env-config module is loaded.
   ============================================================= */

import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

export { isSupabaseConfigured };

export type QueryBuilder = {
  select: (cols?: string) => QueryBuilder;
  order: (col: string, opts?: { ascending?: boolean }) => QueryBuilder;
  eq: (col: string, val: unknown) => QueryBuilder;
  or: (filter: string) => QueryBuilder;
  update: (payload: Record<string, unknown>) => QueryBuilder;
  then: <T>(onFulfilled: (value: { data: T[] | null; error: { message: string } | null }) => unknown) => unknown;
};

export type SupabaseLike = {
  auth: {
    getSession: () => Promise<{ data: { session: { user: { email?: string } | null } | null } }>;
    signInWithPassword: (creds: { email: string; password: string }) => Promise<{ error: { message: string } | null }>;
    signOut: () => Promise<unknown>;
  };
  from: (table: string) => QueryBuilder;
  functions: { invoke: (name: string, opts: { body: unknown }) => Promise<{ data: Record<string, unknown>; error: { message: string } | null }> };
};

let _clientPromise: Promise<SupabaseLike | null> | null = null;

/** Lazy Supabase client — created on first call. */
export function getSupabase(): Promise<SupabaseLike | null> {
  if (!isSupabaseConfigured) return Promise.resolve(null);
  if (!_clientPromise) {
    _clientPromise = import("@supabase/supabase-js").then(({ createClient }) => {
      return createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
        auth: { persistSession: true, autoRefreshToken: true },
      }) as unknown as SupabaseLike;
    });
  }
  return _clientPromise;
}

// Re-export env reads for components that previously imported them from here.
export { SITE_URL, CONTACT_EMAIL, CONTACT_PHONE } from "./config";
