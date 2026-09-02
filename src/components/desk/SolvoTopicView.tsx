import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Brain,
  ChevronDown,
  FlaskConical,
  Lightbulb,
  MessageSquare,
  Minus,
  Radio,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { solvoTopicById, type SolvoQuestion } from "@/lib/desk/solvo-topics";
import { PUBLICEYE_PUBLIC_BASE } from "@/lib/desk/catalog";
import { protoPath, usePrototypeBase } from "@/lib/desk/prototype-base";
import { divergenceColor, sentimentColor, sentimentTone } from "@/lib/score-colors";
import { formatDelta } from "@/components/topic-analysis/utils";
import { NarrativeGapPanel } from "@/components/topic-analysis/NarrativeGapPanel";

export function SolvoTopicView({ topicId }: { topicId: string }) {
  const base = usePrototypeBase();
  const topic = solvoTopicById(topicId);
  const [picked, setPicked] = useState<number | null>(null);
  const [chartsOpen, setChartsOpen] = useState(false);
  const [rawOpen, setRawOpen] = useState(false);
  const trendSeries = useMemo(() => {
    if (!topic) return [];
    const d = topic.delta;
    return [0, 1, 2, 3, 4].map((i) => ({
      label: `W${i + 1}`,
      score: Math.max(20, Math.min(90, topic.score - d * (4 - i) * 0.8)),
    }));
  }, [topic]);
  const questionHeat = useMemo(
    () =>
      (topic?.questions ?? []).map((q, i) => ({
        name: `Q${i + 1}`,
        score: q.score,
        full: q.cardTitle,
      })),
    [topic],
  );
  const segments = useMemo(() => {
    if (!topic) return [];
    const s = topic.score;
    return [
      { name: "Operators", score: Math.max(20, Math.min(90, s + 4)) },
      { name: "Official comms", score: Math.max(20, Math.min(90, s + 10)) },
      { name: "Media", score: Math.max(20, Math.min(90, s - 3)) },
      { name: "Public replies", score: Math.max(20, Math.min(90, s - 6)) },
    ];
  }, [topic]);
  if (!topic) {
    return (
      <main className="max-w-[860px] mx-auto px-4 py-10 space-y-3 mobile-safe-bottom">
        <p className="text-[14px] text-muted-foreground">Topic not on this desk.</p>
        <Link to={protoPath(base, "research") as never} className="text-cyan hover:underline text-[13px]">
          Back to Research
        </Link>
      </main>
    );
  }
  const tone = sentimentTone(topic.score, topic.label);
  const TrendIcon = topic.delta > 0 ? TrendingUp : topic.delta < 0 ? TrendingDown : Minus;
  const pickedQ = picked != null ? topic.questions[picked] : null;

  return (
    <main className="max-w-[1100px] mx-auto w-full px-3 sm:px-4 md:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6 mobile-safe-bottom">
      <Link
        to={protoPath(base, "research") as never}
        className="inline-flex items-center gap-1.5 text-[13px] text-cyan hover:underline min-h-[36px]"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Research Library
      </Link>
      <aside className="rounded-2xl border border-amber-signal/45 bg-amber-signal/[0.12] px-4 py-3 flex items-start gap-2">
        <FlaskConical className="w-4 h-4 text-amber-signal shrink-0 mt-0.5" />
        <p className="text-[13px] text-foreground/90 leading-snug">
          Simulated briefing · not live X. Same topic-analysis layout as elenchos.live.
        </p>
      </aside>

      <div className="md:hidden glass rounded-xl border border-cyan/30 p-4 space-y-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan">{topic.name}</div>
          <div className="font-display font-semibold text-xl tracking-tight">Topic briefing</div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border/60 border-y border-border/60 py-3">
          <HeroMetric label="Sentiment" value={String(topic.score)} sub={topic.label} color={tone.color} mobile />
          <HeroMetric label="Divergence" value={String(topic.divergence)} sub="Citizen vs official" color={divergenceColor(topic.divergence)} mobile />
          <HeroMetric label="Sample" value={String(topic.sample)} sub="posts" color="var(--cyan)" mobile />
        </div>
        <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-muted-foreground">
          <span className="px-1.5 py-0.5 rounded border uppercase" style={{ color: tone.color, borderColor: `${tone.color}44` }}>
            {topic.delta > 0 ? "+" : ""}
            {topic.delta} WoW
          </span>
          <TrendIcon className="w-5 h-5" style={{ color: tone.color }} />
        </div>
      </div>

      <div className="hidden md:block sticky top-0 z-20">
        <div className="glass rounded-xl border border-cyan/30 p-4 flex flex-wrap items-center gap-5">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan">
              {topic.group} · {topic.audience}
            </div>
            <div className="font-display font-semibold text-xl truncate">{topic.name}</div>
          </div>
          <HeroMetric label="Sentiment" value={String(topic.score)} sub={topic.label} color={tone.color} />
          <HeroMetric label="Divergence" value={String(topic.divergence)} sub="Citizen vs official" color={divergenceColor(topic.divergence)} />
          <HeroMetric label="Sample" value={String(topic.sample)} sub="posts" color="var(--cyan)" />
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase" style={{ color: tone.color, borderColor: `${tone.color}44` }}>
            {topic.delta > 0 ? "+" : ""}
            {topic.delta}pt WoW
          </span>
          <TrendIcon className="w-5 h-5 shrink-0" style={{ color: tone.color }} />
        </div>
      </div>

      <NarrativeGapPanel
        topicLabel={topic.name}
        score={topic.divergence}
        citizenFrame={topic.headline}
        officialMediaFrame="Official and paid/media volume on this topic — contrast, not mixed in as the public."
        gapHeadline={topic.blurb}
        fullOverview={topic.headline}
        scoreRationale={`Simulated sample of ${topic.sample} posts. Sentiment ${topic.score} (${topic.label}); divergence ${topic.divergence}.`}
        sentimentScore={topic.score}
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-cyan/35 bg-cyan/[0.06] p-4 sm:p-5 space-y-2"
      >
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-cyan">
          <Sparkles className="w-3.5 h-3.5" /> Curated synthesis
        </div>
        <h2 className="text-xl sm:text-2xl font-display font-semibold leading-tight">{topic.headline}</h2>
        <p className="text-sm text-foreground/90 leading-relaxed">{topic.blurb}</p>
        <div className="flex flex-wrap gap-2 text-[10px] font-mono">
          {formatDelta(topic.delta) && (
            <span className="px-2 py-0.5 rounded-full border border-border">Sentiment {formatDelta(topic.delta)}</span>
          )}
          <span className="px-2 py-0.5 rounded-full border border-border">Divergence {topic.divergence}</span>
          <span className="text-muted-foreground uppercase">vs WoW</span>
        </div>
      </motion.div>

      <section className="space-y-3">
        <SectionLabel icon={<Lightbulb className="w-3.5 h-3.5" />} title="Narrative Threads" sub="Tap for full text" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {topic.questions.slice(0, 2).map((q, i) => (
            <button
              key={q.cardTitle}
              type="button"
              onClick={() => setPicked(i)}
              className="text-left rounded-xl border border-border bg-secondary/20 p-4 space-y-1.5 hover:border-cyan/40 min-h-[44px]"
              style={{ borderLeft: `3px solid ${sentimentColor(q.score)}` }}
            >
              <div className="flex justify-between gap-2 text-[10px] font-mono uppercase text-muted-foreground">
                <span>{q.label}</span>
                <span style={{ color: sentimentColor(q.score) }}>{q.score}</span>
              </div>
              <h4 className="font-display font-semibold text-sm">{q.cardTitle}</h4>
              <p className="text-[13px] text-foreground/85 leading-relaxed line-clamp-2">{q.answer}</p>
              <span className="text-[10px] font-mono text-cyan md:hidden">Read full →</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionLabel icon={<Brain className="w-3.5 h-3.5" />} title="Key Insights" sub="9 · tap to read" />
        <div className="md:hidden flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory custom-scroll">
          {topic.questions.map((q, i) => (
            <button
              key={q.q}
              type="button"
              onClick={() => setPicked(i)}
              className="snap-center shrink-0 w-[min(100%,20rem)] text-left rounded-xl border border-border bg-background/50 p-4 space-y-2.5 min-h-[44px]"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display font-semibold text-[15px] leading-snug flex-1">{q.cardTitle}</h4>
                <span
                  className="shrink-0 text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded border"
                  style={{ color: sentimentColor(q.score), borderColor: `${sentimentColor(q.score)}55`, background: `${sentimentColor(q.score)}14` }}
                >
                  {q.score}
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground line-clamp-3">{q.answer}</p>
              <span className="text-[10px] font-mono text-cyan">Open full insight →</span>
            </button>
          ))}
        </div>
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-3">
          {topic.questions.map((q, i) => (
            <button
              key={q.q}
              type="button"
              onClick={() => setPicked(i)}
              className="text-left rounded-xl border border-border bg-background/40 hover:border-cyan/40 p-4 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg font-display font-semibold tabular-nums" style={{ color: sentimentColor(q.score) }}>
                  {q.score}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">Q{i + 1}</span>
              </div>
              <h4 className="font-display font-semibold text-sm leading-snug line-clamp-2">{q.cardTitle}</h4>
              <p className="text-[12px] text-muted-foreground line-clamp-2">{q.answer}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <button
          type="button"
          onClick={() => setChartsOpen((v) => !v)}
          className="md:pointer-events-none w-full md:w-auto flex items-center justify-between md:justify-start gap-2 min-h-[44px] md:min-h-0"
        >
          <SectionLabel icon={<Radio className="w-3.5 h-3.5" />} title="Visual Analytics" />
          <ChevronDown className={`w-4 h-4 text-muted-foreground md:hidden ${chartsOpen ? "rotate-180" : ""}`} />
        </button>
        <div className={`${chartsOpen ? "grid" : "hidden"} md:grid grid-cols-1 lg:grid-cols-2 gap-4`}>
          <ChartPanel title="Sentiment trend">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendSeries}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--background)", border: "1px solid var(--border)" }} />
                <Line type="monotone" dataKey="score" stroke="var(--cyan)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>
          <ChartPanel title="Question heatmap">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={questionHeat}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--background)", border: "1px solid var(--border)" }} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {questionHeat.map((q) => (
                    <Cell key={q.name} fill={sentimentColor(q.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
          <ChartPanel title="Fan segments">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={segments} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {segments.map((e) => (
                    <Cell key={e.name} fill={sentimentColor(e.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
          <ChartPanel title="Historical comparison">
            <div className="flex flex-wrap gap-3 p-2">
              <ComparePill label="WoW sentiment" value={formatDelta(topic.delta)} />
              <ComparePill label="Divergence" value={String(topic.divergence)} />
              <ComparePill label="Window" value="WOW" />
            </div>
          </ChartPanel>
        </div>
      </section>

      <div className="rounded-xl border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setRawOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground hover:bg-secondary/30"
        >
          <span className="flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" /> Raw data & methodology
          </span>
          <ChevronDown className={`w-4 h-4 ${rawOpen ? "rotate-180" : ""}`} />
        </button>
        {rawOpen && (
          <div className="px-4 pb-4 space-y-3 text-sm border-t border-border pt-3">
            <p className="text-muted-foreground text-[12px] leading-relaxed">
              Based on <strong className="text-foreground">{topic.sample}</strong> simulated public posts (aggregates only).
            </p>
            <div className="grid gap-2 max-h-64 overflow-y-auto custom-scroll">
              {topic.questions.map((q, i) => (
                <div key={q.q} className="text-[12px] p-2 rounded border border-border bg-secondary/20">
                  <div className="font-mono text-cyan text-[10px]">
                    Q{i + 1} · {q.score}/100
                  </div>
                  <div className="text-muted-foreground mt-0.5">{q.q}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <section className="rounded-xl border border-cyan/35 bg-cyan/[0.06] p-4 sm:p-5 space-y-3">
        <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-cyan">What’s next</p>
        <p className="text-[13px] sm:text-[14px] text-foreground/90 leading-relaxed">
          {base === PUBLICEYE_PUBLIC_BASE
            ? "This is a BrandEye prototype topic analysis for young UAE operators — simulated sample, same method as elenchos.live."
            : "This is the Solvo Creations prototype of a public topic analysis. Simulated sample — scoring stays locked."}
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          {base === PUBLICEYE_PUBLIC_BASE ? (
            <Link
              to={protoPath(base, "desk") as never}
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-full border border-cyan/45 bg-cyan/15 text-cyan text-[13px] font-medium"
            >
              Get this desk
            </Link>
          ) : null}
          <Link
            to={protoPath(base, "research") as never}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-full border border-border text-muted-foreground text-[13px]"
          >
            Research Library
          </Link>
        </div>
      </section>

      {pickedQ ? (
        <DetailOverlay onClose={() => setPicked(null)}>
          <InsightDetail q={pickedQ} index={picked ?? 0} onClose={() => setPicked(null)} />
        </DetailOverlay>
      ) : null}
    </main>
  );
}

function InsightDetail({
  q,
  index,
  onClose,
}: {
  q: SolvoQuestion;
  index: number;
  onClose: () => void;
}) {
  return (
    <>
      <div className="text-[10px] font-mono uppercase text-cyan tracking-[0.18em]">
        Insight detail · Question {index + 1} of 9
      </div>
      <h3 className="text-xl font-display font-semibold leading-snug">{q.cardTitle}</h3>
      <p className="text-[15px] sm:text-sm text-foreground/90 leading-relaxed">{q.q}</p>
      <p className="text-[14px] sm:text-[13px] text-foreground/90 leading-relaxed">{q.answer}</p>
      <ul className="space-y-2 text-[14px] sm:text-[13px]">
        {q.keyPoints.map((e, i) => (
          <li key={e} className="flex gap-2">
            <span className="text-cyan font-mono shrink-0">{String(i + 1).padStart(2, "0")}</span>
            <span>{e}</span>
          </li>
        ))}
      </ul>
      <span
        className="text-[11px] font-mono px-2 py-1 rounded border w-fit"
        style={{ color: sentimentColor(q.score), borderColor: `${sentimentColor(q.score)}55` }}
      >
        Metric {q.score} · {q.label}
      </span>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center justify-center min-h-[48px] sm:min-h-[40px] px-4 rounded-full text-[12px] font-mono border border-border text-muted-foreground"
      >
        Close
      </button>
    </>
  );
}

function DetailOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md" onClick={onClose} role="presentation">
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
          className="absolute top-3 right-3 p-2 rounded-full min-h-[44px] min-w-[44px] grid place-items-center"
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
        <div className="text-[9px] font-mono uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
        <div className="text-2xl font-display font-semibold tabular-nums leading-none mt-1" style={{ color }}>
          {value}
        </div>
        <div className="text-[9px] font-mono text-muted-foreground truncate mt-0.5 px-0.5">{sub}</div>
      </div>
    );
  }
  return (
    <div className="text-center min-w-[4.5rem]">
      <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
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
      {sub && <span className="text-muted-foreground normal-case tracking-normal text-[10px]">· {sub}</span>}
    </div>
  );
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3 sm:p-4">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">{title}</div>
      {children}
    </div>
  );
}

function ComparePill({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="px-3 py-2 rounded-lg border border-border bg-secondary/30">
      <div className="text-[9px] font-mono uppercase text-muted-foreground">{label}</div>
      <div className="text-sm font-display font-semibold tabular-nums">{value ?? "—"}</div>
    </div>
  );
}
