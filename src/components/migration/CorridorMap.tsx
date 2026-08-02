import { useState } from "react";
import { ENTRY_POINTS, type EntryPoint } from "@/lib/migration/data";

/**
 * Schematic interactive map — not classified intel.
 * Paths are approximate corridor illustrations for ordinary-reader orientation.
 */
export function CorridorMap() {
  const [active, setActive] = useState<string>(ENTRY_POINTS[0]?.id ?? "");
  const sel = ENTRY_POINTS.find((e) => e.id === active) ?? ENTRY_POINTS[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_minmax(0,0.9fr)] gap-3 sm:gap-4">
      <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
        <svg
          viewBox="0 0 400 280"
          className="w-full h-auto max-h-[320px] sm:max-h-none"
          role="img"
          aria-label="Schematic map of irregular migration corridors into the EU and UK"
        >
          <rect width="400" height="280" fill="color-mix(in oklab, var(--card) 88%, var(--cyan) 4%)" />
          {/* Water suggestion */}
          <ellipse cx="200" cy="165" rx="150" ry="70" fill="color-mix(in oklab, var(--cyan) 12%, transparent)" />
          <text x="175" y="170" className="fill-cyan/50" fontSize="9" fontFamily="ui-monospace, monospace">
            MED
          </text>
          {/* Europe mass */}
          <path
            d="M120 40 L280 35 L300 90 L270 130 L200 125 L140 110 Z"
            fill="color-mix(in oklab, var(--secondary) 80%, var(--foreground) 5%)"
            stroke="var(--border)"
            strokeWidth="1"
          />
          <text x="190" y="80" fill="var(--muted-foreground)" fontSize="10" fontFamily="ui-monospace, monospace">
            EU
          </text>
          {/* N Africa */}
          <path
            d="M80 200 L320 205 L310 250 L90 248 Z"
            fill="color-mix(in oklab, var(--secondary) 70%, var(--amber-signal) 8%)"
            stroke="var(--border)"
            strokeWidth="1"
          />
          <text x="160" y="230" fill="var(--muted-foreground)" fontSize="9" fontFamily="ui-monospace, monospace">
            N. AFRICA / SAHEL edge
          </text>
          {/* Turkey blob */}
          <ellipse
            cx="310"
            cy="140"
            rx="36"
            ry="22"
            fill="color-mix(in oklab, var(--secondary) 75%, var(--rose-signal) 10%)"
            stroke="var(--border)"
          />
          <text x="292" y="143" fill="var(--muted-foreground)" fontSize="8" fontFamily="ui-monospace, monospace">
            TR
          </text>
          {/* UK */}
          <ellipse cx="95" cy="55" rx="18" ry="14" fill="color-mix(in oklab, var(--secondary) 80%, var(--cyan) 8%)" stroke="var(--border)" />
          <text x="87" y="58" fill="var(--muted-foreground)" fontSize="8" fontFamily="ui-monospace, monospace">
            UK
          </text>

          {/* Corridor paths */}
          {ENTRY_POINTS.map((e) => (
            <path
              key={`path-${e.id}`}
              d={e.svgPath}
              fill="none"
              stroke={active === e.id ? "var(--rose-signal)" : "var(--cyan)"}
              strokeWidth={active === e.id ? 2.5 : 1.5}
              strokeDasharray={active === e.id ? "0" : "4 3"}
              opacity={active === e.id ? 1 : 0.55}
            />
          ))}

          {ENTRY_POINTS.map((e) => (
            <g
              key={e.id}
              className="cursor-pointer"
              onClick={() => setActive(e.id)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.preventDefault();
                  setActive(e.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`${e.name}, ${e.role}`}
            >
              <circle
                cx={e.x}
                cy={e.y}
                r={active === e.id ? 8 : 6}
                fill={active === e.id ? "var(--rose-signal)" : "var(--cyan)"}
                stroke="var(--background)"
                strokeWidth="1.5"
              />
              <text
                x={e.x + 10}
                y={e.y + 3}
                fill="var(--foreground)"
                fontSize="8"
                fontFamily="ui-monospace, monospace"
                opacity={0.9}
              >
                {e.shortLabel}
              </text>
            </g>
          ))}
        </svg>
        <p className="px-3 py-2 text-[10px] font-mono text-muted-foreground border-t border-border">
          Schematic corridors · not operational intel · tap a node
        </p>
      </div>

      {sel && <EntryDetail entry={sel} />}
    </div>
  );
}

function EntryDetail({ entry }: { entry: EntryPoint }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-3 sm:p-4 space-y-2.5 min-h-[200px]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-cyan">{entry.corridor}</p>
          <h3 className="text-[15px] font-display font-semibold text-foreground">{entry.name}</h3>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border border-rose-signal/40 text-rose-signal shrink-0">
          {entry.risk}
        </span>
      </div>
      <p className="text-[12.5px] text-muted-foreground leading-snug">{entry.role}</p>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Entries signal" value={entry.entriesNote} />
        <Stat label="Returns signal" value={entry.returnsNote} />
      </div>
      <p className="text-[11px] text-foreground/90 leading-snug border-t border-border pt-2">
        <strong className="text-amber-signal font-mono text-[10px] uppercase tracking-wider">
          Honesty ·{" "}
        </strong>
        {entry.honesty}
      </p>
      {entry.destinations?.length ? (
        <p className="text-[11px] text-muted-foreground">
          Typical onward / final: {entry.destinations.join(" · ")}
        </p>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/80 bg-secondary/20 px-2.5 py-2">
      <p className="text-[9px] font-mono uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="text-[12px] text-foreground/95 leading-snug mt-0.5">{value}</p>
    </div>
  );
}
