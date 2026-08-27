/** True when a snapshot has a real public-discourse sample (not empty / catalog). */
export function hasLiveDiscourseSample(
  sampleSize?: number | null,
  fetchedPostCount?: number | null,
): boolean {
  const sample = typeof sampleSize === "number" ? sampleSize : 0;
  const fetched = typeof fetchedPostCount === "number" ? fetchedPostCount : 0;
  return sample > 0 || fetched > 0;
}

/** Share only finite scores from a live sample. Empty stays empty — no catalog / NaN. */
export function liveShareScore(
  score: unknown,
  sampleSize?: number | null,
  fetchedPostCount?: number | null,
): number | null {
  if (!hasLiveDiscourseSample(sampleSize, fetchedPostCount)) return null;
  if (typeof score !== "number" || !Number.isFinite(score)) return null;
  return Math.round(score);
}

/** Build compact X share text for topic insights + narrative gap frames. */

function firstSentence(text: string, max = 140): string {
  const t = text.trim();
  if (!t) return "";
  const m = t.match(/^(.+?[.!?])(?:\s|$)/);
  const s = (m?.[1] ?? t).trim();
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

export function buildInsightShareText(opts: {
  topicLabel: string;
  insightTitle?: string;
  sentimentScore?: number | null;
  divergenceScore?: number | null;
  citizenFrame?: string;
  officialMediaFrame?: string;
  gapHeadline?: string;
  divergenceNote?: string;
  divergenceGap?: string;
}): string {
  const parts: string[] = [];
  const topic = opts.topicLabel.trim() || "Elenchos";
  const metrics: string[] = [];
  if (typeof opts.sentimentScore === "number") metrics.push(`Sentiment ${Math.round(opts.sentimentScore)}/100`);
  if (typeof opts.divergenceScore === "number") metrics.push(`Gap ${Math.round(opts.divergenceScore)}`);
  parts.push(metrics.length ? `${topic} · ${metrics.join(" · ")}` : topic);

  if (opts.insightTitle?.trim()) {
    parts.push(opts.insightTitle.trim().slice(0, 100));
  }

  const citizen = opts.citizenFrame?.trim();
  const official = opts.officialMediaFrame?.trim();
  if (citizen && official) {
    parts.push(`Citizens: ${firstSentence(citizen, 90)}`);
    parts.push(`Official/media: ${firstSentence(official, 90)}`);
  } else {
    const gap =
      opts.divergenceNote?.trim() ||
      opts.gapHeadline?.trim() ||
      firstSentence(opts.divergenceGap ?? "", 120);
    if (gap) parts.push(gap);
  }

  parts.push("via @ElenchosPulse");
  let text = parts.filter(Boolean).join("\n");
  // Twitter intent length headroom for URL
  if (text.length > 240) text = text.slice(0, 237).trimEnd() + "…";
  return text;
}

export function buildTwitterShareHref(text: string, url: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}
