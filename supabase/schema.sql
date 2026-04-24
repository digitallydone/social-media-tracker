create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null check (role in ('admin', 'manager', 'client')),
  client_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.access_invites (
  email text primary key,
  full_name text,
  role text not null check (role in ('admin', 'manager', 'client')),
  client_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  date date not null,
  platform text not null,
  topic text not null,
  format text,
  time text,
  notes text,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.status_records (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans (id) on delete cascade,
  client_name text not null,
  date date not null,
  platform text not null,
  topic text not null,
  format text,
  time text,
  status text not null check (status in ('Posted', 'Awaiting Approval', 'Missed', 'Rescheduled', 'Overdue')),
  post_link text,
  notes text,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists plans_set_updated_at on public.plans;
create trigger plans_set_updated_at
before update on public.plans
for each row execute function public.set_updated_at();

drop trigger if exists status_records_set_updated_at on public.status_records;
create trigger status_records_set_updated_at
before update on public.status_records
for each row execute function public.set_updated_at();

create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.get_my_client_name()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select client_name from public.profiles where id = auth.uid()
$$;

create or replace function public.sync_profile_from_invite(
  target_user_id uuid,
  target_email text,
  fallback_name text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  invite public.access_invites;
  synced_profile public.profiles;
begin
  if target_user_id is null or target_email is null then
    return null;
  end if;

  select *
  into invite
  from public.access_invites
  where email = lower(target_email);

  if not found then
    return null;
  end if;

  insert into public.profiles (id, full_name, role, client_name)
  values (
    target_user_id,
    coalesce(invite.full_name, fallback_name, split_part(lower(target_email), '@', 1)),
    invite.role,
    invite.client_name
  )
  on conflict (id) do update
  set full_name = excluded.full_name,
      role = excluded.role,
      client_name = excluded.client_name
  returning * into synced_profile;

  return synced_profile;
end;
$$;

create or replace function public.ensure_my_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_profile public.profiles;
begin
  select *
  into existing_profile
  from public.profiles
  where id = auth.uid();

  if found then
    return existing_profile;
  end if;

  return public.sync_profile_from_invite(
    auth.uid(),
    lower(coalesce(auth.jwt()->>'email', '')),
    nullif(auth.jwt()->>'email', '')
  );
end;
$$;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_profile_from_invite(
    new.id,
    lower(coalesce(new.email, '')),
    nullif(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user_profile();

alter table public.profiles enable row level security;
alter table public.access_invites enable row level security;
alter table public.plans enable row level security;
alter table public.status_records enable row level security;

drop policy if exists "profiles_select_self_or_team" on public.profiles;
create policy "profiles_select_self_or_team"
on public.profiles
for select
using (
  auth.uid() = id
  or public.get_my_role() in ('admin', 'manager')
);

drop policy if exists "profiles_insert_admin_only" on public.profiles;
create policy "profiles_insert_admin_only"
on public.profiles
for insert
with check (public.get_my_role() = 'admin');

drop policy if exists "profiles_update_admin_only" on public.profiles;
create policy "profiles_update_admin_only"
on public.profiles
for update
using (public.get_my_role() = 'admin')
with check (public.get_my_role() = 'admin');

drop policy if exists "access_invites_admin_only" on public.access_invites;
create policy "access_invites_admin_only"
on public.access_invites
for all
using (public.get_my_role() = 'admin')
with check (public.get_my_role() = 'admin');

drop policy if exists "plans_select_by_scope" on public.plans;
create policy "plans_select_by_scope"
on public.plans
for select
using (
  public.get_my_role() in ('admin', 'manager')
  or client_name = public.get_my_client_name()
);

drop policy if exists "plans_write_admin_manager" on public.plans;
create policy "plans_write_admin_manager"
on public.plans
for all
using (public.get_my_role() in ('admin', 'manager'))
with check (public.get_my_role() in ('admin', 'manager'));

drop policy if exists "status_select_by_scope" on public.status_records;
create policy "status_select_by_scope"
on public.status_records
for select
using (
  public.get_my_role() in ('admin', 'manager')
  or client_name = public.get_my_client_name()
);

drop policy if exists "status_write_admin_manager" on public.status_records;
create policy "status_write_admin_manager"
on public.status_records
for all
using (public.get_my_role() in ('admin', 'manager'))
with check (public.get_my_role() in ('admin', 'manager'));

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.access_invites to authenticated;
grant select, insert, update, delete on public.plans to authenticated;
grant select, insert, update, delete on public.status_records to authenticated;
grant select on public.profiles to anon;
grant select on public.plans to anon;
grant select on public.status_records to anon;
grant execute on function public.get_my_role() to anon, authenticated;
grant execute on function public.get_my_client_name() to anon, authenticated;
grant execute on function public.sync_profile_from_invite(uuid, text, text) to authenticated;
grant execute on function public.ensure_my_profile() to authenticated;
grant execute on function public.handle_new_user_profile() to authenticated;
grant execute on function public.set_updated_at() to anon, authenticated;
