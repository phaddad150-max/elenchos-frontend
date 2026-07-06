import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { z } from "zod";

const inputSchema = z.object({
  topic: z.string().min(2).max(200),
});

export type DispatchResult = {
  ok: boolean;
  message: string;
};

// In-memory per-IP rate limiter. The dispatch endpoint triggers a paid
// GitHub Actions workflow, so abuse drains CI minutes / billing. We cap
// each client IP to a small burst and a slow refill.
//
// Note: workerd instances are ephemeral, so this is best-effort. For hard
// guarantees, also configure Cloudflare edge rate-limit rules on this path.
const RATE_LIMIT_MAX = 3; // max dispatches
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // per 10 minutes per IP
const ipHits = new Map<string, number[]>();

function clientIp(): string {
  try {
    const h = getRequestHeaders() as unknown as Record<string, string | undefined>;
    const cf = h["cf-connecting-ip"];
    if (cf) return cf;
    const xff = h["x-forwarded-for"];
    if (xff) return xff.split(",")[0]!.trim();
    const real = h["x-real-ip"];
    if (real) return real;
  } catch {
    /* ignore */
  }
  return "unknown";
}

function allow(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const hits = (ipHits.get(ip) ?? []).filter((t) => t > cutoff);
  if (hits.length >= RATE_LIMIT_MAX) {
    ipHits.set(ip, hits);
    return false;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  // Opportunistic cleanup so the map cannot grow unbounded.
  if (ipHits.size > 5000) {
    for (const [k, v] of ipHits) {
      const kept = v.filter((t) => t > cutoff);
      if (kept.length === 0) ipHits.delete(k);
      else ipHits.set(k, kept);
    }
  }
  return true;
}

// Trigger the GitHub Actions `compare` workflow via repository_dispatch.
// Reads the fine-grained PAT from env: GITHUB_DISPATCH_PAT.
export const triggerCompareRun = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<DispatchResult> => {
    const ip = clientIp();
    if (!allow(ip)) {
      return {
        ok: false,
        message:
          "Too many analysis requests from your network. Please wait a few minutes and try again.",
      };
    }

    const token = process.env.GITHUB_DISPATCH_PAT;
    if (!token) {
      return {
        ok: false,
        message:
          "GitHub dispatch is not configured yet — backend run can't be triggered from the site.",
      };
    }
    try {
      const res = await fetch(
        "https://api.github.com/repos/phaddad150-max/elenchos-compare-backend/dispatches",
        {
          method: "POST",
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${token}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "Elenchos-Lovable-Frontend",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_type: "compare",
            client_payload: { topic: data.topic.trim() },
          }),
        },
      );
      if (res.status === 204) {
        return {
          ok: true,
          message:
            "Fresh analysis dispatched. Pulling signals + AI synthesis — usually 60–120s.",
        };
      }
      // Log raw upstream detail server-side only; never echo to the client.
      const body = await res.text().catch(() => "");
      console.error("[compare-dispatch] GitHub dispatch failed", res.status, body.slice(0, 500));
      return {
        ok: false,
        message: "Analysis dispatch failed. Please try again later.",
      };
    } catch (e) {
      console.error("[compare-dispatch] dispatch error", e);
      return {
        ok: false,
        message: "Analysis dispatch failed. Please try again later.",
      };
    }
  });
