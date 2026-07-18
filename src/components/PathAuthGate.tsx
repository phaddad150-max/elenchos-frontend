import type { ReactNode } from "react";

/**
 * Previously required X (Twitter) sign-in for most routes.
 * The site is now fully public — children render without a login gate.
 * Admin routes still enforce their own auth where needed.
 */
export function PathAuthGate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}