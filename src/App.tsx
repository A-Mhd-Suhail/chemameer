/* =============================================================
   CHEMAMEER · App router
   - Header + Footer wrap all routes
   - Admin routes are lazy-loaded (code-split) — never loaded on
     the homepage's critical path
   - ScrollToTop on route change
   ============================================================= */

import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Header } from "./components/navigation/Header";
import { Footer } from "./components/footer/Footer";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { CoursesPage } from "./pages/CoursesPage";
import { CourseCategoryPage } from "./pages/CourseCategoryPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { BookingPage } from "./pages/BookingPage";
import { BookingSuccessPage } from "./pages/BookingSuccessPage";
import { LoadingScreen } from "./components/common/LoadingScreen";

// Lazy-load admin bundle — keeps it out of the initial JS payload.
const AdminLoginPage = lazy(() =>
  import("./pages/AdminLoginPage").then((m) => ({ default: m.AdminLoginPage })),
);
const AdminDashboardPage = lazy(() =>
  import("./pages/AdminDashboardPage").then((m) => ({ default: m.AdminDashboardPage })),
);
const PrivacyPage = lazy(() =>
  import("./pages/PrivacyPage").then((m) => ({ default: m.PrivacyPage })),
);
const TermsPage = lazy(() =>
  import("./pages/TermsPage").then((m) => ({ default: m.TermsPage })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // /#section links: wait a frame so lazy content exists, then scroll
      // to the target element instead of the top of the page.
      const id = hash.slice(1);
      const frame = requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      });
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <ScrollToTop />
      <Header />
      <main id="main">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/school" element={<CourseCategoryPage />} />
            <Route path="/courses/jee" element={<CourseCategoryPage />} />
            <Route path="/courses/neet" element={<CourseCategoryPage />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/booking/success" element={<BookingSuccessPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
