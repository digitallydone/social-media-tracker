-- Add invited emails here before the team signs in.
-- On the user's first successful magic-link sign-in, the database trigger
-- will automatically create the matching public.profiles row.

insert into public.access_invites (email, full_name, role, client_name)
values
  ('rich@example.com', 'Richard', 'admin', null),
  ('lead@example.com', 'Team Lead', 'manager', null),
  ('client@example.com', 'Acme Client Contact', 'client', 'Acme Client')
on conflict (email) do update
set full_name = excluded.full_name,
    role = excluded.role,
    client_name = excluded.client_name;
