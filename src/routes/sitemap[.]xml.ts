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
            path: `/research/library?section=topics&topic=${encodeURIComponent(t.id)}`,
            changefreq: "daily" as const,
            priority: "0.8",
          })),
          { path: "/research", changefreq: "weekly", priority: "0.9" },
          { path: "/pro", changefreq: "weekly", priority: "0.85" },
          { path: "/research/networks-ledger", changefreq: "weekly", priority: "0.7" },
          {
            path: "/research/speech-reach",
            changefreq: "weekly",
            priority: "0.7",
          },
          // Shared community reports are token URLs (noindex private by default); library lists them.
          { path: "/research-migration", changefreq: "weekly", priority: "0.8" },
          { path: "/research-aviation", changefreq: "weekly", priority: "0.8" },
          ...researchBriefs.map((b) => ({
            path: `/research/preview/${b.slug}`,
            changefreq: "weekly" as const,
            priority: "0.75",
          })),
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
