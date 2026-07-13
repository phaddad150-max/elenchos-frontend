import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/sponsor/success")({
  beforeLoad: () => {
    throw redirect({ to: "/topics" });
  },
});