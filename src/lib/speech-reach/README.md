# Speech Reach (Networks Ledger branch)

Tracks **code-visible legal and platform rules** that limit the algorithmic distribution of **already-public** speech on X (primarily For You).

**Live URL:** `/research/networks-ledger/speech-reach`  
**Parent hub:** `/research/networks-ledger`

## Privacy rules (non-negotiable)

- Never publish individual account names, handles, user IDs, or specific posts on public pages.
- Metrics stay aggregated / system-level.
- Exact lists → original public GitHub (and official datasets cited in code).
- Preferred language: “kept out of For You recommendations”, “limited algorithmic distribution”, “recommendation restriction”.
- Emphasise: speech remains public and accessible.

## Adding a jurisdiction entry

1. Append to `data.json` → `entries` with the same shape as Brazil 2026.
2. Keep `approximateScale` as a number; never embed lists of handles.
3. Point `verifyUrl` at the public filter file.
4. Bump `meta.lastReviewed`.
5. Metrics must stay directional with explicit caveats until a verified sample window exists.

## Metrics pipeline (v1 → later)

v1 ships **directional seed metrics** in JSON (`confidence: "directional"`) for layout and user understanding.  
Refresh cadence is declared on each entry (`daily` | `weekly`). A future backend job can overwrite the same fields without UI redesign.
