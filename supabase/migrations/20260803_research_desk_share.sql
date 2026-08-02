-- Opt-in public share for paid Research Desk reports (no PII).
-- Owner of the secret token can toggle share; listing only shows shared rows.

alter table public.research_desk_reports
  add column if not exists shared_public boolean not null default false;

alter table public.research_desk_reports
  add column if not exists shared_at timestamptz;

create index if not exists research_desk_reports_shared_public_idx
  on public.research_desk_reports (shared_public, shared_at desc)
  where shared_public = true;

comment on column public.research_desk_reports.shared_public is
  'When true, report may appear in the public Research library (topic + report body only; no PII).';
