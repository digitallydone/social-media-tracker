-- Replace the placeholder UUIDs with real auth.users IDs
-- after inviting or creating your trial users in Supabase Auth.

insert into public.profiles (id, full_name, role, client_name)
values
  ('11111111-1111-1111-1111-111111111111', 'Richard', 'admin', null),
  ('22222222-2222-2222-2222-222222222222', 'Team Lead', 'manager', null),
  ('33333333-3333-3333-3333-333333333333', 'Acme Client Contact', 'client', 'Acme Client');

