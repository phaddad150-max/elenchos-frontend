import type { ReactNode } from "react";

/**
 * Previously gated content behind a blur overlay during private beta.
 * Now renders children directly — all panels are publicly visible.
 */
export function TeaserLock({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
