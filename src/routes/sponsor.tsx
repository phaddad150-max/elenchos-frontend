import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SponsorModal } from "@/components/SponsorModal";

const sponsorSearchSchema = z.object({
  topic: z.string().optional(),
});

export const Route = createFileRoute("/sponsor")({
  validateSearch: sponsorSearchSchema,
  head: () => ({
    meta: [
      { title: "Sponsor a topic — Elenchos" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content:
          "Sponsor deeper citizen-signal analysis on the topics you care about.",
      },
      { property: "og:title", content: "Sponsor a topic — Elenchos" },
      {
        property: "og:description",
        content:
          "Fund deeper citizen-signal analysis on the topics you care about. 24-hour activation.",
      },
      { property: "og:url", content: "https://elenchos.live/sponsor" },
    ],
    links: [{ rel: "canonical", href: "https://elenchos.live/sponsor" }],
  }),

  component: SponsorPage,
});

function SponsorPage() {
  const { topic } = Route.useSearch();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <SiteNav />
      <main className="max-w-2xl mx-auto w-full px-6 py-16 relative flex-1" />
      <SiteFooter />
      <SponsorModal
        open
        initialTopic={topic}
        onClose={() => navigate({ to: "/topics" })}
      />
    </div>
  );
}
