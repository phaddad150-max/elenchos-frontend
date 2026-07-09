import type {
  CuratedQaPair,
  CuratedTopicInsights,
  InsightThread,
  QuestionAnalysis,
  TopicHistoryPoint,
  TopicSnapshot,
} from "@/lib/dashboard-data";

export type AudienceLens = {
  id: "journalist" | "researcher" | "policymaker";
  title: string;
  subtitle: string;
  summary: string;
  insights: string[];
  accent: string;
};

export type InsightCardModel = {
  id: string;
  title: string;
  summary: string;
  score: number;
  label?: string;
  evidence: string[];
  audiences: string[];
  theme?: string;
  wowDelta?: number | null;
};

const JOURNALIST_THEMES = new Set(["culture", "society", "public opinion", "security"]);
const RESEARCHER_THEMES = new Set(["economy", "governance", "diplomacy", "geopolitics"]);
const POLICY_THEMES = new Set(["geopolitics", "governance", "diplomacy", "security"]);

export function buildAudienceLenses(
  curated: CuratedTopicInsights | null,
  snapshot: TopicSnapshot | null,
  qa: CuratedQaPair[],
): AudienceLens[] {
  if (curated?.audience_lenses) {
    const al = curated.audience_lenses;
    return [
      {
        id: "journalist",
        title: "Citizen Journalist",
        subtitle: "Story angles & on-the-ground signals",
        summary: al.journalist?.summary ?? "",
        insights: al.journalist?.insights?.slice(0, 4) ?? [],
        accent: "var(--cyan)",
      },
      {
        id: "researcher",
        title: "Researcher / Student",
        subtitle: "Evidence density & methodological notes",
        summary: al.researcher?.summary ?? "",
        insights: al.researcher?.insights?.slice(0, 4) ?? [],
        accent: "var(--violet, #a78bfa)",
      },
      {
        id: "policymaker",
        title: "Policymaker / Diplomat",
        subtitle: "Governance gaps & narrative risk",
        summary: al.policymaker?.summary ?? "",
        insights: al.policymaker?.insights?.slice(0, 4) ?? [],
        accent: "var(--amber-signal)",
      },
    ].filter((l) => l.summary || l.insights.length) as AudienceLens[];
  }

  const threads = curated?.insight_threads ?? [];
  const pick = (themes: Set<string>) =>
    threads
      .filter((t) => themes.has((t.theme ?? "").toLowerCase()))
      .slice(0, 4)
      .map((t) => t.headline || t.summary || "")
      .filter(Boolean);

  const hero = curated?.hero_summary ?? snapshot?.narrative_summary ?? "";
  const insights = snapshot?.key_insights ?? [];

  return [
    {
      id: "journalist",
      title: "Citizen Journalist",
      subtitle: "Story angles & fan-facing signals",
      summary: curated?.hero_headline ?? hero.split(/(?<=[.!?])\s+/)[0] ?? "",
      insights: pick(JOURNALIST_THEMES).length
        ? pick(JOURNALIST_THEMES)
        : insights.slice(0, 3),
      accent: "var(--cyan)",
    },
    {
      id: "researcher",
      title: "Researcher / Student",
      subtitle: "Patterns, sample context, evidence",
      summary: `Based on ${snapshot?.sample_size ?? "—"} paraphrased public posts. ${curated?.evolution_note ?? ""}`.trim(),
      insights: pick(RESEARCHER_THEMES).length
        ? pick(RESEARCHER_THEMES)
        : qa.slice(0, 3).map((c) => c.card_title || c.card_summary || "").filter(Boolean),
      accent: "#a78bfa",
    },
    {
      id: "policymaker",
      title: "Policymaker / Diplomat",
      subtitle: "Institutional narrative gaps",
      summary: snapshot?.divergence_gap?.split(/(?<=[.!?])\s+/)[0] ?? curated?.hero_summary?.split(/(?<=[.!?])\s+/)[0] ?? "",
      insights: pick(POLICY_THEMES).length
        ? pick(POLICY_THEMES)
        : threads
            .filter((t) => t.divergence_note)
            .slice(0, 3)
            .map((t) => `${t.headline ?? t.theme}: ${t.divergence_note}`)
            .filter(Boolean),
      accent: "var(--amber-signal)",
    },
  ];
}

export function qaToInsightCards(qa: CuratedQaPair[]): InsightCardModel[] {
  return qa.map((c, i) => ({
    id: `${c.question_slug ?? i}`,
    title: c.card_title ?? "Insight",
    summary: c.card_summary ?? "",
    score: c.sentiment_score ?? 50,
    label: c.sentiment_label,
    evidence: (c.key_evidence ?? []).map((e) => e.point ?? "").filter(Boolean),
    audiences: audienceTagsForTheme(c.theme),
    theme: c.theme,
    wowDelta: c.wow_delta,
  }));
}

export function questionsToInsightCards(questions: QuestionAnalysis[]): InsightCardModel[] {
  return questions.map((q, i) => ({
    id: `q-${i}`,
    title: (q.summary ?? q.question ?? "Insight").split(/(?<=[.!?])\s+/)[0] ?? "Insight",
    summary: q.summary ?? "",
    score: q.sentiment_score ?? 50,
    label: q.sentiment_label,
    evidence: q.key_points ?? [],
    audiences: ["All audiences"],
    theme: undefined,
    wowDelta: null,
  }));
}

function audienceTagsForTheme(theme?: string): string[] {
  const t = (theme ?? "").toLowerCase();
  if (JOURNALIST_THEMES.has(t)) return ["Journalist", "Citizen"];
  if (RESEARCHER_THEMES.has(t)) return ["Researcher"];
  if (POLICY_THEMES.has(t)) return ["Policymaker"];
  return ["All"];
}

export function historySentimentSeries(history: TopicHistoryPoint[]): { label: string; score: number }[] {
  return [...history]
    .reverse()
    .map((h) => {
      const os = h.overall_sentiment;
      const score =
        typeof os === "object" && os && typeof os.score === "number" ? os.score : 50;
      return { label: h.month ?? h.last_updated?.slice(0, 10) ?? "—", score };
    })
    .filter((p) => p.label !== "—");
}

export function sortThreads(threads: InsightThread[]): InsightThread[] {
  return [...threads].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
}