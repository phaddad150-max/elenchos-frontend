/** Networks Ledger — Phase 2 types (public official actions only). */

export type NetworkTag =
  | "IRGC"
  | "Hezbollah"
  | "Muslim Brotherhood"
  | "Hamas"
  | "Mixed / Axis";

export type ActionType =
  | "designation"
  | "arrest"
  | "charges"
  | "asset_freeze"
  | "forfeiture"
  | "joint_action";

export type CountryCode =
  | "US"
  | "UAE"
  | "SA"
  | "BH"
  | "LB"
  | "TR"
  | "EG"
  | "JO"
  | "SD"
  | "UK"
  | "IQ"
  | "SY"
  | "OM"
  | "QA"
  | "PL"
  | "SI"
  | "DE"
  | "FR"
  | "BE"
  | "NL"
  | "AT"
  | "CA"
  | "MULTI";

export type RegionFocus = "US" | "Gulf" | "Lebanon" | "Europe" | "Africa" | "Other";

export type LinkedActorKind =
  | "organization"
  | "country"
  | "institution"
  | "ngo"
  | "person"
  | "company";

export type LinkedActorRole =
  | "designated"
  | "charged"
  | "arrested"
  | "funder"
  | "front"
  | "jurisdiction"
  | "beneficiary"
  | "other";

/** Actor named or clearly identified in the primary government source. */
export interface LinkedActor {
  kind: LinkedActorKind;
  name: string;
  role: LinkedActorRole;
  /** Short relation grounded in source language */
  relation: string;
  /** true = listed SDN/defendant/named party; false only if source explicitly links */
  direct: boolean;
}

export interface LedgerSource {
  label: string;
  url: string;
  agency: string;
}

export interface LedgerLocation {
  /** Display label, e.g. "Washington, DC" or "Abu Dhabi, UAE" */
  label: string;
  country: CountryCode;
  /** Optional US state code when US-sited */
  usState?: string;
  lat: number;
  lng: number;
}

export interface LedgerEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: ActionType;
  networks: NetworkTag[];
  entities: string[];
  location: LedgerLocation;
  /** USD amount when publicly quantified; null if not stated */
  amountUsd: number | null;
  amountNote?: string;
  title: string;
  summary: string;
  source: LedgerSource;
  /** Highlight on Major packages strip */
  flagship?: boolean;
  /** Geography focus tags for filters */
  regionFocus: RegionFocus[];
  /** Orgs / countries / institutions / NGOs named in primary source */
  linkedActors?: LinkedActor[];
}

export interface NetworksLedgerData {
  meta: {
    title: string;
    version: string;
    phase: string;
    lastReviewed: string;
    disclaimer: string;
    scope: string;
  };
  entries: LedgerEntry[];
}
