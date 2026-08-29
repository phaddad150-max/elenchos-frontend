import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/desk")({
  component: () => <Outlet />,
});
