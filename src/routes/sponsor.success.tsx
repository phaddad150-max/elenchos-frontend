import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/sponsor/success")({
  head: () => ({
    meta: [
      { title: "Sponsorship received · Elenchos" },
      { name: "robots", content: "noindex" },
      { property: "og:url", content: "https://elenchos.live/sponsor/success" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/sponsor/success" }],
  }),

  component: SponsorSuccessPage,
});

function SponsorSuccessPage() {
  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <div className="glass-strong rounded-3xl p-8 max-w-lg text-center space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-signal/15 text-emerald-signal border border-emerald-signal/40 mx-auto">
          <Heart className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-display font-semibold">
          Thank you — your sponsorship is in.
        </h1>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          Your contribution will help us do deeper analysis on the topic you
          chose. 100% of funds support data collection and
          analysis costs for this independent research — no humans or organizations profit.
        </p>
        <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
          Receipt sent by Stripe if you provided an email.
        </p>
        <Link
          to="/topics"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-mono border border-cyan/40 text-cyan hover:bg-cyan/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to topics
        </Link>
      </div>
    </div>
  );
}
