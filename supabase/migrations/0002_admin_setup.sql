-- =============================================================
-- CHEMAMEER · Admin profile auto-creation trigger
-- When a new auth user is created, this trigger creates an
-- admin_profiles row ONLY IF the project owner explicitly
-- inserts that user's id into the `pending_admins` table.
-- This prevents new sign-ups from granting themselves admin.
-- =============================================================

-- A queue the project owner populates manually to whitelist admins.
create table if not exists public.pending_admins (
  email text primary key,
  display_name text,
  created_at timestamptz not null default now(),
  consumed_at timestamptz
);

alter table public.pending_admins enable row level security;
drop policy if exists "admins manage pending_admins" on public.pending_admins;
create policy "admins manage pending_admins"
  on public.pending_admins for all
  to authenticated
  using (exists (select 1 from public.admin_profiles ap where ap.id = auth.uid()));

create or replace function public.handle_new_admin_user()
returns trigger as $$
begin
  -- Only promote to admin if the user's email was pre-registered by the project owner.
  if exists (select 1 from public.pending_admins p where p.email = new.email and p.consumed_at is null) then
    insert into public.admin_profiles (id, email, display_name)
    values (new.id, new.email, coalesce(
      (select display_name from public.pending_admins where email = new.email),
      new.email
    ))
    on conflict (id) do nothing;

    update public.pending_admins
       set consumed_at = now()
     where email = new.email;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_admin_user();
