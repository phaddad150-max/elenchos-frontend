/**
 * Canonical score → color bands for Elenchos UI.
 *
 * Sentiment (higher = more positive citizen mood):
 *   81–100 Strongly Positive → strong green
 *   71–80  Positive            → mid green
 *   61–70  Leaning Positive    → light green  (not amber)
 *   51–60  Mixed               → amber
 *   41–50  Slightly Negative   → orange
 *   21–40  Negative            → rose
 *    0–20  Strongly Negative   → rose
 *
 * Divergence (higher = wider citizen vs official/media gap = more concern):
 *   60–100 Severe  → rose
 *   35–59  Notable → amber
 *    0–34  Low     → green
 */

export type SentimentBand =
  | "Strongly Positive"
  | "Positive"
  | "Leaning Positive"
  | "Mixed"
  | "Slightly Negative"
  | "Negative"
  | "Strongly Negative";

export type SentimentTone = {
  color: string;
  tint: string;
  band: SentimentBand | string;
};

/** Full emerald for solid positive bands (71+). */
const GREEN = "var(--emerald-signal)";
const GREEN_STRONG = "#22c55e";
const GREEN_MID = "#4ade80";
/** Lighter green for leaning positive (61–70). */
const GREEN_LIGHT = "#86efac";
const AMBER = "var(--amber-signal)";
const ORANGE = "#fb923c";
const ROSE = "var(--rose-signal)";

/** CSS color for a sentiment score 0–100. */
export function sentimentColor(score: number): string {
  if (score >= 81) return GREEN_STRONG;
  if (score >= 71) return GREEN_MID;
  if (score >= 61) return GREEN_LIGHT; // Leaning Positive — lighter green
  if (score >= 51) return AMBER;
  if (score >= 41) return ORANGE;
  return ROSE;
}

/** Full tone object for cards/modals (score preferred; label as fallback). */
export function sentimentTone(
  score?: number | null,
  label?: string | null,
): SentimentTone {
  if (typeof score === "number" && !Number.isNaN(score)) {
    if (score >= 81)
      return { color: GREEN_STRONG, tint: "rgba(34,197,94,0.14)", band: "Strongly Positive" };
    if (score >= 71)
      return { color: GREEN_MID, tint: "rgba(74,222,128,0.14)", band: "Positive" };
    if (score >= 61)
      return { color: GREEN_LIGHT, tint: "rgba(134,239,172,0.16)", band: "Leaning Positive" };
    if (score >= 51)
      return { color: AMBER, tint: "rgba(245,158,11,0.12)", band: "Mixed" };
    if (score >= 41)
      return { color: ORANGE, tint: "rgba(251,146,60,0.12)", band: "Slightly Negative" };
    if (score >= 21)
      return { color: ROSE, tint: "rgba(244,63,94,0.12)", band: "Negative" };
    return { color: ROSE, tint: "rgba(244,63,94,0.12)", band: "Strongly Negative" };
  }

  const lab = (label ?? "").toLowerCase();
  if (lab.includes("strongly positive"))
    return { color: GREEN_STRONG, tint: "rgba(34,197,94,0.14)", band: "Strongly Positive" };
  // "Slightly Positive" (backend/Grok) and "Leaning Positive" both map to light green
  if (lab.includes("slightly positive") || lab.includes("leaning positive"))
    return { color: GREEN_LIGHT, tint: "rgba(134,239,172,0.16)", band: "Leaning Positive" };
  if (lab.includes("positive"))
    return { color: GREEN_MID, tint: "rgba(74,222,128,0.14)", band: "Positive" };
  if (lab.includes("strongly negative"))
    return { color: ROSE, tint: "rgba(244,63,94,0.12)", band: "Strongly Negative" };
  if (lab.includes("slightly negative"))
    return { color: ORANGE, tint: "rgba(251,146,60,0.12)", band: "Slightly Negative" };
  if (lab.includes("negative"))
    return { color: ROSE, tint: "rgba(244,63,94,0.12)", band: "Negative" };
  return { color: AMBER, tint: "rgba(245,158,11,0.12)", band: label ?? "Mixed" };
}

/**
 * Compact cards: preserve light green for 61–70 (do not collapse into full emerald).
 * 71+ full green · 61–70 light green · 41–60 amber · else rose
 */
export function sentimentColorCoarse(score: number): string {
  if (score >= 71) return GREEN;
  if (score >= 61) return GREEN_LIGHT;
  if (score >= 41) return AMBER;
  return ROSE;
}

export function sentimentBandFromScore(score: number): SentimentBand {
  if (score >= 81) return "Strongly Positive";
  if (score >= 71) return "Positive";
  if (score >= 61) return "Leaning Positive";
  if (score >= 51) return "Mixed";
  if (score >= 41) return "Slightly Negative";
  if (score >= 21) return "Negative";
  return "Strongly Negative";
}

/** Divergence: higher = worse (rose). */
export function divergenceColor(score: number): string {
  if (score >= 60) return ROSE;
  if (score >= 35) return AMBER;
  return GREEN;
}

export function divergenceBand(score: number): string {
  if (score >= 60) return "Severe divergence";
  if (score >= 35) return "Notable divergence";
  return "Low divergence";
}

/** Coarse positive / mixed / negative wording for UI chips. */
export function sentimentNetLabel(score: number): string {
  if (score >= 61) return "Net positive";
  if (score >= 41) return "Mixed signal";
  return "Net negative";
}
