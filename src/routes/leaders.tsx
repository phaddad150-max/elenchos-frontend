import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/leaders")({
  beforeLoad: () => {
    throw redirect({ to: "/topics" });
  },
});
