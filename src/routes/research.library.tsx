import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  FileText,
  MessageSquareQuote,
  Radio,
  Search,
  Share2,
  Shield,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import {
  ResearchBreadcrumb,
  ResearchDeskNav,
} from "@/components/research/ResearchDeskNav";
import { listResearchBriefs, researchStatusLabel } from "@/lib/research-catalog";
import { FEATURE_TOPICS } from "@/lib/feature-topics";
import { isArchivedTopicId } from "@/lib/topic-catalog";

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
          "All free Elenchos work: public discourse topic analysis, multi-source case studies, leadership boards, peace index, designations and fraud ledgers.",
      },
      {
        property: "og:title",
        content: "Library · Elenchos Research Desk",
      },
      {
        property: "og:description",
        content:
          "One free library: X topic analysis, deep-dive case studies, and citizen trackers.",
      },
      { property: "og:url", content: "https://elenchos.live/research/library" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/research/library" }],
  }),
  component: ResearchLibraryPage,
});

function buildCaseStudies(): CaseStudy[] {
  const fromCatalog: CaseStudy[] = listResearchBriefs().map((b) => ({
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
  ];

  return [...editorial, ...fromCatalog].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

type SectionId = "discourse" | "cases" | "trackers";

function ResearchLibraryPage() {
  const cases = useMemo(() => buildCaseStudies(), []);
  const liveTopics = useMemo(
    () => FEATURE_TOPICS.filter((t) => !isArchivedTopicId(t.id)).slice(0, 8),
    [],
  );
  const [shared, setShared] = useState<SharedItem[]>([]);
  const [q, setQ] = useState("");
  const [section, setSection] = useState<SectionId>("discourse");

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

  // Deep-link hash from Intelligence redirects
  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = window.location.hash.replace("#", "");
    if (h === "trackers" || h === "cases" || h === "discourse") {
      setSection(h as SectionId);
      requestAnimationFrame(() => {
        document.getElementById(`lib-${h}`)?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, []);

  const needle = q.trim().toLowerCase();
  const filteredCases = useMemo(() => {
    if (!needle) return cases;
    return cases.filter((c) =>
      [c.title, c.subtitle, c.region, c.statusLabel].join(" ").toLowerCase().includes(needle),
    );
  }, [cases, needle]);

  const filteredTopics = useMemo(() => {
    if (!needle) return liveTopics;
    return liveTopics.filter((t) =>
      [t.title, t.shortTitle, t.description, t.region].join(" ").toLowerCase().includes(needle),
    );
  }, [liveTopics, needle]);

  const filteredShared = useMemo(() => {
    if (!needle) return shared;
    return shared.filter((s) =>
      [s.title, s.topic, s.packageId].join(" ").toLowerCase().includes(needle),
    );
  }, [shared, needle]);

  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1400px] mx-auto w-full min-w-0 px-2.5 sm:px-4 md:px-6 py-5 sm:py-8 mobile-safe-bottom md:pb-14 relative flex-1 overflow-x-clip">
        <ResearchBreadcrumb current="Library" />
        <ResearchDeskNav />

        <header className="page-hero-banner mb-5 overflow-hidden min-w-0">
          <div className="p-4 sm:p-5 md:p-6 space-y-2 min-w-0">
            <div className="page-hero-kicker">
              <BookOpen className="w-3.5 h-3.5" aria-hidden />
              Library
            </div>
            <h1 className="page-hero-title text-[1.35rem] sm:text-2xl md:text-[1.85rem] break-words">
              Free reports, case studies &amp; trackers
            </h1>
            <p className="page-hero-sub max-w-2xl break-words">
              Everything Elenchos publishes for free — public discourse on X, multi-source case
              studies, and citizen indexes. Commission a private report when you need your own.
            </p>
          </div>
        </header>

        {/* Section switcher */}
        <div className="mb-5 flex flex-col sm:flex-row gap-2.5 sm:items-center">
          <div
            className="flex rounded-xl border border-border/80 bg-card/70 p-1 gap-1 overflow-x-auto scrollbar-none"
            role="tablist"
            aria-label="Library sections"
          >
            {(
              [
                { id: "discourse" as const, label: "Public discourse on X" },
                { id: "cases" as const, label: "Case studies" },
                { id: "trackers" as const, label: "Trackers" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={section === tab.id}
                onClick={() => {
                  setSection(tab.id);
                  window.history.replaceState(null, "", `#${tab.id}`);
                }}
                className={`shrink-0 min-h-[40px] px-3 rounded-lg text-[12px] font-medium touch-manipulation transition-colors ${
                  section === tab.id
                    ? "bg-cyan/15 text-cyan border border-cyan/40"
                    : "text-muted-foreground border border-transparent hover:bg-secondary/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search library…"
              className="w-full min-h-[42px] pl-10 pr-3 rounded-xl border border-border/80 bg-background/80 text-[13px] focus:outline-none focus:ring-1 focus:ring-cyan/50"
            />
          </div>
        </div>

        {/* —— Public discourse on X —— */}
        {section === "discourse" && (
          <section id="lib-discourse" className="space-y-4 scroll-mt-28" aria-labelledby="h-discourse">
            <SectionIntro
              id="h-discourse"
              title="Public discourse on X"
              sub="Live Topics analysis — citizen voices vs official and media frames. Open any topic for scores, gaps, and insights."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {filteredTopics.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    to="/topics/$topicId"
                    params={{ topicId: t.id }}
                    className="group flex flex-col h-full min-h-[140px] rounded-2xl border border-border/80 bg-card/50 hover:border-cyan/45 p-3.5 transition-colors touch-manipulation"
                  >
                    <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-cyan">
                      Topic analysis
                    </span>
                    <h3 className="text-[14px] font-display font-semibold mt-1 group-hover:text-cyan transition-colors line-clamp-2 break-words">
                      {t.shortTitle || t.title}
                    </h3>
                    <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2 flex-1 break-words">
                      {t.description || t.region}
                    </p>
                    <span className="mt-2 text-[12px] font-medium text-cyan inline-flex items-center gap-1">
                      Open report <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
            {filteredTopics.length === 0 && (
              <EmptySearch />
            )}
            <Link
              to="/topics"
              className="inline-flex items-center gap-1.5 text-[12px] font-mono text-cyan hover:underline min-h-[40px]"
            >
              <Radio className="w-3.5 h-3.5" /> All live Topics
            </Link>
          </section>
        )}

        {/* —— Case studies —— */}
        {section === "cases" && (
          <section id="lib-cases" className="space-y-4 scroll-mt-28" aria-labelledby="h-cases">
            <SectionIntro
              id="h-cases"
              title="Case studies"
              sub="Multi-source deep dives (multichannel ± X). Published by Elenchos — same research discipline as commissioned briefs."
            />
            <div className="space-y-2.5">
              {filteredCases.map((c, i) => (
                <CaseCard key={c.id} item={c} delay={i * 0.03} />
              ))}
            </div>
            {filteredCases.length === 0 && <EmptySearch />}

            {filteredShared.length > 0 && (
              <div className="pt-4 space-y-2.5">
                <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" /> Community shared deep dives
                </p>
                {filteredShared.map((s, i) => (
                  <Link
                    key={s.token}
                    to="/research/report/$token"
                    params={{ token: s.token }}
                    className="group flex gap-3 rounded-2xl border border-border/80 bg-card/40 hover:border-cyan/40 p-3.5 transition-colors"
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

        {/* —— Trackers —— */}
        {section === "trackers" && (
          <section id="lib-trackers" className="space-y-4 scroll-mt-28" aria-labelledby="h-trackers">
            <SectionIntro
              id="h-trackers"
              title="Trackers"
              sub="Indexes, leadership boards, and official-source ledgers — free to explore."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <ToolCard
                href="/research/networks-ledger#designations-ledger"
                title="Designations Ledger"
                body="OFAC, DOJ, State, UAE, TFTC — terror-finance designations & freezes."
                icon={<Shield className="w-5 h-5" />}
                badge="Ledger"
              />
              <ToolCard
                href="/research/networks-ledger#fraud-ledger"
                title="Fraud Ledger"
                body="Public financial-crime designations shell — same evidence rules as designations."
                icon={<Zap className="w-5 h-5" />}
                badge="Ledger"
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
                href="/trackers/media"
                title="Media trust"
                body="Citizen trust signals on media outlets and narrative framing."
                icon={<MessageSquareQuote className="w-5 h-5" />}
                badge="Index"
              />
              <ToolCard
                href="/trackers/football"
                title="Football player index"
                body="Fan discourse rankings — form, legacy, post-match sentiment."
                icon={<Trophy className="w-5 h-5" />}
                badge="Index"
              />
            </div>
            <Link
              to="/trackers"
              className="inline-flex items-center gap-1.5 text-[12px] font-mono text-cyan hover:underline min-h-[40px]"
            >
              Full trackers hub <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </section>
        )}

        <div className="mt-10 rounded-2xl border border-cyan/30 bg-cyan/[0.06] px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <p className="text-[13px] text-foreground/90 break-words">
            Need a private brief on your own question?
          </p>
          <Link
            to="/research/commission"
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-full bg-cyan text-background text-[13px] font-semibold touch-manipulation shrink-0"
          >
            Commission report · $10 / $20 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function SectionIntro({
  id,
  title,
  sub,
}: {
  id: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="px-0.5 min-w-0">
      <h2 id={id} className="text-[15px] sm:text-base font-display font-semibold text-foreground">
        {title}
      </h2>
      <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug max-w-2xl break-words">
        {sub}
      </p>
    </div>
  );
}

function EmptySearch() {
  return (
    <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-[13px] text-muted-foreground">
      No matches for your search.
    </p>
  );
}

function CaseCard({ item, delay }: { item: CaseStudy; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Link
        to={item.href}
        params={item.params as never}
        className="group flex gap-3 rounded-2xl border border-border/90 bg-card/50 hover:border-cyan/45 p-3.5 sm:p-4 transition-colors touch-manipulation min-w-0"
      >
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
      </Link>
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
    "group flex flex-col h-full min-h-[148px] rounded-2xl border border-border/80 bg-card/50 hover:border-cyan/45 p-3.5 sm:p-4 transition-colors touch-manipulation min-w-0";

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
