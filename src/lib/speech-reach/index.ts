import raw from "./data.json";
import type {
  SpeechReachData,
  SpeechReachEntry,
  SpeechReachStatus,
} from "./types";

export type {
  MetricConfidence,
  SpeechReachData,
  SpeechReachEntry,
  SpeechReachMetrics,
  SpeechReachObservation,
  SpeechReachSource,
  SpeechReachStatus,
  SpectrumSlice,
  TimeSeriesPoint,
} from "./types";

export const SPEECH_REACH_DATA = raw as SpeechReachData;

export const SPEECH_REACH_ENTRIES: SpeechReachEntry[] =
  SPEECH_REACH_DATA.entries;

export const SPEECH_REACH_META = SPEECH_REACH_DATA.meta;

export const STATUS_LABELS: Record<SpeechReachStatus, string> = {
  active: "Active",
  announced: "Announced",
  ended: "Ended",
  monitoring: "Monitoring",
};

export function getSpeechReachEntry(id: string): SpeechReachEntry | undefined {
  return SPEECH_REACH_ENTRIES.find((e) => e.id === id);
}

export function primaryEntry(): SpeechReachEntry {
  return SPEECH_REACH_ENTRIES[0]!;
}

export function formatPct(n: number, signed = false): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(Math.round(n));
  if (signed) return `${n > 0 ? "+" : n < 0 ? "−" : ""}${abs}%`;
  return `${Math.round(n)}%`;
}

export function formatDateLabel(iso: string): string {
  if (/^\d{4}-\d{2}$/.test(iso)) {
    const [y, m] = iso.split("-");
    const d = new Date(Date.UTC(Number(y), Number(m) - 1, 1));
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      timeZone: "UTC",
    });
  }
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
