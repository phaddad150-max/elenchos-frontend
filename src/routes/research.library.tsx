import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  FileText,
  Layers,
  Minus,
  Radio,
  Share2,
  Shield,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { GoDeeperCTA } from "@/components/GoDeeperCTA";
import { ResearchBreadcrumb } from "@/components/research/ResearchDeskNav";
import {
  getWowTrendForTopic,
  loadDashboardData,
  loadWowSentimentTrends,
  type TopicSnapshot,
  type WowTrend,
} from "@/lib/dashboard-data";
import { FEATURE_TOPICS, getTopic } from "@/lib/feature-topics";
import { listResearchBriefs, researchStatusLabel } from "@/lib/research-catalog";
import {
  PUBLISHED_AT as AVIATION_PUBLISHED_AT,
  UPDATED_AT as AVIATION_UPDATED_AT,
} from "@/lib/aviation/data";
import {
  PUBLISHED_AT as MIGRATION_PUBLISHED_AT,
  UPDATED_AT as MIGRATION_UPDATED_AT,
} from "@/lib/migration/data";
import { formatCaseStudyDate } from "@/lib/case-study-meta";
import {
  divergenceColor,
  sentimentColorCoarse,
} from "@/lib/score-colors";
import { LIBRARY_SOCIAL, socialMetaTags } from "@/lib/social-meta";
import {
  activeLiveTopicCount,
  archivedLiveTopicCount,
  isArchivedTopicId,
  isNewTopicBadge,
  LIVE_TOPIC_KEYS,
} from "@/lib/topic-catalog";
import { TopicDetailPage } from "./-topics.shared";

type SharedItem = {
  token: string;
  title: string;
  topic: string;
  packageId: string;
  createdAt: string;
  sharedAt: string | null;
};

type CaseStudy = {
  id: string;
  title: string;
  subtitle: string;
  region: string;
  statusLabel: string;
  updatedAt: string;
  href: string;
  params?: { slug: string };
  pdf?: boolean;
};

