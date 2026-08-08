/**
 * After Stripe payment, dispatch the backend Topics pipeline for X packages.
 * Server-only. Never blocks forever — report page polls research_desk_reports.
 */
import { DESK_PACKAGES, type DeskPackageId } from "./packages";

export function packageNeedsXPipeline(packageId: DeskPackageId): boolean {
  const pkg = DESK_PACKAGES[packageId];
  return Boolean(pkg?.includesX);
}

/**
 * Fire-and-forget GitHub repository_dispatch → run_commission_analysis.yml
 * Returns { ok, mode } without waiting for the pipeline to finish.
 */
export async function dispatchCommissionPipeline(input: {
  token: string;
  topic: string;
  questions: string;
  packageId: DeskPackageId;
  sampleSize?: number;
}): Promise<{ ok: boolean; mode: "dispatched" | "skipped" | "failed"; detail?: string }> {
  if (!packageNeedsXPipeline(input.packageId)) {
    return { ok: true, mode: "skipped", detail: "package has no X sample" };
  }

  const tokenGh =
    process.env.GITHUB_DISPATCH_TOKEN?.trim() ||
    process.env.ELENCHOS_GH_DISPATCH_TOKEN?.trim() ||
    "";
  const repo =
    process.env.ELENCHOS_BACKEND_REPO?.trim() ||
    process.env.GITHUB_BACKEND_REPO?.trim() ||
    "phaddad150-max/elenchos-backend";

  if (!tokenGh) {
    console.warn(
      "[research-desk] GITHUB_DISPATCH_TOKEN missing — cannot auto-run Topics pipeline",
    );
    return {
      ok: false,
      mode: "failed",
      detail: "GITHUB_DISPATCH_TOKEN not configured on Vercel",
    };
  }

  const [owner, name] = repo.split("/").map((s) => s.trim());
  if (!owner || !name) {
    return { ok: false, mode: "failed", detail: `Invalid backend repo: ${repo}` };
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${name}/dispatches`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${tokenGh}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: "commission-paid",
          client_payload: {
            token: input.token.slice(0, 64),
            topic: input.topic.slice(0, 800),
            // GitHub client_payload size limits — keep questions bounded
            questions: input.questions.slice(0, 12000),
            package: input.packageId,
            sample_size: String(input.sampleSize ?? 100),
          },
        }),
      },
    );

    if (res.status === 204 || res.ok) {
      console.info("[research-desk] commission pipeline dispatched", {
        token: input.token.slice(0, 8),
        packageId: input.packageId,
        repo,
      });
      return { ok: true, mode: "dispatched" };
    }

    const body = await res.text().catch(() => "");
    console.error("[research-desk] dispatch failed", res.status, body.slice(0, 400));
    return {
      ok: false,
      mode: "failed",
      detail: `GitHub dispatch ${res.status}: ${body.slice(0, 200)}`,
    };
  } catch (e) {
    console.error("[research-desk] dispatch error", e);
    return {
      ok: false,
      mode: "failed",
      detail: e instanceof Error ? e.message : "dispatch error",
    };
  }
}
