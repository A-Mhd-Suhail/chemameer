/* =============================================================
   CHEMAMEER · Footer
   ============================================================= */

import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Phone, ShieldCheck } from "lucide-react";
import { BrandMark } from "../common/BrandMark";
import { CONTACT_EMAIL, CONTACT_PHONE } from "../../lib/config";
import "./Footer.css";

const SCHOOL_LINKS = Array.from({ length: 12 }, (_, i) => ({
  label: `Class ${i + 1}`,
  to: `/courses/school-${i + 1}`,
}));

// Year is stable for the lifetime of a page view.
const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  const year = CURRENT_YEAR;
  const location = useLocation();
  const navigate = useNavigate();

  // Hash links (/#why, /#faqs) must scroll even when already on "/" with
  // the same hash — react-router alone would treat it as a no-op.
  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    const scroll = () =>
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(scroll, 220);
    } else {
      scroll();
    }
  };

  return (
    <footer className="site-footer" id="contact">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <BrandMark variant="dark" size={40} />
          <p className="site-footer__tagline">
            Where Science Comes Alive — a premium educational platform for school,
            JEE and NEET learners.
          </p>
          <div className="cluster" style={{ marginTop: "var(--space-3)" }}>
            {CONTACT_EMAIL && (
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="chip site-footer__chip"
                aria-label={`Email us at ${CONTACT_EMAIL}`}
              >
                <Mail size={14} aria-hidden />
                {CONTACT_EMAIL}
              </a>
            )}
            {CONTACT_PHONE && (
              <a
                href={`tel:${CONTACT_PHONE.replace(/[^+\d]/g, "")}`}
                className="chip site-footer__chip"
                aria-label={`Call us at ${CONTACT_PHONE}`}
              >
                <Phone size={14} aria-hidden />
                {CONTACT_PHONE}
              </a>
            )}
          </div>
        </div>

        <div className="site-footer__col">
          <h4 className="site-footer__head">Navigation</h4>
          <ul className="site-footer__list">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li>
              <a href="/#why" onClick={(e) => handleHashClick(e, "why")}>Why Us</a>
            </li>
            <li>
              <a href="/#faqs" onClick={(e) => handleHashClick(e, "faqs")}>FAQs</a>
            </li>
            <li><Link to="/booking">Book a Demo</Link></li>
          </ul>
        </div>

        <div className="site-footer__col">
          <h4 className="site-footer__head">School Education</h4>
          <ul className="site-footer__list site-footer__list--grid">
            {SCHOOL_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="site-footer__col">
          <h4 className="site-footer__head">Exam Tracks</h4>
          <ul className="site-footer__list">
            <li><Link to="/courses/jee">JEE Preparation</Link></li>
            <li><Link to="/courses/neet">NEET Preparation</Link></li>
            <li><Link to="/courses/jee-foundation">JEE Foundation</Link></li>
            <li><Link to="/courses/neet-foundation">NEET Foundation</Link></li>
          </ul>
          <h4 className="site-footer__head" style={{ marginTop: "var(--space-5)" }}>Legal</h4>
          <ul className="site-footer__list">
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms</Link></li>
            <li>
              <Link to="/admin/login" className="site-footer__admin">
                <ShieldCheck size={14} aria-hidden />
                Admin Access
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="site-footer__bar">
        <div className="container site-footer__bar-inner">
          <span>© {year} CHEMAMEER · CHEM ANIMATED. All rights reserved.</span>
          <span className="site-footer__legal">
            <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
