import { useState, type CSSProperties } from "react";
import { Layers, Radio } from "lucide-react";
import type { DeskCard, LiveDesk } from "@/lib/desk/types";
import { sentimentTone } from "@/lib/score-colors";

export function TenantDeskView({ desk }: { desk: LiveDesk | null }) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!desk) {
    return (
      <div className="page-shell dash-landing">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <main className="max-w-[640px] mx-auto px-4 py-16 text-center space-y-2 relative">
          <p className="text-[1.35rem] font-display font-semibold tabular-nums">0</p>
          <p className="text-[13px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
            Awaiting data
          </p>
          <p className="text-[14px] text-muted-foreground">This desk is not live yet.</p>
        </main>
      </div>
    );
  }

  const { tenant, branding, cards } = desk;
  const title = branding.org_name || tenant.org_name || "Public discourse desk";
  const primary = branding.primary_color || "#22d3ee";
  const accent = branding.accent_color || "#f59e0b";
  const sampled = cards.reduce((n, c) => n + (typeof c.sample_size === "number" ? c.sample_size : 0), 0);
  const awaitingCount = cards.filter((c) => !c.sample_size).length;
  const selectedCard =
    cards.find((c) => c.topic_id === selected) ?? cards.find((c) => c.sample_size) ?? cards[0];
  const discourseTitle = selectedCard
    ? `Public Discourse Around ${selectedCard.topic_name}`
    : "Public Discourse Around topic of selection";

  return (
    <div
      className="min-h-screen relative flex flex-col dash-landing"
      style={
        {
          ["--cyan" as string]: primary,
          ["--cyan-glow" as string]: `${primary}73`,
          ["--amber-signal" as string]: accent,
        } as CSSProperties
      }
    >
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <header className="sticky top-0 z-30 nav-shell">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 py-2.5 md:py-3 flex items-center gap-3">
          {branding.logo_url ? (
            <img
              src={branding.logo_url}
              alt=""
              className="h-9 w-9 rounded-full object-cover border border-cyan/35"
            />
          ) : (
            <div className="brand-mark w-9 h-9 rounded-full grid place-items-center shrink-0">
              <Radio className="w-4 h-4 text-cyan" strokeWidth={2.5} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-lg sm:text-xl tracking-tight truncate">{title}</p>
            <p className="hidden sm:block text-[10.5px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              Public discourse desk
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto w-full px-3 sm:px-4 md:px-6 py-3 sm:py-6 space-y-3 sm:space-y-5 relative flex-1 mobile-safe-bottom">
        <div className="hidden md:grid grid-cols-3 gap-2.5">
          <KpiFace label="Topics" value={cards.length} />
          <KpiFace label="Sample posts" value={sampled} awaiting={sampled === 0} />
          <KpiFace label="Awaiting data" value={awaitingCount} />
        </div>

        {cards.length === 0 ? (
          <p className="text-[13px] font-mono text-muted-foreground">0 · awaiting data</p>
        ) : (
          <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3">
            {cards.map((c) => (
              <li key={c.topic_id}>
                <TopicTile
                  card={c}
                  selected={selected === c.topic_id}
                  onSelect={() => setSelected(c.topic_id)}
                />
              </li>
            ))}
          </ul>
        )}

        <section className="dash-panel p-3 sm:p-5 space-y-3">
          <div className="flex items-start gap-2.5 pb-2.5 border-b border-border/80">
            <div className="intel-header-icon shrink-0">
              <Radio className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-semibold text-[0.98rem] sm:text-[1.15rem] leading-snug">
                {discourseTitle}
              </h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Tap a topic card. Empty rows stay 0 · awaiting data — never invented.
              </p>
            </div>
          </div>
          {selectedCard?.headline && selectedCard.sample_size ? (
            <p className="text-[14px] leading-relaxed text-foreground/90">{selectedCard.headline}</p>
          ) : (
            <p className="text-[13px] font-mono text-muted-foreground">0 · awaiting data</p>
          )}
        </section>
      </main>

      {branding.unbranded ? (
        <div className="h-8" />
      ) : (
        <footer className="border-t border-border/80 mt-4 pb-8 bg-gradient-to-t from-card/40 to-transparent">
          <p className="max-w-[1600px] mx-auto px-4 py-3 text-[11px] font-mono text-muted-foreground">
            Desk hosted on elenchos.live
            {tenant.custom_domain ? ` · connect ${tenant.custom_domain}` : ""}
          </p>
        </footer>
      )}
    </div>
  );
}

function KpiFace({
  label,
  value,
  awaiting,
}: {
  label: string;
  value: number;
  awaiting?: boolean;
}) {
  return (
    <div className="dash-kpi dash-kpi-hero px-2.5 py-2.5 space-y-1">
      <p className="dash-kpi-label text-[9.5px] font-mono uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      {awaiting ? (
        <p className="text-[12px] font-mono text-muted-foreground">0 · awaiting data</p>
      ) : (
        <p className="dash-kpi-value text-[1.35rem] font-display font-semibold tabular-nums text-cyan leading-none">
          {value}
        </p>
      )}
    </div>
  );
}

function TopicTile({
  card,
  selected,
  onSelect,
}: {
  card: DeskCard;
  selected: boolean;
  onSelect: () => void;
}) {
  const awaiting = !card.sample_size;
  const score =
    typeof card.overall_sentiment?.score === "number" ? Math.round(card.overall_sentiment.score) : null;
  const tone = awaiting || score == null ? null : sentimentTone(score, card.overall_sentiment?.label);
  const tileStyle = tone ? { borderColor: tone.color, background: tone.tint } : undefined;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`dash-panel w-full text-left p-4 space-y-2 min-h-[148px] touch-manipulation transition-colors ${
        selected ? "ring-1 ring-cyan/50" : ""
      }`}
      style={tileStyle}
    >
      <div className="flex items-start gap-2">
        <Layers className="w-3.5 h-3.5 text-cyan mt-0.5 shrink-0" aria-hidden />
        <h2 className="font-display font-semibold text-[15px] leading-snug">{card.topic_name}</h2>
      </div>
      {awaiting || score == null ? (
        <p className="text-[12px] font-mono text-muted-foreground">0 · awaiting data</p>
      ) : (
        <>
          <p
            className="text-[1.55rem] font-display font-semibold tabular-nums leading-none"
            style={{ color: tone?.color }}
          >
            {score}
          </p>
          <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
            {tone?.band} · sample {card.sample_size}
          </p>
        </>
      )}
    </button>
  );
}
