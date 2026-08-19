-- =============================================================================
-- Elenchos Pro billing — SAFE one-shot for Supabase SQL Editor
-- Project: jacbalsongvqvaqlfsbx
-- Same body as 20260819_pro_billing_tokens.sql (includes DATA PROTECTION header).
-- Safe to re-run. Does NOT touch intelligence tables or rewrite desk row history.
-- =============================================================================
-- =============================================================================
-- Elenchos Pro / tokens / connected accounts
-- =============================================================================
-- CRITICAL DATA PROTECTION (never violate):
-- 1) Intelligence tables are append-only forever â€” never UPDATE/DELETE/TRUNCATE/DROP
--    topic_snapshots, curated_*, dashboard_*, trackers, citizen_signals,
--    research_runs, research_sources, or other historical intelligence.
--    Private Pro runs must NEVER write into those tables.
-- 2) research_desk_reports: append-only for existing rows. Only ADD COLUMN IF NOT
--    EXISTS. New Pro runs INSERT new rows (user_id set). Never rewrite history.
-- 3) Only billing tables may be updated: subscriptions, token_balances,
--    connected_accounts. token_ledger is append-only (INSERT only).
-- 4) Prefer IF NOT EXISTS / ADD COLUMN IF NOT EXISTS / CREATE OR REPLACE on new
--    objects only. Reject any migration that mutates historical intelligence rows.
-- 5) Token movements + private runs stay isolated from public KPI/snapshot pipelines.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1) subscriptions
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text not null default 'inactive'
    check (status in ('active', 'trialing', 'past_due', 'canceled', 'inactive', 'unpaid')),
  plan_id text not null default 'pro_monthly',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx
  on public.subscriptions (user_id);

create index if not exists subscriptions_stripe_customer_idx
  on public.subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;

comment on table public.subscriptions is
  'Stripe subscription mirror for Pro plans. Mutable status sync from webhooks.';

-- ---------------------------------------------------------------------------
-- 2) token_balances (mutable cache; authoritative history is token_ledger)
-- ---------------------------------------------------------------------------
create table if not exists public.token_balances (
  user_id uuid primary key references auth.users (id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

comment on table public.token_balances is
  'Cached token wallet. Prefer updating only via debit_tokens / credit_tokens RPCs.';

-- ---------------------------------------------------------------------------
-- 3) token_ledger (append-only grants + usage)
-- ---------------------------------------------------------------------------
create table if not exists public.token_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  delta integer not null,
  reason text not null
    check (reason in (
      'pack_purchase',
      'sub_grant',
      'private_run',
      'refund',
      'adjust',
      'expiry'
    )),
  ref_type text,
  ref_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists token_ledger_user_created_idx
  on public.token_ledger (user_id, created_at desc);

comment on table public.token_ledger is
  'Append-only token grants and debits. Never UPDATE/DELETE rows in app code.';

-- ---------------------------------------------------------------------------
-- 4) connected_accounts (Google / X / Notion later)
-- ---------------------------------------------------------------------------
create table if not exists public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (provider in ('google', 'x', 'notion')),
  provider_user_id text not null,
  access_token_enc text,
  refresh_token_enc text,
  scopes text[] not null default '{}',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_user_id)
);

create index if not exists connected_accounts_user_idx
  on public.connected_accounts (user_id);

comment on table public.connected_accounts is
  'OAuth-linked accounts for Pro features. Encrypt tokens at rest (Vault preferred).';

-- ---------------------------------------------------------------------------
-- 5) Extend research_desk_reports for Pro / token-paid private runs
-- ---------------------------------------------------------------------------
-- NO on delete set null / cascade: deleting an auth user must not UPDATE desk history.
alter table public.research_desk_reports
  add column if not exists user_id uuid references auth.users (id);

alter table public.research_desk_reports
  add column if not exists visibility text not null default 'token_link';

alter table public.research_desk_reports
  add column if not exists tokens_charged integer;

alter table public.research_desk_reports
  add column if not exists payment_source text;

-- Backfill / constrain visibility + payment_source safely
do $$
begin
  alter table public.research_desk_reports
    drop constraint if exists research_desk_reports_visibility_check;
  alter table public.research_desk_reports
    add constraint research_desk_reports_visibility_check
    check (visibility in ('token_link', 'private_account'));
exception when others then null;
end $$;

do $$
begin
  alter table public.research_desk_reports
    drop constraint if exists research_desk_reports_payment_source_check;
  alter table public.research_desk_reports
    add constraint research_desk_reports_payment_source_check
    check (
      payment_source is null
      or payment_source in ('stripe_checkout', 'token_balance', 'pro_grant')
    );
