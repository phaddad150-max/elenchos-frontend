-- Case-study / deep-dive intelligence — SEPARATE from topics + trackers.
-- Append-only forever: every pipeline run INSERTs a new row. Never UPDATE/DELETE history.
--
-- Run in Supabase SQL editor (or via migration tooling) on jacbalsongvqvaqlfsbx.

create table if not exists public.case_study_snapshots (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  last_updated timestamptz not null default now(),
  -- Stable product slug, e.g. aviation-race-digital-ai | irregular-migration
  case_slug text not null,
  snapshot_label text,
  headline text,
  summary text,
  -- [{ "id": "shock", "title": "...", "blurb": "..." }, ...]
  subheadlines jsonb not null default '[]'::jsonb,
  -- Full structured payload for the run (scores, chapters, sources used, etc.)
  data jsonb not null default '{}'::jsonb,
  -- Which evidence rails fed this run: open_web | x | official | mixed
  source_mix jsonb not null default '[]'::jsonb,
  deep_dive_summary text,
  key_insights text[] null,
  item_count integer null,
  -- Optional: link to a Pro/private report without mixing tables
  research_desk_token text null
);

create index if not exists case_study_snapshots_slug_created_idx
  on public.case_study_snapshots (case_slug, created_at desc);

create index if not exists case_study_snapshots_created_idx
  on public.case_study_snapshots (created_at desc);

comment on table public.case_study_snapshots is
  'Append-only case-study / deep-dive runs. Separate from topic_snapshots and trackers. INSERT only — never overwrite historic runs.';

comment on column public.case_study_snapshots.case_slug is
  'Product identifier: aviation-race-digital-ai, irregular-migration, …';

comment on column public.case_study_snapshots.subheadlines is
  'JSON array of deep-dive section teasers for the UI.';

comment on column public.case_study_snapshots.data is
  'Immutable snapshot payload for this run (do not patch in place — INSERT a new row).';

-- Latest row per case_slug (read model; never a write target)
create or replace view public.latest_case_study_snapshots as
select distinct on (case_slug) *
from public.case_study_snapshots
order by case_slug, created_at desc;

comment on view public.latest_case_study_snapshots is
  'Read-only: newest case_study_snapshots row per case_slug. Pipelines must INSERT into case_study_snapshots only.';

alter table public.case_study_snapshots enable row level security;

-- Public read (published deep dives)
drop policy if exists "anon_select_case_study_snapshots" on public.case_study_snapshots;
create policy "anon_select_case_study_snapshots"
  on public.case_study_snapshots for select
  to anon, authenticated
  using (true);

-- No client UPDATE / DELETE (golden rule)
revoke update, delete, truncate on public.case_study_snapshots from anon, authenticated;

-- Inserts: service role / backend only (no open anon insert)
revoke insert on public.case_study_snapshots from anon, authenticated;
