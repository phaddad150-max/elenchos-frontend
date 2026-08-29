import { createFileRoute, redirect } from "@tanstack/react-router";

/** Pro tab retired. The public product is Desk. */
export const Route = createFileRoute("/pro")({
  beforeLoad: () => {
    throw redirect({ to: "/desk", replace: true });
  },
});
