import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Brain,
  Download,
  FlaskConical,
  Mail,
  MessageSquare,
  Scale,
  Sparkles,
} from "lucide-react";
import type { DeskReport } from "@/lib/research-desk/build-report";
import { DESK_PACKAGES } from "@/lib/research-desk/packages";
import { ContactEmailMe } from "@/components/ContactEmailMe";

function sentimentColor(score: number | null | undefined): string {
  if (score == null) return "var(--muted-foreground)";
  if (score >= 71) return "var(--emerald-signal)";
  if (score >= 61) return "oklch(0.72 0.12 145)";
  if (score >= 45) return "var(--amber-signal)";
  return "var(--rose-signal)";
}

function divergenceColor(score: number | null | undefined): string {
  if (score == null) return "var(--muted-foreground)";
  if (score >= 70) return "var(--rose-signal)";
  if (score >= 45) return "var(--amber-signal)";
  return "var(--cyan)";
}

function confClass(c: string): string {
  if (c === "high") return "text-emerald-signal border-emerald-signal/40";
  if (c === "medium") return "text-amber-signal border-amber-signal/40";
  if (c === "low") return "text-rose-signal border-rose-signal/40";
  return "text-muted-foreground border-border";
}

/**
 * Topics-style layout for paid commissioned reports (all packages).
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
  const sent = report.overallSentiment?.score ?? null;
  const div = report.divergenceScore ?? null;
  const isDeep = report.packageId !== "topic-analysis";

  return (
    <article className="space-y-5 sm:space-y-6 min-w-0">
      {/* Hero — mirrors Topic briefing */}
      <header className="rounded-2xl border border-cyan/30 bg-card/50 overflow-hidden min-w-0">
        <div className="p-4 sm:p-5 space-y-3 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/10 text-cyan px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em]">
              <FlaskConical className="w-3 h-3" /> Commissioned
            </span>
            <span className="inline-flex rounded-full border border-border bg-secondary/40 text-muted-foreground px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.1em]">
              {pkg?.title ?? report.packageId}
            </span>
            {report.generatedBy === "ai" && (
              <span className="text-[10px] font-mono text-emerald-signal uppercase tracking-wider">
                Analysis ready
              </span>
            )}
          </div>
          <h1 className="text-[1.25rem] sm:text-2xl font-display font-semibold tracking-tight leading-snug break-words [overflow-wrap:anywhere]">
            {report.title}
          </h1>
          <p className="text-[13px] text-muted-foreground break-words leading-relaxed">
            {report.topic}
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed border border-border/70 rounded-lg bg-background/40 px-3 py-2 break-words">
            {report.disclaimer}
          </p>

          {/* Metric strip */}
          <div className="grid grid-cols-3 divide-x divide-border/60 border border-border/70 rounded-xl overflow-hidden">
            <Metric
              label="Sentiment"
              value={sent != null ? String(Math.round(sent)) : "—"}
              sub={report.overallSentiment?.label ?? "directional"}
              color={sentimentColor(sent)}
            />
            <Metric
              label="Divergence"
              value={div != null ? String(Math.round(div)) : "—"}
              sub="Citizen vs official"
              color={divergenceColor(div)}
            />
            <Metric
              label="Sample"
              value={
                report.sampleSize != null ? String(report.sampleSize) : isDeep ? "Open" : "—"
              }
              sub={report.sampleSize != null ? "posts" : "see note"}
              color="var(--cyan)"
            />
          </div>
          {report.sampleNote && (
            <p className="text-[12px] text-muted-foreground leading-relaxed break-words">
              {report.sampleNote}
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
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
              to="/research/commission"
              className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full border border-border text-[12px] text-muted-foreground touch-manipulation"
            >
              Commission another
            </Link>
          </div>
        </div>
      </header>

      {/* Email */}
      {onEmail && (
        <section className="rounded-xl border border-border bg-card/40 px-4 py-3.5 space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-cyan" /> Email this report link
          </p>
          <EmailForm onSend={onEmail} busy={emailBusy} />
          {emailMsg && (
            <p className="text-[12px] text-foreground/85" role="status">
              {emailMsg}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            One-time delivery only — we do not keep your email on the report record.
          </p>
        </section>
      )}

      {shareSlot}

      {/* Narrative gap */}
      {report.narrativeGap &&
        (report.narrativeGap.citizenFrame || report.narrativeGap.officialMediaFrame) && (
          <section className="rounded-2xl border border-border bg-card/40 p-4 sm:p-5 space-y-3 min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-cyan">
              <AlertTriangle className="w-3.5 h-3.5" /> Narrative gap
            </div>
            {report.narrativeGap.headline && (
              <h2 className="text-[15px] sm:text-base font-display font-semibold break-words">
                {report.narrativeGap.headline}
              </h2>
            )}
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-cyan/25 bg-cyan/5 px-3 py-3 min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-cyan mb-1.5">
                  Citizens
                </p>
                <p className="text-[13px] text-foreground/90 leading-relaxed break-words">
                  {report.narrativeGap.citizenFrame}
                </p>
              </div>
              <div className="rounded-xl border border-amber-signal/25 bg-amber-signal/5 px-3 py-3 min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-amber-signal mb-1.5">
                  Official / media
                </p>
                <p className="text-[13px] text-foreground/90 leading-relaxed break-words">
                  {report.narrativeGap.officialMediaFrame}
                </p>
              </div>
            </div>
            {report.narrativeGap.scoreRationale && (
              <p className="text-[12px] text-muted-foreground leading-relaxed break-words">
                {report.narrativeGap.scoreRationale}
              </p>
            )}
            {report.narrativeGap.gapPoints?.length > 0 && (
              <ul className="space-y-1">
                {report.narrativeGap.gapPoints.map((p, i) => (
                  <li
                    key={i}
                    className="text-[13px] text-foreground/85 leading-snug flex gap-2 break-words"
                  >
                    <span className="text-cyan shrink-0">›</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

      {/* Question analysis — Topics insight cards */}
      {report.questionAnalyses && report.questionAnalyses.length > 0 && (
        <section className="space-y-3 min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-cyan">
            <Brain className="w-3.5 h-3.5" /> Question analysis
            <span className="text-muted-foreground normal-case tracking-normal font-sans">
              · {report.questionAnalyses.length} questions
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.questionAnalyses.map((q, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-background/50 p-4 space-y-2 min-w-0 overflow-hidden"
                style={{
                  borderLeft: `3px solid ${sentimentColor(q.sentimentScore)}`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12px] font-mono text-cyan">Q{i + 1}</p>
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${confClass(q.confidence)}`}
                  >
                    {q.confidence}
                  </span>
                </div>
                <h3 className="text-[14px] font-display font-semibold leading-snug break-words">
                  {q.question}
                </h3>
                <p className="text-[13px] text-foreground/90 leading-relaxed break-words">
                  {q.answer}
                </p>
                {q.sentimentScore != null && (
                  <p className="text-[11px] font-mono tabular-nums" style={{ color: sentimentColor(q.sentimentScore) }}>
                    Score {Math.round(q.sentimentScore)}
                    {q.sentimentLabel ? ` · ${q.sentimentLabel}` : ""}
                  </p>
                )}
                {q.keyPoints?.length > 0 && (
                  <ul className="space-y-1 pt-1 border-t border-border/60">
                    {q.keyPoints.map((k, j) => (
                      <li
                        key={j}
                        className="text-[12px] text-muted-foreground flex gap-1.5 break-words"
                      >
                        <MessageSquare className="w-3 h-3 text-cyan shrink-0 mt-0.5" />
                        <span>{k}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Key insights */}
      {report.keyInsights && report.keyInsights.length > 0 && (
        <section className="rounded-2xl border border-border bg-card/40 p-4 sm:p-5 space-y-2 min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-cyan">
            <Sparkles className="w-3.5 h-3.5" /> Key insights
          </div>
          <ul className="space-y-2">
            {report.keyInsights.map((k, i) => (
              <li key={i} className="text-[13px] text-foreground/90 leading-relaxed flex gap-2 break-words">
                <span className="text-cyan font-mono shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <span>{k}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Claims */}
      {report.claims && report.claims.length > 0 && (
        <section className="rounded-2xl border border-border bg-card/40 p-4 sm:p-5 space-y-3 min-w-0">
          <h2 className="text-sm font-display font-semibold">Claims</h2>
          <ul className="space-y-2">
            {report.claims.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-border/80 bg-background/40 px-3 py-3 space-y-1 min-w-0"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono text-cyan uppercase">{c.id}</span>
                  <span className="text-[12px] font-medium">{c.domain}</span>
                  <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${confClass(c.confidence)}`}>
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

      {/* Chapters (deep packages) */}
      {report.chapters && report.chapters.length > 0 && (
        <section className="space-y-3 min-w-0">
          <h2 className="text-sm font-display font-semibold px-0.5">Evidence map / chapters</h2>
          <ol className="space-y-2">
            {report.chapters.map((ch) => (
              <li
                key={ch.id}
                className="rounded-xl border border-border/80 bg-card/40 px-3.5 py-3 min-w-0"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-mono text-[11px] text-cyan">{ch.number}</span>
                  <span className="text-[14px] font-display font-semibold break-words">
                    {ch.title}
                  </span>
                </div>
                <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed break-words">
                  {ch.summary}
                </p>
                {ch.bullets?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {ch.bullets.map((b, i) => (
                      <li key={i} className="text-[12.5px] text-foreground/85 pl-3 relative break-words">
                        <span className="absolute left-0 text-cyan">·</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Scenarios */}
      {report.scenarios && report.scenarios.length > 0 && (
        <section className="rounded-2xl border border-border bg-card/40 p-4 sm:p-5 space-y-3 min-w-0">
          <h2 className="text-sm font-display font-semibold">Conditional scenarios</h2>
          <div className="grid gap-2 md:grid-cols-3">
            {report.scenarios.map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-border/80 bg-background/30 p-3 space-y-1.5 min-w-0"
              >
                <p className="font-mono text-[11px] text-cyan break-words">
                  {s.id} · {s.name}
                </p>
                <p className="text-[12px] break-words">
                  <span className="text-muted-foreground">Politics: </span>
                  {s.politics}
                </p>
                <p className="text-[12px] break-words">
                  <span className="text-muted-foreground">Tech may accelerate: </span>
                  {s.techMayAccelerate}
                </p>
                <p className="text-[12px] break-words">
                  <span className="text-muted-foreground">Unlikely fast: </span>
                  {s.unlikelyFast}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Method & limits */}
      <section className="rounded-2xl border border-border bg-card/40 p-4 sm:p-5 space-y-3 min-w-0">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
          <Scale className="w-3.5 h-3.5 text-cyan" /> Method & limits
        </div>
        {report.methodNotes?.length ? (
          <ul className="space-y-1">
            {report.methodNotes.map((m, i) => (
              <li key={i} className="text-[13px] text-foreground/85 leading-relaxed break-words">
                · {m}
              </li>
            ))}
          </ul>
        ) : null}
        {report.limits?.length ? (
          <ul className="space-y-1 border-t border-border pt-3">
            {report.limits.map((m, i) => (
              <li key={i} className="text-[12.5px] text-muted-foreground leading-relaxed break-words">
                · {m}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="text-[11px] font-mono text-muted-foreground break-all">
        Token · {report.token} · Save this URL
      </p>

      <div className="text-[12px] text-muted-foreground">
        Questions?{" "}
        <ContactEmailMe
          source="commissioned-report"
          variant="inline"
          defaultMessage={`Re: commissioned report token ${report.token}\n\n`}
        />
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="px-2 py-3 text-center min-w-0">
      <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.1em] text-muted-foreground truncate">
        {label}
      </p>
      <p
        className="text-lg sm:text-xl font-display font-semibold tabular-nums leading-none mt-1"
        style={{ color }}
      >
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground mt-1 truncate">{sub}</p>
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
