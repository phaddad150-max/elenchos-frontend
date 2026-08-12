import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy alias → Research Desk trackers */
export const Route = createFileRoute("/leaders")({
  beforeLoad: () => {
    throw redirect({ to: "/trackers/leaders" });
  },
});
