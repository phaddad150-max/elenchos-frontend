import { useEffect, useRef, useState } from "react";
import type { UaeLang } from "@/lib/desk/uae";
import { GULF_BOUNDS, GULF_PLACES, UAE_BOUNDS, type GulfPlace } from "@/lib/desk/gulf-places";
import { useTheme } from "@/hooks/use-theme";
import "leaflet/dist/leaflet.css";

type Props = {
  lang: UaeLang;
};

/**
 * Interactive 2D Gulf map for the UAE desk.
 * City pins are geography only — no invented sentiment.
 */
export function GulfMap({ lang }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<Array<{ id: string; marker: import("leaflet").Marker }>>([]);
  const iconFnRef = useRef<((p: GulfPlace, selected: boolean) => import("leaflet").DivIcon) | null>(
    null,
  );
  const [active, setActive] = useState<string>("dubai");
  const activeRef = useRef(active);
  activeRef.current = active;
  const [theme] = useTheme();
  const ar = lang === "ar";
  const place = GULF_PLACES.find((p) => p.id === active) ?? GULF_PLACES[0];

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let cancelled = false;

    void import("leaflet").then((mod) => {
      if (cancelled || !wrapRef.current) return;
      const L = (mod as { default?: typeof import("leaflet") }).default ?? (mod as typeof import("leaflet"));
      const dark = theme !== "light";
      const tiles = dark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

      const map = L.map(wrapRef.current, {
        zoomControl: true,
        attributionControl: true,
        minZoom: 5,
        maxZoom: 12,
        worldCopyJump: false,
        maxBounds: L.latLngBounds(
          L.latLng(18.5, 43.5),
          L.latLng(33.5, 63.5),
        ),
        maxBoundsViscosity: 0.85,
      });
      map.fitBounds(GULF_BOUNDS, { padding: [12, 12] });
      L.tileLayer(tiles, {
        subdomains: "abcd",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(map);

      const iconFor = (p: GulfPlace, selected: boolean) =>
        L.divIcon({
          className: "gulf-map-marker",
          iconSize: [selected ? 22 : 16, selected ? 22 : 16],
          iconAnchor: [selected ? 11 : 8, selected ? 11 : 8],
          html: `<span class="gulf-map-pin ${p.inUae ? "gulf-map-pin-uae" : "gulf-map-pin-gulf"} ${selected ? "is-active" : ""}"></span>`,
        });
      iconFnRef.current = iconFor;

      markersRef.current = GULF_PLACES.map((p) => {
        const m = L.marker([p.lat, p.lng], {
          icon: iconFor(p, p.id === activeRef.current),
          title: ar ? p.nameAr : p.nameEn,
          keyboard: true,
        }).addTo(map);
        m.on("click", () => setActive(p.id));
        return { id: p.id, marker: m };
      });

      mapRef.current = map;
      requestAnimationFrame(() => map.invalidateSize());
    });

    return () => {
      cancelled = true;
      markersRef.current = [];
      iconFnRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [theme, ar]);

  useEffect(() => {
    const iconFor = iconFnRef.current;
    if (!iconFor) return;
    for (const row of markersRef.current) {
      const p = GULF_PLACES.find((x) => x.id === row.id);
      if (!p) continue;
      row.marker.setIcon(iconFor(p, row.id === active));
    }
  }, [active]);

  const fly = (mode: "uae" | "gulf") => {
    const map = mapRef.current;
    if (!map) return;
    map.fitBounds(mode === "uae" ? UAE_BOUNDS : GULF_BOUNDS, { padding: [16, 16], animate: true });
  };

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => fly("uae")}
          className="min-h-[36px] px-2.5 rounded-full border border-cyan/40 text-[11px] font-mono uppercase tracking-[0.12em] text-cyan hover:bg-cyan/10"
        >
          {ar ? "الإمارات" : "UAE"}
        </button>
        <button
          type="button"
          onClick={() => fly("gulf")}
          className="min-h-[36px] px-2.5 rounded-full border border-border text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground hover:border-cyan/40"
        >
          {ar ? "الخليج" : "Gulf"}
        </button>
      </div>
      <div
        ref={wrapRef}
        className="gulf-map-shell relative h-[min(52vw,280px)] sm:h-[360px] xl:h-[410px] w-full rounded-xl border border-cyan/30 overflow-hidden ring-1 ring-cyan/10"
        role="application"
        aria-label={ar ? "خريطة تفاعلية للخليج" : "Interactive Gulf map"}
      />
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
        <p className="text-[11px] font-mono text-muted-foreground">
          {ar ? "0 · بانتظار بيانات جغرافية" : "0 · awaiting geo sample"}
        </p>
      </div>
      <p className="text-[10px] text-muted-foreground leading-snug">
        {ar
          ? "اسحب وتكبير. النقاط جغرافياً فقط — بلا درجات مخترعة."
          : "Drag and zoom. Pins are geography only — no invented scores."}
      </p>
    </div>
  );
}
