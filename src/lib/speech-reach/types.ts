/** Speech Reach — code-visible limits on algorithmic distribution of already-public speech. */

export type SpeechReachStatus = "active" | "announced" | "ended" | "monitoring";

export type MetricConfidence = "directional" | "sample" | "verified_code";

export interface SpeechReachSource {
  label: string;
  url: string;
  kind: "code" | "official" | "announcement" | "dataset";
}

export interface SpectrumSlice {
  id: string;
  label: string;
  /** Share of discussion about major candidacies (0–100), aggregate only */
  sharePct: number;
  note?: string;
}

export interface TimeSeriesPoint {
  date: string; // YYYY-MM-DD
  /** Indexed organic volume for the constrained set (100 = baseline window mean) */
  volumeIndex: number;
  /** Share of candidacy discussion carried by non-listed / secondary voices (0–100) */
  nonListedSharePct: number;
}

export interface SpeechReachObservation {
  id: string;
  text: string;
  updatedAt: string;
}

export interface SpeechReachMetrics {
  /** Directional change in organic volume of posts from the constrained set */
  volumeChangePct: number;
  volumeChangeNote: string;
  /** Share of discussion about major candidacies now from non-listed / secondary voices */
  nonListedSharePct: number;
  nonListedShareNote: string;
  /** Estimated share of engagement from non-followers (follower-dependence proxy) */
  nonFollowerEngagementPct: number;
  nonFollowerNote: string;
  spectrum: SpectrumSlice[];
  series: TimeSeriesPoint[];
  confidence: MetricConfidence;
  sampleWindow: string;
  lastSampled: string;
  refreshCadence: "daily" | "weekly";
  caveats: string[];
}

export interface SpeechReachEntry {
  id: string;
  title: string;
  jurisdiction: string;
  status: SpeechReachStatus;
  /** Plain-language what the filter does */
  whatItDoes: string;
  /** Approximate count of constrained accounts — never list them */
  approximateScale: number;
  scaleLabel: string;
  activationDate: string;
  activationNote: string;
  sources: SpeechReachSource[];
  /** Primary GitHub verification file */
  verifyUrl: string;
  verifyLabel: string;
  metrics: SpeechReachMetrics;
  observations: SpeechReachObservation[];
  doesNot: string[];
}

export interface SpeechReachData {
  meta: {
    title: string;
    version: string;
    lastReviewed: string;
    framing: string;
    privacyCore: string;
    methodology: string[];
    limitations: string[];
    futureNote: string;
  };
  entries: SpeechReachEntry[];
}
