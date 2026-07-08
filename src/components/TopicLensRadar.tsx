import { useMemo } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import type { TopicSnapshot } from "@/lib/dashboard-data";

export type LensScores = Partial<Record<
  "geopolitical" | "economic" | "social" | "governance" | "security",
  number
>>;

const LENS_LABELS: { key: keyof LensScores; label: string }[] = [
  { key: "geopolitical", label: "Geopolitical" },
  { key: "economic", label: "Economic" },
  { key: "social", label: "Social" },
  { key: "governance", label: "Governance" },
  { key: "security", label: "Security" },
];

const chartConfig = {
  score: { label: "Score", color: "hsl(var(--cyan))" },
} satisfies ChartConfig;

function estimateLensFromSegments(
  segments: TopicSnapshot["segmented_sentiment"],
): LensScores | null {
  if (!segments || !Object.keys(segments).length) return null;
  const entries = Object.entries(segments);
  const avg = (keys: string[]) => {
    const vals = entries
      .filter(([k]) => keys.some((p) => k.toLowerCase().includes(p)))
      .map(([, v]) => (typeof v === "number" ? v : (v as { score?: number })?.score ?? 50));
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : undefined;
  };
  const scores: LensScores = {
    geopolitical: avg(["gcc", "israel", "arab", "iran", "regime", "gulf", "diplom"]),
    economic: avg(["economic", "economy", "market", "cost", "jobs", "inflation"]),
    social: avg(["youth", "women", "citizen", "public", "fan", "culture", "social"]),
    governance: avg(["government", "corrupt", "regime", "official", "policy", "eu"]),
    security: avg(["security", "military", "crime", "safety", "war", "proxy"]),
  };
  const filled = Object.values(scores).filter((v) => typeof v === "number");
  if (filled.length < 2) return null;
  for (const k of Object.keys(scores) as (keyof LensScores)[]) {
    if (scores[k] == null) scores[k] = 50;
  }
  return scores;
}

function toChartData(scores: LensScores) {
  return LENS_LABELS.map(({ key, label }) => ({
    lens: label,
    score: Math.max(0, Math.min(100, scores[key] ?? 50)),
  }));
}

export function TopicLensRadar({
  lensScores,
  snapshot,
  source = "curated",
}: {
  lensScores?: LensScores | null;
  snapshot?: TopicSnapshot | null;
  source?: "curated" | "estimate";
}) {
  const resolved = useMemo(() => {
    if (lensScores && Object.keys(lensScores).length >= 2) {
      return { scores: lensScores, source: "curated" as const };
    }
    const est = estimateLensFromSegments(snapshot?.segmented_sentiment);
    if (est) return { scores: est, source: "estimate" as const };
    return null;
  }, [lensScores, snapshot]);

  if (!resolved) return null;

  const data = toChartData(resolved.scores);

  return (
    <div className="relative rounded-xl border border-border bg-background/40 backdrop-blur p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan">
          Analytical Lenses
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {resolved.source === "curated" ? "Curated synthesis" : "Live pulse estimate"}
        </span>
      </div>
      <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[280px] w-full">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="lens" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="score"
            dataKey="score"
            stroke="var(--cyan)"
            fill="var(--cyan)"
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ChartContainer>
    </div>
  );
}