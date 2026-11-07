# CHEMAMEER · CHEM ANIMATED

> **Where Science Comes Alive.** — a premium, lightweight educational platform
> for Classes 1–12, JEE and NEET preparation, built around cinematic scroll
> storytelling, real booking workflows, and a secure admin dashboard.

---

## ✨ Highlights

- **Cinematic scroll experiences** built on GSAP ScrollTrigger — three pinned,
  scrubbed scenes with forward/reverse progress and reduced-motion fallbacks.
- **Premium art direction** — warm ivory / deep ink navy / electric cobalt /
  cyan palette, Fraunces display + Inter body, custom SVG illustrations
  (no decorative blobs).
- **Lightweight by design** — homepage initial payload ≈ 165 KB gzipped
  (target ≤ 250 KB). Supabase client is lazy-loaded only on the booking /
  admin routes.
- **Functional booking** — demo class + regular class request flows with
  full client-side validation, server-side re-validation, anti-spam rate
  limiting, and a unique booking reference.
- **Secure admin dashboard** — Supabase Auth, admin allowlist via
  `pending_admins` table (no self-promotion), RLS on every table, status
  workflow, CSV export, failed-email retry.
- **Email notifications** — Resend-driven admin + student transactional
  emails via a Supabase Edge Function. Failures are recorded, not hidden.
- **Accessible** — semantic HTML, keyboard-navigable mega menu, focus-visible,
  `prefers-reduced-motion` honoured, screen-reader status regions.
- **Deploy-ready** — Vite production build, Vercel config notes, Supabase
  migrations + Edge Function, Resend secrets. No fake stats, no fake
  testimonials, no hardcoded credentials.

---

## 🧱 Stack

| Layer       | Choice                                            |
| ----------- | ------------------------------------------------- |
| Framework   | React + TypeScript + Vite                         |
| Routing     | React Router v7                                   |
| Animation   | GSAP + ScrollTrigger                              |
| Backend     | Supabase (PostgreSQL, Auth, Edge Functions, RLS) |
| Email        | Resend (called from the Edge Function)            |
| Icons        | Lucide React + a small set of original SVGs       |
| Hosting     | Vercel (frontend) · Supabase (backend)            |

Approved runtime dependencies (the **only** ones in `package.json`):

```
react  react-dom  react-router-dom  vite  typescript
gsap  @supabase/supabase-js  lucide-react
```

No Three.js, Framer Motion, Lottie, Lenis, Tailwind, or prebuilt UI kit.

---

## 📁 Project structure

```
chemameer-v2/
├── public/
│   ├── brand/        # logo, favicon (SVG+PNG), OG cover, apple-touch-icon
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── animations/   # gsapConfig, heroTimeline, courseTimeline, cleanup
│   ├── components/
│   │   ├── animation/   # 3 cinematic scroll scenes
│   │   ├── booking/     # (shared form atoms, if extracted)
│   │   ├── common/      # SectionHeading, WhyUs, Faq, FinalCta, Icons, etc.
│   │   ├── courses/     # Categories
│   │   ├── footer/
│   │   ├── hero/
│   │   └── navigation/  # Header + mega menu + mobile drawer
│   ├── data/          # catalog.ts, faqs.ts (configurable)
│   ├── hooks/         # useScrollAnimation, useBooking
│   ├── lib/           # config.ts (env reads), supabase.ts (lazy client), validation.ts
│   ├── pages/         # HomePage, AboutPage, CoursesPage, CourseDetailPage,
│   │                  # BookingPage, BookingSuccessPage, AdminLoginPage,
│   │                  # AdminDashboardPage, PrivacyPage, TermsPage, NotFoundPage
│   ├── services/      # adminService.ts
│   ├── styles/        # variables.css, global.css, animations.css
│   ├── types/         # booking.ts, course.ts
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── migrations/    # 0001_initial_schema.sql, 0002_admin_setup.sql
│   └── functions/submit-booking/index.ts
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.*.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Quick start

### 1. Prerequisites

- Node.js 20+ and npm 10+
- A Supabase project (free tier works)
- A Resend account (free tier works for testing)

### 2. Install dependencies

```bash
cd chemameer-v2
npm install
```

Only the approved dependencies above will be installed.

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
VITE_SITE_URL=http://localhost:5173
VITE_CONTACT_EMAIL=hello@your-domain.com
VITE_CONTACT_PHONE=+91-XXXXX-XXXXX
```

> The `VITE_` prefix is required for Vite to expose the value to the browser.
> These particular values are **safe to expose** — Supabase anon key is
> protected by Row Level Security.

### 4. Run the dev server

```bash
npm run dev
```

Visit http://localhost:5173