exception when others then null;
end $$;

create index if not exists research_desk_reports_user_created_idx
  on public.research_desk_reports (user_id, created_at desc)
  where user_id is not null;

comment on column public.research_desk_reports.user_id is
  'Null = guest Stripe commission. Set for Pro/token private runs.';
comment on column public.research_desk_reports.visibility is
  'token_link (default guest) | private_account (Pro library)';
comment on column public.research_desk_reports.tokens_charged is
  'Wallet debit amount when payment_source is token_balance or pro_grant.';
comment on column public.research_desk_reports.payment_source is
  'stripe_checkout | token_balance | pro_grant';

-- ---------------------------------------------------------------------------
-- 6) RPCs: credit_tokens / debit_tokens (transactional)
-- ---------------------------------------------------------------------------
create or replace function public.credit_tokens(
  p_user_id uuid,
  p_delta integer,
  p_reason text,
  p_ref_type text default null,
  p_ref_id text default null,
  p_metadata jsonb default '{}'::jsonb
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_balance integer;
begin
  if p_delta is null or p_delta <= 0 then
    raise exception 'credit_tokens: delta must be positive';
  end if;

  insert into public.token_balances (user_id, balance, updated_at)
  values (p_user_id, p_delta, now())
  on conflict (user_id) do update
    set balance = public.token_balances.balance + excluded.balance,
        updated_at = now()
  returning balance into new_balance;

  insert into public.token_ledger (user_id, delta, reason, ref_type, ref_id, metadata)
  values (p_user_id, p_delta, p_reason, p_ref_type, p_ref_id, coalesce(p_metadata, '{}'::jsonb));

  return new_balance;
end;
$$;

create or replace function public.debit_tokens(
  p_user_id uuid,
  p_amount integer,
  p_reason text default 'private_run',
  p_ref_type text default null,
  p_ref_id text default null,
  p_metadata jsonb default '{}'::jsonb
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_balance integer;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'debit_tokens: amount must be positive';
  end if;

  insert into public.token_balances (user_id, balance, updated_at)
  values (p_user_id, 0, now())
  on conflict (user_id) do nothing;

  update public.token_balances
  set balance = balance - p_amount,
      updated_at = now()
  where user_id = p_user_id
    and balance >= p_amount
  returning balance into new_balance;

  if new_balance is null then
    raise exception 'debit_tokens: insufficient balance';
  end if;

  insert into public.token_ledger (user_id, delta, reason, ref_type, ref_id, metadata)
  values (p_user_id, -p_amount, p_reason, p_ref_type, p_ref_id, coalesce(p_metadata, '{}'::jsonb));

  return new_balance;
end;
$$;

revoke all on function public.credit_tokens(uuid, integer, text, text, text, jsonb) from public;
revoke all on function public.debit_tokens(uuid, integer, text, text, text, jsonb) from public;
grant execute on function public.credit_tokens(uuid, integer, text, text, text, jsonb) to service_role;
grant execute on function public.debit_tokens(uuid, integer, text, text, text, jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- 7) RLS
-- ---------------------------------------------------------------------------
alter table public.subscriptions enable row level security;
alter table public.token_balances enable row level security;
alter table public.token_ledger enable row level security;
alter table public.connected_accounts enable row level security;

-- subscriptions: owner read
drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own on public.subscriptions
  for select to authenticated
  using (auth.uid() = user_id);

-- token_balances: owner read
drop policy if exists token_balances_select_own on public.token_balances;
create policy token_balances_select_own on public.token_balances
  for select to authenticated
  using (auth.uid() = user_id);

-- token_ledger: owner read
drop policy if exists token_ledger_select_own on public.token_ledger;
create policy token_ledger_select_own on public.token_ledger
  for select to authenticated
  using (auth.uid() = user_id);

-- connected_accounts: owner CRUD (tokens written by service role preferred)
drop policy if exists connected_accounts_select_own on public.connected_accounts;
create policy connected_accounts_select_own on public.connected_accounts
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists connected_accounts_insert_own on public.connected_accounts;
create policy connected_accounts_insert_own on public.connected_accounts
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists connected_accounts_update_own on public.connected_accounts;
create policy connected_accounts_update_own on public.connected_accounts
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists connected_accounts_delete_own on public.connected_accounts;
create policy connected_accounts_delete_own on public.connected_accounts
  for delete to authenticated
  using (auth.uid() = user_id);

-- desk: owners can read their private_account rows (guest token_link stays service/anon as before)
drop policy if exists research_desk_select_own on public.research_desk_reports;
create policy research_desk_select_own on public.research_desk_reports
  for select to authenticated
  using (user_id is not null and auth.uid() = user_id);
