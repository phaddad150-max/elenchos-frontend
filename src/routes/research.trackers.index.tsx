import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Hub: /research/trackers → existing trackers landing (kept for now).
 * Prefer index detail URLs: /research/trackers/$indexId
 */
export const Route = createFileRoute("/research/trackers/")({
  beforeLoad: () => {
    throw redirect({ to: "/trackers", replace: true });
  },
});
