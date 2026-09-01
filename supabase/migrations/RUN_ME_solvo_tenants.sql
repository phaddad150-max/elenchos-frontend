-- Paste into Supabase SQL editor for the Solvo Creations / UAE prototype.
-- NEW TABLES ONLY. Does not ALTER, UPDATE, or DELETE desk_* or intelligence rows.

create table if not exists public.solvo_tenants (
  id uuid primary key default gen_random_uuid(),
  manage_token text not null unique,
  slug text unique,
  email text,
  org_name text not null default '',
  stripe_session_id text,
  stripe_customer_id text,
  status text not null default 'pending',
  custom_domain text,
  market text not null default 'uae',
  plan text not null default 'pulse',
  sample_size integer not null default 120,
  currency text not null default 'aed',
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists solvo_tenants_slug_idx on public.solvo_tenants (slug);
create index if not exists solvo_tenants_session_idx on public.solvo_tenants (stripe_session_id);
create index if not exists solvo_tenants_plan_idx on public.solvo_tenants (plan);

create table if not exists public.solvo_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.solvo_tenants (id),
  topic_count integer not null default 0,
  amount_cents integer not null default 0,
  currency text not null default 'aed',
  stripe_invoice_id text,
  created_at timestamptz not null default now()
);

create index if not exists solvo_runs_tenant_idx on public.solvo_runs (tenant_id, created_at desc);

create table if not exists public.solvo_branding (
  tenant_id uuid primary key references public.solvo_tenants (id),
  org_name text not null default '',
  unbranded boolean not null default false,
  logo_url text,
  primary_color text not null default '#1E4ED8',
  accent_color text not null default '#E8B923',
  updated_at timestamptz not null default now()
);

create table if not exists public.solvo_picks (
  tenant_id uuid primary key references public.solvo_tenants (id),
  topic_ids text[] not null default '{}',
  custom_topics text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.solvo_topic_snapshots (
  id bigserial primary key,
  tenant_id uuid not null references public.solvo_tenants (id),
  topic_id text not null,
  topic_name text not null,
  headline text,
  overall_sentiment jsonb,
  divergence_score numeric,
  sample_size integer,
  last_updated timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists solvo_topic_snapshots_tenant_idx
  on public.solvo_topic_snapshots (tenant_id, created_at desc);

alter table public.solvo_tenants enable row level security;
alter table public.solvo_branding enable row level security;
alter table public.solvo_picks enable row level security;
alter table public.solvo_topic_snapshots enable row level security;
alter table public.solvo_runs enable row level security;

drop policy if exists "anon_select_live_solvo_tenants" on public.solvo_tenants;
create policy "anon_select_live_solvo_tenants"
  on public.solvo_tenants for select to anon, authenticated
  using (status = 'live');

drop policy if exists "anon_select_live_solvo_branding" on public.solvo_branding;
create policy "anon_select_live_solvo_branding"
  on public.solvo_branding for select to anon, authenticated
  using (
    exists (select 1 from public.solvo_tenants t where t.id = tenant_id and t.status = 'live')
  );

drop policy if exists "anon_select_live_solvo_picks" on public.solvo_picks;
create policy "anon_select_live_solvo_picks"
  on public.solvo_picks for select to anon, authenticated
  using (
    exists (select 1 from public.solvo_tenants t where t.id = tenant_id and t.status = 'live')
  );

drop policy if exists "anon_select_live_solvo_snaps" on public.solvo_topic_snapshots;
create policy "anon_select_live_solvo_snaps"
  on public.solvo_topic_snapshots for select to anon, authenticated
  using (
    exists (select 1 from public.solvo_tenants t where t.id = tenant_id and t.status = 'live')
  );

revoke insert, update, delete, truncate on public.solvo_tenants from anon, authenticated;
revoke insert, update, delete, truncate on public.solvo_branding from anon, authenticated;
revoke insert, update, delete, truncate on public.solvo_picks from anon, authenticated;
revoke insert, update, delete, truncate on public.solvo_topic_snapshots from anon, authenticated;
revoke insert, update, delete, truncate on public.solvo_runs from anon, authenticated;

grant select on public.solvo_tenants to anon, authenticated;
grant select on public.solvo_branding to anon, authenticated;
grant select on public.solvo_picks to anon, authenticated;
grant select on public.solvo_topic_snapshots to anon, authenticated;
