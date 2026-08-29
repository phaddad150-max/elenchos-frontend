import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { FEATURE_TOPICS } from "@/lib/feature-topics";
import { listResearchBriefs } from "@/lib/research-catalog";

const BASE_URL = "https://elenchos.live";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const researchBriefs = listResearchBriefs();
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/research/library", changefreq: "daily", priority: "0.95" },
          ...FEATURE_TOPICS.map((t) => ({
            path: `/research/topic/${encodeURIComponent(t.id)}`,
            changefreq: "daily" as const,
            priority: "0.8",
          })),
          { path: "/research", changefreq: "weekly", priority: "0.9" },
          { path: "/research/networks-ledger", changefreq: "weekly", priority: "0.7" },
          {
            path: "/research/speech-reach",
            changefreq: "weekly",
            priority: "0.7",
          },
          {
            path: "/research/casestudy/irregular-migration",
            changefreq: "weekly",
            priority: "0.8",
          },
          {
            path: "/research/casestudy/aviation",
            changefreq: "weekly",
            priority: "0.8",
          },
          { path: "/trackers", changefreq: "weekly", priority: "0.7" },
          ...researchBriefs
            .filter(
              (b) =>
                b.slug !== "aviation-race-digital-ai" &&
                b.slug !== "aviation" &&
                b.slug !== "irregular-migration",
            )
            .map((b) => ({
              path: `/research/preview/${b.slug}`,
              changefreq: "weekly" as const,
              priority: "0.75",
            })),
          { path: "/desk", changefreq: "weekly", priority: "0.85" },
          { path: "/about", changefreq: "monthly", priority: "0.65" },
          { path: "/privacy", changefreq: "yearly", priority: "0.4" },
        ];


        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
