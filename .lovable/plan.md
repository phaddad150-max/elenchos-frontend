## Goal
Hide all Sponsor-related UI and disable Stripe checkout calls, while keeping every file, table, route, and backend integration intact so the architecture can be redesigned later without data loss.

## Approach: Single feature flag, no deletions

Introduce one boolean flag `SPONSOR_ENABLED = false` in `src/lib/sponsor-topics.ts`. Every Sponsor surface reads from that flag and renders nothing (or a neutral fallback) when it's off. Flipping it back to `true` later restores the current behavior exactly.

No files are deleted. No tables are dropped. No Stripe keys are removed. The `topic_sponsorships` rows, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and the `create-stripe-checkout` edge function all stay in place, just unused.

## Changes

1. **`src/lib/sponsor-topics.ts`** — add `export const SPONSOR_ENABLED = false;` at the top. Keep all topic arrays and helpers untouched so server fn imports still compile.

2. **`src/components/SiteNav.tsx` / `SiteFooter.tsx`** — hide any "Sponsor" nav link / footer link behind `SPONSOR_ENABLED`.

3. **`src/routes/index.tsx`** (Dashboard hero) — hide the "Sponsor" CTA button when the flag is off; keep "Explore topics" as the sole CTA.

4. **`src/routes/topics.tsx`** —
   - Skip the `getUnlockedSponsorTopics` server-fn call when flag is off.
   - Filter out the `SPONSOR_LOCKED_TOPIC_IDS` topics from the grid entirely (so no `SponsorMeCard` and no locked tiles render).
   - Treat the `?success=true` redirect path as a no-op.
   - Do not render `SponsorModal`.

5. **`src/routes/sponsor.tsx` and `src/routes/sponsor.success.tsx`** — keep the files but render a minimal "Sponsorships are paused while we redesign this experience" placeholder. No Stripe call, no modal, no form. Files stay so links don't 404 and route tree regen is unaffected.

6. **`src/components/SponsorModal.tsx`** — leave the component file in place (so imports compile), but early-return `null` whenever `SPONSOR_ENABLED` is false. No fetch to `create-stripe-checkout` will ever fire.

7. **Stripe backend** — leave untouched. We are NOT calling `update_stripe_secret_key`, NOT deleting the edge function, NOT removing secrets. With every caller gated behind the flag, no checkout sessions can be created from the app. If you also want me to formally disable the Lovable-managed Stripe integration in the backend, say so and I'll add that step — by default this plan leaves it connected but idle.

## What this preserves
- `topic_sponsorships` rows and any past sponsor data.
- `SPONSOR_TOPICS`, `SPONSOR_COMING_SOON_TOPICS`, `SPONSOR_LOCKED_TOPIC_IDS` arrays — available for the new architecture.
- The `/sponsor` and `/sponsor/success` routes, the `SponsorModal` component, the `getUnlockedSponsorTopics` server function, and the `create-stripe-checkout` edge function — all dormant but ready.
- Stripe secrets and webhook configuration.

## Re-enabling later
Flip `SPONSOR_ENABLED` back to `true`. Everything returns. If the new sponsor architecture is different enough, we instead build it alongside and delete the flag once cut over.

## Open question
Do you also want me to disconnect the Lovable-managed Stripe integration in the backend (no charges possible at all, even if someone hits the edge function directly), or keep it connected and just remove every UI path to it? Default in this plan is "keep connected, remove UI paths."