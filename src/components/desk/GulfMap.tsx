import { useMemo, useState } from "react";
import type { UaeLang } from "@/lib/desk/uae";
import { GULF_PLACES } from "@/lib/desk/gulf-places";
import { simulateGulfCities, type SimCity } from "@/lib/desk/solvo-sim";
import { sentimentTone } from "@/lib/score-colors";

type Props = {
  lang: UaeLang;
};

function xy(lat: number, lng: number): { x: number; y: number } {
  return {
    x: 28 + ((lng - 47) / (59.2 - 47)) * 384,
    y: 36 + ((31.2 - lat) / (31.2 - 21.8)) * 328,
  };
}

/**
 * Self-contained interactive 2D Gulf map (no tile CDN, no Leaflet).
 * Always paints. Pins use labeled simulated scores for this prototype.
 */
export function GulfMap({ lang }: Props) {
  const ar = lang === "ar";
  const [frame, setFrame] = useState<"gulf" | "uae">("gulf");
  const [active, setActive] = useState("dubai");
  const cities = useMemo(() => simulateGulfCities(), []);
  const cityMap = useMemo(() => {
    const m = new Map<string, SimCity>();
    for (const c of cities) m.set(c.id, c);
    return m;
  }, [cities]);
  const place = GULF_PLACES.find((p) => p.id === active) ?? GULF_PLACES[0];
  const stat = cityMap.get(place.id);
  const tone = stat ? sentimentTone(stat.score, stat.label) : null;

  const viewBox = frame === "uae" ? "210 150 175 155" : "0 0 440 400";

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setFrame("uae")}
          className={`min-h-[36px] px-2.5 rounded-full border text-[11px] font-mono uppercase tracking-[0.12em] ${
            frame === "uae"
              ? "border-cyan/50 bg-cyan/15 text-cyan"
              : "border-border text-muted-foreground hover:border-cyan/40"
          }`}
        >
          {ar ? "الإمارات" : "UAE"}
        </button>
        <button
          type="button"
          onClick={() => setFrame("gulf")}
          className={`min-h-[36px] px-2.5 rounded-full border text-[11px] font-mono uppercase tracking-[0.12em] ${
            frame === "gulf"
              ? "border-cyan/50 bg-cyan/15 text-cyan"
              : "border-border text-muted-foreground hover:border-cyan/40"
          }`}
        >
          {ar ? "الخليج" : "Gulf"}
        </button>
      </div>

      <svg
        viewBox={viewBox}
        className="w-full h-[min(52vw,280px)] sm:h-[360px] xl:h-[410px] rounded-xl border border-cyan/30 bg-[color-mix(in_oklab,var(--card)_82%,var(--cyan)_8%)] ring-1 ring-cyan/10"
        role="img"
        aria-label={ar ? "خريطة تفاعلية للإمارات والخليج" : "Interactive UAE and Gulf map"}
      >
        <defs>
          <radialGradient id="gulf-water" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="color-mix(in oklab, var(--cyan) 22%, transparent)" />
            <stop offset="100%" stopColor="color-mix(in oklab, var(--background) 70%, var(--cyan) 8%)" />
          </radialGradient>
        </defs>
        <rect width="440" height="400" fill="url(#gulf-water)" />
        {/* Iran / north shore */}
        <path
          d="M40 28 L410 22 L418 78 L300 95 L180 88 L70 70 Z"
          fill="color-mix(in oklab, var(--secondary) 78%, var(--foreground) 6%)"
          stroke="var(--border)"
          strokeWidth="1"
        />
        <text x="240" y="58" fill="var(--muted-foreground)" fontSize="9" fontFamily="ui-monospace, monospace">
          IRAN
        </text>
        {/* Arabian peninsula */}
        <path
          d="M48 210 L90 155 L150 148 L210 170 L250 210 L280 250 L240 360 L70 355 L40 280 Z"
          fill="color-mix(in oklab, var(--secondary) 72%, var(--amber-signal) 8%)"
          stroke="var(--border)"
          strokeWidth="1"
        />
        <text x="92" y="268" fill="var(--muted-foreground)" fontSize="9" fontFamily="ui-monospace, monospace">
          KSA
        </text>
        {/* UAE mass — highlighted */}
        <path
          d="M248 198 L318 188 L355 205 L348 248 L300 262 L252 240 Z"
          fill="color-mix(in oklab, var(--cyan) 28%, var(--secondary) 55%)"
          stroke="var(--cyan)"
          strokeWidth="1.6"
        />
        <text x="278" y="228" fill="var(--cyan)" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="700">
          UAE
        </text>
        {/* Qatar */}
        <path
          d="M198 188 L218 182 L222 208 L200 214 Z"
          fill="color-mix(in oklab, var(--secondary) 70%, var(--cyan) 12%)"
          stroke="var(--border)"
        />
        <text x="70" y="120" fill="color-mix(in oklab, var(--cyan) 55%, var(--muted-foreground))" fontSize="8" fontFamily="ui-monospace, monospace">
          ARABIAN GULF
        </text>
        <text x="330" y="320" fill="var(--muted-foreground)" fontSize="8" fontFamily="ui-monospace, monospace">
          OMAN
        </text>

        {GULF_PLACES.map((p) => {
          const { x, y } = xy(p.lat, p.lng);
          const st = cityMap.get(p.id);
          const selected = active === p.id;
          const fill = st ? sentimentTone(st.score, st.label).color : "var(--cyan)";
          return (
            <g
              key={p.id}
              className="cursor-pointer"
              onClick={() => setActive(p.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActive(p.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={ar ? p.nameAr : p.nameEn}
            >
              <circle
                cx={x}
                cy={y}
                r={selected ? 9 : p.inUae ? 7 : 5.5}
                fill={fill}
                stroke="var(--background)"
                strokeWidth={selected ? 2 : 1.4}
                opacity={selected ? 1 : 0.92}
              />
              {selected ? (
                <circle cx={x} cy={y} r="14" fill="none" stroke={fill} strokeOpacity="0.45" strokeWidth="1.2" />
              ) : null}
            </g>
          );
        })}
      </svg>

      <div className="rounded-lg border border-border/80 bg-background/40 px-3 py-2 space-y-0.5">
        <p className="text-[13px] font-display font-semibold">
          {ar ? place.nameAr : place.nameEn}
          {place.inUae ? (
            <span className="ml-2 text-[10px] font-mono uppercase tracking-[0.12em] text-cyan">UAE</span>
          ) : (
            <span className="ml-2 text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
              {ar ? "الخليج" : "Gulf"}
            </span>
          )}
        </p>
        {stat ? (
          <p className="text-[12px] font-mono tabular-nums" style={{ color: tone?.color }}>
            {stat.score} · {stat.label} · sim sample {stat.sample}
          </p>
        ) : null}
        <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-amber-signal">
          {ar ? "بيانات تجريبية" : "Testing data · preview"}
        </p>
      </div>
      <p className="text-[10px] text-muted-foreground leading-snug">
        {ar
          ? "اضغط الإمارات أو الخليج. انقر مدينة. الخريطة ترسم دائماً — بلا بلاطات خارجية."
          : "UAE / Gulf frames. Tap a city. Map is drawn in-page — no external tiles."}
      </p>
    </div>
  );
}
