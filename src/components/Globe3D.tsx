import { useEffect, useMemo, useRef, useState, Suspense, lazy } from "react";
import type { Signal } from "@/lib/sim-data";
import { INTENSITY_GLOBE_COLOR } from "@/lib/sim-data";

// react-globe.gl pulls in three.js — must be client-only (no SSR).
const Globe = lazy(() => import("react-globe.gl"));

interface Props {
  signals: Signal[];
  onPick: (s: Signal) => void;
}

export function Globe3D({ signals, onPick }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 600, h: 480 });
  const [mounted, setMounted] = useState(false);
  const globeRef = useRef<any>(null);

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

  // Apply auto-rotate once the globe instance exists.
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
  }, [mounted]);

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
    return {
      startLat: s.lat,
      startLng: s.lng,
      endLat: target.lat,
      endLng: target.lng,
      color: [INTENSITY_GLOBE_COLOR[s.intensity], "rgba(0, 213, 255, 0.16)"],
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

  return (
    <div ref={wrapRef} className="relative w-full h-full min-h-[240px] overflow-hidden rounded-xl globe-stage">
      {mounted ? (
        <Suspense fallback={<GlobeFallback />}>
          <Globe
            ref={globeRef}
            width={size.w}
            height={size.h}
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
            bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
            showAtmosphere
            atmosphereColor="#22d3ee"
            atmosphereAltitude={0.34}
            showGraticules
            pointsData={points}
            pointLat={(d: any) => d?.lat ?? 0}
            pointLng={(d: any) => d?.lng ?? 0}
            pointColor={(d: any) => d?.color ?? "#22d3ee"}
            pointAltitude={(d: any) => 0.025 + (d?.size ?? 0.4) * 0.1}
            pointRadius={(d: any) => 0.38 + (d?.size ?? 0.4) * 0.48}
            pointResolution={10}
            pointLabel={(d: any) => {
              const s = d?.signal;
              if (!s) return "";
              const score = Math.round((s.intensityScore ?? 0) * 100);
              const div = Math.round((s.divergence ?? 0) * 100);
              return `
                <div style="background:rgba(8,12,20,0.92);border:1px solid rgba(34,211,238,0.4);padding:8px 10px;border-radius:8px;font-family:ui-monospace,monospace;font-size:11px;color:#e2e8f0;max-width:240px;box-shadow:0 4px 18px rgba(0,0,0,0.5)">
                  <div style="color:#22d3ee;text-transform:uppercase;letter-spacing:0.12em;font-size:9.5px;margin-bottom:4px">${s.region ?? "—"}</div>
                  <div style="font-weight:600;margin-bottom:4px;line-height:1.25">${(s.topic ?? "Signal").replace(/</g,"&lt;")}</div>
                  <div style="display:flex;gap:10px;color:#94a3b8">
                    <span>Score <span style="color:${d.color};font-weight:600">${score}</span></span>
                    <span>Divergence <span style="color:#22d3ee;font-weight:600">${div}</span></span>
                  </div>
                </div>`;
            }}
            onPointClick={(d: any) => d?.signal && onPick(d.signal)}
            arcsData={arcs}
            arcStartLat={(d: any) => d?.startLat ?? 0}
            arcStartLng={(d: any) => d?.startLng ?? 0}
            arcEndLat={(d: any) => d?.endLat ?? 0}
            arcEndLng={(d: any) => d?.endLng ?? 0}
            arcColor={(d: any) => d?.color ?? ["#00d5ff", "rgba(0, 213, 255, 0.16)"]}
            arcAltitude={0.18}
            arcStroke={0.45}
            arcDashLength={0.38}
            arcDashGap={1.8}
            arcDashInitialGap={(d: any) => (d?.order ?? 0) * 0.35}
            arcDashAnimateTime={3200}
            ringsData={rings}
            ringColor={(d: any) => d?.color ?? "#22d3ee"}
            ringMaxRadius={(d: any) => d?.maxR ?? 4}
            ringPropagationSpeed={(d: any) => d?.propagationSpeed ?? 2}
            ringRepeatPeriod={(d: any) => d?.repeatPeriod ?? 1200}
            labelsData={labels}
            labelLat={(d: any) => d?.lat ?? 0}
            labelLng={(d: any) => d?.lng ?? 0}
            labelText={(d: any) => d?.text ?? ""}
            labelColor={(d: any) => d?.color ?? "#00d5ff"}
            labelSize={0.72}
            labelAltitude={0.035}
            labelDotRadius={0.16}
          />
        </Suspense>
      ) : (
        <GlobeFallback />
      )}
      <div className="absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono pointer-events-none">
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