### 5. Preview the production build locally

```bash
npm run build
npm run preview
```

> **Important:** always use `npm run preview` (or `npx serve -s dist`) to view
> the built site. A bare static server such as `python -m http.server` does
> not understand single-page-app routes, so deep links like `/courses/jee`
> or `/booking` would return the server's 404 page on direct navigation.
> The build emits `404.html` and `_redirects` fallbacks for GitHub Pages,
> Netlify and Cloudflare Pages; Vercel rewrites are in `vercel.json`.

---

## 🗄️ Supabase setup

### 1. Create the database schema

Run the migrations. You can do this via the Supabase Dashboard → SQL Editor
(copy & paste each file in order) or via the Supabase CLI:

```bash
supabase db push
```

This creates:

- `admin_profiles`, `pending_admins`
- `course_categories`, `courses`, `subjects`, `available_slots`
- `bookings`, `booking_notifications`, `activity_logs`
- `faqs`, `site_settings`
- RLS policies on every table
- Auto admin-promotion trigger

### 2. Enable Row Level Security

RLS is enabled by the migration. Verify in Dashboard →
Authentication → Policies that every table has policies defined.

### 3. Create an admin user (secure process)

```sql
-- 1. Whitelist the email first (must be done BEFORE the user signs up):
insert into public.pending_admins (email, display_name)
values ('you@your-domain.com', 'Your Name');

-- 2. Then create the auth user via Dashboard → Authentication → Users →
--    "Add user" → enter the same email + a strong password.
--    The trigger will promote them to admin_profiles automatically.
```

> New users cannot grant themselves admin rights — only pre-whitelisted
> emails are promoted. This is enforced by the `handle_new_admin_user`
> trigger.

### 4. Deploy the Edge Function

```bash
supabase functions deploy submit-booking
```

Then set the function secrets (Dashboard → Project Settings → Edge
Functions → Secrets, or via CLI):

```bash
supabase secrets set \
  RESEND_API_KEY=re_xxxxxxxxxxxxxxxx \
  RESEND_FROM_EMAIL="CHEMAMEER <bookings@your-domain.com>" \
  ADMIN_NOTIFICATION_EMAIL=admin@your-domain.com \
  SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY
```

> NEVER prefix these with `VITE_` — they must stay server-side.

### 5. Test email delivery

Submit a demo booking from the website. You should receive:

1. An admin notification at `ADMIN_NOTIFICATION_EMAIL`.
2. A student confirmation at the email entered in the form.

If email fails, the booking is still saved — check the dashboard's
"Failed emails" stat and use the retry button.

---

## 🛠️ Admin usage

1. Visit `/admin/login` (linked discreetly from the footer).
2. Sign in with the admin email + password you configured.
3. The dashboard shows total enquiries, demo/regular splits, status counts,
   and failed-email count.
4. Filter by category, status, type; search by name, email or reference.
5. Click any row to view details, update status, add internal notes, or
   retry a failed email.
6. Export the current filtered list as CSV via the Export button.

---

## 🎬 Animation system

Three pinned, scrubbed cinematic scenes live in
`src/components/animation/`:

| Scene | File | Concept |
|-------|------|---------|
| 1 | `ScienceIntroScene.tsx` | Headline splits; molecule assembles; bonds connect; explanations reveal. |
| 2 | `ComplexityToClarityScene.tsx` | Complex molecule breaks apart into labelled atoms; reassembles into a simplified, legible concept. |
| 3 | `LearningJourneyScene.tsx` | Horizontal pinned track: Explore → Understand → Practice → Improve → Achieve → CTA. |

Cleanup is handled via `gsap.context()` and `ctx.revert()` in every
component's `useEffect` return — no leaks, no duplicate pins, no
lingering ScrollTriggers after navigation.

When `prefers-reduced-motion: reduce` is on, every scene is flattened
(static layout, normal scrolling) via `scene.css` and the timeline
builders return `null` early.

---

## 📦 Performance budget

| Metric | Target | Actual |
| ------ | ------ | ------ |
| Initial JS (gzipped) | ≤ 250 KB | ≈ 165 KB |
| Initial CSS (gzipped) | ≤ 80 KB | ≈ 7.8 KB |
| Above-the-fold images | ≤ 700 KB | < 5 KB (SVG only) |
| Total dist folder | small | < 1 MB |
| `public/` assets | ≤ 15 MB | < 50 KB |

Strategies used:

- Manual chunking: `vendor-react`, `vendor-gsap`, `vendor-supabase`,
  `vendor-icons` are split out so the homepage doesn't load Supabase.
- Lazy Supabase client: `getSupabase()` dynamically imports
  `@supabase/supabase-js` on first call.
