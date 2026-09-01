import { createFileRoute, redirect } from "@tanstack/react-router";

/** Public Desk sell page retired. Not linked from the main site. */
export const Route = createFileRoute("/desk/")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
