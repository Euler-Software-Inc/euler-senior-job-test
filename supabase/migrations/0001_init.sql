-- Nimbus — initial schema
--
-- ┌────────────────────────────────────────────────────────────────────────┐
-- │ IMPORTANT: Row-Level Security is DELIBERATELY DISABLED in this starter.  │
-- │ Every authenticated user can read and write EVERY workspace's data.      │
-- │ The columns needed for tenancy (`workspace_id`) and roles (`role`) exist,│
-- │ but nothing enforces them. Building that enforcement is Task 1c — see    │
-- │ supabase/policies/rls_policies.sql for where your work goes.             │
-- └────────────────────────────────────────────────────────────────────────┘

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.workspaces (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'member', 'viewer');
  end if;
end$$;

create table if not exists public.memberships (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  workspace_id  uuid not null references public.workspaces (id) on delete cascade,
  role          public.user_role not null default 'member',
  created_at    timestamptz not null default now(),
  unique (user_id, workspace_id)
);

create table if not exists public.tasks (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces (id) on delete cascade,
  title         text not null,
  status        text not null default 'todo'
                  check (status in ('todo', 'in_progress', 'done')),
  assignee_id   uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists memberships_user_idx on public.memberships (user_id);
create index if not exists memberships_workspace_idx on public.memberships (workspace_id);
create index if not exists tasks_workspace_idx on public.tasks (workspace_id);

-- ---------------------------------------------------------------------------
-- API grants
-- The Supabase client connects as the `authenticated` role once a user signs
-- in. With RLS off, these grants alone let any signed-in user touch any row.
-- (Supabase often sets these defaults already; we make them explicit so the
-- starter behaves the same on any fresh project.)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete
  on public.workspaces, public.memberships, public.tasks
  to authenticated;

-- ---------------------------------------------------------------------------
-- RLS — intentionally OFF. Do not "fix" this here by flipping it on blindly;
-- enabling RLS with no policies denies everything. Task 1c is to enable it AND
-- write correct policies. See supabase/policies/rls_policies.sql.
-- ---------------------------------------------------------------------------
alter table public.workspaces  disable row level security;
alter table public.memberships disable row level security;
alter table public.tasks       disable row level security;
