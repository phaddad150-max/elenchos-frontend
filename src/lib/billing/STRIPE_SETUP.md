# Stripe setup — monthly plans (v1)

## Product IA (final)

**Main nav:** Dashboard · Research · Pro · About  

- **Research** tab opens Library content directly (`/research/library`). `/research` redirects there — no intermediate landing.  
- Public guest commission CTAs are **removed**. `/research/commission` may remain for legacy URLs but is not linked.  
- Private analyses: **Pro** monthly packs + token wallet.

## Products live (3 monthly options)

| Plan | Mode | Amount | Tokens / period | Env var |
|------|------|--------|-----------------|---------|
| Starter | Recurring monthly | $10 | 10 | `STRIPE_PRICE_PACK_STARTER` |
| Plus | Recurring monthly | $40 | 50 | `STRIPE_PRICE_PACK_PLUS` |
| Mega | Recurring monthly | $90 | 120 | `STRIPE_PRICE_PACK_MEGA` |

## Webhook

`https://elenchos.live/api/research/webhook`

Events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`

## Vercel env

```
# Preferred while packs are Test-mode prices (avoids live/test mismatch):
STRIPE_SECRET_KEY_TEST=sk_test_...
# Optional: keep live key for later Live prices (checkout ignores it if TEST is set)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PACK_STARTER=price_1U62rN2EYDynfsPbGBfZED8c
STRIPE_PRICE_PACK_PLUS=price_1U62u62EYDynfsPbCXLtpn39
STRIPE_PRICE_PACK_MEGA=price_1U62vt2EYDynfsPbFsNiomxK
SITE_URL=https://elenchos.live
```

**Mode rule:** Test Price IDs only work with `sk_test_`. A `sk_live_` key + test prices → Stripe error
`No such price … exists in test mode, but a live mode key was used`. Checkout prefers
`STRIPE_SECRET_KEY_TEST` when present.

### Test-mode Price IDs (Aug 2026)

| Env var | Price id | Plan |
|---------|----------|------|
| `STRIPE_PRICE_PACK_STARTER` | `price_1U62rN2EYDynfsPbGBfZED8c` | Starter $10/mo |
| `STRIPE_PRICE_PACK_PLUS` | `price_1U62u62EYDynfsPbCXLtpn39` | Plus $40/mo |
| `STRIPE_PRICE_PACK_MEGA` | `price_1U62vt2EYDynfsPbFsNiomxK` | Mega $90/mo |

Code falls back to these IDs automatically **only when** `STRIPE_SECRET_KEY` starts with `sk_test_` and the env var is empty. For Live mode, create Live prices and set the env vars — no test fallback applies.

**Important:** set vars on the Vercel project that serves `elenchos.live` (not CatchSnap / paused siblings), for **Production + Preview + Development**, then redeploy.

Known project names under team `elenchos-live` (may both exist):

- `elenchos-frontend`
- `frontend-elenchos`

Dashboard: [Vercel team elenchos-live](https://vercel.com/elenchos-live) → open the project whose Domains include `elenchos.live` / `www.elenchos.live` → **Settings → Environment Variables** → add the three `STRIPE_PRICE_PACK_*` values above → **Deployments → Redeploy** (or push to `main`).

Confirm `STRIPE_SECRET_KEY` is `sk_test_…` while these Test Price IDs are in use.

## Isolation

Private Pro runs: `debit_tokens` → INSERT `research_desk_reports` only (`user_id`, `payment_source=token_balance`). Never public intelligence tables.
