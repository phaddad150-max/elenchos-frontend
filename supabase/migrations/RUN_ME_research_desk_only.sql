-- =============================================================================
-- Elenchos Research Desk — SAFE one-shot for Supabase SQL Editor
-- =============================================================================
-- DO NOT run the June 2026 "profiles" migrations again (they will error).
-- This file only touches public.research_desk_reports.
-- Safe to re-run: uses IF NOT EXISTS / exception handlers where possible.
-- =============================================================================

-- 1) Base table (first commission store)
create table if not exists public.research_desk_reports (
  token text not null,
  stripe_session_id text,
  package_id text not null,
  topic text not null,
  questions text default '',
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists research_desk_reports_created_at_idx
  on public.research_desk_reports (created_at desc);

alter table public.research_desk_reports enable row level security;

-- 2) Share columns
alter table public.research_desk_reports
  add column if not exists shared_public boolean not null default false;

alter table public.research_desk_reports
  add column if not exists shared_at timestamptz;

create index if not exists research_desk_reports_shared_public_idx
  on public.research_desk_reports (shared_public, shared_at desc)
  where shared_public = true;

-- 3) Commission v2 status machine
alter table public.research_desk_reports
  alter column stripe_session_id drop not null;

alter table public.research_desk_reports
  add column if not exists status text not null default 'ready';

alter table public.research_desk_reports
  add column if not exists error_message text;

create index if not exists research_desk_reports_status_idx
  on public.research_desk_reports (status);

-- 4) Append-only: id as primary key; many rows per public token
alter table public.research_desk_reports
  add column if not exists id uuid default gen_random_uuid();

update public.research_desk_reports
set id = gen_random_uuid()
where id is null;

-- Drop existing primary key if any (token or other)
do $$
declare
  pk_name text;
begin
  select tc.constraint_name into pk_name
  from information_schema.table_constraints tc
  where tc.table_schema = 'public'
    and tc.table_name = 'research_desk_reports'
    and tc.constraint_type = 'PRIMARY KEY'
  limit 1;

  if pk_name is not null then
    execute format('alter table public.research_desk_reports drop constraint %I', pk_name);
  end if;
end $$;

alter table public.research_desk_reports
  alter column id set not null;

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'research_desk_reports'
      and constraint_type = 'PRIMARY KEY'
  ) then
    alter table public.research_desk_reports add primary key (id);
  end if;
end $$;

-- Drop unique on stripe_session_id if present (append rows may share a session)
do $$
declare
  uq_name text;
begin
  select c.conname into uq_name
  from pg_constraint c
  join pg_class t on c.conrelid = t.oid
  join pg_namespace n on t.relnamespace = n.oid
  where n.nspname = 'public'
    and t.relname = 'research_desk_reports'
    and c.contype = 'u'
    and pg_get_constraintdef(c.oid) ilike '%stripe_session_id%'
  limit 1;

  if uq_name is not null then
    execute format('alter table public.research_desk_reports drop constraint %I', uq_name);
  end if;
end $$;

create index if not exists research_desk_reports_token_created_idx
  on public.research_desk_reports (token, created_at desc);

create index if not exists research_desk_reports_shared_package_idx
  on public.research_desk_reports (shared_public, package_id, created_at desc)
  where shared_public = true;

comment on table public.research_desk_reports is
  'Append-only commissioned reports. Never UPDATE/DELETE. Latest row per token wins.';

-- Done. Verify with:
-- select column_name, data_type from information_schema.columns
-- where table_name = 'research_desk_reports' order by ordinal_position;
