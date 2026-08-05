-- Commission v2: full brief stored before Stripe; generation status machine.
-- stripe_session_id may be null until payment completes.

alter table public.research_desk_reports
  alter column stripe_session_id drop not null;

alter table public.research_desk_reports
  add column if not exists status text not null default 'ready';

alter table public.research_desk_reports
  add column if not exists error_message text;

-- pending_payment | paid | generating | ready | failed
comment on column public.research_desk_reports.status is
  'Commission lifecycle: pending_payment → paid → generating → ready | failed';

-- Allow longer questions (was effectively capped in app code)
alter table public.research_desk_reports
  alter column questions type text;

create index if not exists research_desk_reports_status_idx
  on public.research_desk_reports (status);
