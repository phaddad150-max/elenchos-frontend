import { createFileRoute } from "@tanstack/react-router";
import {
  listSharedReports,
  type SharedKind,
} from "@/lib/research-desk/store.server";

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
          const items = await listSharedReports(40, kind);
          return Response.json(
            { items, kind },
            {
              headers: {
                "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
              },
            },
          );
        } catch (e) {
          console.error("[research-shared-list]", e);
          return Response.json({ items: [], kind: "all" }, { status: 200 });
        }
      },
    },
  },
});
