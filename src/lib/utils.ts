import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cleanHeadline(text: string): string {
  if (!text) return text;
  return text.replace(/^\s*Posts reveal\s*/i, "").trim();
}
