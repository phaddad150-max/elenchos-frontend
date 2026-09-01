import { createFileRoute, redirect } from "@tanstack/react-router";

/** Pro tab retired. No public price list on elenchos.live. */
export const Route = createFileRoute("/pro")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
