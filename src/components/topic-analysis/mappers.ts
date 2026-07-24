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

const PLACEHOLDER_QA_RE =
  /limited or unclear data|insufficient clear signals|insufficient signals|public discussion exists but is fragmented|zero posts|data collapse/i;

/** Titles that are really our metric, not a citizen insight. */
const SCORE_AS_INSIGHT_RE =
  /^(sentiment|score|overall|divergence|pts?|point|rating|index)\b|^\d{1,3}\s*(\/100|pts?|%|points?)?$|sentiment\s*(score)?\s*[:=]?\s*\d|score\s*[:=]?\s*\d|^\d{1,3}\s*[·\-–—]\s*(mixed|positive|negative|stable)/i;

export function isPlaceholderQuestion(q: QuestionAnalysis): boolean {
  const text = [q.summary, ...(q.key_points ?? [])].filter(Boolean).join(" ");
  return PLACEHOLDER_QA_RE.test(text);
}

function isPlaceholderCuratedQa(c: CuratedQaPair): boolean {
  const text = [c.card_title, c.card_summary].filter(Boolean).join(" ");
  return !text.trim() || PLACEHOLDER_QA_RE.test(text);
}

/** True if text is essentially a calculated score, not a citizen insight. */
export function isScoreAsInsightText(text?: string | null): boolean {
  const t = (text ?? "").trim();
  if (!t) return true;
  if (SCORE_AS_INSIGHT_RE.test(t)) return true;
  // Pure label + number combos
  if (/^(strongly\s+)?(positive|negative|mixed|leaning\s+positive|slightly\s+positive)\s*\(?\d{0,3}\)?$/i.test(t))
    return true;
  return false;
}

function isSubstantiveInsightCard(card: InsightCardModel): boolean {
  if (isScoreAsInsightText(card.title) && isScoreAsInsightText(card.summary)) return false;
  if (isScoreAsInsightText(card.title) && !(card.summary?.trim().length > 20)) return false;
  // Need real prose somewhere
  const body = `${card.title} ${card.summary} ${card.evidence.join(" ")}`.trim();
  if (body.length < 12) return false;
  if (/^\d+(\s*\/\s*100)?$/.test(body)) return false;
  return true;
}

function insightTitleFromProse(text: string): string {
  const t = text.trim();
  if (!t || isScoreAsInsightText(t)) return "";
  const first = t.split(/(?<=[.!?])\s+/)[0] ?? t;
  if (isScoreAsInsightText(first)) {
    // Skip score-like first sentence
    const rest = t.slice(first.length).trim();
    if (rest) return (rest.split(/(?<=[.!?])\s+/)[0] ?? rest).slice(0, 120);
    return "";
  }
  return first.slice(0, 120);
}

export function keyInsightsToInsightCards(insights: string[]): InsightCardModel[] {
  return insights
    .map((raw) => raw?.trim())
    .filter((x): x is string => Boolean(x) && !PLACEHOLDER_QA_RE.test(x) && !isScoreAsInsightText(x))
    .map((text, i) => {
      const title = insightTitleFromProse(text) || text.slice(0, 100);
      return {
        id: `ki-${i}`,
        title,
        summary: text,
        score: 50,
        evidence: [],
        audiences: ["All audiences"],
        wowDelta: null,
      };
    })
    .filter(isSubstantiveInsightCard);
}

/** Pass 2 QA → Pass 1 key_insights → substantive question_analysis (skips empty-run placeholders). */
export function buildInsightCards(
  qa: CuratedQaPair[],
  snapshot: TopicSnapshot | null,
  questions: QuestionAnalysis[],
): InsightCardModel[] {
  const curated = qa.filter(
    (c) => (c.card_title?.trim() || c.card_summary?.trim()) && !isPlaceholderCuratedQa(c),
  );
  if (curated.length) {
    const cards = qaToInsightCards(curated).filter(isSubstantiveInsightCard);
    if (cards.length) return cards;
  }

  const insights = (snapshot?.key_insights ?? [])
    .map((x) => x?.trim())
    .filter((x): x is string => Boolean(x) && !PLACEHOLDER_QA_RE.test(x));
  const fromKi = keyInsightsToInsightCards(insights);
  if (fromKi.length) return fromKi;

  const substantive = questions.filter((q) => !isPlaceholderQuestion(q));
  if (substantive.length) {
    return questionsToInsightCards(substantive).filter(isSubstantiveInsightCard);
  }

  return [];
}

export function qaToInsightCards(qa: CuratedQaPair[]): InsightCardModel[] {
  return qa.map((c, i) => {
    let title = (c.card_title ?? "").trim();
    let summary = (c.card_summary ?? "").trim();
    if (isScoreAsInsightText(title)) {
      // Prefer summary or first evidence point as the insight, not the score
      const fromEvidence = (c.key_evidence ?? []).map((e) => e.point ?? "").find((p) => p && !isScoreAsInsightText(p));
      title = insightTitleFromProse(summary) || fromEvidence || "Citizen insight";
    }
    if (isScoreAsInsightText(summary)) summary = "";
    return {
      id: `${c.question_slug ?? i}`,
      title: title || "Citizen insight",
      summary,
      score: c.sentiment_score ?? 50,
      label: c.sentiment_label,
      evidence: (c.key_evidence ?? []).map((e) => e.point ?? "").filter(Boolean),
      audiences: audienceTagsForTheme(c.theme),
      theme: c.theme,
      wowDelta: c.wow_delta,
    };
  });
}

export function questionsToInsightCards(questions: QuestionAnalysis[]): InsightCardModel[] {
  return questions.map((q, i) => {
    const points = (q.key_points ?? []).filter((p) => p && !isScoreAsInsightText(p));
    const summary = (q.summary ?? "").trim();
    let title =
      points[0] ||
      insightTitleFromProse(summary) ||
      (!isScoreAsInsightText(q.question) ? (q.question ?? "").slice(0, 100) : "") ||
      "Citizen insight";
    // Prefer not to use the full Socratic question as the insight title if we have a summary
    if (title === q.question && summary && !isScoreAsInsightText(summary)) {
      title = insightTitleFromProse(summary) || title;
    }
    return {
      id: `q-${i}`,
      title,
      summary: isScoreAsInsightText(summary) ? points.slice(1).join(" ") || summary : summary,
      score: q.sentiment_score ?? 50,
      label: q.sentiment_label,
      evidence: points,
      audiences: ["All audiences"],
      theme: undefined,
      wowDelta: null,
    };
  });
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