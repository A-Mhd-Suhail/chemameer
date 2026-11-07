/* CHEMAMEER · Privacy Policy */

import { SectionHeading } from "../components/common/SectionHeading";
import { CONTACT_EMAIL } from "../lib/config";

export function PrivacyPage() {
  return (
    <section className="section" style={{ paddingTop: "calc(var(--header-h) + var(--space-7))" }}>
      <div className="container container--narrow">
        <SectionHeading as="h1" eyebrow="Legal" title="Privacy Policy" />
        <div className="prose" style={{ marginTop: "var(--space-5)" }}>
          <p>
            CHEMAMEER ("we", "us") respects your privacy. This policy explains what we
            collect, why, and how we use it.
          </p>
          <h3>What we collect</h3>
          <p>
            When you submit a booking request, we collect your name, email, phone number,
            parent/guardian phone (if provided), selected programme, and your message.
            We do not collect payment information — we do not process payments.
          </p>
          <h3>How we use it</h3>
          <p>
            We use the information you submit solely to review and respond to your booking
            request. We do not sell or share your information with third parties for marketing.
          </p>
          <h3>Where it lives</h3>
          <p>
            Booking data is stored in our Supabase database, protected by Row Level Security.
            Only authorised administrators can read full booking records.
          </p>
          <h3>Your rights</h3>
          <p>
            You may request access to, correction of, or deletion of your personal data
            by contacting us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
          <p className="muted" style={{ fontSize: "var(--step--2)" }}>
            This is a template policy. Have your legal counsel review and adapt it before
            production deployment.
          </p>
        </div>
      </div>
    </section>
  );
}
