import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/solvocreations-uae/research")({
  component: () => <Outlet />,
});
