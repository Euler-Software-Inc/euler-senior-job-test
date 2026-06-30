-- Nimbus — seed data
--
-- Run this in the Supabase SQL editor (or `supabase db reset`) AFTER applying
-- migrations. It creates two workspaces with deliberately OVERLAPPING task
-- titles, so if workspace isolation is broken you can SEE another tenant's
-- rows leaking in. It also seeds enough tasks to make the Task 1b performance
-- issue measurable.
--
-- Memberships are NOT seeded here, because they reference real auth users that
-- only exist after you sign up in the app. See the bottom of this file for the
-- one-liner to link your account once you've registered.

-- Fixed UUIDs so you can reference these workspaces in queries/membership SQL.
insert into public.workspaces (id, name)
values
  ('11111111-1111-1111-1111-111111111111', 'Acme'),
  ('22222222-2222-2222-2222-222222222222', 'Globex')
on conflict (id) do nothing;

-- Per-workspace flavoured tasks.
insert into public.tasks (workspace_id, title, status)
select
  '11111111-1111-1111-1111-111111111111',
  'Acme task #' || g || ' — ' ||
    (array['onboard customer','ship invoice','triage support','close books'])[1 + (g % 4)],
  (array['todo','in_progress','done'])[1 + (g % 3)]
from generate_series(1, 60) as g;

insert into public.tasks (workspace_id, title, status)
select
  '22222222-2222-2222-2222-222222222222',
  'Globex task #' || g || ' — ' ||
    (array['onboard customer','ship invoice','triage support','close books'])[1 + (g % 4)],
  (array['todo','in_progress','done'])[1 + (g % 3)]
from generate_series(1, 60) as g;

-- Identical titles in BOTH workspaces — the obvious "isolation is broken" tell.
insert into public.tasks (workspace_id, title, status) values
  ('11111111-1111-1111-1111-111111111111', 'Q3 planning', 'todo'),
  ('22222222-2222-2222-2222-222222222222', 'Q3 planning', 'todo'),
  ('11111111-1111-1111-1111-111111111111', 'Security review', 'in_progress'),
  ('22222222-2222-2222-2222-222222222222', 'Security review', 'in_progress');

-- ---------------------------------------------------------------------------
-- LINK YOUR ACCOUNT (run after signing up in the app)
-- ---------------------------------------------------------------------------
-- Replace the email with the one you registered. To exercise roles, register a
-- second user and give them a different role / a different workspace.
--
--   insert into public.memberships (user_id, workspace_id, role)
--   select u.id, '11111111-1111-1111-1111-111111111111', 'admin'
--   from auth.users u where u.email = 'you@example.com'
--   on conflict (user_id, workspace_id) do nothing;
--
--   -- a second user as a viewer of Globex, for testing roles/isolation:
--   insert into public.memberships (user_id, workspace_id, role)
--   select u.id, '22222222-2222-2222-2222-222222222222', 'viewer'
--   from auth.users u where u.email = 'teammate@example.com'
--   on conflict (user_id, workspace_id) do nothing;
