import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { setReportShared } from "@/lib/research-desk/store.server";

const BodySchema = z.object({
  token: z.string().trim().min(8).max(120),
  share: z.boolean(),
});

/**
 * Opt-in share: anyone with the secret report token can list or unlist
 * the report on the public Elenchos library. No PII is stored.
 */
export const Route = createFileRoute("/api/research/share")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const json = await request.json().catch(() => null);
          const parsed = BodySchema.safeParse(json);
          if (!parsed.success) {
            return Response.json({ error: "Invalid request" }, { status: 400 });
          }
          const result = await setReportShared(parsed.data.token, parsed.data.share);
          if (!result.ok) {
            return Response.json(
              { error: result.error || "Could not update share" },
              { status: 404 },
            );
          }
          return Response.json({
            ok: true,
            sharedPublic: Boolean(result.report?.sharedPublic),
            sharedAt: result.report?.sharedAt ?? null,
            report: result.report,
          });
        } catch (e) {
          console.error("[research-share]", e);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
