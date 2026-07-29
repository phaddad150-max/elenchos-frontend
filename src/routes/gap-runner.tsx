import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { GapRunnerGame } from "@/components/gap-runner/GapRunnerGame";
import { ELENCHOS_CONTACT_EMAIL, ELENCHOS_CONTACT_MAILTO } from "@/lib/contact";

export const Route = createFileRoute("/gap-runner")({
  head: () => ({
    meta: [
      { title: "GapRunner — Elenchos" },
      {
        name: "description",
        content:
          "GapRunner: desktop awareness mini-game. Spot citizen vs official/media narrative gaps. Data, not dogma. Entertainment only — real analysis on Topics.",
      },
      { property: "og:title", content: "GapRunner — Elenchos" },
      {
        property: "og:description",
        content:
          "Desktop mini-game using the Elenchos cast. Learn the gap method — then open live Topics.",
      },
      { property: "og:url", content: "https://elenchos.live/gap-runner" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/gap-runner" }],
  }),
  component: GapRunnerPage,
});

function GapRunnerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteNav />
      <main className="flex-1">
        <GapRunnerGame />
        <div className="max-w-[1280px] mx-auto px-4 pb-6 text-center text-[11px] text-muted-foreground font-mono space-y-1">
          <p>
            GapRunner · desktop · awareness / education · not a legal fact-check ·{" "}
            <Link to="/about" className="text-cyan hover:underline">
              About
            </Link>{" "}
            ·{" "}
            <a href={ELENCHOS_CONTACT_MAILTO} className="text-cyan hover:underline">
              {ELENCHOS_CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
