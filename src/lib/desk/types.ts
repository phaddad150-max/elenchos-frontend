/** Desk tenant shapes. Shared with the public live view. No scoring logic. */

export type DeskStatus = "pending" | "paid" | "live";

export type DeskTenant = {
  id: string;
  manage_token: string;
  slug: string | null;
  email: string | null;
  org_name: string;
  stripe_session_id: string | null;
  stripe_customer_id: string | null;
  status: DeskStatus;
  custom_domain: string | null;
  created_at: string;
  paid_at: string | null;
};

export type DeskBranding = {
  tenant_id: string;
  org_name: string;
  unbranded: boolean;
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
};

export type DeskPicks = {
  tenant_id: string;
  topic_ids: string[];
  custom_topics: string[];
};

export type DeskCard = {
  topic_id: string;
  topic_name: string;
  headline: string | null;
  overall_sentiment: { score?: number; label?: string } | null;
  divergence_score: number | null;
  sample_size: number | null;
  last_updated: string | null;
};

export type LiveDesk = {
  tenant: DeskTenant;
  branding: DeskBranding;
  picks: DeskPicks;
  cards: DeskCard[];
};
