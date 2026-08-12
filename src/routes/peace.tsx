import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy alias → Research Desk trackers */
export const Route = createFileRoute("/peace")({
  beforeLoad: () => {
    throw redirect({ to: "/trackers/peace" });
  },
});
