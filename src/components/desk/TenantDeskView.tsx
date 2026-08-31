import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Globe2, Layers, MapPinned, Radio } from "lucide-react";
import type { DeskCard, LiveDesk } from "@/lib/desk/types";
import { sentimentTone } from "@/lib/score-colors";
import { PaidEarnedPanel } from "@/components/desk/PaidEarnedPanel";
import { SimulatedDataBadge } from "@/components/SimulatedDataBadge";
import { Globe3D } from "@/components/Globe3D";
import { GulfMap } from "@/components/desk/GulfMap";
import { UAE_DEMO_SLUG } from "@/lib/desk/catalog";
import { UAE_AR, UAE_EN, type UaeLang } from "@/lib/desk/uae";
import { SOLVO_SIM_PAID } from "@/lib/desk/solvo-sim";

export function TenantDeskView({ desk }: { desk: LiveDesk }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [lang, setLang] = useState<UaeLang>("en");
  const { tenant, cards } = desk;
  const slug = tenant.slug || "";
  const uae = tenant.slug === UAE_DEMO_SLUG || tenant.email === "uae-demo@elenchos.live";
  const ar = uae && lang === "ar";
  const sampled = cards.reduce((n, c) => n + (typeof c.sample_size === "number" ? c.sample_size : 0), 0);
  const awaitingCount = cards.filter((c) => !c.sample_size).length;
  const selectedCard =
    cards.find((c) => c.topic_id === selected) ?? cards.find((c) => c.sample_size) ?? cards[0];
  const discourseTitle = selectedCard
    ? `Public Discourse Around ${selectedCard.topic_name}`
    : "Public Discourse Around topic of selection";

  return (
    <main
      className="max-w-[1600px] mx-auto w-full px-3 sm:px-4 md:px-6 py-3 sm:py-6 md:py-7 space-y-3 sm:space-y-5 md:space-y-6 relative flex-1 mobile-safe-bottom overflow-x-clip min-w-0"
      dir={ar ? "rtl" : "ltr"}
    >
      <aside className="md:hidden rounded-2xl border border-cyan/35 bg-cyan/[0.08] px-4 py-3.5 space-y-1.5">
        <p className="text-[12px] font-mono uppercase tracking-[0.14em] text-cyan">Desktop recommended</p>
        <p className="text-[13.5px] text-foreground/90 leading-snug font-display font-semibold">
          Open in desktop view for the full product experience.
        </p>
      </aside>

      {uae ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-cyan">
              Public Discourse × Research Desk
            </p>
            <SimulatedDataBadge />
          </div>
          <div className="inline-flex rounded-full border border-border p-0.5 text-[11px] font-medium self-end sm:self-auto">
            <button
              type="button"
              className={`min-h-[32px] px-2.5 rounded-full ${lang === "en" ? "bg-cyan/15 text-cyan" : "text-muted-foreground"}`}
              onClick={() => setLang("en")}
            >
              EN
            </button>
            <button
              type="button"
              className={`min-h-[32px] px-2.5 rounded-full ${lang === "ar" ? "bg-cyan/15 text-cyan" : "text-muted-foreground"}`}
              onClick={() => setLang("ar")}
            >
              العربية
            </button>
          </div>
        </div>
      ) : null}

      <div className="hidden md:grid grid-cols-6 gap-2">
        <KpiFace label={ar ? "مواضيع" : "Topics"} value={cards.length} />
        <KpiFace
          label={ar ? "عيّنة" : "Sample"}
          value={sampled}
          awaiting={sampled === 0}
          awaitingLabel={ar ? "0 · بانتظار البيانات" : undefined}
        />
        <KpiFace label={ar ? "بانتظار" : "Awaiting"} value={awaitingCount} />
        <KpiFace label={ar ? "بحث" : "Research"} value={cards.length} />
        <KpiFace label={ar ? "مدفوع" : "Paid"} value={uae ? SOLVO_SIM_PAID.volume : 0} awaiting={!uae} />
        <KpiFace label={ar ? "مكتسب" : "Earned"} value={uae ? SOLVO_SIM_PAID.earned : 0} awaiting={!uae} />
      </div>

      {uae ? <PaidEarnedPanel lang={lang} /> : null}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2.5 sm:gap-4 md:gap-5 xl:items-start min-w-0">
        <section className="dash-panel p-2.5 sm:p-4 md:p-5 xl:col-span-8 overflow-hidden min-w-0 flex flex-col max-w-full self-start">
          <div className="flex flex-col gap-1.5 sm:gap-2.5 mb-2 sm:mb-2.5 pb-2 sm:pb-2.5 border-b border-border/80">
            <div className="intel-header">
              <div className="intel-header-row">
                <div className="intel-header-icon">
                  <Radio className="w-4 h-4" />
                </div>
                <h2 className="font-display font-semibold text-[0.98rem] sm:text-[1.15rem] leading-snug">
                  {discourseTitle}
                </h2>
              </div>
              <p className="intel-header-sub">
                {ar
                  ? "عيّنة القوة العاملة — لا الوزارات ولا الإعلام كصوت الجمهور. الفارغ يبقى 0 بانتظار البيانات."
                  : "Workforce sample — not ministry feeds, not media as the public. Empty rows stay 0 · awaiting data."}
              </p>
            </div>
          </div>
          {cards.length === 0 ? (
            <p className="text-[13px] font-mono text-muted-foreground">
              {ar ? "0 · بانتظار البيانات" : "0 · awaiting data"}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {cards.map((c) => {
                const awaiting = !c.sample_size;
                const score =
                  typeof c.overall_sentiment?.score === "number"
                    ? Math.round(c.overall_sentiment.score)
                    : null;
                const tone =
                  awaiting || score == null ? null : sentimentTone(score, c.overall_sentiment?.label);
                return (
                  <li key={c.topic_id}>
                    <button
                      type="button"
                      onClick={() => setSelected(c.topic_id)}
                      className={`w-full text-left rounded-xl border px-3 py-2.5 min-h-[52px] flex items-center gap-3 touch-manipulation ${
                        selected === c.topic_id ? "border-cyan/50 bg-cyan/10" : "border-border/80 bg-background/40"
                      }`}
                    >
                      <span className="font-display font-semibold text-[14px] min-w-0 flex-1 truncate">
                        {c.topic_name}
                      </span>
                      {awaiting || score == null ? (
                        <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                          {ar ? "0 · بانتظار" : "0 · awaiting"}
                        </span>
                      ) : (
                        <span className="text-[14px] font-display font-semibold tabular-nums shrink-0" style={{ color: tone?.color }}>
                          {score}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {selectedCard?.headline && selectedCard.sample_size ? (
            <p className="mt-3 text-[14px] leading-relaxed text-foreground/90">{selectedCard.headline}</p>
          ) : null}
        </section>

        <section className="dash-panel p-2.5 sm:p-4 md:p-5 xl:col-span-4 relative overflow-hidden min-w-0 flex flex-col self-start w-full">
          <div className="mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-border/80">
            <div className="intel-header">
              <div className="intel-header-row">
                <div className="intel-header-icon">
                  {uae ? <MapPinned className="w-4 h-4" /> : <Globe2 className="w-4 h-4" />}
                </div>
                <h2 className="intel-header-title">
                  {uae
                    ? ar
                      ? "خريطة الخليج"
                      : "UAE & Gulf map"
                    : "Global Sentiment Heatmap"}
                </h2>
              </div>
              <p className="intel-header-sub">
                {uae
                  ? ar
                    ? "اسحب وتكبير · الإمارات والخليج · النقاط بلا درجات مخترعة"
                    : "Drag, zoom, tap a city · UAE + surrounding Gulf · pins are not scores"
                  : sampled > 0
                    ? `Tap a point · ${sampled} data points`
                    : "0 · awaiting data — no region markers until a billed run"}
              </p>
            </div>
          </div>
          {uae ? (
            <GulfMap lang={lang} />
          ) : (
            <div className="relative h-[min(52vw,280px)] sm:h-[400px] xl:h-[450px] w-full rounded-xl border border-cyan/30 overflow-hidden globe-stage shadow-[inset_0_0_48px_-14px_var(--cyan-glow)] ring-1 ring-cyan/10">
              <Globe3D signals={[]} onPick={() => undefined} />
              <div className="absolute inset-0 grid place-items-center bg-background/40 px-4 text-center">
                <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xs">
                  No region markers in this sample yet. Run a billed topic sample from studio.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3">
        {cards.map((c) => (
          <li key={`tile-${c.topic_id}`}>
            <TopicTile card={c} selected={selected === c.topic_id} onSelect={() => setSelected(c.topic_id)} />
          </li>
        ))}
      </ul>

      <section className="rounded-xl border border-border/80 bg-card/30 px-2.5 py-2 sm:px-3 sm:py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">Go deeper</span>
          <Link
            to="/d/$slug/research"
            params={{ slug }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-lg border border-border/90 bg-background/60 hover:border-cyan/50 text-[12.5px] font-medium"
          >
            <Layers className="w-3.5 h-3.5 text-cyan" />
            Research · selected topics
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {uae ? (
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          {ar ? UAE_AR.limits : UAE_EN.limits}
        </p>
      ) : null}
    </main>
  );
}

function KpiFace({
  label,
  value,
  awaiting,
  awaitingLabel,
}: {
  label: string;
  value: number;
  awaiting?: boolean;
  awaitingLabel?: string;
}) {
  return (
    <div className="dash-kpi dash-kpi-hero px-2.5 py-2.5 space-y-1">
      <p className="dash-kpi-label text-[9.5px] font-mono uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      {awaiting ? (
        <p className="text-[12px] font-mono text-muted-foreground">{awaitingLabel || "0 · awaiting data"}</p>
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
      className={`dash-panel w-full text-left p-4 space-y-2 min-h-[148px] touch-manipulation ${
        selected ? "ring-1 ring-cyan/50" : ""
      }`}
      style={tileStyle}
    >
      <div className="flex items-start gap-2">
        <Layers className="w-3.5 h-3.5 text-cyan mt-0.5 shrink-0" />
        <h2 className="font-display font-semibold text-[15px] leading-snug">{card.topic_name}</h2>
      </div>
      {awaiting || score == null ? (
        <p className="text-[12px] font-mono text-muted-foreground">0 · awaiting data</p>
      ) : (
        <>
          <p className="text-[1.55rem] font-display font-semibold tabular-nums leading-none" style={{ color: tone?.color }}>
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
