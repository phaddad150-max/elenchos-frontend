# Stripe setup — monthly plans (v1)

## Product IA (final)

**Main nav:** Dashboard · Research · Pro · About  

- Library lives under Research only (`/research/library`) — not in main nav.  
- Public guest commission CTAs are **removed**. `/research/commission` may remain for legacy URLs but is not linked from nav, footer, sitemap, or landing pages.  
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
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PACK_STARTER=price_...
STRIPE_PRICE_PACK_PLUS=price_...
STRIPE_PRICE_PACK_MEGA=price_...
SITE_URL=https://elenchos.live
```

## Isolation

Private Pro runs: `debit_tokens` → INSERT `research_desk_reports` only (`user_id`, `payment_source=token_balance`). Never public intelligence tables.
