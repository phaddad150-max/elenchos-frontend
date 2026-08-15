import { useEffect, useRef } from "react";
import type { LedgerEntry, NetworkTag } from "@/lib/networks-ledger";
import {
  formatDate,
  groupEntriesByLocation,
  NETWORK_MARKER_COLORS,
  primaryNetwork,
} from "@/lib/networks-ledger";
import "leaflet/dist/leaflet.css";

type Props = {
  entries: LedgerEntry[];
  onSelect?: (entry: LedgerEntry) => void;
};

/**
 * Premium Leaflet map — light high-contrast basemap, glow markers, polished popups.
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
        zoomControl: false,
        preferCanvas: true,
        attributionControl: true,
      }).setView([28, 15], 2.4);

      L.control.zoom({ position: "topright" }).addTo(map);
      L.control.scale({ imperial: false, metric: true, position: "bottomleft" }).addTo(map);

      // Premium light basemap: Carto Voyager (labels under roads) + crisp retina tiles
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 18,
          minZoom: 2,
        },
      ).addTo(map);

      const groups = groupEntriesByLocation(entries);
      const bounds: [number, number][] = [];

      for (const g of groups) {
        bounds.push([g.lat, g.lng]);
        const items = g.entries
          .slice()
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 5);

        const counts = new Map<NetworkTag, number>();
        for (const e of g.entries) {
          const n = primaryNetwork(e);
          counts.set(n, (counts.get(n) ?? 0) + 1);
        }
        let topNet: NetworkTag = "Mixed / Axis";
        let topN = 0;
        for (const [n, c] of counts) {
          if (c > topN) {
            topN = c;
            topNet = n;
          }
        }
        const color = NETWORK_MARKER_COLORS[topNet] ?? "#22d3ee";
        const count = g.entries.length;
        const size = count > 3 ? 36 : count > 1 ? 32 : 28;

        const html = `
          <div class="nl-map-popup">
            <div class="nl-map-popup-place">${escapeHtml(g.label)}
              <span class="nl-map-popup-count">${count} action${count > 1 ? "s" : ""}</span>
            </div>
            ${items
              .map(
                (e) => `
              <div class="nl-map-popup-item">
                <div class="nl-map-popup-meta">${escapeHtml(formatDate(e.date))} · ${escapeHtml(e.type)}</div>
                <div class="nl-map-popup-title">${escapeHtml(e.title)}</div>
                <div class="nl-map-popup-summary">${escapeHtml(e.summary)}</div>
                <a class="nl-map-popup-link" href="${escapeAttr(e.source.url)}" target="_blank" rel="noopener noreferrer">Primary source ↗</a>
              </div>`,
              )
              .join("")}
            ${
              g.entries.length > 5
                ? `<div class="nl-map-popup-more">+${g.entries.length - 5} more at this pin — use ledger filters</div>`
                : ""
            }
          </div>
        `;

        const icon = L.divIcon({
          className: "nl-map-marker",
          html: `
            <span class="nl-map-marker-inner" style="--pin:${color};width:${size}px;height:${size}px">
              <span class="nl-map-marker-glow"></span>
              <span class="nl-map-marker-core"></span>
              ${count > 1 ? `<span class="nl-map-marker-badge">${count}</span>` : ""}
            </span>
          `,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -size / 2],
        });

        const marker = L.marker([g.lat, g.lng], {
          icon,
          riseOnHover: true,
          keyboard: true,
          title: `${g.label} · ${count} action${count > 1 ? "s" : ""}`,
        }).addTo(map!);

        marker.bindPopup(html, {
          maxWidth: 340,
          className: "nl-map-popup-wrap",
          autoPanPadding: [48, 48],
        });
        marker.on("click", () => {
          const top = g.entries.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
          if (top && onSelect) onSelect(top);
        });
      }

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 5 });
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
    <div className="networks-map-shell relative rounded-xl overflow-hidden border border-cyan/35 bg-card/50 shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_20px_50px_-28px_rgba(0,0,0,0.65)]">
      <div
        ref={containerRef}
        className="networks-map-stage w-full h-[340px] sm:h-[420px] md:h-[480px] z-0"
        role="img"
        aria-label="Interactive map of network enforcement actions"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-background/25 to-transparent z-[400]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background/20 to-transparent z-[400]" />
    </div>
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
