import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Guest $10/$20 commission UI is retired from public nav.
 * Stripe webhook + /api/research/* stay for in-flight report tokens.
 */
export const Route = createFileRoute("/research/commission")({
  beforeLoad: () => {
    throw redirect({ to: "/desk", replace: true });
  },
});
