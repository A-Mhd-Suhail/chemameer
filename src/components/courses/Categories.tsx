/* =============================================================
   CHEMAMEER · Categories section (3 cards: School, JEE, NEET)
   ============================================================= */

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "../../data/catalog";
import { AtomIcon, BookIcon, DnaIcon } from "../common/Icons";
import "./Categories.css";

const ICON_MAP = { school: BookIcon, atom: AtomIcon, dna: DnaIcon };

const CATEGORY_LINKS: Record<string, string> = {
  school: "/courses/school",
  jee: "/courses/jee",
  neet: "/courses/neet",
};

export function Categories() {
  return (
    <section className="section categories" id="categories" aria-labelledby="categories-title">
      <div className="container">
        <div className="categories__head">
          <p className="eyebrow">Learning Categories</p>
          <h2 id="categories-title" className="display categories__title">
            Three paths. One philosophy: clarity first.
          </h2>
        </div>

        <div className="categories__grid">
          {CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon];
            return (
              <Link key={cat.id} to={CATEGORY_LINKS[cat.id]} className="category-card">
                <div className="category-card__icon">
                  <Icon size={32} />
                </div>
                <p className="eyebrow category-card__eyebrow">{cat.short}</p>
                <h3 className="display category-card__title">{cat.label}</h3>
                <p className="category-card__blurb">{cat.blurb}</p>
                <span className="category-card__cta">
                  Explore
                  <ArrowRight size={16} aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
