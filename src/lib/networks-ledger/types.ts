/** Networks Ledger — Phase 1 types (public official actions only). */

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
  | "MULTI";

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
  /** Highlight on Flagship Actions strip */
  flagship?: boolean;
  /** Phase-1 geography focus tags for filters */
  regionFocus: ("US" | "Gulf" | "Lebanon" | "Other")[];
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
