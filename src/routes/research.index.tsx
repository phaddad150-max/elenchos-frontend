import { createFileRoute, Link } from "@tanstack/react-router";
import { FlaskConical, Clock } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { RESEARCH_NORTH_STAR } from "@/lib/research-catalog";
import { ELENCHOS_CONTACT_EMAIL, ELENCHOS_CONTACT_MAILTO } from "@/lib/contact";

export const Route = createFileRoute("/research/")({
  head: () => ({
    meta: [
      { title: "Research — Coming soon · Elenchos" },
      {
        name: "description",
        content:
          "Elenchos Research: human-gated, multi-source thesis briefs for researchers. Coming soon — separate from live Topics.",
      },
      { property: "og:title", content: "Research — Coming soon · Elenchos" },
      {
        property: "og:description",
        content:
          "Thesis-style research lane under construction. Human-gated multi-source briefs — not live topic scores.",
      },
      { property: "og:url", content: "https://elenchos.live/research" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/research" }],
  }),
  component: ResearchComingSoonPage,
});

function ResearchComingSoonPage() {
  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <SiteNav />

      <main className="max-w-[720px] mx-auto w-full px-4 md:px-8 py-16 md:py-24 mobile-safe-bottom md:pb-24 relative flex-1 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-5">
          <FlaskConical className="w-3.5 h-3.5 text-cyan" aria-hidden />
          Research
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan/35 bg-cyan/10 text-cyan px-3 py-1 text-[11px] font-mono uppercase tracking-[0.16em] mb-6">
          <Clock className="w-3.5 h-3.5" aria-hidden />
          Coming soon
        </span>

        <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-glow-cyan mb-4">
          Thesis research, built for serious work
        </h1>

        <p className="text-[15px] md:text-base text-muted-foreground leading-relaxed max-w-xl mb-3">
          {RESEARCH_NORTH_STAR}
        </p>
        <p className="text-[13.5px] text-muted-foreground/90 leading-relaxed max-w-lg mb-10">
          Multi-source briefs (scholarly, surveys, open web, official, media frames, and
          discourse) — human-gated claims, not live Topics scores. We&apos;re finishing the
          lane before public launch.
        </p>

        <div className="rounded-2xl border border-border bg-card/40 px-5 py-4 text-left max-w-md w-full space-y-2 mb-10">
          <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
            What&apos;s coming
          </p>
          <ul className="text-[13px] text-foreground/85 space-y-1.5 leading-snug">
            <li className="flex gap-2">
              <span className="text-cyan shrink-0">·</span>
              Method-first thesis workbenches
            </li>
            <li className="flex gap-2">
              <span className="text-cyan shrink-0">·</span>
              Full source logs and falsifiable claims
            </li>
            <li className="flex gap-2">
              <span className="text-cyan shrink-0">·</span>
              Separate from the Topics citizen pulse
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/topics"
            className="inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-cyan/10 hover:bg-cyan/20 text-cyan px-4 py-2 text-[13px] font-medium transition-colors"
          >
            Explore live Topics
          </Link>
          <a
            href={ELENCHOS_CONTACT_MAILTO}
            className="text-[12px] font-mono text-muted-foreground hover:text-cyan transition-colors"
          >
            Contact: {ELENCHOS_CONTACT_EMAIL}
          </a>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
