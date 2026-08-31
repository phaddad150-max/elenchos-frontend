import { Link } from "@tanstack/react-router";
import { BookOpen, Layers } from "lucide-react";
import type { LiveDesk } from "@/lib/desk/types";
import { LIVE_TOPIC_KEYS } from "@/lib/topic-catalog";
import { sentimentTone } from "@/lib/score-colors";
import { UAE_DEMO_SLUG } from "@/lib/desk/catalog";
import { UAE_EN } from "@/lib/desk/uae";

export function TenantResearchView({ desk }: { desk: LiveDesk }) {
  const slug = desk.tenant.slug || "";
  const cards = desk.cards;
  const uae = desk.tenant.slug === UAE_DEMO_SLUG || desk.tenant.email === "uae-demo@elenchos.live";

  return (
    <main className="max-w-[1100px] mx-auto w-full px-3 sm:px-4 md:px-6 py-5 sm:py-8 space-y-5 relative flex-1 mobile-safe-bottom">
      <header className="space-y-1">
        <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-cyan">
          {uae ? UAE_EN.lens : "Research"}
        </p>
        <h1 className="page-hero-title text-2xl sm:text-3xl">
          {uae ? "UAE workforce topics" : "Selected topics"}
        </h1>
        <p className="text-[13.5px] text-muted-foreground max-w-2xl leading-relaxed">
          {uae
            ? "Preselected for Solvo Creations: SMBs, startups, founders, expansion brands — visibility, trust, AI/GEO, partnerships. Simulated preview. Official and media are contrast. Method locked."
            : "This tab only lists topics this desk picked. Catalog topics may reuse a public sample after a billed run. Your own names stay 0 · awaiting data until that run. Scoring stays on Elenchos."}
        </p>
      </header>

      {cards.length === 0 ? (
        <p className="text-[13px] font-mono text-muted-foreground">0 · awaiting data</p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {cards.map((c) => {
            const awaiting = !c.sample_size;
            const catalog = LIVE_TOPIC_KEYS[c.topic_id];
            const score =
              typeof c.overall_sentiment?.score === "number"
                ? Math.round(c.overall_sentiment.score)
                : null;
            const tone =
              awaiting || score == null ? null : sentimentTone(score, c.overall_sentiment?.label);
            return (
              <li key={c.topic_id} className="dash-panel p-4 space-y-2 min-h-[140px] flex flex-col">
                <div className="flex items-start gap-2">
                  {catalog ? (
                    <Layers className="w-4 h-4 text-cyan mt-0.5" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-amber-signal mt-0.5" />
                  )}
                  <h2 className="font-display font-semibold text-[15px] leading-snug">{c.topic_name}</h2>
                </div>
                {awaiting || score == null ? (
                  <p className="text-[12px] font-mono text-muted-foreground">0 · awaiting data</p>
                ) : (
                  <p className="text-[1.4rem] font-display font-semibold tabular-nums" style={{ color: tone?.color }}>
                    {score}
                    <span className="ml-2 text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                      {tone?.band}
                    </span>
                  </p>
                )}
                {c.headline && c.sample_size ? (
                  <p className="text-[13px] text-muted-foreground leading-relaxed flex-1">{c.headline}</p>
                ) : (
                  <p className="text-[13px] text-muted-foreground flex-1">
                    {catalog
                      ? "No sample on this desk yet. Run from studio — billed to the desk card."
                      : "Custom topic. No invented briefing."}
                  </p>
                )}
                {catalog ? (
                  <Link
                    to="/topics/$topicId"
                    params={{ topicId: c.topic_id }}
                    className="text-[12px] text-cyan hover:underline"
                  >
                    Open public briefing (method locked)
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <Link to="/d/$slug" params={{ slug }} className="text-[12px] text-cyan hover:underline">
        Back to overview
      </Link>
    </main>
  );
}
