import { createFileRoute } from "@tanstack/react-router";
import {
  listSharedReports,
  type SharedKind,
  type SharedReportListItem,
} from "@/lib/research-desk/store.server";
import { STATIC_TOPIC_COMMISSIONED_ARCHIVE } from "@/lib/research-desk/seeds/catalog";

/** Public list of opt-in shared commissions (no PII). kind=topic|deep|all */
export const Route = createFileRoute("/api/research/shared")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const raw = (url.searchParams.get("kind") || "all").toLowerCase();
          const kind: SharedKind =
            raw === "topic" || raw === "deep" || raw === "all" ? raw : "all";
          const fromDb = await listSharedReports(40, kind);

          // Always merge static topic-analysis archive (e.g. UAE Fintech goodwill)
          // so Topics → Archived is never empty for customer delivery.
          let items: SharedReportListItem[] = fromDb;
          if (kind === "topic" || kind === "all") {
            const seen = new Set(fromDb.map((i) => i.token));
            const staticItems: SharedReportListItem[] =
              STATIC_TOPIC_COMMISSIONED_ARCHIVE.filter((s) => !seen.has(s.token)).map(
                (s) => ({
                  token: s.token,
                  title: s.title,
                  topic: s.topic,
                  packageId: s.packageId,
                  createdAt: s.sharedAt || new Date().toISOString(),
                  sharedAt: s.sharedAt,
                  sentimentScore: s.sentimentScore,
                  divergenceScore: s.divergenceScore,
                }),
              );
            items = [...staticItems, ...fromDb];
          }

          return Response.json(
            { items, kind },
            {
              headers: {
                "Cache-Control": "public, max-age=15, stale-while-revalidate=30",
              },
            },
          );
        } catch (e) {
          console.error("[research-shared-list]", e);
          // Still return static archive on total failure
          const staticItems =
            (new URL(request.url).searchParams.get("kind") || "all") !== "deep"
              ? STATIC_TOPIC_COMMISSIONED_ARCHIVE.map((s) => ({
                  token: s.token,
                  title: s.title,
                  topic: s.topic,
                  packageId: s.packageId,
                  createdAt: s.sharedAt || new Date().toISOString(),
                  sharedAt: s.sharedAt,
                  sentimentScore: s.sentimentScore,
                  divergenceScore: s.divergenceScore,
                }))
              : [];
          return Response.json({ items: staticItems, kind: "all" }, { status: 200 });
        }
      },
    },
  },
});
