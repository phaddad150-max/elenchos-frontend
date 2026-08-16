import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Legacy path — redirects to /research/speech-reach so branch navigation
 * is not nested under /research/networks-ledger (which kept Terror & Finance mounted).
 */
export const Route = createFileRoute("/research/networks-ledger/speech-reach")({
  beforeLoad: () => {
    throw redirect({ to: "/research/speech-reach", replace: true });
  },
  component: () => null,
});
