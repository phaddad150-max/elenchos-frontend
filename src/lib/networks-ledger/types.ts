/** Terror & Finance Networks — privacy-first public types (no party identifiers). */

export type ActionTypeBucket =
  | "designation"
  | "arrest"
  | "charges"
  | "asset_freeze"
  | "forfeiture"
  | "joint_action";

export type SourceKind = "official_list" | "official_hub";

export interface CountSlice {
  id: string;
  label: string;
  count: number;
  note?: string;
}

export interface SeriesPoint {
  date: string; // YYYY-MM
  actions: number;
}

export interface Observation {
  id: string;
  text: string;
  updatedAt: string;
}

export interface OfficialSource {
  id: string;
  label: string;
  agency: string;
  url: string;
  kind: SourceKind;
}

export interface TerrorFinanceMetrics {
  totalActions: number;
  designationsAndJoint: number;
  designations: number;
  jointActions: number;
  assetFreezes: number;
  arrestsCharges: number;
  actionsSince2025: number;
  actionsLatestPeriod: number;
  quantifiedFundsUsdApprox: number | null;
  quantifiedFundsNote: string;
}

export interface TerrorFinancePublicData {
  meta: {
    title: string;
    version: string;
    phase: string;
    lastReviewed: string;
    framing: string;
    privacyCore: string;
    scope: string;
    methodology: string[];
    limitations: string[];
  };
  period: {
    label: string;
    from: string;
    to: string;
    corpusLabel: string;
  };
  metrics: TerrorFinanceMetrics;
  byActionType: CountSlice[];
  byNetworkCategory: CountSlice[];
  byRegion: CountSlice[];
  series: SeriesPoint[];
  observations: Observation[];
  sources: OfficialSource[];
}
