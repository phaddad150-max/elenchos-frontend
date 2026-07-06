import { useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";

/** Applies saved theme class on every route (not only inside SiteNav). */
export function ThemeInit() {
  useTheme();
  return null;
}