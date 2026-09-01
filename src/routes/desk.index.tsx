import { createFileRoute, redirect } from "@tanstack/react-router";

/** Public Desk sell page retired. Prices live on the UAE / Solvo prototype only. */
export const Route = createFileRoute("/desk/")({
  beforeLoad: () => {
    throw redirect({ to: "/uae", replace: true });
  },
});
