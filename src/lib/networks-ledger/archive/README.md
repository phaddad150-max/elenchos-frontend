# Named ledger archive (NOT for public pages)

`data.named.json` holds historical party-level research rows used **only** to derive aggregates offline.

## Rules

- **Do not import this folder** from any route, component, or public `index.ts`.
- **Do not** re-export named fields to the client bundle.
- Public site data lives in `../public-data.json` (counts, categories, official source hubs only).

## Refresh workflow

1. Update named research notes offline (optional).
2. Recompute aggregates (action types, categories, regions, series).
3. Write numbers + nameless observations into `../public-data.json`.
4. Bump `meta.lastReviewed`.
