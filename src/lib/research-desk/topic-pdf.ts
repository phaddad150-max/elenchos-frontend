/**
 * Build a DeskReport-shaped payload from a live topic snapshot for branded PDF export
 * (same layout family as commissioned UAE fintech sample).
 */
import type { CuratedQaPair, CuratedTopicInsights, TopicSnapshot } from "@/lib/dashboard-data";
import { getNarrativeGapFrames } from "@/lib/dashboard-data";
import { reportToPdfBytes, type DeskReport } from "./build-report";

export function liveTopicToDeskReport(
  rootKey: string,
  headerLabel: string,
  data: TopicSnapshot,
  curated?: CuratedTopicInsights | null,
  qa?: CuratedQaPair[] | null,
): DeskReport {
  const os = data.overall_sentiment;
  const score =
    typeof os === "object" && os && typeof os.score === "number" ? os.score : null;
  const label =
    typeof os === "object" && os && typeof os.label === "string" ? os.label : null;
  const trend =
    typeof os === "object" && os && typeof os.trend === "string" ? os.trend : null;
  const gap = getNarrativeGapFrames(data);
  const qaList = (qa ?? []).slice(0, 12);
  const questions = qaList
    .map((q) => q.source_question || q.card_title || "")
    .filter(Boolean) as string[];
  if (!questions.length && data.question_analysis?.length) {
    for (const q of data.question_analysis) {
      if (q.question) questions.push(q.question);
    }
  }

  return {
    token: `live-${rootKey.slice(0, 40)}`,
    packageId: "topic-analysis",
    topic: rootKey,
    questions,
    title: headerLabel || rootKey,
    createdAt: data.last_updated ?? new Date().toISOString(),
    disclaimer:
      "Independent aggregation of public discourse samples. Directional, not a poll. Experimental research — not legal advice. elenchos.live",
    overallSentiment: { score, label, trend },
    divergenceScore:
      typeof data.divergence_score === "number" ? data.divergence_score : null,
    sampleSize:
      typeof data.sample_size === "number"
        ? data.sample_size
        : typeof data.fetched_post_count === "number"
          ? data.fetched_post_count
          : null,
    sampleNote: "Public X sample · live Topics pipeline",
    narrativeGap: {
      headline: gap.gapHeadline || curated?.hero_headline || null,
      citizenFrame: gap.citizenFrame || null,
      officialMediaFrame: gap.officialMediaFrame || null,
      scoreRationale: gap.scoreRationale || null,
      fullOverview: gap.fullOverview || curated?.hero_summary || null,
      gapPoints: (gap.gapPoints ?? []) as never[],
    },
    questionAnalyses: (data.question_analysis ?? []).map((q) => ({
      question: q.question ?? "",
      answer: q.summary ?? "",
      cardTitle: null,
      sentimentScore: q.sentiment_score ?? null,
      sentimentLabel: q.sentiment_label ?? null,
      keyPoints: q.key_points ?? [],
      confidence: "medium" as const,
    })),
    keyInsights: Array.isArray(data.key_insights)
      ? data.key_insights.map(String)
      : [],
    insightThreads: (curated?.insight_threads ?? []).map((t) => ({
      theme: t.theme,
      headline: t.headline,
      summary: t.summary,
      confidence: t.confidence,
    })),
    curatedSynthesis: curated
      ? {
          headline: curated.hero_headline,
          summary: curated.hero_summary,
          confidence: curated.hero_confidence,
        }
      : undefined,
    methodNotes: [
      "Live Topics Pass-1 sample + optional Pass-2 curation.",
      "Append-only history in topic_snapshots — this PDF is a point-in-time export.",
    ],
    limits: [
      "Not a national poll. Sample is directional public discourse on X.",
      "Charges/designations elsewhere are separate Library trackers.",
    ],
    sections: [
      {
        heading: "Narrative summary",
        body: [data.narrative_summary || curated?.hero_summary || "—"],
      },
    ],
    status: "ready",
    generatedBy: "hybrid",
  };
}

/** Trigger browser download of branded topic PDF (UAE fintech layout family). */
export function downloadLiveTopicPdf(
  rootKey: string,
  headerLabel: string,
  data: TopicSnapshot,
  curated?: CuratedTopicInsights | null,
  qa?: CuratedQaPair[] | null,
): void {
  if (typeof window === "undefined") return;
  const report = liveTopicToDeskReport(rootKey, headerLabel, data, curated, qa);
  const bytes = reportToPdfBytes(report);
  // Ensure ArrayBuffer-backed BlobPart (avoid SharedArrayBuffer typing issues)
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy.buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const slug = headerLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  a.download = `Elenchos_${slug || "topic"}_briefing.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
