import { useRouterState } from "@tanstack/react-router";
import {
  PUBLICEYE_PUBLIC_BASE,
  SOLVO_PUBLIC_BASE,
  type PrototypeBase,
} from "./catalog";

export function usePrototypeBase(): PrototypeBase {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith(PUBLICEYE_PUBLIC_BASE)) return PUBLICEYE_PUBLIC_BASE;
  return SOLVO_PUBLIC_BASE;
}

export function protoPath(
  base: PrototypeBase,
  sub?: "research" | "desk" | `research/${string}` | `topic/${string}` | `casestudy/${string}`,
): string {
  return sub ? `${base}/${sub}` : base;
}
