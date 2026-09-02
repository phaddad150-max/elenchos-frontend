import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/publiceye-uae/research")({
  component: () => <Outlet />,
});
