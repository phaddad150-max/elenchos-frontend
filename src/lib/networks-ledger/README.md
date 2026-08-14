# Networks Ledger (Phase 1)

Public tracker of **official government designations, arrests/charges, and quantified freezes** involving:

- IRGC  
- Hezbollah (Lebanese + financial arms)  
- Muslim Brotherhood chapters/affiliates  
- Hamas-linked financing  
- Mixed / Axis (clear overlaps only)

**Geography (Phase 1):** United States + US-allied Gulf (primarily UAE + TFTC partners).

**Live URL:** `/research/networks-ledger` (Research Desk → **Intelligence** tab).  
The Intelligence hub also links Leadership, Peace, Media, Football trackers and the Fraud Ledger shell.

---

## Golden data rule

- Only **primary public government** sources (Treasury/OFAC, DOJ, State, UAE Cabinet/WAM, TFTC).  
- Every row must have a working **`source.url`**.  
- Charges are **allegations until adjudicated** (stated in UI disclaimer).  
- Do **not** invent dollar amounts; use official figures or `null`.

---

## How to add a new entry

1. Open `src/lib/networks-ledger/data.json`.
2. Append an object to `entries` with this shape:

```json
{
  "id": "unique-kebab-id-yyyy-mm-dd",
  "date": "YYYY-MM-DD",
  "type": "designation | arrest | charges | asset_freeze | forfeiture | joint_action",
  "networks": ["Hezbollah"],
  "entities": ["Named person or entity"],
  "location": {
    "label": "Washington, DC",
    "country": "US",
    "usState": "DC",
    "lat": 38.9072,
    "lng": -77.0369
  },
  "amountUsd": null,
  "amountNote": "Optional context if amountUsd is set",
  "title": "Short official action title",
  "summary": "2–4 sentences grounded only in the source release.",
  "source": {
    "label": "Treasury press release CODE",
    "url": "https://home.treasury.gov/...",
    "agency": "US Treasury / OFAC"
  },
  "flagship": false,
  "regionFocus": ["US"]
}
```

3. Set `"flagship": true` only for high-impact multi-entity or large-$ packages (max ~8).
4. Bump `meta.lastReviewed` (YYYY-MM-DD).
5. Run the app and confirm the row appears in metrics, map, and ledger table.

### Field notes

| Field | Notes |
|-------|--------|
| `networks` | One or more of: `IRGC`, `Hezbollah`, `Muslim Brotherhood`, `Hamas`, `Mixed / Axis` |
| `country` | `US`, `UAE`, `SA`, `BH`, `LB`, `TR`, `UK`, `MULTI`, etc. |
| `amountUsd` | Integer USD or `null`. Prefer unique packages to avoid double-counting in metrics. |
| `regionFocus` | `US` \| `Gulf` \| `Lebanon` \| `Other` (filter/analytics helper) |

Types live in `types.ts`. Aggregations live in `index.ts`.

---

## How to deploy

This is part of the **elenchos-frontend-prod** Vite / TanStack app (not a separate deploy).

```bash
cd elenchos-frontend-prod
npm install
npm run dev          # local: http://localhost:…/research/networks-ledger
npm run build        # production bundle
```

Ship via your normal Vercel (or host) pipeline for `elenchos.live`. No Supabase tables required for Phase 1 — data is local JSON.

### Embed / deep link

- Full page: `https://elenchos.live/research/networks-ledger`  
- Research Desk card also links from `/research`.

---

## Phase 2+ (do not add yet)

- Detailed European arrests/trials (Germany, UK, etc.)  
- African operations  
- General Lebanese post-2019 capital-flight / elite real-estate cases  

---

## Disclaimer (always on page)

> Independent aggregation of public official announcements only (US Treasury/OFAC, DOJ, State, UAE Cabinet/TFTC). Charges and designations are allegations until adjudicated. Not affiliated with any government.
