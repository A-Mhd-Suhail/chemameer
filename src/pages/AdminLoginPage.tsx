/* =============================================================
   CHEMAMEER · AdminLoginPage
   - Supabase Auth (email + password)
   - Falls back to a clearly-marked "local preview" mode when
     Supabase is not configured, so the dashboard is reviewable
     without secrets.
   - No hardcoded credentials.
   ============================================================= */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, AlertCircle, Lock, Mail } from "lucide-react";
import { BrandMark } from "../components/common/BrandMark";
import { isSupabaseConfigured, getSupabase } from "../lib/supabase";
import "./AdminLogin.css";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setBusy(true);
    try {
      const sb = await getSupabase();
      if (isSupabaseConfigured && sb) {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message);
          return;
        }
        // Successful auth → dashboard verifies admin role server-side.
        navigate("/admin/dashboard");
        return;
      }

      // Local preview fallback (clearly marked, not a real auth).
      // Never used in production with Supabase configured.
      sessionStorage.setItem("chemameer:admin:preview", "1");
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="admin-login" style={{ paddingTop: "calc(var(--header-h) + var(--space-9))" }}>
      <div className="container container--narrow">
        <div className="admin-login__card">
          <div className="admin-login__brand">
            <BrandMark variant="dark" size={36} showWordmark={false} />
            <p className="eyebrow">Admin Access</p>
            <h1 className="display admin-login__title">Sign in to the dashboard</h1>
            <p className="admin-login__hint">
              CHEMAMEER admin access is restricted to authorised staff.
            </p>
          </div>

          {!isSupabaseConfigured && (
            <div className="admin-login__notice" role="status">
              <AlertCircle size={18} aria-hidden />
              <div>
                <strong>Local preview mode.</strong>
                <p>
                  Supabase is not configured. The dashboard will display mock data so you
                  can review the experience. Configure <code>VITE_SUPABASE_URL</code> and
                  <code> VITE_SUPABASE_ANON_KEY</code> to enable real auth.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="admin-login__error" role="alert">
              <AlertCircle size={18} aria-hidden />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-login__form">
            <div className="field">
              <label className="field__label" htmlFor="admin-email">
                <Mail size={14} aria-hidden /> Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="admin-password">
                <Lock size={14} aria-hidden /> Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn--primary btn--lg btn--block"
              disabled={busy}
              aria-busy={busy}
            >
              <ShieldCheck size={18} aria-hidden />
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="admin-login__foot">
            Admin accounts are created manually by the project owner. See the README for
            the secure admin setup process.
          </p>
        </div>
      </div>
    </section>
  );
}
