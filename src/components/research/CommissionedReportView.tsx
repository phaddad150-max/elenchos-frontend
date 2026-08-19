import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Brain,
  ChevronDown,
  Download,
  FlaskConical,
  Lightbulb,
  Mail,
  Minus,
  Scale,
  Share2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import type {
  DeskGapPoint,
  DeskInsightThread,
  DeskReport,
  DeskQuestionAnalysis,
} from "@/lib/research-desk/build-report";
import { DESK_PACKAGES } from "@/lib/research-desk/packages";
import { ContactEmailMe } from "@/components/ContactEmailMe";
import { DataFreshnessBar } from "@/components/DataFreshnessBar";
import { NarrativeGapPanel } from "@/components/topic-analysis/NarrativeGapPanel";
import {
  confidenceColor,
  divergenceColor,
  sentimentColor,
} from "@/components/topic-analysis/utils";
import type { NarrativeGapPoint } from "@/lib/dashboard-data";

type InsightCard = {
  id: string;
  title: string;
  summary: string;
  score: number;
  evidence: string[];
  confidence?: string;
};

type ThreadCard = {
  id: string;
  theme: string;
  headline: string;
  summary: string;
  confidence?: string;
};

/** Soft word-boundary truncate for UI chrome (full text still in detail/method). */
function softTruncate(text: string, max: number): string {
  const t = (text ?? "").trim();
  if (!t || t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  return (sp > max * 0.55 ? cut.slice(0, sp) : cut).trimEnd() + "…";
}

function firstSentence(text: string, max = 100): string {
  const t = (text ?? "").trim();
  if (!t) return "";
  const m = t.match(/^(.+?[.!?])(?:\s|$)/);
  return softTruncate((m?.[1] ?? t).trim(), max);
}

/** NarrativeGapPanel drops headlines containing "vs" — normalise for display. */
function cleanGapHeadline(raw: string): string {
  let t = (raw ?? "").trim();
  if (!t) return "";
  t = t.replace(/\s*\bvs\.?\b\s*/gi, " · ");
  return softTruncate(t, 72);
}

/** Normalize legacy string gap points and structured objects into NarrativeGapPoint. */
function normalizeGapPoints(
  pts: Array<string | DeskGapPoint> | undefined,
  citizenFrame?: string | null,
  officialFrame?: string | null,
): NarrativeGapPoint[] {
  if (!pts?.length) {
    const cit = (citizenFrame ?? "").trim();
    const off = (officialFrame ?? "").trim();
    if (cit || off) {
      return [
        {
          claim_citizen: cit || undefined,
          claim_official_media: off || undefined,
          why_it_matters: "Citizen vs official / media framing",
        },
      ];
    }
    return [];
  }

  const out: NarrativeGapPoint[] = [];
  for (const p of pts) {
    if (p && typeof p === "object" && !Array.isArray(p)) {
      const cit = String(p.claim_citizen ?? "").trim();
      const off = String(p.claim_official_media ?? "").trim();
      const why = String(p.why_it_matters ?? "").trim();
      if (!cit && !off) continue;
      out.push({
        claim_citizen: cit || undefined,
        claim_official_media: off || undefined,
        why_it_matters: why || firstSentence(cit || off, 100) || undefined,
      });
      continue;
    }
    if (typeof p === "string" && p.trim()) {
      // Legacy "A ↔ B" or plain string — never dump both sides into citizen only
      const parts = p.split(/\s*(?:↔|⟷|vs\.?|versus)\s*/i);
      if (parts.length >= 2) {
        out.push({
          claim_citizen: parts[0]!.trim() || undefined,
          claim_official_media: parts.slice(1).join(" vs ").trim() || undefined,
          why_it_matters: firstSentence(parts[0]!, 100) || undefined,
        });
      } else {
        out.push({
          claim_citizen: p.trim(),
          claim_official_media: undefined,
          why_it_matters: firstSentence(p, 100) || undefined,
        });
      }
    }
  }

  // If every official side empty but we have frames, fill first point's official
  if (out.length && out.every((g) => !g.claim_official_media) && officialFrame?.trim()) {
    out[0] = {
      ...out[0]!,
      claim_official_media: officialFrame.trim(),
    };
  }

  return out.slice(0, 6);
}

/**
 * Commissioned report UI — same structure as live TopicAnalysisPage
 * (hero metrics, narrative gap, curated synthesis, insight cards, method).
 */
export function CommissionedReportView({
  report,
  token,
  onEmail,
  emailBusy,
  emailMsg,
  shareSlot,
}: {
  report: DeskReport;
  token: string;
  onEmail?: (email: string) => void;
  emailBusy?: boolean;
  emailMsg?: string | null;
  shareSlot?: React.ReactNode;
}) {
  const pkg = DESK_PACKAGES[report.packageId];
  const score = report.overallSentiment?.score ?? null;
  const label = report.overallSentiment?.label ?? "—";
  const trend = report.overallSentiment?.trend ?? "";
  const divergence =
    typeof report.divergenceScore === "number" ? Math.round(report.divergenceScore) : null;
  const sample =
    report.sampleSize != null ? String(report.sampleSize) : "—";

  const [pickedCard, setPickedCard] = useState<InsightCard | null>(null);
  const [curatedExpanded, setCuratedExpanded] = useState(false);
  const [rawOpen, setRawOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  const gapPoints: NarrativeGapPoint[] = useMemo(
    () =>
      normalizeGapPoints(
        report.narrativeGap?.gapPoints,
        report.narrativeGap?.citizenFrame,
        report.narrativeGap?.officialMediaFrame,
      ),
    [report.narrativeGap],
  );

  const insightCards: InsightCard[] = useMemo(() => {
    const fromQa = (report.questionAnalyses ?? [])
      .map((q, i) => qaToInsight(q, i))
      .filter((c) => c.title.trim() && c.summary.trim());
    if (fromQa.length > 0) return fromQa;
    return (report.keyInsights ?? []).map((k, i) => ({
      id: `ki-${i}`,
      title: firstSentence(k, 90) || softTruncate(k, 80),
      summary: k,
      score: score ?? 50,
      evidence: [],
      confidence: "medium",
    }));
  }, [report.questionAnalyses, report.keyInsights, score]);

  // Curated synthesis — Pass-2 hero preferred; never re-dump gap frames
  const synthesisHeadline =
    report.curatedSynthesis?.headline?.trim() ||
    report.narrativeGap?.headline?.trim() ||
    (report.keyInsights?.[0] ? firstSentence(report.keyInsights[0], 80) : "") ||
    softTruncate(report.title, 80);
  const synthesisBody =
    report.curatedSynthesis?.summary?.trim() ||
    report.narrativeGap?.fullOverview?.trim() ||
    (report.keyInsights ?? []).slice(0, 2).join(" ") ||
    report.sampleNote?.trim() ||
    "";

  const threadCards: ThreadCard[] = useMemo(() => {
    const structured = report.insightThreads ?? [];
    if (structured.length > 0) {
      return structured
        .map((t, i) => threadFromStructured(t, i))
        .filter((t) => t.headline || t.summary)
        .slice(0, 6);
    }
    // Fallback: short key insight lines (not full Q&A dump)
    return (report.keyInsights ?? []).slice(0, 6).map((k, i) => ({
      id: `thread-${i}`,
      theme: "Public Opinion",
      headline: firstSentence(k, 90) || softTruncate(k, 80),
      summary: k,
      confidence: "medium",
    }));
  }, [report.insightThreads, report.keyInsights]);

  const showInsightCards = insightCards.length > 0;
  const isDeep = report.packageId !== "topic-analysis";
  const showClaims = (report.claims?.length ?? 0) > 0 && (isDeep || !showInsightCards);

  const [pickedThread, setPickedThread] = useState<ThreadCard | null>(null);

  const TrendIcon = /increas|improv|up|posit/i.test(trend)
    ? TrendingUp
    : /decreas|declin|down|neg/i.test(trend)
      ? TrendingDown
      : Minus;

  const headerLabel = report.topic;
  const confLabel =
    report.curatedSynthesis?.confidence?.trim() ||
    (report.generatedBy === "ai" || report.generatedBy === "hybrid"
      ? "medium"
      : "directional");
  const sampleSub =
    report.sampleSize != null && report.sampleSize > 0
      ? "posts"
      : report.packageId === "deep-no-x"
        ? "no X pack"
        : "awaiting sample";
  const gapOverview =
    report.narrativeGap?.fullOverview?.trim() ||
    [
      report.narrativeGap?.citizenFrame,
      report.narrativeGap?.officialMediaFrame,
    ]
      .filter(Boolean)
      .join(" · ");

  return (
    <div className="space-y-5 sm:space-y-6 min-w-0">
      {/* Back context — compact, like topic breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-[12px]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/10 text-cyan px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em]">
          <FlaskConical className="w-3 h-3" /> Commissioned
        </span>
        <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-muted-foreground border border-border rounded-full px-2 py-0.5">
          {pkg?.title ?? "Topic analysis"}
        </span>
        <Link
          to="/research/library"
          search={{ section: "topics" }}
          className="text-muted-foreground hover:text-cyan min-h-[36px] inline-flex items-center"
        >
          Library
        </Link>
      </div>

      {/* Topic hero — mobile (matches TopicAnalysisPage) */}
      <div className="md:hidden -mx-3 px-3 py-2">
        <div className="glass rounded-xl border border-cyan/30 p-4 space-y-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan break-words">
              {headerLabel}
            </div>
            <div className="font-display font-semibold text-xl tracking-tight">
              Topic briefing
            </div>
          </div>
          <DataFreshnessBar
            sourceUpdatedAt={report.updatedAt ?? report.createdAt}
            label="Report ready"
          />
          <div className="grid grid-cols-3 divide-x divide-border/60 border-y border-border/60 py-3">
            <HeroMetric
              label="Sentiment"
              value={score != null ? String(Math.round(score)) : "—"}
              sub={label}
              color={score != null ? sentimentColor(score) : "var(--muted-foreground)"}
              mobile
            />
            <HeroMetric
              label="Divergence"
              value={divergence !== null ? String(divergence) : "—"}
              sub="Citizen vs official"
              color={
                divergence !== null
                  ? divergenceColor(divergence)
                  : "var(--muted-foreground)"
              }
              mobile
            />
            <HeroMetric
              label="Sample"
              value={sample}
              sub={sampleSub}
              color="var(--cyan)"
              mobile
            />
          </div>
          <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-muted-foreground">
            <span
              className="px-1.5 py-0.5 rounded border uppercase"
              style={{
                color: confidenceColor(confLabel),
                borderColor: `${confidenceColor(confLabel)}44`,
              }}
            >
              {confLabel}
            </span>
            <TrendIcon
              className="w-5 h-5"
              style={{
                color:
                  score != null ? sentimentColor(score) : "var(--muted-foreground)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Topic hero — desktop sticky */}
      <div className="hidden md:block sticky top-0 z-30 -mx-3 sm:-mx-0 px-3 sm:px-0 py-2 bg-background/85 backdrop-blur-xl border-b border-border/60">
        <div className="glass rounded-xl border border-cyan/30 p-3 sm:p-4 flex flex-wrap items-center gap-3 sm:gap-5">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan truncate">
              {headerLabel}
            </div>
            <div className="font-display font-semibold text-lg sm:text-xl truncate">
              Topic briefing
            </div>
          </div>
          <DataFreshnessBar
            sourceUpdatedAt={report.updatedAt ?? report.createdAt}
            label="Report ready"
            className="shrink-0"
          />
          <HeroMetric
            label="Sentiment"
            value={score != null ? String(Math.round(score)) : "—"}
            sub={label}
            color={score != null ? sentimentColor(score) : "var(--muted-foreground)"}
          />
          <HeroMetric
            label="Divergence"
            value={divergence !== null ? String(divergence) : "—"}
            sub="Citizen vs official"
            color={
              divergence !== null
                ? divergenceColor(divergence)
                : "var(--muted-foreground)"
            }
          />
          <HeroMetric
            label="Sample"
            value={sample}
            sub={sampleSub}
            color="var(--cyan)"
          />
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase"
            style={{
              color: confidenceColor(confLabel),
              borderColor: `${confidenceColor(confLabel)}44`,
            }}
          >
            {confLabel}
          </span>
          <TrendIcon
            className="w-5 h-5 shrink-0"
            style={{
              color: score != null ? sentimentColor(score) : "var(--muted-foreground)",
            }}
          />
        </div>
      </div>

      {/* Narrative gap — same component as live topics */}
      <NarrativeGapPanel
        topicLabel={headerLabel}
        score={divergence}
        citizenFrame={report.narrativeGap?.citizenFrame ?? ""}
        officialMediaFrame={report.narrativeGap?.officialMediaFrame ?? ""}
        gapHeadline={cleanGapHeadline(report.narrativeGap?.headline ?? "")}
        fullOverview={gapOverview}
        scoreRationale={softTruncate(
          report.narrativeGap?.scoreRationale ?? "",
          160,
        )}
        gapPoints={gapPoints}
        sentimentScore={score}
        shareUrl={
          typeof window !== "undefined" ? window.location.href : undefined
        }
      />

      {/* Curated synthesis */}
      {(synthesisHeadline || synthesisBody) && (
        <div className="rounded-xl border border-cyan/35 bg-cyan/[0.06] p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-cyan">
            <Sparkles className="w-3.5 h-3.5" /> Curated synthesis
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-semibold leading-tight break-words">
            {synthesisHeadline}
          </h2>
          {synthesisBody && (
            <>
              <p
                className={`text-sm text-foreground/90 leading-relaxed break-words ${
                  curatedExpanded ? "" : "line-clamp-3 md:line-clamp-4"
                }`}
              >
                {synthesisBody}
              </p>
              {synthesisBody.length > 160 && (
                <button
                  type="button"
                  onClick={() => setCuratedExpanded((v) => !v)}
                  className="text-[11px] font-mono text-cyan hover:underline min-h-[40px] touch-manipulation"
                >
                  {curatedExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Narrative threads first — matches live TopicAnalysisPage order */}
      {threadCards.length > 0 && (
        <section className="space-y-3">
          <SectionLabel
            icon={<Lightbulb className="w-3.5 h-3.5" />}
            title="Narrative Threads"
            sub="Tap for full text"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {threadCards.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setPickedThread(t)}
                className="text-left rounded-xl border border-border bg-secondary/20 p-4 space-y-1.5 hover:border-cyan/40 active:bg-secondary/40 transition-colors touch-manipulation min-h-[44px]"
                style={{
                  borderLeft: `3px solid ${confidenceColor(t.confidence ?? "medium")}`,
                }}
              >
                <div className="flex justify-between gap-2 text-[10px] font-mono uppercase text-muted-foreground">
                  <span>{t.theme}</span>
                  {t.confidence && (
                    <span style={{ color: confidenceColor(t.confidence) }}>
                      {t.confidence}
                    </span>
                  )}
                </div>
                {t.headline && (
                  <h4 className="font-display font-semibold text-sm break-words">{t.headline}</h4>
                )}
                {t.summary && (
                  <p className="text-[13px] text-foreground/85 leading-relaxed line-clamp-2">
                    {t.summary}
                  </p>
                )}
                <span className="text-[10px] font-mono text-cyan md:hidden">Read full →</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Key insights / question cards — scored, same pattern as TopicAnalysisPage */}
      {showInsightCards && (
        <section className="space-y-3">
          <SectionLabel
            icon={<Brain className="w-3.5 h-3.5" />}
            title="Key Insights"
            sub={`${insightCards.length} · tap to read`}
          />
          <div className="md:hidden flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory custom-scroll">
            {insightCards.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => setPickedCard(card)}
                className="snap-center shrink-0 w-[min(100%,20rem)] text-left rounded-xl border border-border bg-background/50 p-4 space-y-2.5 hover:border-cyan/40 active:scale-[0.99] transition-all touch-manipulation"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-display font-semibold text-[15px] leading-snug flex-1 break-words">
                    {card.title}
                  </h4>
                  <span
                    className="shrink-0 text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded border"
                    style={{
                      color: sentimentColor(card.score),
                      borderColor: `${sentimentColor(card.score)}55`,
                      background: `${sentimentColor(card.score)}14`,
                    }}
                  >
                    {card.score}
                  </span>
                </div>
                {card.summary && (
                  <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3">
                    {card.summary}
                  </p>
                )}
                <span className="text-[10px] font-mono text-cyan">Open full insight →</span>
              </button>
            ))}
          </div>
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-3">
            {insightCards.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => setPickedCard(card)}
                className="text-left rounded-xl border border-border bg-background/40 hover:border-cyan/40 p-4 space-y-2 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-lg font-display font-semibold tabular-nums"
                    style={{ color: sentimentColor(card.score) }}
                  >
                    {card.score}
                  </span>
                  {card.confidence && (
                    <span
                      className="text-[10px] font-mono uppercase"
                      style={{ color: confidenceColor(card.confidence) }}
                    >
                      {card.confidence}
                    </span>
                  )}
                </div>
                <h4 className="font-display font-semibold text-sm leading-snug line-clamp-2">
                  {card.title}
                </h4>
                <p className="text-[12px] text-muted-foreground line-clamp-2">{card.summary}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Deep-dive chapters */}
      {isDeep && report.chapters && report.chapters.length > 0 && (
        <section className="space-y-3">
          <SectionLabel icon={<Scale className="w-3.5 h-3.5" />} title="Chapters" sub="Evidence map" />
          <div className="space-y-2">
            {report.chapters.map((ch) => (
              <div
                key={ch.id}
                className="rounded-xl border border-border bg-background/40 px-4 py-3 space-y-1.5"
              >
                <div className="text-[10px] font-mono text-cyan uppercase">
                  {ch.number} · {ch.title}
                </div>
                <p className="text-[13px] text-foreground/90 leading-relaxed break-words">
                  {ch.summary}
                </p>
                {ch.bullets?.length > 0 && (
                  <ul className="text-[12px] text-muted-foreground space-y-1">
                    {ch.bullets.map((b, i) => (
                      <li key={i}>· {b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Claims — deep packages or when no question cards */}
      {showClaims && report.claims && (
        <section className="space-y-3">
          <SectionLabel icon={<Scale className="w-3.5 h-3.5" />} title="Claims" sub="with falsifiers" />
          <ul className="space-y-2">
            {report.claims.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-border bg-background/40 px-4 py-3 space-y-1.5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono text-cyan uppercase">{c.id}</span>
                  <span className="text-[12px] font-medium">{c.domain}</span>
                  <span
                    className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border"
                    style={{
                      color: confidenceColor(c.confidence),
                      borderColor: `${confidenceColor(c.confidence)}44`,
                    }}
                  >
                    {c.confidence}
                  </span>
                </div>
                <p className="text-[13px] text-foreground/90 leading-relaxed break-words">
                  {c.statement}
                </p>
                <p className="text-[12px] text-muted-foreground break-words">
                  <span className="text-foreground/60">Falsifier: </span>
                  {c.falsifier}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Raw method & limits — collapsible like live topics */}
      <div className="rounded-xl border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setRawOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground hover:bg-secondary/30 min-h-[44px] touch-manipulation"
        >
          <span className="flex items-center gap-2">
            <Scale className="w-3.5 h-3.5" /> Method, sample & limits
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${rawOpen ? "rotate-180" : ""}`} />
        </button>
        {rawOpen && (
          <div className="px-4 pb-4 space-y-3 text-sm border-t border-border pt-3">
            {report.sampleNote && (
              <p className="text-[13px] text-muted-foreground leading-relaxed break-words">
                {report.sampleNote}
              </p>
            )}
            {report.methodNotes?.map((m, i) => (
              <p key={i} className="text-[13px] text-foreground/85 leading-relaxed break-words">
                · {m}
              </p>
            ))}
            {report.limits?.map((m, i) => (
              <p key={i} className="text-[12px] text-muted-foreground leading-relaxed break-words">
                · {m}
              </p>
            ))}
            <p className="text-[11px] font-mono text-muted-foreground break-all pt-2 border-t border-border">
              Token · {report.token}
            </p>
          </div>
        )}
      </div>

      {/* Deliverables — secondary, not the hero dump */}
      <div className="rounded-xl border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setActionsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground hover:bg-secondary/30 min-h-[44px] touch-manipulation"
        >
          <span className="flex items-center gap-2">
            <Download className="w-3.5 h-3.5" /> Download & delivery
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${actionsOpen ? "rotate-180" : ""}`}
          />
        </button>
        {actionsOpen && (
          <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
            <div className="flex flex-wrap gap-2">
              <a
                href={`/api/research/report/${encodeURIComponent(token)}?format=pdf`}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full border border-cyan/45 bg-cyan/15 text-cyan text-[12px] font-medium touch-manipulation"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </a>
              <a
                href={`/api/research/report/${encodeURIComponent(token)}?format=txt`}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full border border-border text-[12px] text-muted-foreground touch-manipulation"
              >
                Download text
              </a>
              <Link
                to="/research/library"
                search={{ section: "topics" }}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full border border-border text-[12px] text-muted-foreground touch-manipulation"
              >
                Back to Library
              </Link>
            </div>
            {onEmail && (
              <div className="space-y-2">
                <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan" /> Email report link
                </p>
                <EmailForm onSend={onEmail} busy={emailBusy} />
                {emailMsg && (
                  <p className="text-[12px] text-foreground/85" role="status">
                    {emailMsg}
                  </p>
                )}
              </div>
            )}
            {shareSlot}
            <p className="text-[12px] text-muted-foreground">
              Questions?{" "}
              <ContactEmailMe
                source="commissioned-report"
                variant="inline"
                defaultMessage={`Re: commissioned report token ${report.token}\n\n`}
              />
            </p>
          </div>
        )}
      </div>

      {/* Insight detail overlay — same pattern as TopicAnalysisPage */}
      {pickedCard && (
        <DetailOverlay onClose={() => setPickedCard(null)}>
          <div className="text-[10px] font-mono uppercase text-cyan tracking-[0.18em]">
            Insight detail
          </div>
          <h3 className="text-xl font-display font-semibold leading-snug break-words">
            {pickedCard.title}
          </h3>
          {pickedCard.summary && (
            <p className="text-[15px] sm:text-sm text-foreground/90 leading-relaxed break-words">
              {pickedCard.summary}
            </p>
          )}
          {pickedCard.evidence.length > 0 && (
            <ul className="space-y-2 text-[14px] sm:text-[13px]">
              {pickedCard.evidence.map((e, i) => (
                <li key={i} className="flex gap-2 break-words">
                  <span className="text-cyan font-mono shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span
              className="text-[11px] font-mono px-2 py-1 rounded border"
              style={{
                color: sentimentColor(pickedCard.score),
                borderColor: `${sentimentColor(pickedCard.score)}55`,
              }}
            >
              Metric {pickedCard.score}
              {pickedCard.confidence ? ` · ${pickedCard.confidence}` : ""}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setPickedCard(null)}
            className="inline-flex items-center justify-center min-h-[48px] sm:min-h-[40px] px-4 rounded-full text-[12px] font-mono border border-border text-muted-foreground hover:bg-secondary touch-manipulation"
          >
            Close
          </button>
        </DetailOverlay>
      )}

      {pickedThread && (
        <DetailOverlay onClose={() => setPickedThread(null)}>
          <div className="text-[10px] font-mono uppercase text-cyan tracking-[0.18em]">
            {pickedThread.theme || "Narrative thread"}
          </div>
          <h3 className="text-xl font-display font-semibold leading-snug break-words">
            {pickedThread.headline}
          </h3>
          {pickedThread.summary && (
            <p className="text-[15px] sm:text-sm text-foreground/90 leading-relaxed break-words">
              {pickedThread.summary}
            </p>
          )}
          <button
            type="button"
            onClick={() => setPickedThread(null)}
            className="inline-flex items-center justify-center min-h-[48px] sm:min-h-[40px] px-4 rounded-full text-[12px] font-mono border border-border text-muted-foreground hover:bg-secondary touch-manipulation"
          >
            Close
          </button>
        </DetailOverlay>
      )}
    </div>
  );
}

function threadFromStructured(t: DeskInsightThread, i: number): ThreadCard {
  return {
    id: `thread-${i}`,
    theme: (t.theme || "Thread").trim(),
    headline: softTruncate((t.headline || firstSentence(t.summary || "", 90) || "Thread").trim(), 100),
    summary: (t.summary || t.headline || "").trim(),
    confidence: t.confidence,
  };
}

/**
 * Card title = short insight (cardTitle / first key point / first sentence of answer).
 * NEVER the full long Socratic question (live Topics use Pass-2 card_title the same way).
 */
function qaToInsight(q: DeskQuestionAnalysis, i: number): InsightCard {
  const answer = (q.answer ?? "").trim();
  const points = (q.keyPoints ?? []).filter(Boolean);
  let title = (q.cardTitle ?? "").trim();
  const question = (q.question ?? "").trim();

  // Reject titles that are just the question (truncated or full)
  const titleIsQuestion =
    title &&
    question &&
    (title === question ||
      question.startsWith(title.replace(/…$/, "")) ||
      title.replace(/…$/, "").length > 0 &&
        question.toLowerCase().startsWith(title.replace(/…$/, "").toLowerCase().slice(0, 40)));

  if (!title || titleIsQuestion) {
    title =
      (points[0] && softTruncate(points[0], 90)) ||
      firstSentence(answer, 90) ||
      `Insight ${i + 1}`;
  } else {
    title = softTruncate(title, 100);
  }

  return {
    id: `q-${i}`,
    title,
    summary: answer,
    score:
      typeof q.sentimentScore === "number" && !Number.isNaN(q.sentimentScore)
        ? Math.round(q.sentimentScore)
        : 50,
    evidence: points,
    confidence: q.confidence,
  };
}

function HeroMetric({
  label,
  value,
  sub,
  color,
  mobile = false,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <div className="text-center px-1 min-w-0">
        <div className="text-[9px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </div>
        <div
          className="text-2xl font-display font-semibold tabular-nums leading-none mt-1"
          style={{ color }}
        >
          {value}
        </div>
        <div className="text-[9px] font-mono text-muted-foreground truncate mt-0.5 px-0.5">
          {sub}
        </div>
      </div>
    );
  }
  return (
    <div className="text-center min-w-[4.5rem]">
      <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-xl sm:text-2xl font-display font-semibold tabular-nums" style={{ color }}>
        {value}
      </div>
      <div className="text-[9px] font-mono text-muted-foreground truncate max-w-[5rem]">{sub}</div>
    </div>
  );
}

function SectionLabel({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-cyan">
      {icon}
      {title}
      {sub && (
        <span className="text-muted-foreground normal-case tracking-normal text-[10px]">
          · {sub}
        </span>
      )}
    </div>
  );
}

function DetailOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="md:hidden absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-2xl border border-border border-b-0 bg-background shadow-2xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-3"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-center pb-1">
          <span className="w-10 h-1 rounded-full bg-border" aria-hidden />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-secondary min-h-[44px] min-w-[44px] grid place-items-center touch-manipulation"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
        {children}
      </div>
      <div className="hidden md:grid place-items-center p-4 h-full">
        <div
          className="glass-strong rounded-2xl max-w-lg w-full p-5 space-y-3 max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function EmailForm({
  onSend,
  busy,
}: {
  onSend: (email: string) => void;
  busy?: boolean;
}) {
  return (
    <form
      className="flex flex-col sm:flex-row gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const email = String(fd.get("email") || "").trim();
        if (email) onSend(email);
      }}
    >
      <input
        name="email"
        type="email"
        required
        placeholder="you@example.com"
        className="flex-1 min-h-[44px] rounded-xl border border-border bg-background px-3 text-[13px] focus:outline-none focus:border-cyan/50"
      />
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-full bg-cyan text-background text-[12px] font-semibold disabled:opacity-50 touch-manipulation"
      >
        <Mail className="w-3.5 h-3.5" />
        {busy ? "Sending…" : "Send link"}
      </button>
    </form>
  );
}
