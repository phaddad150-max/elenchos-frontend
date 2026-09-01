import { createFileRoute, redirect } from "@tanstack/react-router";

/** Old public path. Prototype now lives at /solvocreations-uae and is not linked from the main site. */
export const Route = createFileRoute("/uae")({
  validateSearch: (s: Record<string, unknown>): { cancelled?: "1" } =>
    s.cancelled === "1" || s.cancelled === true ? { cancelled: "1" } : {},
  beforeLoad: ({ search }) => {
    if (search.cancelled === "1") {
      throw redirect({ to: "/solvocreations-uae/desk", search: { cancelled: "1" }, replace: true });
    }
    throw redirect({ to: "/solvocreations-uae", replace: true });
  },
});
