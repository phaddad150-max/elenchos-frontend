# Networks Ledger

| Branch | URL | Privacy |
|--------|-----|---------|
| **Terror & Finance Networks** | `/research/networks-ledger` | Aggregate only — no party names |
| **Speech Reach** | `/research/networks-ledger/speech-reach` | System metrics — no account names |

## Terror & Finance (privacy-first)

Public page shows:

- Aggregate metrics (designations, freezes, arrests/charges, geography, categories)
- Time-series of official action volume
- Nameless observations
- Permanent links to **official public lists** (OFAC, State FTO, DOJ, TFTC, UK, EU, UAE WAM)

**Never** on public pages or client modules:

- Individual names
- Organisation / entity identifiers
- Linked-actor chips, named tables, named map popups

### Data files

| File | Role |
|------|------|
| `public-data.json` | **Shipped** — aggregates + source hubs only |
| `archive/data.named.json` | Offline research archive — **do not import** |

### Update cadence

Weekly review against official hubs; change only numbers and observation text in `public-data.json`.
