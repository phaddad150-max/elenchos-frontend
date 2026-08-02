-- Research Desk on-demand reports
-- Privacy: NO email, name, or payment PAN columns. Topic text only + report JSON.

create table if not exists public.research_desk_reports (
  token text primary key,
  stripe_session_id text unique not null,
  package_id text not null,
  topic text not null,
  questions text default '',
  report jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists research_desk_reports_created_at_idx
  on public.research_desk_reports (created_at desc);

comment on table public.research_desk_reports is
  'On-demand Research Desk reports. No personal identity fields. Append-oriented.';

-- Public read by token only via service role / server; lock down anon
alter table public.research_desk_reports enable row level security;

-- No anon policies: server service role bypasses RLS
