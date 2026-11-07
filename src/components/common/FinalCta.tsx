/* =============================================================
   CHEMAMEER · Final CTA section
   ============================================================= */

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "./FinalCta.css";

export function FinalCta() {
  return (
    <section className="section section--dark final-cta" aria-labelledby="final-cta-title">
      <div className="container final-cta__inner">
        <p className="eyebrow">Start Learning Differently</p>
        <h2 id="final-cta-title" className="display final-cta__title">
          Your journey into clearer science starts today.
        </h2>
        <p className="final-cta__lead">
          Book a demo class — we’ll walk you through the format, answer your questions,
          and confirm a slot that works for you.
        </p>
        <div className="cluster cluster--center">
          <Link to="/booking" className="btn btn--primary btn--lg">
            Book Your Demo Class
            <span className="btn__icon"><ArrowRight size={18} aria-hidden /></span>
          </Link>
          <Link to="/courses" className="btn btn--ghost btn--lg">
            Browse Programs
          </Link>
        </div>
      </div>
    </section>
  );
}
