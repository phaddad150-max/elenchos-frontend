import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  FileText,
  MessageSquareQuote,
  Radio,
  Share2,
  Shield,
  Trophy,
  Users,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import {
  ResearchBreadcrumb,
  ResearchDeskNav,
} from "@/components/research/ResearchDeskNav";
import { listResearchBriefs, researchStatusLabel } from "@/lib/research-catalog";

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

export const Route = createFileRoute("/research/library")({
  head: () => ({
    meta: [
      {
        title: "Library · Topics, case studies & trackers · Elenchos",
      },
      {
        name: "description",
        content:
          "Free Elenchos library: public discourse topic analysis on X, multi-source case studies, leadership boards, peace index, and the Networks Ledger.",
      },
      {
        property: "og:title",
        content: "Library · Elenchos Research Desk",
      },
      {
        property: "og:description",
        content:
          "Three free doors: topic analysis on X, deep-dive case studies, and citizen trackers.",
      },
      { property: "og:url", content: "https://elenchos.live/research/library" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/research/library" }],
  }),
  component: ResearchLibraryPage,
});

function buildCaseStudies(): CaseStudy[] {
  const editorial: CaseStudy[] = [
    {
      id: "irregular-migration",
      title: "Irregular migration — public briefing",
      subtitle:
        "Scale since 2011, corridors, open vs resist frames, discourse, and returns honesty.",
      region: "EU · UK Channel",
      statusLabel: "Published",
      updatedAt: "2026-07-01",
      href: "/research-migration",
      pdf: false,
    },
    {
      id: "aviation-race-digital-ai",
      title:
        "Aviation after disruption — OEM race, satcom, AI readiness",
      subtitle:
        "Interactive deep dive: delivery trust, networks, Starlink-class cabin bandwidth, payments, AI ops KPIs.",
      region: "Global",
      statusLabel: "Published",
      updatedAt: "2026-08-15",
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

type DeepSection = "cases" | "trackers" | null;

const DOORS = [
  {
    id: "discourse" as const,
    title: "Public discourse on X",
    kicker: "Topic analysis",
    description:
      "Live Topics monitors — citizen voices on X vs official and media frames. Scores, narrative gaps, and insights per topic.",
    leadsTo: "Opens the Topics desk with active, commissioned, and archived reports.",
    cta: "Go to Topics",
    href: "/topics",
    externalNav: true,
    icon: MessageSquareQuote,
    accent: "cyan",
    glow: "from-cyan/25 via-cyan/5 to-transparent border-cyan/40",
  },
  {
    id: "cases" as const,
    title: "Case studies",
    kicker: "Deep dives",
    description:
      "Multi-source research briefs — scholarly, official, media, and optional discourse. Thesis-style claims with limits you can check.",
    leadsTo: "Opens published deep dives and community-shared reports in this library.",
    cta: "Browse case studies",
    href: "#cases",
    externalNav: false,
    icon: FileText,
    accent: "emerald",
    glow: "from-emerald-signal/20 via-emerald-signal/5 to-transparent border-emerald-signal/35",
  },
  {
    id: "trackers" as const,
    title: "Trackers",
    kicker: "Indexes & ledgers",
    description:
      "Leadership board, peace index, football player index, and the Networks Ledger (Terror & Finance + Speech Reach).",
    leadsTo: "Opens free indexes and the networks ledger from this library.",
    cta: "Browse trackers",
    href: "#trackers",
    externalNav: false,
    icon: Trophy,
    accent: "amber",
    glow: "from-amber-signal/20 via-amber-signal/5 to-transparent border-amber-signal/35",
  },
] as const;

function ResearchLibraryPage() {
  const cases = useMemo(() => buildCaseStudies(), []);
  const [shared, setShared] = useState<SharedItem[]>([]);
  const [deep, setDeep] = useState<DeepSection>(null);

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
    if (typeof window === "undefined") return;
    const h = window.location.hash.replace("#", "");
    if (h === "cases" || h === "trackers") {
      setDeep(h);
      requestAnimationFrame(() => {
        document.getElementById(`lib-${h}`)?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, []);

  const openDeep = (id: "cases" | "trackers") => {
    setDeep(id);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
    requestAnimationFrame(() => {
      document.getElementById(`lib-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1400px] mx-auto w-full min-w-0 px-2.5 sm:px-4 md:px-6 py-5 sm:py-8 mobile-safe-bottom md:pb-14 relative flex-1 overflow-x-clip">
        <ResearchBreadcrumb current="Library" />
        <ResearchDeskNav />

        <header className="page-hero-banner mb-6 sm:mb-8 overflow-hidden min-w-0 relative">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_oklab,var(--cyan)_18%,transparent),transparent_55%),radial-gradient(ellipse_at_90%_20%,color-mix(in_oklab,var(--amber-signal)_10%,transparent),transparent_50%)]" />
          <div className="relative p-4 sm:p-5 md:p-7 space-y-2.5 min-w-0">
            <div className="page-hero-kicker">
              <BookOpen className="w-3.5 h-3.5" aria-hidden />
              Library
            </div>
            <h1 className="page-hero-title text-[1.4rem] sm:text-2xl md:text-[2rem] break-words max-w-3xl">
              Three free doors into Elenchos intelligence
            </h1>
            <p className="page-hero-sub max-w-2xl break-words text-[13.5px] sm:text-[14px]">
              Pick where you want to go — live discourse on X, multi-source case studies, or
              citizen trackers and ledgers. No paywall on published work.
            </p>
          </div>
        </header>

        {/* Three creative doors */}
        <section
          aria-label="Library sections"
          className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-8"
        >
          {DOORS.map((door, i) => {
            const Icon = door.icon;
            const isOpen = deep === door.id;
            const cardClass = `lib-door group relative flex flex-col h-full min-h-[260px] sm:min-h-[280px] rounded-2xl border bg-gradient-to-b ${door.glow} bg-card/70 p-4 sm:p-5 overflow-hidden transition-all touch-manipulation ${
              isOpen ? "ring-1 ring-cyan/40 shadow-[0_0_36px_-12px_var(--cyan-glow)]" : "hover:shadow-[0_0_36px_-14px_var(--cyan-glow)]"
            }`;

            const body = (
              <>
                <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-cyan/10 blur-2xl pointer-events-none group-hover:bg-cyan/15 transition-colors" />
                <div className="relative flex items-start justify-between gap-2 mb-4">
                  <span className="w-12 h-12 rounded-2xl border border-cyan/35 bg-cyan/10 text-cyan grid place-items-center group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground tabular-nums">
                    0{i + 1}
                  </span>
                </div>
                <p className="relative text-[10px] font-mono uppercase tracking-[0.18em] text-cyan mb-1">
                  {door.kicker}
                </p>
                <h2 className="relative text-[1.15rem] sm:text-xl font-display font-semibold text-foreground group-hover:text-cyan transition-colors break-words">
                  {door.title}
                </h2>
                <p className="relative text-[13px] text-muted-foreground leading-relaxed mt-2 flex-1 break-words">
                  {door.description}
                </p>
                <p className="relative text-[11.5px] font-mono text-foreground/75 leading-snug mt-3 border-t border-border/60 pt-3 break-words">
                  {door.leadsTo}
                </p>
                <span className="relative mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-cyan">
                  {door.cta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </>
            );

            return (
              <motion.div
                key={door.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="min-w-0 h-full"
              >
                {door.externalNav ? (
                  <Link to={door.href} className={cardClass}>
                    {body}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => openDeep(door.id)}
                    className={`${cardClass} w-full text-left`}
                    aria-expanded={isOpen}
                  >
                    {body}
                  </button>
                )}
              </motion.div>
            );
          })}
        </section>

        {/* Case studies panel */}
        {deep === "cases" && (
          <section
            id="lib-cases"
            className="scroll-mt-28 space-y-4 mb-8 rounded-2xl border border-emerald-signal/25 bg-emerald-signal/[0.04] p-3.5 sm:p-5"
            aria-labelledby="h-cases"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h2
                  id="h-cases"
                  className="text-[15px] sm:text-base font-display font-semibold text-foreground"
                >
                  Case studies
                </h2>
                <p className="text-[12.5px] text-muted-foreground mt-1 max-w-2xl leading-snug">
                  Multi-source deep dives published by Elenchos — same research discipline as
                  commissioned briefs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDeep(null);
                  window.history.replaceState(null, "", "/research/library");
                }}
                className="text-[12px] font-mono text-muted-foreground hover:text-cyan min-h-[36px] px-2"
              >
                Close
              </button>
            </div>
            <div className="space-y-2.5">
              {cases.map((c, i) => (
                <CaseCard key={c.id} item={c} delay={i * 0.03} />
              ))}
            </div>
            {cases.length === 0 && (
              <p className="text-[13px] text-muted-foreground text-center py-8 border border-dashed border-border rounded-xl">
                No case studies published yet.
              </p>
            )}
            {shared.length > 0 && (
              <div className="pt-4 space-y-2.5">
                <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" /> Community shared deep dives
                </p>
                {shared.map((s) => (
                  <Link
                    key={s.token}
                    to="/research/report/$token"
                    params={{ token: s.token }}
                    className="group flex gap-3 rounded-2xl border border-border/80 bg-card/50 hover:border-cyan/40 p-3.5 transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-cyan shrink-0 mt-1" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-mono text-muted-foreground">
                        Shared · {s.packageId}
                      </p>
                      <h3 className="text-[14px] font-display font-semibold group-hover:text-cyan break-words">
                        {s.title}
                      </h3>
                      <p className="text-[12px] text-muted-foreground line-clamp-1">{s.topic}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Trackers panel */}
        {deep === "trackers" && (
          <section
            id="lib-trackers"
            className="scroll-mt-28 space-y-4 mb-8 rounded-2xl border border-amber-signal/25 bg-amber-signal/[0.04] p-3.5 sm:p-5"
            aria-labelledby="h-trackers"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h2
                  id="h-trackers"
                  className="text-[15px] sm:text-base font-display font-semibold text-foreground"
                >
                  Trackers
                </h2>
                <p className="text-[12.5px] text-muted-foreground mt-1 max-w-2xl leading-snug">
                  Indexes, leadership board, and the Networks Ledger — free to explore.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDeep(null);
                  window.history.replaceState(null, "", "/research/library");
                }}
                className="text-[12px] font-mono text-muted-foreground hover:text-cyan min-h-[36px] px-2"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <ToolCard
                href="/research/networks-ledger"
                title="Networks Ledger"
                body="Two privacy-first branches: Terror & Finance (aggregate official actions; names only on official lists) and Speech Reach (For You distribution rules)."
                icon={<Shield className="w-5 h-5" />}
                badge="Live"
              />
              <ToolCard
                href="/trackers/leaders"
                title="Leadership board"
                body="Citizen trust rankings for world leaders vs official narratives."
                icon={<Users className="w-5 h-5" />}
                badge="Index"
              />
              <ToolCard
                href="/trackers/peace"
                title="Peace index"
                body="Normalization & peace diagnostics — support, momentum, official gap."
                icon={<Trophy className="w-5 h-5" />}
                badge="Index"
              />
              <ToolCard
                href="/trackers/football"
                title="Football player index"
                body="Fan discourse rankings — form, legacy, post-match sentiment."
                icon={<Trophy className="w-5 h-5" />}
                badge="Index"
              />
              <ToolCard
                href="/trackers"
                title="All trackers hub"
                body="Full citizen rankings hub — leaders, peace, football, and upcoming indexes."
                icon={<Radio className="w-5 h-5" />}
                badge="Hub"
              />
            </div>
          </section>
        )}

        <div className="mt-4 rounded-2xl border border-cyan/30 bg-cyan/[0.06] px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <p className="text-[13px] text-foreground/90 break-words">
            Need a private brief on your own question?
          </p>
          <Link
            to="/research/commission"
            className="btn-intel-primary inline-flex items-center justify-center gap-1.5 min-h-[44px] px-5 rounded-full text-[13px] touch-manipulation shrink-0"
          >
            Commission report · $10 / $20 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function CaseCard({ item, delay }: { item: CaseStudy; delay: number }) {
  const className =
    "rd-lib-row group flex gap-3 rounded-2xl border border-border/90 bg-card/70 hover:border-cyan/50 p-3.5 sm:p-4 transition-colors touch-manipulation min-w-0";
  const inner = (
    <>
      <span className="shrink-0 w-10 h-10 rounded-xl border border-cyan/30 bg-cyan/10 text-cyan grid place-items-center">
        <FileText className="w-4 h-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-cyan/90 truncate">
          {item.region} · {item.statusLabel}
          {item.pdf ? " · PDF" : ""}
        </p>
        <h3 className="text-[14px] sm:text-[15px] font-display font-semibold group-hover:text-cyan transition-colors leading-snug mt-0.5 break-words">
          {item.title}
        </h3>
        <p className="text-[12.5px] text-muted-foreground leading-snug mt-1 line-clamp-2 break-words">
          {item.subtitle}
        </p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan shrink-0 mt-1" />
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
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
  icon,
  badge,
}: {
  href: string;
  title: string;
  body: string;
  icon: React.ReactNode;
  badge: string;
}) {
  const isInternal =
    href.startsWith("/trackers") ||
    href.startsWith("/research") ||
    href.startsWith("/topics");
  const className =
    "rd-card group flex flex-col h-full min-h-[148px] rounded-2xl border border-border/80 bg-card/60 hover:border-cyan/50 p-3.5 sm:p-4 transition-colors touch-manipulation min-w-0";

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="w-10 h-10 rounded-xl border border-cyan/30 bg-cyan/10 text-cyan grid place-items-center">
          {icon}
        </span>
        <span className="text-[9px] font-mono uppercase tracking-[0.12em] text-muted-foreground border border-border/70 rounded-full px-1.5 py-0.5">
          {badge}
        </span>
      </div>
      <h3 className="text-[14px] font-display font-semibold group-hover:text-cyan transition-colors break-words">
        {title}
      </h3>
      <p className="text-[12px] text-muted-foreground leading-snug mt-1 flex-1 break-words">{body}</p>
      <span className="mt-2 text-[12px] font-medium text-cyan inline-flex items-center gap-1">
        Open <ArrowRight className="w-3.5 h-3.5" />
      </span>
    </>
  );

  if (href.includes("#") || !isInternal) {
    return (
      <a href={href} className={className}>
        {inner}
      </a>
    );
  }
  return (
    <Link to={href} className={className}>
      {inner}
    </Link>
  );
}
