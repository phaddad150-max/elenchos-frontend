import { createFileRoute } from "@tanstack/react-router";
import { getTenantBySession, markDeskPaid } from "@/lib/desk/store.server";

export const Route = createFileRoute("/api/desk/thanks")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const sessionId = new URL(request.url).searchParams.get("session_id")?.trim() || "";
        if (!sessionId) {
          return Response.json({ error: "Missing session." }, { status: 400 });
        }
        let tenant = await getTenantBySession(sessionId);
        if (tenant && tenant.status === "pending") {
          tenant = await markDeskPaid({ tenantId: tenant.id, sessionId });
        }
        if (!tenant || tenant.status === "pending") {
          return Response.json({ paid: false });
        }
        return Response.json({
          paid: true,
          manageToken: tenant.manage_token,
          orgName: tenant.org_name,
          slug: tenant.slug,
        });
      },
    },
  },
});
