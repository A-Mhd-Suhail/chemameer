/* CHEMAMEER · 404 NotFoundPage */

import { Link } from "react-router-dom";
import { AtomIcon } from "../components/common/Icons";

export function NotFoundPage() {
  return (
    <section
      className="section section--dark"
      style={{
        paddingTop: "calc(var(--header-h) + var(--space-9))",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div className="container" style={{ textAlign: "center" }}>
        <div style={{ marginBottom: "var(--space-4)", display: "inline-flex" }}>
          <span style={{ color: "var(--cyan)" }}>
            <AtomIcon size={56} />
          </span>
        </div>
        <p className="eyebrow">404</p>
        <h1 className="display" style={{ fontSize: "var(--step-7)", margin: "var(--space-3) 0" }}>
          This page is out of orbit.
        </h1>
        <p className="lead" style={{ margin: "0 auto var(--space-5)", color: "rgba(246,241,230,0.7)" }}>
          The page you’re looking for doesn’t exist — but your learning journey still does.
        </p>
        <div className="cluster cluster--center">
          <Link to="/" className="btn btn--primary btn--lg">Back to home</Link>
          <Link to="/courses" className="btn btn--light btn--lg">Browse programs</Link>
        </div>
      </div>
    </section>
  );
}