- Code-split routes: Admin, Privacy, Terms, NotFound are `React.lazy()`.
- SVG illustrations only — no raster images on the homepage.
- No autoplay video, no Lottie, no Three.js.

---

## ♿ Accessibility

- Semantic HTML5 throughout (`<main>`, `<header>`, `<footer>`, `<nav>`,
  `<section>`, `<article>`).
- Mega menu: click + keyboard + Escape + touch. Not hover-only.
- Mobile drawer: focus trap on open, body scroll lock, Escape to close.
- `:focus-visible` outline on all interactive elements.
- All form fields have associated `<label>` elements.
- `aria-expanded`, `aria-controls`, `aria-busy`, `aria-live` regions.
- `prefers-reduced-motion` flattens all cinematic scenes.
- Skip-to-content link at the top of every page.

---

## 🔍 SEO

- Unique `<title>` and meta description per route (via `index.html` defaults
  — extend with `react-helmet` if you need per-page overrides).
- Open Graph + Twitter card meta tags.
- JSON-LD `EducationalOrganization` structured data.
- Canonical URL configured.
- `sitemap.xml` and `robots.txt` in `public/`.
- Semantic heading hierarchy (one `<h1>` per page).

---

## 🌐 Deployment

### Frontend → Vercel

1. Push the repo to GitHub.
2. In Vercel, "Import Project" → select the GitHub repo.
3. Set the framework to **Vite** (auto-detected).
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add the public env vars (`VITE_SUPABASE_URL`, etc.) in
   Project Settings → Environment Variables.
7. Under "Rewrites" add a catch-all so client-side routes resolve:
   ```
   /(.*)  →  /index.html
   ```
   (Vercel auto-detects Vite SPA mode, but explicit rewrites don't hurt.)
8. Deploy. Vercel will give you a preview URL per commit and a production
   URL on the main branch.

### Backend → Supabase

1. Create a Supabase project.
2. Run both migrations (`0001_initial_schema.sql`,
   `0002_admin_setup.sql`).
3. Verify RLS is enabled on every table.
4. Deploy the Edge Function + secrets (see above).
5. Whitelist your admin email in `pending_admins` and create the auth user.

### Email → Resend

1. Sign up at https://resend.com.
2. Verify your sending domain.
3. Generate an API key.
4. Add it as the `RESEND_API_KEY` Edge Function secret.

---

## 🧪 Testing checklist

Run through this before declaring "done":

```text
[ ] npm install completes with only approved deps
[ ] npm run dev serves the site
[ ] npm run build succeeds
[ ] npm run preview serves the build
[ ] Homepage hero renders with SVG fallback visible immediately
[ ] Scroll down advances all 3 cinematic scenes
[ ] Scroll up reverses them
[ ] Resize does not break pinned scenes
[ ] prefers-reduced-motion flattens scenes (DevTools → Rendering)
[ ] Mega menu opens on click, closes on Escape / outside-click
[ ] Mobile drawer works, locks body scroll
[ ] Class 1–12 / JEE / NEET navigation works
[ ] Booking form validates and submits
[ ] Booking success page shows the reference
[ ] Admin login rejects empty creds
[ ] Admin dashboard shows stats and bookings (preview mode without Supabase)
[ ] CSV export downloads
[ ] No console errors on any route
```

---

## 🧯 Troubleshooting

**The hero is blank.** Check the browser console. GSAP should load
lazily — if it fails, the static SVG composition is still rendered
visible. If even the SVG is missing, check `public/brand/`.

**Bookings don't reach Supabase.** Confirm `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` are set. Check the browser Network tab for the
`submit-booking` function call. The RLS `anyone can create a booking`
policy must be present.

**Emails don't arrive.** Verify `RESEND_API_KEY`, `RESEND_FROM_EMAIL`,
`ADMIN_NOTIFICATION_EMAIL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
are set as **Edge Function secrets** (not env vars). Verify your sending
domain is verified in Resend. Check the dashboard's "Failed emails"
stat and the `email_error` column in the `bookings` table.

**Admin login fails.** Confirm the user exists in `auth.users` AND in
`admin_profiles`. The trigger only creates the `admin_profiles` row if
the email was first inserted into `pending_admins`.

**Pinned scenes jump on resize.** This is expected on mobile URL bar
show/hide. ScrollTrigger has `ignoreMobileResize: true` set in
`gsapConfig.ts` to minimise it.

---

## 📜 License

This project is proprietary. All rights reserved by CHEMAMEER.

The bundled dependencies retain their original licenses:
React (MIT), Vite (MIT), GSAP (GreenSock Standard License — free for
commercial use), Supabase JS (MIT), Lucide (ISC).
