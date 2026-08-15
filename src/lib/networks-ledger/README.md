# Networks Ledger (Phase 2)

Public tracker of **official government designations, arrests/charges, and quantified freezes** involving:

- IRGC  
- Hezbollah (Lebanese + financial arms)  
- Muslim Brotherhood chapters/affiliates  
- Hamas-linked financing  
- Mixed / Axis (clear overlaps only)

**Geography (Phase 2):** United States · US-allied Gulf (UAE + TFTC partners) · Europe (primary government/court sources) · Lebanon when the official act is a designation, freeze, or charge.

**Live URL:** `/research/networks-ledger` (Research Desk → **Library**).  
Also linked from Library → Trackers.

---

## Golden data rule

- Only **primary public government** sources (Treasury/OFAC, DOJ, State, UAE Cabinet/WAM, TFTC, EU/member-state justice where primary).  
- Every row must have a working **`source.url`**.  
- Charges are **allegations until adjudicated** (stated in UI disclaimer).  
- Do **not** invent dollar amounts; use official figures or `null`.  
- **`linkedActors`** (organizations, countries, institutions, NGOs, persons, companies) only when **named or clearly identified** in the primary source — not guilt by association.

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
  "summary": "Full multi-sentence description grounded only in the source release.",
  "source": {
    "label": "Treasury press release CODE",
    "url": "https://home.treasury.gov/...",
    "agency": "US Treasury / OFAC"
  },
  "flagship": false,
  "regionFocus": ["US"],
  "linkedActors": [
    {
      "kind": "organization",
      "name": "Named org",
      "role": "designated",
      "relation": "As stated in source",
      "direct": true
    }
  ]
}
```

3. Set `"flagship": true` only for high-impact multi-entity or large-$ packages (target ~10–14).
4. Bump `meta.lastReviewed` (YYYY-MM-DD).
5. Run the app and confirm the row appears in metrics, map, and ledger table.

### Field notes

| Field | Notes |
|-------|--------|
| `networks` | One or more of: `IRGC`, `Hezbollah`, `Muslim Brotherhood`, `Hamas`, `Mixed / Axis` |
| `country` | `US`, `UAE`, `SA`, `BH`, `LB`, `TR`, `UK`, `DE`, `MULTI`, etc. |
| `amountUsd` | Integer USD or `null`. Prefer unique packages to avoid double-counting in metrics. |
| `regionFocus` | `US` \| `Gulf` \| `Lebanon` \| `Europe` \| `Africa` \| `Other` |
| `linkedActors[].kind` | `organization` \| `country` \| `institution` \| `ngo` \| `person` \| `company` |
| `linkedActors[].role` | `designated` \| `charged` \| `arrested` \| `funder` \| `front` \| `jurisdiction` \| `beneficiary` \| `other` |
| `linkedActors[].direct` | `true` if listed SDN/defendant/named party; `false` only if source explicitly links |

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

Ship via the normal Vercel pipeline for `elenchos.live`. No Supabase tables required — data is local JSON.

### Embed / deep link

- Full page: `https://elenchos.live/research/networks-ledger`  
- Legacy anchors `#designations-ledger`, `#fraud-ledger`, `#ledger` still scroll to the tracker.

---

## Phase 3+ (later)

- Broader European prosecutions with court primary sources  
- African operations where primary government releases exist  
- Deeper Lebanese capital-flight cases **only** when tied to an official designation/freeze/charge  

---

## Disclaimer (always on page)

> Independent aggregation of public official announcements only (US Treasury/OFAC, DOJ, State, EU/member-state justice where primary, UAE Cabinet/TFTC). Charges and designations are allegations until adjudicated. Linked organizations, NGOs, institutions, and countries appear only when named or clearly identified in the primary source — not collective guilt. Not affiliated with any government.
