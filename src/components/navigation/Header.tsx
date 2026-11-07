/* =============================================================
   CHEMAMEER · Header / Navigation
   - Sticky premium header with scroll-aware background
   - Mega menu (click + keyboard + Escape + touch)
   - Mobile drawer
   - All routes wired to react-router
   ============================================================= */

import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, CalendarCheck } from "lucide-react";
import { BrandMark } from "../common/BrandMark";
import { SCHOOL_COURSES, JEE_COURSES, NEET_COURSES } from "../../data/catalog";
import "./Header.css";

type MenuId = "classes" | "experience" | null;

const NAV_ITEMS = [
  { label: "Home", to: "/", type: "link" as const },
  { label: "About", to: "/about", type: "link" as const },
  { label: "Classes", menuId: "classes" as const, type: "menu" as const },
  { label: "Experience", menuId: "experience" as const, type: "menu" as const },
  { label: "Why Us", to: "/#why", type: "link" as const },
  { label: "FAQs", to: "/#faqs", type: "link" as const },
  { label: "Contact", to: "/#contact", type: "link" as const },
];

const EXPERIENCE_MENU = [
  { title: "Visual Learning", blurb: "Animated concept storytelling.", to: "/#experience-visual" },
  { title: "Interactive Learning", blurb: "Hands-on guided problems.", to: "/#experience-interactive" },
  { title: "Concept Understanding", blurb: "First-principles explanations.", to: "/#experience-concept" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuId>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll-aware background.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus when the route changes (adjust-during-render pattern).
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setOpenMenu(null);
    setMobileOpen(false);
  }

  // Escape closes everything.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Click outside closes the mega menu.
  useEffect(() => {
    if (!openMenu) return;
    const onPointer = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [openMenu]);

  // Lock body scroll when mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const toggleMenu = useCallback((id: MenuId) => {
    setOpenMenu((cur) => (cur === id ? null : id));
  }, []);

  const handleNavClick = useCallback(
    (to: string) => {
      if (to.startsWith("/#")) {
        const hash = to.slice(2);
        if (location.pathname !== "/") {
          navigate("/");
          setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 220);
        } else {
          document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
        }
      } else if (to === "/") {
        // "Home" must actually navigate when we're on another page —
        // previously it only scrolled, leaving the user stuck on e.g. /about.
        if (location.pathname !== "/") {
          navigate("/");
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else {
        navigate(to);
      }
      setOpenMenu(null);
      setMobileOpen(false);
    },
    [location.pathname, navigate],
  );

  return (
    <header
      ref={headerRef}
      className={`site-header ${scrolled ? "is-scrolled" : ""} ${openMenu ? "menu-open" : ""}`}
    >
      <div className="site-header__inner container">
        <div className="site-header__left">
          <BrandMark variant="dark" size={36} />
        </div>

        <nav className="site-header__nav" aria-label="Primary">
          <ul className="site-header__list">
            {NAV_ITEMS.map((item) => {
              if (item.type === "link") {
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      className="nav-link site-header__link"
                      onClick={() => handleNavClick(item.to)}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              }
              const isOpen = openMenu === item.menuId;
              return (
                <li key={item.label} className="site-header__hasmenu">
                  <button
                    type="button"
                    className={`nav-link site-header__link ${isOpen ? "is-active" : ""}`}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={() => toggleMenu(item.menuId!)}
                  >
                    {item.label}
                    <ChevronDown size={14} style={{ marginLeft: 4, opacity: 0.7 }} />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="site-header__right">
          <Link to="/booking" className="btn btn--primary btn--sm site-header__cta">
            <CalendarCheck size={16} aria-hidden />
            Book a Demo Class
          </Link>
          <button
            type="button"
            className="site-header__burger"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mega menu — Classes */}
      {openMenu === "classes" && (
        <div className="mega" role="menu" aria-label="Classes menu">
          <div className="mega__inner container">
            <div className="mega__group">
              <div className="mega__head">
                <p className="eyebrow">School Education</p>
                <h3 className="display mega__title">Classes 1–12</h3>
                <p className="mega__hint">Pick a grade to see subjects &amp; book a demo.</p>
              </div>
              <div className="mega__grid mega__grid--12">
                {SCHOOL_COURSES.map((c) => (
                  <Link
                    key={c.id}
                    to={`/courses/${c.id}`}
                    className="mega__cell"
                    role="menuitem"
                    onClick={() => setOpenMenu(null)}
                  >
                    <span className="mega__cellnum">{c.level.replace("Class ", "")}</span>
                    <span className="mega__celllabel">Class</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="mega__divider" aria-hidden />
            <div className="mega__group mega__group--exam">
              <Link
                to="/courses/jee"
                className="mega__exam"
                role="menuitem"
                onClick={() => setOpenMenu(null)}
              >
                <p className="eyebrow">Exam Track</p>
                <h4 className="display">JEE Preparation</h4>
                <p className="mega__hint">
                  {JEE_COURSES.map((c) => c.level).join(" · ")}
                </p>
              </Link>
              <Link
                to="/courses/neet"
                className="mega__exam"
                role="menuitem"
                onClick={() => setOpenMenu(null)}
              >
                <p className="eyebrow">Exam Track</p>
                <h4 className="display">NEET Preparation</h4>
                <p className="mega__hint">
                  {NEET_COURSES.map((c) => c.level).join(" · ")}
                </p>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mega menu — Experience */}
      {openMenu === "experience" && (
        <div className="mega mega--narrow" role="menu" aria-label="Experience menu">
          <div className="mega__inner container">
            <div className="mega__exp-grid">
              {EXPERIENCE_MENU.map((m) => (
                <button
                  key={m.title}
                  type="button"
                  className="mega__exp"
                  role="menuitem"
                  onClick={() => handleNavClick(m.to)}
                >
                  <p className="eyebrow">Experience</p>
                  <h4 className="display">{m.title}</h4>
                  <p className="mega__hint">{m.blurb}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onNavigate={(to) => handleNavClick(to)}
      />
    </header>
  );
}

/* ---------- Mobile drawer ---------- */

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (to: string) => void;
}

function MobileDrawer({ open, onClose, onNavigate }: DrawerProps) {
  const [tab, setTab] = useState<"main" | "school" | "jee" | "neet">("main");
  // Reset the tab when the drawer closes (adjust-during-render pattern).
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) setTab("main");
  }
  return (
    <div
      className={`drawer ${open ? "is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      <button
        type="button"
        className="drawer__backdrop"
        aria-label="Close menu"
        onClick={onClose}
        tabIndex={-1}
      />
      <div className="drawer__panel">
        <div className="drawer__head">
          {/* "dark" variant = ivory wordmark, legible on the navy drawer panel */}
          <BrandMark variant="dark" size={32} />
          <button type="button" className="drawer__close" onClick={onClose} aria-label="Close menu">
            <X size={22} />
          </button>
        </div>
        <div className="drawer__body">
          {tab === "main" && (
            <>
              <button className="drawer__link" onClick={() => onNavigate("/")}>Home</button>
              <button className="drawer__link" onClick={() => onNavigate("/about")}>About</button>
              <button
                className="drawer__link drawer__link--expand"
                onClick={() => setTab("school")}
              >
                Classes <ChevronDown size={16} />
              </button>
              <button
                className="drawer__link drawer__link--expand"
                onClick={() => setTab("jee")}
              >
                JEE Preparation <ChevronDown size={16} />
              </button>
              <button
                className="drawer__link drawer__link--expand"
                onClick={() => setTab("neet")}
              >
                NEET Preparation <ChevronDown size={16} />
              </button>
              <button className="drawer__link" onClick={() => onNavigate("/#why")}>Why Us</button>
              <button className="drawer__link" onClick={() => onNavigate("/#faqs")}>FAQs</button>
              <button className="drawer__link" onClick={() => onNavigate("/#contact")}>Contact</button>
              <Link to="/booking" className="btn btn--primary btn--block" onClick={onClose}>
                Book a Demo Class
              </Link>
            </>
          )}
          {tab === "school" && (
            <>
              <button className="drawer__back" onClick={() => setTab("main")}>← Back</button>
              <p className="eyebrow" style={{ margin: "0.75rem 0 0.5rem" }}>Classes 1–12</p>
              <div className="drawer__grid">
                {SCHOOL_COURSES.map((c) => (
                  <Link key={c.id} to={`/courses/${c.id}`} className="drawer__cell" onClick={onClose}>
                    {c.level.replace("Class ", "")}
                  </Link>
                ))}
              </div>
            </>
          )}
          {tab === "jee" && (
            <>
              <button className="drawer__back" onClick={() => setTab("main")}>← Back</button>
              <p className="eyebrow" style={{ margin: "0.75rem 0 0.5rem" }}>JEE Preparation</p>
              {JEE_COURSES.map((c) => (
                <Link key={c.id} to={`/courses/${c.id}`} className="drawer__exam" onClick={onClose}>
                  <strong>{c.level}</strong>
                  <span className="muted">{c.blurb}</span>
                </Link>
              ))}
            </>
          )}
          {tab === "neet" && (
            <>
              <button className="drawer__back" onClick={() => setTab("main")}>← Back</button>
              <p className="eyebrow" style={{ margin: "0.75rem 0 0.5rem" }}>NEET Preparation</p>
              {NEET_COURSES.map((c) => (
                <Link key={c.id} to={`/courses/${c.id}`} className="drawer__exam" onClick={onClose}>
                  <strong>{c.level}</strong>
                  <span className="muted">{c.blurb}</span>
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
