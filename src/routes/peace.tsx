import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/peace")({
  beforeLoad: () => {
    throw redirect({ to: "/trackers/peace" });
  },
});
