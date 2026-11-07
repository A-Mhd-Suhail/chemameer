/* CHEMAMEER · Terms of Service */

import { SectionHeading } from "../components/common/SectionHeading";
import { CONTACT_EMAIL } from "../lib/config";

export function TermsPage() {
  return (
    <section className="section" style={{ paddingTop: "calc(var(--header-h) + var(--space-7))" }}>
      <div className="container container--narrow">
        <SectionHeading as="h1" eyebrow="Legal" title="Terms of Service" />
        <div className="prose" style={{ marginTop: "var(--space-5)" }}>
          <p>
            By using CHEMAMEER, you agree to these terms.
          </p>
          <h3>Bookings</h3>
          <p>
            Submitting a booking request does not constitute confirmed enrolment. All
            bookings are reviewed by the academic team. Confirmation is provided separately
            by email or phone.
          </p>
          <h3>Accuracy of information</h3>
          <p>
            You agree to provide accurate contact information when submitting a booking
            request. We are not responsible for failed communications resulting from
            incorrect contact details.
          </p>
          <h3>No payments</h3>
          <p>
            CHEMAMEER does not accept payments through this website. Any fee arrangements
            are made separately and confirmed in writing by the academic team.
          </p>
          <h3>Acceptable use</h3>
          <p>
            You agree not to misuse the booking system, submit fraudulent requests, or
            attempt to access administrative features without authorisation.
          </p>
          <h3>Contact</h3>
          <p>
            Questions about these terms can be sent to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
          <p className="muted" style={{ fontSize: "var(--step--2)" }}>
            This is a template terms document. Have your legal counsel review and adapt it
            before production deployment.
          </p>
        </div>
      </div>
    </section>
  );
}
