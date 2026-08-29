import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { generateLiveUrl, getTenantByToken, publicDeskPath } from "@/lib/desk/store.server";

const BodySchema = z.object({
  token: z.string().min(16).max(80),
});

export const Route = createFileRoute("/api/desk/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const json = await request.json().catch(() => null);
        const parsed = BodySchema.safeParse(json);
        if (!parsed.success) {
          return Response.json({ error: "Missing studio token." }, { status: 400 });
        }
        const tenant = await getTenantByToken(parsed.data.token);
        if (!tenant || (tenant.status !== "paid" && tenant.status !== "live")) {
          return Response.json({ error: "Pay for a desk first." }, { status: 401 });
        }
        const slug = await generateLiveUrl(tenant);
        const path = publicDeskPath(slug);
        return Response.json({
          ok: true,
          slug,
          path,
          researchPath: `${path}/research`,
        });
      },
    },
  },
});
