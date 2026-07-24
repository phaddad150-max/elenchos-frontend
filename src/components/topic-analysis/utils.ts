export {
  sentimentColor,
  divergenceColor,
  divergenceBand,
  sentimentTone,
  sentimentColorCoarse,
  sentimentNetLabel,
} from "@/lib/score-colors";

export function confidenceColor(c?: string): string {
  const v = (c ?? "").toLowerCase();
  if (v === "high") return "var(--emerald-signal)";
  if (v === "low") return "var(--rose-signal)";
  return "var(--amber-signal)";
}

export function formatDelta(delta?: number | null): string | null {
  if (typeof delta !== "number" || Number.isNaN(delta) || delta === 0) return null;
  const rounded = Math.round(delta);
  return `${rounded > 0 ? "+" : ""}${rounded}pt`;
}

export function prettySegmentName(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function segScore(raw: number | { score?: number } | undefined): number {
  if (typeof raw === "number") return Math.round(raw);
  if (raw && typeof raw.score === "number") return Math.round(raw.score);
  return 50;
}

export function timeAgo(iso?: string | null): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const m = Math.floor((Date.now() - t) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}