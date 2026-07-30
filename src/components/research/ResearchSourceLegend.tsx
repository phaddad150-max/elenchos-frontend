import type { ResearchBrief } from "@/lib/research-catalog";

export function ResearchSourceLegend({
  classes,
}: {
  classes: ResearchBrief["sourceClasses"];
}) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-3.5 space-y-2.5">
      <h3 className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        Source classes
      </h3>
      <ul className="space-y-2">
        {classes.map((c) => (
          <li key={c.code} className="flex gap-2.5 text-[12px] leading-snug">
            <span
              className={`shrink-0 font-mono font-semibold w-5 ${
                c.code === "R" ? "text-amber-400" : "text-cyan"
              }`}
            >
              {c.code}
            </span>
            <span className="min-w-0">
              <span className="text-foreground/90 font-medium">{c.label}</span>
              <span className="text-muted-foreground">: {c.use}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-muted-foreground leading-snug border-t border-border/60 pt-2">
        <span className="text-amber-400/90 font-mono">R</span> is over-and-above external
        sources for transparency. Never instead of them, and never primary evidence.
      </p>
      <p className="text-[11px] text-muted-foreground leading-snug">
        <span className="text-cyan font-mono">M</span> includes high-scrutiny state or movement
        media inside a multi-decade regional noise field. Narrative use only unless
        triangulated. Claims are human-reviewed before publish.
      </p>
    </div>
  );
}
