import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AuthGate } from "./AuthGate";

// Routes that stay fully public. Everything else requires sign-in.
const PUBLIC_PREFIXES = ["/about", "/privacy"];

export function PathAuthGate({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPublic = PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (isPublic) return <>{children}</>;
  return <AuthGate>{children}</AuthGate>;
}
