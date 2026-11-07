/* =============================================================
   CHEMAMEER · BookingSuccessPage
   ============================================================= */

import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, CalendarClock, Mail, ArrowRight } from "lucide-react";
import { CONTACT_EMAIL } from "../lib/config";
import "./BookingSuccessPage.css";

export function BookingSuccessPage() {
  const [params] = useSearchParams();
  const ref = params.get("ref") ?? "—";

  return (
    <section className="section booking-success" style={{ paddingTop: "calc(var(--header-h) + var(--space-9))" }}>
      <div className="container container--narrow booking-success__inner">
        <div className="booking-success__icon" aria-hidden>
          <CheckCircle2 size={56} />
        </div>
        <p className="eyebrow">Request received</p>
        <h1 className="display booking-success__title">
          We’ve got your booking request.
        </h1>
        <p className="lead booking-success__lead">
          Your reference is <strong className="booking-success__ref">{ref}</strong>.
          Please keep it for follow-up — the academic team will reach out shortly to
          confirm your slot.
        </p>

        <div className="booking-success__cards">
          <div className="booking-success__card">
            <CalendarClock size={24} aria-hidden />
            <h3>What happens next</h3>
            <p>The academic team reviews your request and contacts you to confirm a slot.</p>
          </div>
          <div className="booking-success__card">
            <Mail size={24} aria-hidden />
            <h3>Confirmation by email</h3>
            <p>
              You’ll receive a confirmation email at the address you provided.
              {CONTACT_EMAIL && (
                <>
                  {" "}
                  Didn’t get it? Reach us at{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="cluster cluster--center" style={{ marginTop: "var(--space-6)" }}>
          <Link to="/courses" className="btn btn--primary btn--lg">
            Browse more programs
            <ArrowRight size={16} aria-hidden />
          </Link>
          <Link to="/" className="btn btn--ghost btn--lg">
            Back to home
          </Link>
        </div>

        <p className="booking-success__note">
          This is a request — your booking is <strong>not yet confirmed</strong> until
          the academic team reaches out.
        </p>
      </div>
    </section>
  );
}
