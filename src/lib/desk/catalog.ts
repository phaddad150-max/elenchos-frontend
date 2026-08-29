/** One public SKU: the dashboard, licensed. Scoring code stays locked. */

export const DESK_PRICE_USD = 49;
export const DESK_INTERVAL = "month" as const;

export const DESK_PRODUCT_NAME = "Elenchos Desk";
export const DESK_PRODUCT_BLURB =
  "Your public-discourse dashboard. Pay, brand it, pick topics, generate a live URL. Truth-scoring stays on Elenchos.";

export const DESK_INCLUDED = [
  "Branded or unbranded dashboard (this live site is the template)",
  "Your own data tables created at payment",
  "Topic picker + Generate → free live link on elenchos.live",
  "Connect your own domain (CNAME)",
  "Scoring / Pass-1 logic is not exported — you buy the surface, not the method",
] as const;
