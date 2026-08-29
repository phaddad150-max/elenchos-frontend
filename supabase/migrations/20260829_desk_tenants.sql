-- Desk tenants — billing / app state (Wix-style dashboard license).
-- Isolated from public intelligence tables. Payment creates the row + empty branding/picks.
-- Scoring pipelines never write here. Tenant snapshots are copies, not Pass-1 runs.

create table if not exists public.desk_tenants (
  id uuid primary key default gen_random_uuid(),
  manage_token text not null unique,
  slug text unique,
  email text,
  org_name text not null default '',
  stripe_session_id text,
  status text not null default 'pending',
  custom_domain text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists desk_tenants_slug_idx on public.desk_tenants (slug);
create index if not exists desk_tenants_session_idx on public.desk_tenants (stripe_session_id);

create table if not exists public.desk_branding (
  tenant_id uuid primary key references public.desk_tenants (id),
  org_name text not null default '',
  unbranded boolean not null default false,
  logo_url text,
  primary_color text not null default '#22d3ee',
  accent_color text not null default '#f59e0b',
  updated_at timestamptz not null default now()
);

create table if not exists public.desk_picks (
  tenant_id uuid primary key references public.desk_tenants (id),
  topic_ids text[] not null default '{}',
  custom_topics text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.desk_topic_snapshots (
  id bigserial primary key,
  tenant_id uuid not null references public.desk_tenants (id),
  topic_id text not null,
  topic_name text not null,
  headline text,
  overall_sentiment jsonb,
  divergence_score numeric,
  sample_size integer,
  last_updated timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists desk_topic_snapshots_tenant_idx
  on public.desk_topic_snapshots (tenant_id, created_at desc);

comment on table public.desk_tenants is
  'Paying desk customers. App state (status/slug) may update. Not an intelligence table.';
comment on table public.desk_topic_snapshots is
  'Per-tenant published cards. Copies of public samples or empty awaiting rows. Never Pass-1.';

alter table public.desk_tenants enable row level security;
alter table public.desk_branding enable row level security;
alter table public.desk_picks enable row level security;
alter table public.desk_topic_snapshots enable row level security;

drop policy if exists "anon_select_live_desk_tenants" on public.desk_tenants;
create policy "anon_select_live_desk_tenants"
  on public.desk_tenants for select to anon, authenticated
  using (status = 'live');

drop policy if exists "anon_select_live_desk_branding" on public.desk_branding;
create policy "anon_select_live_desk_branding"
  on public.desk_branding for select to anon, authenticated
  using (
    exists (select 1 from public.desk_tenants t where t.id = tenant_id and t.status = 'live')
  );

drop policy if exists "anon_select_live_desk_picks" on public.desk_picks;
create policy "anon_select_live_desk_picks"
  on public.desk_picks for select to anon, authenticated
  using (
    exists (select 1 from public.desk_tenants t where t.id = tenant_id and t.status = 'live')
  );

drop policy if exists "anon_select_live_desk_snaps" on public.desk_topic_snapshots;
create policy "anon_select_live_desk_snaps"
  on public.desk_topic_snapshots for select to anon, authenticated
  using (
    exists (select 1 from public.desk_tenants t where t.id = tenant_id and t.status = 'live')
  );

revoke insert, update, delete, truncate on public.desk_tenants from anon, authenticated;
revoke insert, update, delete, truncate on public.desk_branding from anon, authenticated;
revoke insert, update, delete, truncate on public.desk_picks from anon, authenticated;
revoke insert, update, delete, truncate on public.desk_topic_snapshots from anon, authenticated;
grant select on public.desk_tenants to anon, authenticated;
grant select on public.desk_branding to anon, authenticated;
grant select on public.desk_picks to anon, authenticated;
grant select on public.desk_topic_snapshots to anon, authenticated;