function buildCaseStudies(): CaseStudy[] {
  const editorial: CaseStudy[] = [
    {
      id: "irregular-migration",
      title: "Irregular migration — public briefing",
      subtitle:
        "Peak year ~1.8M ≠ multi-year total · X scale rail · corridors · open vs resist · returns honesty.",
      region: "EU · UK Channel",
      statusLabel: "Published",
      updatedAt: MIGRATION_UPDATED_AT || MIGRATION_PUBLISHED_AT,
      href: "/research-migration",
      pdf: false,
    },
    {
      id: "aviation-race-digital-ai",
      title: "Aviation after disruption — OEM race, satcom, AI readiness",
      subtitle:
        "After COVID: delivery trust, cabin bandwidth, and who can run AI ops — not seats alone.",
      region: "Global",
      statusLabel: "Published",
      updatedAt: AVIATION_UPDATED_AT || AVIATION_PUBLISHED_AT,
      href: "/research-aviation",
      pdf: true,
    },
  ];

  const fromCatalog: CaseStudy[] = listResearchBriefs()
    .filter((b) => b.slug !== "aviation-race-digital-ai")
    .map((b) => ({
      id: b.slug,
      title: b.title,
      subtitle: b.subtitle,
      region: b.region,
      statusLabel: researchStatusLabel(b.status),
      updatedAt: b.updatedAt,
      href: "/research/preview/$slug",
      params: { slug: b.slug },
      pdf: !!b.pdfUrl,
    }));

  return [...editorial, ...fromCatalog].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

const TRACKERS = [
  {
    href: "/trackers/leaders",
    title: "Leadership board",
    body: "Current world leaders — citizen trust vs official narratives.",
    icon: Users,
    badge: "Index",
    accent: "amber" as const,
    metric: "15 leaders",
  },
  {
    href: "/trackers/business",
    title: "AI & Business leaders",
    body: "AI / tech builders scored on vision, execution, and free-speech stance.",
    icon: Layers,
    badge: "Preview",
    accent: "amber" as const,
    metric: "15 figures",
  },
  {
    href: "/trackers/citizen-discourse",
    title: "Citizen journalism",
    body: "Individual reporters only — trust, authenticity, rigor, independence.",
    icon: Radio,
    badge: "Preview",
    accent: "cyan" as const,
    metric: "15 journalists",
  },
  {
    href: "/trackers/peace",
    title: "Peace index",
    body: "Normalization & peace diagnostics — support, momentum, official gap.",
    icon: Trophy,
    badge: "Index",
    accent: "emerald" as const,
    metric: "Country index",
  },
  {
    href: "/research/networks-ledger",
    title: "Networks Ledger",
    body: "Terror & Finance + Speech Reach — official actions and For You recommendation rules.",
    icon: Shield,
    badge: "Ledger",
    accent: "cyan" as const,
    metric: "2 branches",
  },
] as const;

type LibrarySection = "topics" | "cases" | "trackers";

type LibrarySearch = {
  section?: LibrarySection;
  topic?: string;
};

function isLibrarySection(v: string): v is LibrarySection {
  return v === "topics" || v === "cases" || v === "trackers";
}

export const Route = createFileRoute("/research/library")({
  validateSearch: (search: Record<string, unknown>): LibrarySearch => {
    const out: LibrarySearch = {};
    if (typeof search.section === "string" && isLibrarySection(search.section)) {
      out.section = search.section;
    }
    if (typeof search.topic === "string" && search.topic.trim()) {
      out.topic = search.topic.trim();
      out.section = out.section ?? "topics";
    }
    return out;
  },
  head: ({ match }) => {
    const topicId = match.search.topic;
    const topic = topicId ? getTopic(topicId) : null;
    if (topic) {
      const title = `${topic.title} · Library · Elenchos`;
      const description =
        topic.description?.slice(0, 160) ??
        "Citizen sentiment and narrative divergence from public discourse on X.";
      const url = `https://elenchos.live/research/library?section=topics&topic=${encodeURIComponent(topic.id)}`;
      return {
        meta: [
          { title },
          { name: "description", content: description },
          { property: "og:title", content: title },
          { property: "og:description", content: description },
          { property: "og:url", content: url },
          { property: "og:type", content: "article" },
        ],
        links: [{ rel: "canonical", href: url }],
      };
    }
    return {
      meta: socialMetaTags(LIBRARY_SOCIAL),
      links: [{ rel: "canonical", href: LIBRARY_SOCIAL.url }],
    };
  },
  component: ResearchLibraryPage,
});

/**
 * Premium interactive Library — one section at a time via Jump in.
 * Topic detail deep-links: ?section=topics&topic=$id (standalone /topics retired).
 */
function ResearchLibraryPage() {
  const navigate = useNavigate({ from: "/research/library" });
  const search = Route.useSearch();
  const cases = useMemo(() => buildCaseStudies(), []);
  /** Active monitors only (presentation list). */
  const topicList = useMemo(
    () =>
      FEATURE_TOPICS.filter(
        (t) => Object.prototype.hasOwnProperty.call(LIVE_TOPIC_KEYS, t.id) && !isArchivedTopicId(t.id),
      ),
    [],
  );
  const archivedTopicList = useMemo(
    () =>
      FEATURE_TOPICS.filter(
        (t) => Object.prototype.hasOwnProperty.call(LIVE_TOPIC_KEYS, t.id) && isArchivedTopicId(t.id),
      ),
    [],
  );
  const [shared, setShared] = useState<SharedItem[]>([]);
  const [activeSec, setActiveSec] = useState<LibrarySection>(
    search.section ?? "topics",
  );
  /** Bump after dashboard/WoW loads so topic cards re-read live scores. */
  const [scoresTick, setScoresTick] = useState(0);
  const activeTopics = activeLiveTopicCount();
  const archivedTopics = archivedLiveTopicCount();
  const caseCount = cases.length + shared.length;
  const trackerCount = TRACKERS.length;

  const openTopic = search.topic;

  const scrollToSection = (id: LibrarySection) => {
    const el = document.getElementById(`lib-${id}`);
    if (!el) return;
    window.requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const selectSection = (id: LibrarySection) => {
    setActiveSec(id);
    void navigate({
      to: "/research/library",
      search: { section: id },
      replace: true,
    });
    scrollToSection(id);
  };

  const clearTopic = () => {
    void navigate({
      to: "/research/library",
      search: { section: "topics" },
      replace: true,
    });
  };

  useEffect(() => {
    let cancelled = false;
    fetch("/api/research/shared?kind=deep")
      .then((r) => r.json())
      .then((data: { items?: SharedItem[] }) => {
        if (!cancelled) setShared(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => {
        if (!cancelled) setShared([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadDashboardData(), loadWowSentimentTrends()]).then(() => {
      if (!cancelled) setScoresTick((n) => n + 1);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync section from search; legacy hash #topics | #cases | #trackers still works
  useEffect(() => {
    if (search.section) {
      setActiveSec(search.section);
      scrollToSection(search.section);
    }
  }, [search.section]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.location.hash.replace(/^#/, "").replace(/^lib-/, "");
    if (isLibrarySection(raw) && !search.section) setActiveSec(raw);

    const onHash = () => {
      const h = window.location.hash.replace(/^#/, "").replace(/^lib-/, "");
      if (isLibrarySection(h)) {
        setActiveSec(h);
        void navigate({
          to: "/research/library",
          search: { section: h },
          replace: true,
        });
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [navigate, search.section]);

  if (openTopic) {
    return (
      <TopicDetailPage
        topicId={openTopic}
        onBack={clearTopic}
      />
    );
  }

  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1400px] mx-auto w-full min-w-0 px-2.5 sm:px-4 md:px-6 py-5 sm:py-8 mobile-safe-bottom md:pb-14 relative flex-1 overflow-x-clip space-y-5 sm:space-y-7">
        <ResearchBreadcrumb />

        {/* Hero + at-a-glance KPIs */}
        <header className="page-hero-banner overflow-hidden min-w-0 relative">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_15%_0%,color-mix(in_oklab,var(--cyan)_22%,transparent),transparent_50%),radial-gradient(ellipse_at_85%_30%,color-mix(in_oklab,var(--amber-signal)_12%,transparent),transparent_45%)]" />
          <div className="relative p-4 sm:p-5 md:p-7 space-y-4 min-w-0">
            <div className="page-hero-kicker">
              <BookOpen className="w-3.5 h-3.5" aria-hidden />
              Research · Free published work
            </div>
            <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <h1 className="page-hero-title text-[1.4rem] sm:text-2xl md:text-[2rem] break-words">
                  Research Library
                </h1>
                <p className="page-hero-sub text-[13px] sm:text-[14.5px]">
                  Tap Topics, Cases, or Trackers — then open any card in one click.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full lg:w-auto lg:min-w-[320px]">
                <StatTile
                  value={String(activeTopics)}
                  label="Topics"
                  sub={archivedTopics > 0 ? `${archivedTopics} archived` : "live"}
                  tone="cyan"
                  delay={0}
                  active={activeSec === "topics"}
                  onSelect={() => selectSection("topics")}
                />
                <StatTile
                  value={String(caseCount)}
                  label="Cases"
                  sub="deep dives"
                  tone="emerald"
                  delay={0.05}
                  active={activeSec === "cases"}
                  onSelect={() => selectSection("cases")}
                />
                <StatTile
                  value={String(trackerCount)}
                  label="Trackers"
                  sub="indexes"
                  tone="amber"
                  delay={0.1}
                  active={activeSec === "trackers"}
                  onSelect={() => selectSection("trackers")}
                />
              </div>
            </div>
          </div>
        </header>

        {/* One-tap switcher — StatTiles in the hero already select; keep a thin rail only */}
        <div
          role="tablist"
          aria-label="Research collections"
          className="flex flex-wrap items-center gap-1.5 sm:gap-2 px-0.5"
        >
          <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground mr-1">
            Show
          </span>
          {(
            [
              { id: "topics" as const, label: "Topics", tone: "cyan" },
              { id: "cases" as const, label: "Case studies", tone: "emerald" },
              { id: "trackers" as const, label: "Trackers", tone: "amber" },
            ] as const
          ).map((t) => {
            const on = activeSec === t.id;
            const activeCls =
              t.tone === "emerald"
                ? "bg-emerald-signal/15 text-emerald-signal border-emerald-signal/45"
                : t.tone === "amber"
                  ? "bg-amber-signal/15 text-amber-signal border-amber-signal/45"
                  : "bg-cyan/15 text-cyan border-cyan/45";
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => selectSection(t.id)}
                className={`inline-flex items-center min-h-[40px] px-3 rounded-full text-[12.5px] font-medium border touch-manipulation transition-colors ${
                  on
                    ? activeCls
                    : "border-border/80 text-muted-foreground hover:border-cyan/35 hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Active collection only — one click from card → destination */}
        <div className="min-w-0" role="tabpanel" aria-live="polite">
          {activeSec === "topics" && (
            <section
              id="lib-topics"
              className="lib-panel lib-panel-cyan rounded-2xl border p-4 sm:p-5 md:p-6 space-y-4 scroll-mt-24"
              aria-labelledby="h-topics"
            >
              <SectionHead
                id="h-topics"
                icon={<Layers className="w-4 h-4" />}
                title="Topic analyses"
                sub="Live citizen discourse on X vs official and media frames. Open any card for the full briefing."
                tone="cyan"
                metric={`${activeTopics} active`}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                {topicList.map((t, i) => (
                  <TopicLibraryCard
                    key={`${t.id}-${scoresTick}`}
                    topic={t}
                    delay={i * 0.03}
                  />
                ))}
              </div>
              {topicList.length === 0 && (
                <p className="text-[13px] text-muted-foreground text-center py-8 border border-dashed border-border rounded-xl">
                  No active topic analyses listed yet.
                </p>
              )}
              {archivedTopicList.length > 0 && (
                <div className="pt-1 space-y-2.5">
                  <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                    Archived · history only
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                    {archivedTopicList.map((t, i) => (
                      <TopicLibraryCard
                        key={`${t.id}-a-${scoresTick}`}
                        topic={t}
                        delay={i * 0.03}
                        archived
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {activeSec === "cases" && (
            <section
              id="lib-cases"
              className="lib-panel lib-panel-emerald rounded-2xl border p-4 sm:p-5 md:p-6 space-y-4 scroll-mt-24"
              aria-labelledby="h-cases"
            >
              <SectionHead
                id="h-cases"
                icon={<FileText className="w-4 h-4" />}
                title="Case studies"
                sub="Multi-source deep dives with claims and limits you can check."
                tone="emerald"
                metric={`${cases.length} listed`}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cases.map((c, i) => (
                  <CaseCard key={c.id} item={c} delay={i * 0.04} index={i} />
                ))}
              </div>
              {cases.length === 0 && (
                <p className="text-[13px] text-muted-foreground text-center py-8 border border-dashed border-border rounded-xl">
                  No case studies published yet.
                </p>
              )}
              {shared.length > 0 && (
                <div className="pt-1 space-y-2.5">
                  <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5" /> Community shared
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {shared.map((s) => (
                      <Link
                        key={s.token}
                        to="/research/report/$token"
                        params={{ token: s.token }}
                        className="lib-case-card group flex gap-3 rounded-2xl border border-border/80 bg-card/50 hover:border-emerald-signal/45 p-3.5 transition-all"
                      >
                        <span className="w-10 h-10 shrink-0 rounded-xl border border-emerald-signal/30 bg-emerald-signal/10 text-emerald-signal grid place-items-center">
                          <Share2 className="w-4 h-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-mono text-muted-foreground">
                            Shared · {s.packageId}
                          </p>
                          <h3 className="text-[14px] font-display font-semibold group-hover:text-emerald-signal break-words">
                            {s.title}
                          </h3>
                          <p className="text-[12px] text-muted-foreground line-clamp-1">{s.topic}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1 group-hover:text-emerald-signal group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {activeSec === "trackers" && (
            <section
              id="lib-trackers"
              className="lib-panel lib-panel-amber rounded-2xl border p-4 sm:p-5 md:p-6 space-y-4 scroll-mt-24"
              aria-labelledby="h-trackers"
            >
              <SectionHead
                id="h-trackers"
                icon={<Trophy className="w-4 h-4" />}
                title="Trackers & indexes"
                sub="Citizen rankings and the Networks Ledger (Terror & Finance + Speech Reach)."
                tone="amber"
                metric={`${trackerCount} surfaces`}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {TRACKERS.map((t, i) => (
                  <ToolCard key={t.href} {...t} delay={i * 0.05} />
                ))}
              </div>
            </section>
          )}
        </div>

        <GoDeeperCTA />
      </main>

      <SiteFooter />
    </div>
  );
}

function StatTile({
  value,
  label,
  sub,
  tone,
  delay,
  active,
  onSelect,
}: {
  value: string;
  label: string;
  sub: string;
  tone: "cyan" | "emerald" | "amber";
  delay: number;
  active?: boolean;
  onSelect?: () => void;
}) {
  const toneCls =
    tone === "emerald"
      ? active
        ? "border-emerald-signal/55 text-emerald-signal bg-emerald-signal/10 ring-1 ring-emerald-signal/25"
        : "border-emerald-signal/35 text-emerald-signal"
      : tone === "amber"
        ? active
          ? "border-amber-signal/55 text-amber-signal bg-amber-signal/10 ring-1 ring-amber-signal/25"
          : "border-amber-signal/35 text-amber-signal"
        : active
          ? "border-cyan/55 text-cyan bg-cyan/10 ring-1 ring-cyan/25"
          : "border-cyan/35 text-cyan";
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      onClick={onSelect}
      aria-pressed={active}
      className={`rounded-xl border bg-background/50 px-2.5 py-2.5 sm:px-3 sm:py-3 text-center w-full min-h-[44px] touch-manipulation transition-colors hover:bg-background/80 ${toneCls}`}
    >
      <p className="text-xl sm:text-2xl font-display font-semibold tabular-nums leading-none">
        {value}
      </p>
      <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mt-1.5">
        {label}
      </p>
      <p className="text-[10px] text-muted-foreground/80 mt-0.5">{sub}</p>
    </motion.button>
  );
}

function SectionHead({
  id,
  icon,
  title,
  sub,
  tone,
  metric,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
  tone: "cyan" | "emerald" | "amber";
  metric: string;
}) {
  const chip =
    tone === "emerald"
      ? "text-emerald-signal border-emerald-signal/35 bg-emerald-signal/10"
      : tone === "amber"
        ? "text-amber-signal border-amber-signal/35 bg-amber-signal/10"
        : "text-cyan border-cyan/35 bg-cyan/10";
  return (
    <div className="flex flex-wrap items-start justify-between gap-2 min-w-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-cyan">{icon}</span>
          <h2
            id={id}
            className="text-[15px] sm:text-base font-display font-semibold text-foreground"
          >
            {title}
          </h2>
        </div>
        <p className="text-[12.5px] text-muted-foreground max-w-2xl leading-snug pl-6">{sub}</p>
      </div>
      <span
        className={`text-[10px] font-mono uppercase tracking-[0.12em] px-2 py-1 rounded-full border ${chip}`}
      >
        {metric}
      </span>
    </div>
  );
}

function readLibSnapshot(rootKey: string): TopicSnapshot | null {
  if (typeof window === "undefined") return null;
  const root = window.dashboardData;
  if (!root) return null;
  return (root[rootKey] as TopicSnapshot) ?? null;
}

function readLibDivergence(snapshot?: TopicSnapshot | null): number | undefined {
  if (snapshot == null) return undefined;
  if (typeof snapshot.divergence_score === "number") {
    return Math.round(snapshot.divergence_score);
  }
  const raw = snapshot.narrative_divergence;
  if (typeof raw === "number") return Math.round(raw);
  if (raw && typeof raw === "object" && typeof (raw as { score?: number }).score === "number") {
    return Math.round((raw as { score: number }).score);
  }
  return undefined;
}

function TopicLibraryCard({
  topic,
  delay,
  archived = false,
}: {
  topic: (typeof FEATURE_TOPICS)[number];
  delay: number;
  archived?: boolean;
}) {
  const isNew = !archived && isNewTopicBadge(topic.id);
  const rootKey = LIVE_TOPIC_KEYS[topic.id]?.rootKey;
  const snap = rootKey ? readLibSnapshot(rootKey) : null;
  const os = snap?.overall_sentiment;
  const sentiment =
    typeof os === "object" && os && typeof os.score === "number"
      ? Math.round(os.score)
      : undefined;
  const divergence = readLibDivergence(snap);
  const wow: WowTrend | null = rootKey
    ? getWowTrendForTopic(rootKey) ?? getWowTrendForTopic(topic.title)
    : null;
  const sentColor =
    typeof sentiment === "number"
      ? sentimentColorCoarse(sentiment)
      : "var(--muted-foreground)";
  const divColor =
    typeof divergence === "number"
      ? divergenceColor(divergence)
      : "var(--muted-foreground)";

  const WowIcon =
    wow?.direction === "up"
      ? TrendingUp
      : wow?.direction === "down"
        ? TrendingDown
        : Minus;
  const wowColor =
    wow?.direction === "up"
      ? "var(--emerald-signal)"
      : wow?.direction === "down"
        ? "var(--rose-signal)"
        : "var(--muted-foreground)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ delay, duration: 0.25 }}
      className="h-full"
    >
      <Link
        to="/research/library"
        search={{ section: "topics", topic: topic.id }}
        className={`group lib-case-card relative flex flex-col h-full min-h-0 rounded-xl border p-3 overflow-hidden transition-all touch-manipulation ${
          archived
            ? "border-border/70 bg-card/40 opacity-90 hover:border-border"
            : "border-cyan/25 bg-card/70 hover:border-cyan/55 hover:bg-cyan/[0.06] hover:shadow-[0_12px_28px_-20px_rgba(0,200,200,0.35)]"
        }`}
      >
        <div className="flex items-start gap-2 min-w-0">
          <span
            className={`shrink-0 w-8 h-8 rounded-lg border grid place-items-center ${
              archived
                ? "border-border/70 bg-background/40 text-muted-foreground"
                : "border-cyan/35 bg-cyan/10 text-cyan"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1 mb-1">
              {isNew && (
                <span className="text-[8px] font-mono uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full border border-cyan/40 bg-cyan/15 text-cyan">
                  New
                </span>
              )}
              {archived && (
                <span className="text-[8px] font-mono uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground">
                  Archived
                </span>
              )}
              {topic.region && (
                <span
                  className="text-[9px] font-mono uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-md border border-border/60 text-muted-foreground bg-background/40 leading-snug break-words max-w-full"
                  title={topic.region}
                >
                  {topic.region}
                </span>
              )}
            </div>
            <h3 className="text-[13px] sm:text-[13.5px] font-display font-semibold leading-snug group-hover:text-cyan transition-colors break-words">
              {topic.title}
            </h3>
          </div>
        </div>

        <div className="mt-2.5 flex items-end justify-between gap-2 border-t border-border/40 pt-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-center min-w-[2.5rem]">
              <p className="text-[8px] font-mono uppercase tracking-[0.1em] text-muted-foreground">
                Sent
              </p>
              <p
                className="text-[1.05rem] font-display font-semibold tabular-nums leading-none mt-0.5"
                style={{ color: sentColor }}
              >
                {sentiment ?? "—"}
              </p>
            </div>
            <div className="text-center min-w-[2.5rem] border-l border-border/50 pl-3">
              <p className="text-[8px] font-mono uppercase tracking-[0.1em] text-muted-foreground">
                Div
              </p>
              <p
                className="text-[1.05rem] font-display font-semibold tabular-nums leading-none mt-0.5"
                style={{ color: divColor }}
              >
                {divergence ?? "—"}
              </p>
            </div>
            <div
              className="flex items-center gap-1 min-h-[1.1rem]"
              title="Week-over-week sentiment"
            >
              <WowIcon className="w-3.5 h-3.5 shrink-0" style={{ color: wowColor }} strokeWidth={2.5} />
              {typeof wow?.delta === "number" && wow.delta !== 0 && (
                <span
                  className="text-[10px] font-mono font-semibold tabular-nums"
                  style={{ color: wowColor }}
                >
                  {wow.delta > 0 ? "+" : ""}
                  {Math.round(wow.delta)}
                </span>
              )}
            </div>
          </div>
          <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-cyan shrink-0">
            Open
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function CaseCard({
  item,
  delay,
  index,
}: {
  item: CaseStudy;
  delay: number;
  index: number;
}) {
  const accents = [
    "from-cyan/15 to-transparent border-cyan/30 hover:border-cyan/55",
    "from-emerald-signal/15 to-transparent border-emerald-signal/30 hover:border-emerald-signal/55",
    "from-violet-500/12 to-transparent border-violet-400/30 hover:border-violet-400/50",
    "from-amber-signal/12 to-transparent border-amber-signal/30 hover:border-amber-signal/50",
  ];
  const accent = accents[index % accents.length];
  const className = `lib-case-card group relative flex flex-col h-full min-h-[148px] rounded-2xl border bg-gradient-to-br ${accent} bg-card/80 p-4 overflow-hidden transition-all touch-manipulation hover:-translate-y-1 hover:shadow-[0_16px_40px_-24px_rgba(0,0,0,0.5)]`;

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="shrink-0 w-10 h-10 rounded-xl border border-border/70 bg-background/50 text-cyan grid place-items-center group-hover:scale-105 transition-transform">
          <FileText className="w-4 h-4" />
        </span>
        <div className="flex flex-wrap gap-1 justify-end">
          <span className="text-[9px] font-mono uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full border border-border/70 text-muted-foreground">
            {item.region}
          </span>
          {item.pdf && (
            <span className="text-[9px] font-mono uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full border border-cyan/35 text-cyan bg-cyan/10">
              PDF
            </span>
          )}
        </div>
      </div>
      <p className="text-[10px] font-mono text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <span>{item.statusLabel}</span>
        <span className="text-border" aria-hidden>
          ·
        </span>
        <time dateTime={item.updatedAt}>
          Updated {formatCaseStudyDate(item.updatedAt)}
        </time>
      </p>
      <h3 className="text-[14px] sm:text-[15px] font-display font-semibold group-hover:text-cyan transition-colors leading-snug mt-0.5 break-words">
        {item.title}
      </h3>
      <p className="text-[12.5px] text-muted-foreground leading-snug mt-1.5 line-clamp-2 break-words flex-1">
        {item.subtitle}
      </p>
      <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-cyan">
        Open briefing <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </span>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay, duration: 0.35 }}
      className="h-full"
    >
      {item.params ? (
        <Link to={item.href} params={item.params as never} className={className}>
          {inner}
        </Link>
      ) : (
        <a href={item.href} className={className}>
          {inner}
        </a>
      )}
    </motion.div>
  );
}

function ToolCard({
  href,
  title,
  body,
  icon: Icon,
  badge,
  accent,
  metric,
  delay,
}: {
  href: string;
  title: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  accent: "cyan" | "emerald" | "amber";
  metric: string;
  delay: number;
}) {
  const border =
    accent === "emerald"
      ? "border-emerald-signal/30 hover:border-emerald-signal/55"
      : accent === "amber"
        ? "border-amber-signal/30 hover:border-amber-signal/55"
        : "border-cyan/30 hover:border-cyan/55";
  const iconBox =
    accent === "emerald"
      ? "text-emerald-signal border-emerald-signal/40 bg-emerald-signal/10"
      : accent === "amber"
        ? "text-amber-signal border-amber-signal/40 bg-amber-signal/10"
        : "text-cyan border-cyan/40 bg-cyan/10";
  const bar =
    accent === "emerald"
      ? "bg-emerald-signal"
      : accent === "amber"
        ? "bg-amber-signal"
        : "bg-cyan";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -3 }}
      className="h-full"
    >
      <Link
        to={href}
        className={`lib-tracker-card group relative flex flex-col h-full min-h-[168px] rounded-2xl border bg-card/70 p-4 overflow-hidden transition-shadow touch-manipulation ${border} hover:shadow-[0_18px_44px_-28px_rgba(0,0,0,0.5)]`}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <span
            className={`w-11 h-11 rounded-xl border grid place-items-center group-hover:scale-105 transition-transform ${iconBox}`}
          >
            <Icon className="w-5 h-5" />
          </span>
          <span className="text-[9px] font-mono uppercase tracking-[0.12em] text-muted-foreground border border-border/70 rounded-full px-1.5 py-0.5">
            {badge}
          </span>
        </div>
        <h3 className="text-[14px] font-display font-semibold group-hover:text-cyan transition-colors break-words">
          {title}
        </h3>
        <p className="text-[12px] text-muted-foreground leading-snug mt-1 flex-1 break-words">
          {body}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-cyan" />
            {metric}
          </span>
          <span className="text-[12px] font-semibold text-cyan inline-flex items-center gap-1">
            Open <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${bar} opacity-40 group-hover:opacity-90 transition-opacity`} />
      </Link>
    </motion.div>
  );
}
