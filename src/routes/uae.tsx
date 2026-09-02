import { createFileRoute, redirect } from "@tanstack/react-router";

/** Old public path. Prototype now lives at /solvocreations-uae and is not linked from the main site. */
export const Route = createFileRoute("/uae")({
  beforeLoad: () => {
    throw redirect({ to: "/solvocreations-uae", replace: true });
  },
});
