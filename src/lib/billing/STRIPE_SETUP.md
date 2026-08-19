# Stripe setup — monthly plans (v1)

Guest Research Desk packages (`topic-analysis` / `deep-no-x` / `deep-with-x`) still use one-time Checkout. **Billing on `/pro` is monthly only** for now.

## Products live (3 options)

| Plan | Mode | Amount | Tokens / period | Env var |
|------|------|--------|-----------------|---------|
| Starter | **Recurring monthly** | $10 | 10 | `STRIPE_PRICE_PACK_STARTER` |
| Plus | **Recurring monthly** | $40 | 50 | `STRIPE_PRICE_PACK_PLUS` |
| Mega | **Recurring monthly** | $90 | 120 | `STRIPE_PRICE_PACK_MEGA` |

Recommended Price metadata on each:

- `plan_id` = `pack_starter` | `pack_plus` | `pack_mega`
- `tokens` / `tokens_granted` = `10` | `50` | `120`

## Deferred (not wired)

- Separate “Elenchos Pro $29” product
- One-time token packs

## Checkout

| Flow | Stripe `mode` | App effect |
|------|---------------|------------|
| Starter / Plus / Mega | `subscription` | Upsert `subscriptions`; grant tokens on `checkout.session.completed` + renewals via `invoice.paid` |
| Guest commission | `payment` (existing) | Unchanged |

## Webhook

Keep: `https://elenchos.live/api/research/webhook`

Events:

- `checkout.session.completed`
- `invoice.paid`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Vercel env

```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PACK_STARTER=price_...
STRIPE_PRICE_PACK_PLUS=price_...
STRIPE_PRICE_PACK_MEGA=price_...
SITE_URL=https://elenchos.live
```

Paste the three `price_…` IDs when ready to deploy.
