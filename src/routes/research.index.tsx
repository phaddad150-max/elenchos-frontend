import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Building2,
  FlaskConical,
  Sparkles,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactEmailMe } from "@/components/ContactEmailMe";
import { ResearchDeskNav } from "@/components/research/ResearchDeskNav";
import { ELENCHOS_TAGLINE } from "@/lib/brand";

const ENTERPRISE_DEFAULT_MESSAGE =
  "Hi — I'm interested in Enterprise for Elenchos: personalized dashboards, custom topics, and team research. Here's what I need:\n\n";

export const Route = createFileRoute("/research/")({
  head: () => ({
    meta: [
      {
        title: "Research · Free Library · Elenchos",
      },
      {
        name: "description",
        content:
          "Elenchos Research: free Library of topic analyses, case studies, trackers, and ledgers. Private analyses via Pro.",
      },
      { property: "og:title", content: "Research · Elenchos" },
      {
        property: "og:description",
        content: "Open the free Library — topics, cases, trackers, and ledgers.",
      },
      { property: "og:url", content: "https://elenchos.live/research" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/research" }],
  }),
  component: ResearchLanding,
});

/**
 * Research parent: clean entry to the free Library.
 * Private token runs live on /pro (not guest commission).
 */
function ResearchLanding() {
  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />

      <main className="max-w-[1400px] mx-auto w-full px-2.5 sm:px-4 md:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6 relative flex-1 mobile-safe-bottom overflow-x-clip min-w-0">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-x-1.5 text-[12px] text-muted-foreground mb-1"
        >
          <Link to="/" className="hover:text-cyan min-h-[32px] inline-flex items-center">
            Home
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground/90 font-medium">Research</span>
        </nav>

        <ResearchDeskNav />

        <header className="page-hero-banner overflow-hidden min-w-0">
          <div className="relative p-4 sm:p-5 md:p-6 min-w-0 space-y-2">
            <div className="page-hero-kicker">
              <FlaskConical className="w-3.5 h-3.5" aria-hidden />
              Research
            </div>
            <h1 className="page-hero-title text-[1.4rem] sm:text-2xl md:text-[1.85rem] break-words">
              Free Library of published research
            </h1>
            <p className="text-[13px] sm:text-[14px] text-muted-foreground max-w-2xl leading-relaxed">
              Topic analyses, case studies, trackers, and ledgers — open to everyone.
              {ELENCHOS_TAGLINE ? ` ${ELENCHOS_TAGLINE}` : ""}
            </p>
          </div>
        </header>

        <section aria-label="Open the Library" className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Link
              to="/research/library"
              className="group flex flex-col h-full min-h-[168px] rounded-2xl border border-cyan/35 bg-card/70 p-4 sm:p-5 hover:border-cyan/60 transition-colors touch-manipulation"
            >
              <span className="w-11 h-11 rounded-xl border border-cyan/35 bg-cyan/10 text-cyan grid place-items-center mb-3">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="text-[1.05rem] font-display font-semibold group-hover:text-cyan transition-colors">
                Open Library
              </h2>
              <p className="text-[12.5px] text-muted-foreground mt-1.5 flex-1 leading-snug">
                Browse free published work — topics on X, deep case studies, leadership and peace
                indexes, Networks Ledger.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-cyan">
                Enter Library <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </motion.div>
        </section>

        <p className="text-[12.5px] text-muted-foreground max-w-xl leading-relaxed">
          Need a private analysis with a token wallet?{" "}
          <Link to="/pro" className="text-cyan hover:underline inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" aria-hidden />
            Go to Pro
          </Link>
        </p>

        <section className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between rounded-xl border border-border/80 bg-secondary/20 px-4 py-3 min-w-0 max-w-3xl">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
            <p className="text-[12.5px] text-muted-foreground break-words">
              Enterprise dashboards or ongoing research? Email — not self-serve checkout.
            </p>
          </div>
          <ContactEmailMe
            source="research-enterprise"
            variant="button"
            defaultMessage={ENTERPRISE_DEFAULT_MESSAGE}
            dialogTitle="Enterprise inquiry"
            dialogDescription="Describe dashboards, topics, or ongoing research."
            className="shrink-0 text-[12px] font-semibold"
          >
            Email me
          </ContactEmailMe>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
