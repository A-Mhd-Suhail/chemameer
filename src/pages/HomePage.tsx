/* =============================================================
   CHEMAMEER · HomePage
   Sections: Hero → ScienceIntro (Scene 1) → ComplexityToClarity
   (Scene 2) → Categories → LearningJourney (Scene 3) → Why Us
   → FAQs → Final CTA
   ============================================================= */

import { Hero } from "../components/hero/Hero";
import { ScienceIntroScene } from "../components/animation/ScienceIntroScene";
import { ComplexityToClarityScene } from "../components/animation/ComplexityToClarityScene";
import { LearningJourneyScene } from "../components/animation/LearningJourneyScene";
import { Categories } from "../components/courses/Categories";
import { WhyUs } from "../components/common/WhyUs";
import { Faq } from "../components/common/Faq";
import { FinalCta } from "../components/common/FinalCta";

export function HomePage() {
  return (
    <>
      <Hero />
      <ScienceIntroScene />
      <ComplexityToClarityScene />
      <Categories />
      <LearningJourneyScene />
      <WhyUs />
      <Faq />
      <FinalCta />
    </>
  );
}
