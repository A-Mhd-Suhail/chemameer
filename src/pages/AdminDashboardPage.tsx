/* =============================================================
   CHEMAMEER · AdminDashboardPage
   - Stats summary
   - Searchable, filterable booking list
   - Status update, email retry, CSV export
   ============================================================= */

import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut, Search, Download, RefreshCw, Filter, CheckCircle2, XCircle,
  Clock, CalendarClock, FileText, Inbox, CheckCheck,
} from "lucide-react";
import {
  getAdminSession,
  signOut,
  listBookings,
  updateBookingStatus,
  retryEmail,
  exportBookingsCsv,
  type AdminSession,
} from "../services/adminService";
import type { BookingRecord, BookingStatus } from "../types/booking";
import { BrandMark } from "../components/common/BrandMark";
import "./AdminDashboard.css";

const STATUSES: BookingStatus[] = [
  "new", "pending", "confirmed", "rescheduled", "completed", "enrolled", "cancelled",
];

const STATUS_LABELS: Record<BookingStatus, string> = {
  new: "New",
  pending: "Pending",
  confirmed: "Confirmed",
  rescheduled: "Rescheduled",
  completed: "Completed",
  enrolled: "Enrolled",
  cancelled: "Cancelled",
};

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checking, setChecking] = useState(true);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selected, setSelected] = useState<BookingRecord | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    getAdminSession().then((s) => {
      if (!s) navigate("/admin/login");
      else setSession(s);
      setChecking(false);
    });
  }, [navigate]);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const rows = await listBookings({
        search,
        category: filterCategory,
        status: filterStatus,
        booking_type: filterType,
      });
      setBookings(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings.");
    }
  }, [search, filterCategory, filterStatus, filterType]);

  // Initial + filter-driven data load. State updates happen after `await`,
  // so this is a legitimate data-fetching effect per the React docs.
  useEffect(() => {
    let cancelled = false;
    if (!session) return;
    (async () => {
      try {
        const rows = await listBookings({
          search,
          category: filterCategory,
          status: filterStatus,
          booking_type: filterType,
        });
        if (!cancelled) setBookings(rows);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load bookings.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session, search, filterCategory, filterStatus, filterType]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const byType = {
      demo: bookings.filter((b) => b.booking_type === "demo").length,
      regular: bookings.filter((b) => b.booking_type === "regular").length,
    };
    const byStatus: Record<string, number> = {};
    for (const s of STATUSES) byStatus[s] = 0;
    for (const b of bookings) byStatus[b.status] = (byStatus[b.status] || 0) + 1;
    const failedEmails = bookings.filter((b) => !b.email_delivered).length;
    return { total, byType, byStatus, failedEmails };
  }, [bookings]);

  const handleStatusChange = async (id: string, status: BookingStatus, notesToSave?: string) => {
    try {
      const newNotes = notesToSave !== undefined ? notesToSave : notes;
      await updateBookingStatus(id, status, newNotes);
      await refresh();
      setSelected((s) => (s && s.id === id ? { ...s, status, admin_notes: newNotes ?? null } : s));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status.");
    }
  };

  const handleRetry = async (id: string) => {
    const r = await retryEmail(id);
    if (!r.ok) setError(r.error ?? "Email retry failed.");
    else refresh();
  };

  const handleExport = () => {
    const csv = exportBookingsCsv(bookings);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chemameer-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  if (checking) {
    return (
      <div className="admin-loading">
        <BrandMark variant="dark" size={40} showWordmark={false} />
        <p>Loading dashboard…</p>
      </div>
    );
  }

  // Not authenticated — the auth guard above is redirecting to /admin/login.
  // Render nothing to avoid flashing the dashboard without a session.
  if (!session) return null;

  return (
    <div className="admin-dash">
      <header className="admin-dash__bar">
        <div className="container admin-dash__bar-inner">
          <BrandMark variant="dark" size={32} showWordmark={false} />
          <div className="admin-dash__title">
            <span className="eyebrow">Admin Dashboard</span>
            <h1 className="display">Bookings</h1>
          </div>
          <div className="admin-dash__user">
            <span>{session?.email}</span>
            {session?.preview && <span className="chip admin-dash__preview">preview</span>}
            <button className="btn btn--ghost btn--sm" onClick={handleSignOut}>
              <LogOut size={14} aria-hidden /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container admin-dash__main">
        {/* Stats */}
        <section className="admin-stats">
          <StatCard label="Total enquiries" value={stats.total} icon={Inbox} />
          <StatCard label="Demo bookings" value={stats.byType.demo} icon={CalendarClock} />
          <StatCard label="Regular requests" value={stats.byType.regular} icon={FileText} />
          <StatCard label="New" value={stats.byStatus.new || 0} icon={Clock} accent />
          <StatCard label="Pending confirmation" value={stats.byStatus.pending || 0} icon={Clock} />
          <StatCard label="Confirmed" value={stats.byStatus.confirmed || 0} icon={CheckCheck} accent />
          <StatCard label="Cancelled" value={stats.byStatus.cancelled || 0} icon={XCircle} />
          <StatCard label="Failed emails" value={stats.failedEmails} icon={RefreshCw} warn={stats.failedEmails > 0} />
        </section>

        {/* Filters */}
        <section className="admin-filters card">
          <div className="admin-filters__row">
            <div className="field admin-filters__search">
              <Search size={16} aria-hidden />
              <input
                type="search"
                placeholder="Search by name, email or reference…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="field">
              <Filter size={14} aria-hidden style={{ marginBottom: 4 }} />
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="">All categories</option>
                <option value="school">School</option>
                <option value="jee">JEE</option>
                <option value="neet">NEET</option>
              </select>
            </div>
            <div className="field">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">All types</option>
                <option value="demo">Demo</option>
                <option value="regular">Regular</option>
              </select>
            </div>
            <button className="btn btn--ghost btn--sm" onClick={refresh}>
              <RefreshCw size={14} aria-hidden /> Refresh
            </button>
            <button className="btn btn--dark btn--sm" onClick={handleExport}>
              <Download size={14} aria-hidden /> Export CSV
            </button>
          </div>

          {error && (
            <div className="admin-filters__error" role="alert">
              {error}
            </div>
          )}
        </section>

        {/* Bookings list + detail */}
        <section className="admin-list">
          <div className="admin-list__table-wrap card">
            <table className="admin-list__table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Student</th>
                  <th>Programme</th>
                  <th>Preferred</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="admin-list__empty">
                      No bookings match your filters.
                    </td>
                  </tr>
                )}
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => {
                      setSelected(b);
                      setNotes(b.admin_notes ?? "");
                    }}
                    className={selected?.id === b.id ? "is-selected" : ""}
                  >
                    <td><code>{b.booking_reference}</code></td>
                    <td>
                      <strong>{b.student_name}</strong>
                      <span className="admin-list__sub">{b.student_email}</span>
                    </td>
                    <td>
                      {b.class_or_exam}
                      <span className="admin-list__sub">{b.subject} · {b.learning_mode}</span>
                    </td>
                    <td>
                      {b.preferred_date}
                      <span className="admin-list__sub">{b.preferred_time}</span>
                    </td>
                    <td>
                      <span className="chip">{b.booking_type}</span>
                    </td>
                    <td>
                      <span className={`status-pill status-pill--${b.status}`}>
                        {STATUS_LABELS[b.status]}
                      </span>
                    </td>
                    <td>
                      {b.email_delivered ? (
                        <CheckCircle2 size={16} className="status-ok" aria-label="Delivered" />
                      ) : (
                        <button
                          className="admin-list__retry"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRetry(b.id);
                          }}
                          title="Retry email"
                        >
                          <RefreshCw size={14} />
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <aside className="admin-detail card">
              <header className="admin-detail__head">
                <div>
                  <p className="eyebrow">{selected.booking_reference}</p>
                  <h2 className="display admin-detail__name">{selected.student_name}</h2>
                </div>
                <span className={`status-pill status-pill--${selected.status}`}>
                  {STATUS_LABELS[selected.status]}
                </span>
              </header>

              <dl className="admin-detail__dl">
                <div><dt>Email</dt><dd><a href={`mailto:${selected.student_email}`}>{selected.student_email}</a></dd></div>
                <div><dt>Phone</dt><dd><a href={`tel:${selected.phone_number}`}>{selected.phone_number}</a></dd></div>
                {selected.guardian_phone && (
                  <div><dt>Guardian</dt><dd>{selected.guardian_phone}</dd></div>
                )}
                <div><dt>Category</dt><dd>{selected.category}</dd></div>
                <div><dt>Class/Exam</dt><dd>{selected.class_or_exam}</dd></div>
                <div><dt>Subject</dt><dd>{selected.subject}</dd></div>
                <div><dt>Mode</dt><dd>{selected.learning_mode}</dd></div>
                <div><dt>Preferred</dt><dd>{selected.preferred_date} at {selected.preferred_time}</dd></div>
                <div><dt>Type</dt><dd>{selected.booking_type}</dd></div>
                <div><dt>Created</dt><dd>{new Date(selected.created_at).toLocaleString()}</dd></div>
                {selected.message && (
                  <div className="admin-detail__msg"><dt>Message</dt><dd>{selected.message}</dd></div>
                )}
              </dl>

              <div className="admin-detail__actions">
                <label className="field__label" htmlFor="admin-notes">Internal notes</label>
                <textarea
                  id="admin-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes for the team (not visible to the student)"
                />
                <div className="admin-detail__status-row">
                  <label htmlFor="status-select" className="field__label">Update status</label>
                  <select
                    id="status-select"
                    value={selected.status}
                    onChange={(e) => handleStatusChange(selected.id, e.target.value as BookingStatus)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                <div className="cluster">
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => handleStatusChange(selected.id, selected.status, notes)}
                  >
                    Save notes
                  </button>
                  {!selected.email_delivered && (
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => handleRetry(selected.id)}
                    >
                      <RefreshCw size={14} aria-hidden /> Retry email
                    </button>
                  )}
                </div>
              </div>
            </aside>
          )}
        </section>
      </main>
    </div>
  );
}

/* ---------- StatCard ---------- */

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ size?: number }>;
  accent?: boolean;
  warn?: boolean;
}

function StatCard({ label, value, icon: Icon, accent, warn }: StatCardProps) {
  return (
    <div className={`stat-card ${accent ? "stat-card--accent" : ""} ${warn ? "stat-card--warn" : ""}`}>
      <span className="stat-card__icon" aria-hidden>
        <Icon size={18} />
      </span>
      <div>
        <span className="stat-card__value">{value}</span>
        <span className="stat-card__label">{label}</span>
      </div>
    </div>
  );
}
