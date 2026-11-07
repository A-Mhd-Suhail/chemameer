-- =============================================================
-- CHEMAMEER · Initial schema
-- Creates the core tables, indexes, constraints and RLS policies.
-- Run with: supabase db push
-- =============================================================

-- ---------- admin_profiles ----------
create table if not exists public.admin_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- enum types ----------
-- NOTE: PostgreSQL has no "CREATE TYPE IF NOT EXISTS", so we guard each
-- type creation in a DO block that tolerates duplicate_object errors
-- (makes the migration safely re-runnable).
do $$ begin
  create type booking_category_enum as enum ('school', 'jee', 'neet');
exception when duplicate_object then null; end $$;
do $$ begin
  create type booking_type_enum as enum ('demo', 'regular');
exception when duplicate_object then null; end $$;
do $$ begin
  create type learning_mode_enum as enum ('online', 'offline', 'hybrid');
exception when duplicate_object then null; end $$;
do $$ begin
  create type booking_status_enum as enum (
    'new', 'pending', 'confirmed', 'rescheduled', 'completed', 'enrolled', 'cancelled'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.course_categories (
  id booking_category_enum primary key,
  label text not null,
  short text not null,
  blurb text,
  created_at timestamptz not null default now()
);

-- ---------- courses ----------
create table if not exists public.courses (
  id text primary key,
  category booking_category_enum not null references public.course_categories (id),
  level text not null,
  display_label text not null,
  blurb text,
  description text,
  modes learning_mode_enum[] not null default '{}',
  duration_weeks int,
  highlights text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_courses_category on public.courses (category);

-- ---------- subjects ----------
create table if not exists public.subjects (
  id text primary key,
  course_id text not null references public.courses (id) on delete cascade,
  name text not null,
  short text,
  blurb text,
  created_at timestamptz not null default now()
);

create index if not exists idx_subjects_course on public.subjects (course_id);

-- ---------- available_slots ----------
create table if not exists public.available_slots (
  id uuid primary key default gen_random_uuid(),
  course_id text references public.courses (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  mode learning_mode_enum not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- bookings ----------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_reference text not null unique,
  booking_type booking_type_enum not null,
  student_name text not null,
  student_email text not null,
  phone_number text not null,
  guardian_phone text,
  category booking_category_enum not null references public.course_categories (id),
  class_or_exam text not null,
  subject text not null,
  learning_mode learning_mode_enum not null,
  preferred_date date not null,
  preferred_time time not null,
  message text,
  status booking_status_enum not null default 'new',
  admin_notes text,
  email_delivered boolean not null default false,
  email_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_bookings_status on public.bookings (status);
create index if not exists idx_bookings_category on public.bookings (category);
create index if not exists idx_bookings_type on public.bookings (booking_type);
create index if not exists idx_bookings_email on public.bookings (student_email);
create index if not exists idx_bookings_created on public.bookings (created_at desc);

-- ---------- booking_notifications ----------
create table if not exists public.booking_notifications (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  channel text not null check (channel in ('admin_email', 'student_email')),
  recipient text not null,
  subject text not null,
  delivered boolean not null default false,
  error text,
  attempted_at timestamptz not null default now(),
  delivered_at timestamptz
);

create index if not exists idx_notif_booking on public.booking_notifications (booking_id);

-- ---------- activity_logs ----------
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor text,
  action text not null,
  target_booking uuid references public.bookings (id) on delete set null,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_logs_target on public.activity_logs (target_booking);

-- ---------- faqs ----------
create table if not exists public.faqs (
  id text primary key,
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- site_settings (single-row) ----------
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  brand_name text not null default 'CHEMAMEER',
  brand_display text not null default 'CHEM ANIMATED',
  contact_email text,
  contact_phone text,
  admin_notification_email text,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values (1)
  on conflict (id) do nothing;

-- =============================================================
-- Row Level Security
-- Students (anon) can INSERT bookings but cannot SELECT other
-- students' bookings. Admins (via service role from the Edge
-- Function, or via the admin RLS policy) can do everything.
-- =============================================================

alter table public.bookings enable row level security;
alter table public.booking_notifications enable row level security;
alter table public.activity_logs enable row level security;
alter table public.admin_profiles enable row level security;

-- Public can create a booking request (no auth required).
drop policy if exists "anyone can create a booking" on public.bookings;
create policy "anyone can create a booking"
  on public.bookings for insert
  to anon, authenticated
  with check (true);

-- Public CANNOT read bookings (admin only — see below).
drop policy if exists "no public reads" on public.bookings;
create policy "no public reads"
  on public.bookings for select
  to anon
  using (false);

-- Authenticated users can read their own bookings (matched by email).
drop policy if exists "users see own bookings" on public.bookings;
create policy "users see own bookings"
  on public.bookings for select
  to authenticated
  using (auth.jwt() ->> 'email' = student_email);

-- Admin reads / writes — controlled via the admin_profiles join.
drop policy if exists "admins manage bookings" on public.bookings;
create policy "admins manage bookings"
  on public.bookings for all
  to authenticated
  using (exists (select 1 from public.admin_profiles ap where ap.id = auth.uid()))
  with check (exists (select 1 from public.admin_profiles ap where ap.id = auth.uid()));

-- Admin profiles: only the admin themselves (or service role) can read.
drop policy if exists "admins read admin_profiles" on public.admin_profiles;
create policy "admins read admin_profiles"
  on public.admin_profiles for select
  to authenticated
  using (id = auth.uid());

-- Notifications / logs: admin-only.
drop policy if exists "admins manage notifications" on public.booking_notifications;
create policy "admins manage notifications"
  on public.booking_notifications for all
  to authenticated
  using (exists (select 1 from public.admin_profiles ap where ap.id = auth.uid()));

drop policy if exists "admins read logs" on public.activity_logs;
create policy "admins read logs"
  on public.activity_logs for select
  to authenticated
  using (exists (select 1 from public.admin_profiles ap where ap.id = auth.uid()));

-- Public can read categories, courses, subjects, FAQs, site_settings.
alter table public.course_categories enable row level security;
alter table public.courses enable row level security;
alter table public.subjects enable row level security;
alter table public.faqs enable row level security;
alter table public.site_settings enable row level security;
alter table public.available_slots enable row level security;

drop policy if exists "public read course_categories" on public.course_categories;
create policy "public read course_categories"
  on public.course_categories for select to anon, authenticated using (true);

drop policy if exists "public read courses" on public.courses;
create policy "public read courses"
  on public.courses for select to anon, authenticated using (is_active);

drop policy if exists "public read subjects" on public.subjects;
create policy "public read subjects"
  on public.subjects for select to anon, authenticated using (true);

drop policy if exists "public read faqs" on public.faqs;
create policy "public read faqs"
  on public.faqs for select to anon, authenticated using (is_active);

drop policy if exists "public read site_settings" on public.site_settings;
create policy "public read site_settings"
  on public.site_settings for select to anon, authenticated using (true);

drop policy if exists "public read available_slots" on public.available_slots;
create policy "public read available_slots"
  on public.available_slots for select to anon, authenticated using (is_active);

-- Admins can manage catalog tables.
drop policy if exists "admins manage courses" on public.courses;
create policy "admins manage courses"
  on public.courses for all
  to authenticated
  using (exists (select 1 from public.admin_profiles ap where ap.id = auth.uid()));

drop policy if exists "admins manage subjects" on public.subjects;
create policy "admins manage subjects"
  on public.subjects for all
  to authenticated
  using (exists (select 1 from public.admin_profiles ap where ap.id = auth.uid()));

drop policy if exists "admins manage faqs" on public.faqs;
create policy "admins manage faqs"
  on public.faqs for all
  to authenticated
  using (exists (select 1 from public.admin_profiles ap where ap.id = auth.uid()));

-- =============================================================
-- Updated_at triggers
-- =============================================================
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_bookings_touch on public.bookings;
create trigger trg_bookings_touch before update on public.bookings
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_courses_touch on public.courses;
create trigger trg_courses_touch before update on public.courses
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_admin_profiles_touch on public.admin_profiles;
create trigger trg_admin_profiles_touch before update on public.admin_profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_site_settings_touch on public.site_settings;
create trigger trg_site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- =============================================================
-- Seed: categories
-- =============================================================
insert into public.course_categories (id, label, short, blurb) values
  ('school', 'School Education', 'Classes 1–12', 'Concept-first guidance across all classes — aligned to school curriculum.'),
  ('jee', 'JEE Preparation', 'JEE Main & Advanced', 'Structured preparation for the Joint Entrance Examination.'),
  ('neet', 'NEET Preparation', 'NEET-UG', 'Conceptual depth and practice for the NEET-UG medical entrance.')
on conflict (id) do nothing;

-- Seed: default FAQs
insert into public.faqs (id, question, answer, sort_order) values
  ('classes-available', 'Which classes are available?', 'CHEMAMEER supports school students from Class 1 to Class 12, with curriculum-aligned concept guidance. Each class has its own subject configuration — open the Classes menu to explore.', 1),
  ('demo-class', 'Is demo class booking available?', 'Yes. You can request a demo class through the booking form. The demo is a request — final confirmation is sent by the academic team once your slot is reviewed.', 2),
  ('choose-class', 'How do I choose my class?', 'Open Classes → School Education, then pick your grade. For JEE or NEET, choose the relevant preparation track. Each programme lists the subjects covered and available learning modes.', 3),
  ('jee-classes', 'Are JEE classes available?', 'Yes. We offer a JEE Foundation track, a JEE Main programme, and a JEE Advanced track. Each is configurable by the academic team.', 4),
  ('neet-classes', 'Are NEET classes available?', 'Yes. We offer a NEET Foundation track and a full NEET-UG programme, with Biology at the centre of preparation.', 5),
  ('how-enrol', 'How do I enrol?', 'Submit either a demo class request or a regular class enrolment request from the booking page. The academic team reviews your request and reaches out with confirmation and the next steps.', 6)
on conflict (id) do nothing;
