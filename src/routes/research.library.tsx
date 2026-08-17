import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  FilePenLine,
  FileText,
  Layers,
  MessageSquareShare,
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
import { LIBRARY_SOCIAL, socialMetaTags } from "@/lib/social-meta";
import { activeLiveTopicCount, archivedLiveTopicCount } from "@/lib/topic-catalog";

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
    meta: socialMetaTags(LIBRARY_SOCIAL),
    links: [{ rel: "canonical", href: LIBRARY_SOCIAL.url }],
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
      title: "Aviation after disruption — OEM race, satcom, AI readiness",
      subtitle:
        "Interactive deep dive: delivery trust, networks, cabin bandwidth, payments, AI ops KPIs.",
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

/**
 * Library = single free catalog. All sections always visible (no door maze).
 * Topics live on /topics but are clearly labeled as the discourse monitor.
 */
function ResearchLibraryPage() {
  const cases = useMemo(() => buildCaseStudies(), []);
  const [shared, setShared] = useState<SharedItem[]>([]);
  const activeTopics = activeLiveTopicCount();
  const archivedTopics = archivedLiveTopicCount();

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
    if (h === "cases" || h === "trackers" || h === "topics") {
      requestAnimationFrame(() => {
        document.getElementById(`lib-${h}`)?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, []);

  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1400px] mx-auto w-full min-w-0 px-2.5 sm:px-4 md:px-6 py-5 sm:py-8 mobile-safe-bottom md:pb-14 relative flex-1 overflow-x-clip space-y-8 sm:space-y-10">
        <ResearchBreadcrumb trail={[{ label: "Library" }]} />
        <ResearchDeskNav />

        <header className="page-hero-banner overflow-hidden min-w-0 relative">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_oklab,var(--cyan)_14%,transparent),transparent_55%)]" />
          <div className="relative p-4 sm:p-5 md:p-6 space-y-2 min-w-0">
            <div className="page-hero-kicker">
              <BookOpen className="w-3.5 h-3.5" aria-hidden />
              Library
            </div>
            <h1 className="page-hero-title text-[1.35rem] sm:text-2xl md:text-[1.85rem] break-words max-w-3xl">
              Free published intelligence
            </h1>
            <p className="text-[13px] sm:text-[14px] text-muted-foreground max-w-2xl leading-relaxed">
              Topic analyses on X, multi-source case studies, and trackers. No paywall on published
              work. Need something custom?{" "}
              <Link to="/research/commission" className="text-cyan hover:underline font-medium">
                Commission a report
              </Link>
              .
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href="#lib-topics"
                className="text-[11px] font-mono px-2.5 py-1.5 rounded-full border border-border/80 text-muted-foreground hover:text-cyan hover:border-cyan/40 min-h-[36px] inline-flex items-center"
              >
                Topic analyses
              </a>
              <a
                href="#lib-cases"
                className="text-[11px] font-mono px-2.5 py-1.5 rounded-full border border-border/80 text-muted-foreground hover:text-cyan hover:border-cyan/40 min-h-[36px] inline-flex items-center"
              >
                Case studies
              </a>
              <a
                href="#lib-trackers"
                className="text-[11px] font-mono px-2.5 py-1.5 rounded-full border border-border/80 text-muted-foreground hover:text-cyan hover:border-cyan/40 min-h-[36px] inline-flex items-center"
              >
                Trackers
              </a>
            </div>
          </div>
        </header>

        {/* 1 · Topic analyses */}
        <section id="lib-topics" className="scroll-mt-28 space-y-3" aria-labelledby="h-topics">
          <SectionHead
            id="h-topics"
            icon={<Layers className="w-4 h-4" />}
            title="Topic analyses"
            sub="Live citizen discourse monitors on X vs official and media frames. This is the Topics product — opened from the Library so you know where you are."
          />
          <div className="rounded-2xl border border-cyan/30 bg-cyan/[0.05] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
            <div className="min-w-0">
              <p className="text-[14px] font-display font-semibold text-foreground">
                Open the Topics desk
              </p>
              <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug">
                {activeTopics} active monitors
                {archivedTopics > 0 ? ` · ${archivedTopics} archived` : ""}. Scores, narrative gaps,
                and full briefings per topic.
              </p>
            </div>
            <Link
              to="/topics"
              className="btn-intel-primary inline-flex items-center justify-center gap-1.5 min-h-[44px] px-5 rounded-full text-[13px] font-semibold shrink-0 touch-manipulation"
            >
              Go to Topics <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* 2 · Case studies */}
        <section id="lib-cases" className="scroll-mt-28 space-y-3" aria-labelledby="h-cases">
          <SectionHead
            id="h-cases"
            icon={<FileText className="w-4 h-4" />}
            title="Case studies"
            sub="Multi-source deep dives (scholarly, official, media, optional discourse). Thesis-style claims with limits you can check."
          />
          <div className="space-y-2.5">
            {cases.map((c, i) => (
              <CaseCard key={c.id} item={c} delay={i * 0.02} />
            ))}
          </div>
          {cases.length === 0 && (
            <p className="text-[13px] text-muted-foreground text-center py-8 border border-dashed border-border rounded-xl">
              No case studies published yet.
            </p>
          )}
          {shared.length > 0 && (
            <div className="pt-2 space-y-2.5">
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

        {/* 3 · Trackers (elevated) */}
        <section id="lib-trackers" className="scroll-mt-28 space-y-3" aria-labelledby="h-trackers">
          <SectionHead
            id="h-trackers"
            icon={<Trophy className="w-4 h-4" />}
            title="Trackers & indexes"
            sub="Citizen rankings and official-action ledgers. Open any card, or browse the full trackers hub."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
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
              href="/research/networks-ledger"
              title="Networks Ledger · Terror & Finance"
              body="Aggregate official designations, freezes, arrests, and charges. Names only on official lists."
              icon={<Shield className="w-5 h-5" />}
              badge="Ledger"
            />
            <ToolCard
              href="/research/speech-reach"
              title="Speech Reach"
              body="Brazil 2026: campaign posts stay public — only free For You recommendation is limited."
              icon={<MessageSquareShare className="w-5 h-5" />}
              badge="Ledger"
            />
            <ToolCard
              href="/trackers"
              title="All trackers hub"
              body="Leadership, Peace, and Networks Ledger in one place."
              icon={<Trophy className="w-5 h-5" />}
              badge="Hub"
            />
          </div>
        </section>

        {/* Primary CTA out of library */}
        <section className="rounded-2xl border border-cyan/35 bg-cyan/[0.07] px-4 py-4 sm:px-5 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div className="min-w-0">
            <p className="text-[14px] font-display font-semibold text-foreground">
              Need a private brief on your own question?
            </p>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">
              Fixed price · unique link + PDF · typically minutes after pay.
            </p>
          </div>
          <Link
            to="/research/commission"
            className="btn-intel-primary inline-flex items-center justify-center gap-1.5 min-h-[44px] px-5 rounded-full text-[13px] font-semibold touch-manipulation shrink-0"
          >
            <FilePenLine className="w-4 h-4" />
            Commission report · $10 / $20 <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function SectionHead({
  id,
  icon,
  title,
  sub,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-cyan">{icon}</span>
        <h2 id={id} className="text-[15px] sm:text-base font-display font-semibold text-foreground">
          {title}
        </h2>
      </div>
      <p className="text-[12.5px] text-muted-foreground max-w-2xl leading-snug pl-6">{sub}</p>
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

  return (
    <Link to={href} className={className}>
      {inner}
    </Link>
  );
}
