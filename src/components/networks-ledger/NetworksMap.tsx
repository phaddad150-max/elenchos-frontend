import { useEffect, useRef } from "react";
import type { LedgerEntry } from "@/lib/networks-ledger";
import { formatDate, groupEntriesByLocation } from "@/lib/networks-ledger";
import "leaflet/dist/leaflet.css";

type Props = {
  entries: LedgerEntry[];
  onSelect?: (entry: LedgerEntry) => void;
};

/**
 * Client-only Leaflet map (dark basemap). Pins open popup with summary + source link.
 */
export function NetworksMap({ entries, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;
    let cancelled = false;
    let map: import("leaflet").Map | null = null;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      // Fix default marker icons under Vite bundling
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        worldCopyJump: true,
      }).setView([28, 25], 3);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 18,
      }).addTo(map);

      const groups = groupEntriesByLocation(entries);
      const bounds: [number, number][] = [];

      for (const g of groups) {
        bounds.push([g.lat, g.lng]);
        const items = g.entries
          .slice()
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 6);

        const html = `
          <div style="min-width:200px;max-width:280px;font:12px/1.4 system-ui,sans-serif;color:#0f172a">
            <div style="font-weight:700;margin-bottom:6px;color:#0e7490">${escapeHtml(g.label)}</div>
            ${items
              .map(
                (e) => `
              <div style="margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #e2e8f0">
                <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em">${escapeHtml(formatDate(e.date))} · ${escapeHtml(e.type)}</div>
                <div style="font-weight:600;margin:2px 0 4px">${escapeHtml(e.title)}</div>
                <div style="color:#334155;margin-bottom:4px">${escapeHtml(e.summary.slice(0, 160))}${e.summary.length > 160 ? "…" : ""}</div>
                <a href="${escapeAttr(e.source.url)}" target="_blank" rel="noopener noreferrer" style="color:#0891b2;font-weight:600">Primary source ↗</a>
              </div>`,
              )
              .join("")}
            ${g.entries.length > 6 ? `<div style="color:#64748b;font-size:11px">+${g.entries.length - 6} more at this pin (see ledger table)</div>` : ""}
          </div>
        `;

        const marker = L.marker([g.lat, g.lng]).addTo(map!);
        marker.bindPopup(html, { maxWidth: 300 });
        marker.on("click", () => {
          const top = g.entries.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
          if (top && onSelect) onSelect(top);
        });
      }

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [36, 36], maxZoom: 5 });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 4);
      }

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [entries, onSelect]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[280px] sm:h-[340px] md:h-[400px] rounded-xl overflow-hidden border border-cyan/25 bg-secondary/40 z-0"
      role="img"
      aria-label="Interactive map of network enforcement actions"
    />
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, "&#39;");
}
