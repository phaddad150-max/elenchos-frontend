import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Search, Layers, Activity, FlaskConical } from "lucide-react";
import { LIVE_TOPIC_KEYS, topicIdForBackendName } from "@/lib/topic-catalog";
import { loadCitizenSignals } from "@/lib/dashboard-data";
import type { CitizenSignal } from "@/lib/dashboard-data";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [signals, setSignals] = useState<CitizenSignal[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    loadCitizenSignals().then((rows) => setSignals(rows ?? []));
  }, [open]);

  const topicItems = useMemo(
    () =>
      Object.entries(LIVE_TOPIC_KEYS)
        .filter(([id]) => id !== "fifa-world-cup-2026")
        .map(([id, cfg]) => ({
          id,
          label: cfg.headerLabel,
          keywords: `${cfg.headerLabel} ${cfg.rootKey}`.toLowerCase(),
        })),
    [],
  );

  const signalItems = useMemo(() => {
    const seen = new Set<string>();
    const out: { topicId: string; label: string; headline: string; keywords: string }[] = [];
    for (const s of signals) {
      if (!s.topic || seen.has(s.topic)) continue;
      seen.add(s.topic);
      const topicId = topicIdForBackendName(s.topic);
      if (!topicId) continue;
      const headline = (s.headline ?? s.summary ?? s.topic).slice(0, 80);
      out.push({
        topicId,
        label: s.topic,
        headline,
        keywords: `${s.topic} ${headline}`.toLowerCase(),
      });
    }
    return out.slice(0, 20);
  }, [signals]);

  const go = useCallback(
    (to: string) => {
      setOpen(false);
      if (to.includes("?")) {
        window.location.assign(to);
        return;
      }
      navigate({ href: to });
    },
    [navigate],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary/40 text-muted-foreground hover:border-cyan/40 hover:text-foreground text-[11px] font-mono transition-colors min-w-[140px]"
        aria-label="Search topics and signals"
      >
        <Search className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">Search…</span>
        <kbd className="ml-auto hidden lg:inline text-[9px] px-1.5 py-0.5 rounded border border-border bg-background/80 text-muted-foreground">
          ⌘K
        </kbd>
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden tap-target p-2 rounded-lg hover:bg-secondary border border-border touch-manipulation"
        aria-label="Search"
      >
        <Search className="w-4 h-4" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Topics and citizen signals…" />
        <CommandList>
          <CommandEmpty>No matches.</CommandEmpty>

          <CommandGroup heading="Topics">
            {topicItems.map((t) => (
              <CommandItem
                key={t.id}
                value={`topic ${t.keywords}`}
                onSelect={() =>
                  go(
                    `/research/library?section=topics&topic=${encodeURIComponent(t.id)}`,
                  )
                }
              >
                <Layers className="w-4 h-4 text-cyan" />
                <span className="truncate">{t.label}</span>
                <CommandShortcut>Topic</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />
          <CommandGroup heading="Research">
            <CommandItem
              value="research briefs multi-source case study desk"
              onSelect={() => go("/research/library")}
            >
              <FlaskConical className="w-4 h-4 text-cyan" />
              <span className="truncate">Research · topics, cases & trackers</span>
              <CommandShortcut>Research</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="pro subscription tokens private research desk wallet monthly"
              onSelect={() => go("/pro")}
            >
              <FlaskConical className="w-4 h-4 text-cyan" />
              <span className="truncate">Pro · monthly plans & private runs</span>
              <CommandShortcut>Pro</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="leadership board leader trust rankings world leaders"
              onSelect={() => go("/trackers/leaders")}
            >
              <FlaskConical className="w-4 h-4 text-cyan" />
              <span className="truncate">Leadership board · world leaders</span>
              <CommandShortcut>Trackers</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="ai business leaders economy musk nvidia tech ceos"
              onSelect={() => go("/trackers/business")}
            >
              <FlaskConical className="w-4 h-4 text-cyan" />
              <span className="truncate">AI & Business leaders</span>
              <CommandShortcut>Trackers</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="citizen journalism discourse journalists independent reporters"
              onSelect={() => go("/trackers/citizen-discourse")}
            >
              <FlaskConical className="w-4 h-4 text-cyan" />
              <span className="truncate">Citizen journalism index</span>
              <CommandShortcut>Trackers</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="peace index normalization abraham accords"
              onSelect={() => go("/trackers/peace")}
            >
              <FlaskConical className="w-4 h-4 text-cyan" />
              <span className="truncate">Peace index</span>
              <CommandShortcut>Trackers</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          {signalItems.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Citizen signals">
                {signalItems.map((s) => (
                  <CommandItem
                    key={s.topicId}
                    value={`signal ${s.keywords}`}
                    onSelect={() =>
                      go(
                        `/research/library?section=topics&topic=${encodeURIComponent(s.topicId)}`,
                      )
                    }
                  >
                    <Activity className="w-4 h-4 text-emerald-signal" />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-sm">{s.label}</span>
                      <span className="truncate text-[11px] text-muted-foreground">{s.headline}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
