import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  FlaskConical,
  Library,
  Search,
  Share2,
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

/** Unified shelf of Elenchos-published case studies (same product form). */
type LibraryPublication = {
  id: string;
  title: string;
  subtitle: string;
  region: string;
  statusLabel: string;
  updatedAt: string;
  href: string;
  params?: { slug: string };
  pdf?: boolean;
  themeTags: string[];
};

export const Route = createFileRoute("/research/library")({
  head: () => ({
    meta: [
      { title: "Research library · Published case studies · Elenchos" },
      {
        name: "description",
        content:
          "All Elenchos-published multi-source case studies and public briefings in one library. Community-shared deep dives included when authors opt in.",
      },
      {
        property: "og:title",
        content: "Research library · Published case studies · Elenchos",
      },
      {
        property: "og:description",
        content:
          "One shelf for Elenchos case studies and shared multi-source reports. Live Topics analysis is on the Topics page.",
      },
      { property: "og:url", content: "https://elenchos.live/research/library" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/research/library" }],
  }),
  component: ResearchLibraryPage,
});

function buildElenchosPublications(): LibraryPublication[] {
  const fromCatalog: LibraryPublication[] = listResearchBriefs().map((b) => ({
    id: b.slug,
    title: b.title,
    subtitle: b.subtitle,
    region: b.region,
    statusLabel: researchStatusLabel(b.status),
    updatedAt: b.updatedAt,
    href: "/research/preview/$slug",
    params: { slug: b.slug },
    pdf: !!b.pdfUrl,
    themeTags: b.themes.slice(0, 4),
  }));

  // Same product form as catalog briefs — not a separate “crisis product”
  const editorial: LibraryPublication[] = [
    {
      id: "irregular-migration",
      title: "Irregular migration — public briefing",
      subtitle:
        "Scale since 2011, corridors, open vs resist frames, discourse, and returns honesty. Multi-source public briefing (under 10 minutes).",
      region: "EU · UK Channel",
      statusLabel: "Published",
      updatedAt: "2026-07-01",
      href: "/research-migration",
      pdf: false,
      themeTags: ["migration", "borders", "discourse", "policy"],
    },
  ];

  return [...editorial, ...fromCatalog].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

function ResearchLibraryPage() {
  const publications = useMemo(() => buildElenchosPublications(), []);
  const [shared, setShared] = useState<SharedItem[]>([]);
  const [sharedReady, setSharedReady] = useState(false);
  const [q, setQ] = useState("");
  const [view, setView] = useState<"elenchos" | "community">("elenchos");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/research/shared?kind=deep")
      .then((r) => r.json())
      .then((data: { items?: SharedItem[] }) => {
        if (!cancelled) setShared(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => {
        if (!cancelled) setShared([]);
      })
      .finally(() => {
        if (!cancelled) setSharedReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPubs = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return publications;
    return publications.filter((p) =>
      [p.title, p.subtitle, p.region, p.statusLabel, ...p.themeTags]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [publications, q]);

  const filteredShared = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return shared;
    return shared.filter((s) =>
      [s.title, s.topic, s.packageId].join(" ").toLowerCase().includes(needle),
    );
  }, [shared, q]);

  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1400px] mx-auto w-full min-w-0 px-2.5 sm:px-4 md:px-6 py-5 sm:py-8 mobile-safe-bottom md:pb-14 relative flex-1 overflow-x-clip">
        <ResearchBreadcrumb current="Library" />
        <ResearchDeskNav />

        <header className="page-hero-banner mb-5 overflow-hidden relative min-w-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/10 via-transparent to-emerald-signal/5 pointer-events-none" />
          <div className="relative p-4 sm:p-5 md:p-6 space-y-2 min-w-0">
            <div className="page-hero-kicker">
              <Library className="w-3.5 h-3.5" aria-hidden />
              Library
            </div>
            <h1 className="page-hero-title text-[1.35rem] sm:text-2xl md:text-[1.85rem] break-words">
              Published case studies
            </h1>
            <p className="page-hero-sub max-w-xl break-words">
              Every multi-source report Elenchos has published — same format, one shelf. Search or
              switch to community-shared deep dives.
            </p>
          </div>
        </header>

        {/* Simple two-shelf switcher + search */}
        <div className="mb-5 space-y-2.5">
          <div
            className="flex rounded-xl border border-border/80 bg-card/70 p-1 gap-1"
            role="tablist"
            aria-label="Library shelves"
          >
            <ShelfTab
              active={view === "elenchos"}
              onClick={() => setView("elenchos")}
              label="Elenchos publications"
              count={publications.length}
            />
            <ShelfTab
              active={view === "community"}
              onClick={() => setView("community")}
              label="Community shared"
              count={sharedReady ? shared.length : null}
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={
                view === "elenchos"
                  ? "Search case studies…"
                  : "Search shared reports…"
              }
              className="w-full min-h-[44px] pl-10 pr-3 rounded-xl border border-border/80 bg-background/80 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-cyan/50"
            />
          </div>
        </div>

        {view === "elenchos" && (
          <section aria-labelledby="lib-elenchos" className="space-y-3 mb-8">
            <div className="px-0.5 flex items-end justify-between gap-2">
              <div className="min-w-0">
                <h2
                  id="lib-elenchos"
                  className="text-[11px] font-mono uppercase tracking-[0.16em] text-cyan"
                >
                  Elenchos case studies
                </h2>
                <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug">
                  Thesis-style multi-source briefs published by the desk (including public crisis
                  briefings).
                </p>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground shrink-0 tabular-nums">
                {filteredPubs.length}
              </span>
            </div>
            {filteredPubs.length === 0 && (
              <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-[13px] text-muted-foreground">
                No publications match your search.
              </p>
            )}
            <div className="space-y-2.5">
              {filteredPubs.map((p, i) => (
                <PubCard key={p.id} pub={p} delay={i * 0.03} />
              ))}
            </div>
          </section>
        )}

        {view === "community" && (
          <section aria-labelledby="lib-community" className="space-y-3 mb-8">
            <div className="px-0.5">
              <h2
                id="lib-community"
                className="text-[11px] font-mono uppercase tracking-[0.16em] text-cyan flex items-center gap-2"
              >
                <Share2 className="w-3.5 h-3.5" />
                Community shared
              </h2>
              <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug max-w-xl">
                Multi-source reports commissioned by users and shared by them. Topic-analysis
                commissions stay under Topics.
              </p>
            </div>
            {!sharedReady && (
              <p className="text-[12px] font-mono text-muted-foreground px-0.5">Loading…</p>
            )}
            {sharedReady && filteredShared.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card/30 px-4 py-5 text-[13px] text-muted-foreground leading-relaxed">
                {shared.length === 0
                  ? "No community deep dives shared yet. After a multi-source commission, open your private link and choose Share on Elenchos."
                  : "No shared reports match your search."}
              </div>
            )}
            <div className="space-y-2.5">
              {filteredShared.map((s, i) => (
                <LibLinkCard
                  key={s.token}
                  to="/research/report/$token"
                  params={{ token: s.token }}
                  kicker={`Community · ${s.packageId}`}
                  title={s.title}
                  body={s.topic}
                  delay={i * 0.03}
                  icon={<Share2 className="w-4 h-4" />}
                />
              ))}
            </div>
          </section>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-cyan/30 bg-gradient-to-br from-cyan/10 via-card/40 to-transparent px-4 py-4 sm:px-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between"
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-lg border border-cyan/35 bg-cyan/10 text-cyan grid place-items-center shrink-0">
              <FlaskConical className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-display font-semibold break-words">
                Need a brief on your question?
              </p>
              <p className="text-[12px] text-muted-foreground mt-0.5 break-words">
                Commission a multi-source report — private link + PDF.
              </p>
            </div>
          </div>
          <Link
            to="/research/commission"
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-full bg-cyan text-background text-[12px] font-semibold touch-manipulation shrink-0"
          >
            On-demand <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </main>

      <SiteFooter />
    </div>
  );
}

function ShelfTab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number | null;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex-1 min-w-0 min-h-[42px] px-2.5 rounded-lg text-[12px] sm:text-[12.5px] font-medium touch-manipulation transition-colors ${
        active
          ? "bg-cyan/15 text-cyan border border-cyan/40"
          : "text-muted-foreground border border-transparent hover:bg-secondary/50"
      }`}
    >
      <span className="truncate">{label}</span>
      {count != null && (
        <span className="ml-1.5 font-mono text-[10.5px] opacity-80 tabular-nums">({count})</span>
      )}
    </button>
  );
}

function PubCard({ pub, delay }: { pub: LibraryPublication; delay: number }) {
  return (
    <LibLinkCard
      to={pub.href}
      params={pub.params}
      kicker={`${pub.region} · ${pub.statusLabel}${pub.pdf ? " · PDF" : ""}`}
      title={pub.title}
      body={pub.subtitle}
      meta={pub.updatedAt}
      tags={pub.themeTags}
      delay={delay}
      icon={<FileText className="w-4 h-4" />}
    />
  );
}

function LibLinkCard({
  to,
  params,
  kicker,
  title,
  body,
  meta,
  tags,
  delay = 0,
  icon,
}: {
  to: string;
  params?: { slug: string } | { token: string };
  kicker: string;
  title: string;
  body: string;
  meta?: string;
  tags?: string[];
  delay?: number;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="min-w-0"
    >
      <Link
        to={to}
        params={params as never}
        className="group flex gap-3 rounded-2xl border border-border/90 bg-card/50 hover:border-cyan/45 hover:bg-card/80 p-3.5 sm:p-4 transition-colors touch-manipulation min-w-0 overflow-hidden"
      >
        <span className="shrink-0 w-10 h-10 rounded-xl border border-cyan/30 bg-cyan/10 text-cyan grid place-items-center">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-cyan/90 truncate">
            {kicker}
          </p>
          <h3 className="text-[14px] sm:text-[15px] font-display font-semibold text-foreground group-hover:text-cyan transition-colors leading-snug mt-0.5 break-words">
            {title}
          </h3>
          <p className="text-[12.5px] text-muted-foreground leading-snug mt-1 line-clamp-2 break-words">
            {body}
          </p>
          {(meta || (tags && tags.length > 0)) && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {meta && (
                <span className="text-[10px] font-mono text-muted-foreground">Updated {meta}</span>
              )}
              {tags?.map((t) => (
                <span
                  key={t}
                  className="text-[9.5px] px-1.5 py-0.5 rounded-full border border-border/70 text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan shrink-0 mt-1 transition-colors" />
      </Link>
    </motion.div>
  );
}
