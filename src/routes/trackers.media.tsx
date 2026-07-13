import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/trackers/media")({
  beforeLoad: () => {
    throw redirect({ to: "/trackers" });
  },
});