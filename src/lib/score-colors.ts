/**
 * Canonical score → color bands for Elenchos UI.
 * Colors use CSS variables (`--emerald-*`, `--amber-signal`, `--rose-signal`)
 * tuned to the brand neon family (high chroma, cyan-adjacent greens).
 * Band thresholds stay fixed — only token tones change in styles.css.
 *
 * Sentiment (higher = more positive citizen mood):
 *   81–100 Strongly Positive → strong green (neon mint)
 *   71–80  Positive            → mid green
 *   61–70  Leaning Positive    → lean green / cyan-edge (not amber)
 *   51–60  Mixed               → amber (neon gold)
 *   41–50  Slightly Negative   → orange
 *   21–40  Negative            → rose
 *    0–20  Strongly Negative   → rose (hot coral)
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

const GREEN = "var(--emerald-signal)";
const GREEN_STRONG = "var(--emerald-strong)";
const GREEN_MID = "var(--emerald-mid)";
/** Leaning positive — darker than pastel so it reads on light backgrounds */
const GREEN_LEAN = "var(--emerald-lean)";
const AMBER = "var(--amber-signal)";
const ORANGE = "var(--orange-signal)";
const ROSE = "var(--rose-signal)";

const TINT_GREEN = "var(--emerald-tint)";
const TINT_LEAN = "var(--emerald-lean-tint)";
const TINT_AMBER = "var(--amber-tint)";
const TINT_ORANGE = "var(--orange-tint)";
const TINT_ROSE = "var(--rose-tint)";

/** CSS color for a sentiment score 0–100. */
export function sentimentColor(score: number): string {
  if (score >= 81) return GREEN_STRONG;
  if (score >= 71) return GREEN_MID;
  if (score >= 61) return GREEN_LEAN;
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
      return { color: GREEN_STRONG, tint: TINT_GREEN, band: "Strongly Positive" };
    if (score >= 71)
      return { color: GREEN_MID, tint: TINT_GREEN, band: "Positive" };
    if (score >= 61)
      return { color: GREEN_LEAN, tint: TINT_LEAN, band: "Leaning Positive" };
    if (score >= 51)
      return { color: AMBER, tint: TINT_AMBER, band: "Mixed" };
    if (score >= 41)
      return { color: ORANGE, tint: TINT_ORANGE, band: "Slightly Negative" };
    if (score >= 21)
      return { color: ROSE, tint: TINT_ROSE, band: "Negative" };
    return { color: ROSE, tint: TINT_ROSE, band: "Strongly Negative" };
  }

  const lab = (label ?? "").toLowerCase();
  if (lab.includes("strongly positive"))
    return { color: GREEN_STRONG, tint: TINT_GREEN, band: "Strongly Positive" };
  if (lab.includes("slightly positive") || lab.includes("leaning positive"))
    return { color: GREEN_LEAN, tint: TINT_LEAN, band: "Leaning Positive" };
  if (lab.includes("positive"))
    return { color: GREEN_MID, tint: TINT_GREEN, band: "Positive" };
  if (lab.includes("strongly negative"))
    return { color: ROSE, tint: TINT_ROSE, band: "Strongly Negative" };
  if (lab.includes("slightly negative"))
    return { color: ORANGE, tint: TINT_ORANGE, band: "Slightly Negative" };
  if (lab.includes("negative"))
    return { color: ROSE, tint: TINT_ROSE, band: "Negative" };
  return { color: AMBER, tint: TINT_AMBER, band: label ?? "Mixed" };
}

/**
 * Compact cards: preserve lean green for 61–70 (do not collapse into full emerald).
 */
export function sentimentColorCoarse(score: number): string {
  if (score >= 71) return GREEN;
  if (score >= 61) return GREEN_LEAN;
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
