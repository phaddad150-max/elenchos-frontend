-- Append-only commissioned reports: never UPDATE/DELETE existing rows.
-- Each lifecycle event (pending, paid, ready, share on/off) inserts a NEW row.
-- Readers take the latest row per token by created_at desc.

-- New surrogate key so multiple versions can share the same public token
alter table public.research_desk_reports
  add column if not exists id uuid default gen_random_uuid();

-- Backfill ids for existing rows
update public.research_desk_reports
set id = gen_random_uuid()
where id is null;

-- Drop token PK if present; token is a stable public handle, not a unique row key
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'research_desk_reports'
      and constraint_type = 'PRIMARY KEY'
  ) then
    alter table public.research_desk_reports drop constraint research_desk_reports_pkey;
  end if;
exception when others then
  -- constraint name may differ
  begin
    alter table public.research_desk_reports drop constraint if exists research_desk_reports_pkey;
  exception when others then null;
  end;
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
exception when others then null;
end $$;

-- stripe_session_id was unique; multiple append rows may reference same session
do $$
begin
  alter table public.research_desk_reports drop constraint if exists research_desk_reports_stripe_session_id_key;
exception when others then null;
end $$;

create index if not exists research_desk_reports_token_created_idx
  on public.research_desk_reports (token, created_at desc);

create index if not exists research_desk_reports_shared_package_idx
  on public.research_desk_reports (shared_public, package_id, created_at desc)
  where shared_public = true;

comment on table public.research_desk_reports is
  'Append-only commissioned reports. Never UPDATE/DELETE. Latest row per token wins.';
