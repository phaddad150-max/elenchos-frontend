# Critical data protection rules (never violate)

These rules apply to every migration, API route, webhook, and pipeline change.

## 1. Intelligence tables — append-only forever

Never `UPDATE`, `DELETE`, `TRUNCATE`, or `DROP`:

- `topic_snapshots`
- `curated_*` (e.g. `curated_topic_insights`, `curated_qa_pairs`)
- `dashboard_*` (e.g. `dashboard_overviews`)
- `trackers`
- `citizen_signals`
- `research_runs`, `research_sources`
- `case_study_snapshots` (deep dives / case studies — **not** topics or trackers)
- Any other historical intelligence tables / `topic_question_registry`

**Never write private Pro runs into these tables.** Public KPIs and snapshots stay admin-pipeline only.

Backend allowlist + helper: `elenchos-backend/common.py` → `APPEND_ONLY_TABLES` / `append_only_insert()`.

## 2. `research_desk_reports` — append-only rows

- Existing commission / report rows must never be modified.
- Schema: **only** `ADD COLUMN IF NOT EXISTS` (and non-destructive indexes / comments / RLS).
- New Pro / token runs: **INSERT** new rows with `user_id` set (`payment_source` = `token_balance` | `pro_grant`).
- Guest commissions: continue INSERT with `user_id` null.
- Do **not** use `ON DELETE SET NULL` / `CASCADE` on desk FKs — that would rewrite history.

## 3. Billing tables — only mutable app state

| Table | Mutability |
|-------|------------|
| `subscriptions` | Upsert / update status from Stripe webhooks |
| `token_balances` | Update only via `credit_tokens` / `debit_tokens` RPCs |
| `token_ledger` | **Append-only** (INSERT grants/debits; never UPDATE/DELETE rows) |
| `connected_accounts` | Owner update of OAuth metadata / tokens |

## 4. Migration style

- Prefer `IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `CREATE OR REPLACE` on **new** objects.
- Reject any SQL that could rewrite historical intelligence or desk row payloads.
- CHECK constraints / indexes / RLS on desk are OK if they do not `UPDATE`/`DELETE` rows.

## 5. Isolation

Token movements and private runs must stay completely isolated from:

- Pass 1 / Pass 2 topic pipelines
- `update_dashboard.py` / public KPI derivation
- Tracker refresh jobs

Same report UX (`/research/report/$token`) is fine; **different tables / columns**, never public snapshot writers.
