import { createFileRoute } from "@tanstack/react-router";
import { listSharedReports } from "@/lib/research-desk/store.server";

/** Public list of opt-in shared Research Desk reports (no PII). */
export const Route = createFileRoute("/api/research/shared")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const items = await listSharedReports(40);
          return Response.json(
            { items },
            {
              headers: {
                "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
              },
            },
          );
        } catch (e) {
          console.error("[research-shared-list]", e);
          return Response.json({ items: [] }, { status: 200 });
        }
      },
    },
  },
});
