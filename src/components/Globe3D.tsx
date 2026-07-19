import { useEffect, useMemo, useRef, useState, Suspense, lazy } from "react";
import type { Signal } from "@/lib/sim-data";
import { INTENSITY_GLOBE_COLOR } from "@/lib/sim-data";
import { useTheme } from "@/hooks/use-theme";

// react-globe.gl pulls in three.js — must be client-only (no SSR).
const Globe = lazy(() => import("react-globe.gl"));

const EARTH_NIGHT =
  "https://unpkg.com/three-globe/example/img/earth-night.jpg";
// Day / blue-marble texture — much higher contrast on light UI than night lights
const EARTH_DAY =
  "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";

interface Props {
  signals: Signal[];
  onPick: (s: Signal) => void;
}

export function Globe3D({ signals, onPick }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 600, h: 480 });
  const [mounted, setMounted] = useState(false);
  const globeRef = useRef<any>(null);
  const [theme] = useTheme();
  const isLight = theme === "light";

  useEffect(() => {
    setMounted(true);
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const node = wrapRef.current;
      if (!node) return;
      const r = node.getBoundingClientRect();
      setSize({ w: Math.max(r.width, 320), h: Math.max(r.height, 280) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Apply auto-rotate once the globe instance exists (re-run on theme swap remount).
  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => {
      const g = globeRef.current;
      if (!g || typeof g.controls !== "function") return;
      const controls = g.controls();
      if (!controls) return;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.32;
      controls.enableZoom = true;
      controls.enablePan = false;
      if (typeof g.pointOfView === "function") {
        g.pointOfView({ lat: 18, lng: -38, altitude: 1.9 }, 900);
      }
      clearInterval(id);
    }, 120);
    return () => clearInterval(id);
  }, [mounted, isLight]);

  const activeSignals = useMemo(() => signals.slice(0, 32), [signals]);

  const points = activeSignals.map((s) => ({
    lat: s.lat,
    lng: s.lng,
    size: 0.42 + s.intensityScore * 1.15,
    color: INTENSITY_GLOBE_COLOR[s.intensity],
    signal: s,
  }));

  const arcs = activeSignals.slice(0, 14).map((s, i) => {
    const target = activeSignals[(i + 5) % Math.max(activeSignals.length, 1)] ?? s;
    // Light mode: stronger arc fade so paths read over blue-marble land
    const arcEnd = isLight ? "rgba(8, 145, 178, 0.35)" : "rgba(0, 213, 255, 0.16)";
    return {
      startLat: s.lat,
      startLng: s.lng,
      endLat: target.lat,
      endLng: target.lng,
      color: [INTENSITY_GLOBE_COLOR[s.intensity], arcEnd],
      order: i,
    };
  });

  const labels = activeSignals.slice(0, 7).map((s) => ({
    lat: s.lat,
    lng: s.lng,
    text: s.region.toUpperCase(),
    color: INTENSITY_GLOBE_COLOR[s.intensity],
  }));

  const rings = activeSignals
    .filter((s) => s.intensity === "high" || s.intensity === "critical")
    .slice(0, 10)
    .map((s) => ({
      lat: s.lat,
      lng: s.lng,
      maxR: 4 + s.intensityScore * 6,
      propagationSpeed: 2,
      repeatPeriod: 1200,
      color: INTENSITY_GLOBE_COLOR[s.intensity],
    }));

  // Light-mode-only presentation (dark theme keeps original night globe)
  const globeImageUrl = isLight ? EARTH_DAY : EARTH_NIGHT;
  const atmosphereColor = isLight ? "#0e7490" : "#22d3ee";
  const atmosphereAltitude = isLight ? 0.2 : 0.34;
  const defaultPoint = isLight ? "#0e7490" : "#22d3ee";
  const defaultArc = isLight
    ? (["#0891b2", "rgba(8, 145, 178, 0.35)"] as [string, string])
    : (["#00d5ff", "rgba(0, 213, 255, 0.16)"] as [string, string]);
  const arcStroke = isLight ? 0.65 : 0.45;
  const labelSize = isLight ? 0.82 : 0.72;
  const pointRadiusBoost = isLight ? 1.15 : 1;

  return (
    <div
      ref={wrapRef}
      className={`relative w-full h-full min-h-[240px] overflow-hidden rounded-xl globe-stage${
        isLight ? " globe-stage--light" : ""
      }`}
    >
      {mounted ? (
        <Suspense fallback={<GlobeFallback />}>
          <Globe
            key={isLight ? "globe-light" : "globe-dark"}
            ref={globeRef}
            width={size.w}
            height={size.h}
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl={globeImageUrl}
            bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
            showAtmosphere
            atmosphereColor={atmosphereColor}
            atmosphereAltitude={atmosphereAltitude}
            showGraticules
            pointsData={points}
            pointLat={(d: any) => d?.lat ?? 0}
            pointLng={(d: any) => d?.lng ?? 0}
            pointColor={(d: any) => d?.color ?? defaultPoint}
            pointAltitude={(d: any) => 0.025 + (d?.size ?? 0.4) * 0.1}
            pointRadius={(d: any) => (0.38 + (d?.size ?? 0.4) * 0.48) * pointRadiusBoost}
            pointResolution={10}
            pointLabel={(d: any) => {
              const s = d?.signal;
              if (!s) return "";
              const score = Math.round((s.intensityScore ?? 0) * 100);
              const div = Math.round((s.divergence ?? 0) * 100);
              const posts = typeof s.posts === "number" ? s.posts.toLocaleString() : "—";
              const sentiment = (s.sentiment ?? "neutral").replace(/</g, "&lt;");
              const excerpt = (s.headline ?? s.excerpt ?? "").replace(/</g, "&lt;").slice(0, 90);
              // Tooltip always dark for readability on both themes
              return `
                <div style="background:rgba(8,12,20,0.94);border:1px solid rgba(34,211,238,0.45);padding:9px 11px;border-radius:9px;font-family:ui-monospace,monospace;font-size:11px;color:#e2e8f0;max-width:260px;box-shadow:0 6px 22px rgba(0,0,0,0.55)">
                  <div style="color:#22d3ee;text-transform:uppercase;letter-spacing:0.12em;font-size:9.5px;margin-bottom:4px">${s.region ?? "—"} · ${sentiment}</div>
                  <div style="font-weight:600;margin-bottom:5px;line-height:1.3">${(s.topic ?? "Signal").replace(/</g,"&lt;")}</div>
                  ${excerpt ? `<div style="color:#cbd5e1;font-size:10px;line-height:1.35;margin-bottom:6px">${excerpt}</div>` : ""}
                  <div style="display:flex;flex-wrap:wrap;gap:8px;color:#94a3b8;font-size:10px">
                    <span>Intensity <span style="color:${d.color};font-weight:600">${score}</span></span>
                    <span>Divergence <span style="color:#22d3ee;font-weight:600">${div}%</span></span>
                    <span>Posts <span style="color:#e2e8f0;font-weight:600">${posts}</span></span>
                  </div>
                </div>`;
            }}
            onPointClick={(d: any) => d?.signal && onPick(d.signal)}
            arcsData={arcs}
            arcStartLat={(d: any) => d?.startLat ?? 0}
            arcStartLng={(d: any) => d?.startLng ?? 0}
            arcEndLat={(d: any) => d?.endLat ?? 0}
            arcEndLng={(d: any) => d?.endLng ?? 0}
            arcColor={(d: any) => d?.color ?? defaultArc}
            arcAltitude={0.18}
            arcStroke={arcStroke}
            arcDashLength={0.38}
            arcDashGap={1.8}
            arcDashInitialGap={(d: any) => (d?.order ?? 0) * 0.35}
            arcDashAnimateTime={3200}
            ringsData={rings}
            ringColor={(d: any) => d?.color ?? defaultPoint}
            ringMaxRadius={(d: any) => d?.maxR ?? 4}
            ringPropagationSpeed={(d: any) => d?.propagationSpeed ?? 2}
            ringRepeatPeriod={(d: any) => d?.repeatPeriod ?? 1200}
            labelsData={labels}
            labelLat={(d: any) => d?.lat ?? 0}
            labelLng={(d: any) => d?.lng ?? 0}
            labelText={(d: any) => d?.text ?? ""}
            labelColor={(d: any) => d?.color ?? defaultPoint}
            labelSize={labelSize}
            labelAltitude={0.035}
            labelDotRadius={isLight ? 0.2 : 0.16}
          />
        </Suspense>
      ) : (
        <GlobeFallback />
      )}
      <div className="absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono pointer-events-none z-10">
        live signal mesh · auto-rotate
      </div>
    </div>
  );
}

function GlobeFallback() {
  return (
    <div className="w-full h-full grid place-items-center">
      <div className="w-48 h-48 rounded-full border border-cyan/40 animate-pulse" />
    </div>
  );
}
