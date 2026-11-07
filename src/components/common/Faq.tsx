/* =============================================================
   CHEMAMEER · FAQ accordion
   ============================================================= */

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { FAQS } from "../../data/faqs";
import { SectionHeading } from "../common/SectionHeading";
import "./Faq.css";

export function Faq() {
  const [open, setOpen] = useState<string | null>(FAQS[0]?.id ?? null);

  return (
    <section className="section faq" id="faqs" aria-labelledby="faq-title">
      <div className="container container--narrow">
        <SectionHeading
          eyebrow="FAQs"
          title="Frequently asked questions"
          align="center"
        />

        <ul className="faq__list">
          {FAQS.map((f) => {
            const isOpen = open === f.id;
            return (
              <li key={f.id} className={`faq__item ${isOpen ? "is-open" : ""}`}>
                <button
                  type="button"
                  className="faq__trigger"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${f.id}`}
                  id={`faq-trigger-${f.id}`}
                  onClick={() => setOpen(isOpen ? null : f.id)}
                >
                  <span className="faq__q">{f.question}</span>
                  <span className="faq__icon" aria-hidden>
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                  </span>
                </button>
                <div
                  id={`faq-panel-${f.id}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${f.id}`}
                  className="faq__panel"
                  hidden={!isOpen}
                >
                  <p className="faq__a">{f.answer}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
