/**
 * Privacy-safe static share images for Speech Reach (no names, no posts).
 * Drawn with Canvas 2D — downloadable PNGs for X.
 */

import type { SpeechReachEntry, SpectrumSlice, TimeSeriesPoint } from "./types";
import { formatPct } from "./index";

const W = 1200;
const H = 675;
const BG = "#0b1220";
const CARD = "#121a2b";
const CYAN = "#22d3ee";
const VIOLET = "#a78bfa";
const AMBER = "#f59e0b";
const MUTED = "#94a3b8";
const TEXT = "#f1f5f9";
const BORDER = "#1e293b";

/**
 * Mobile-safe image save:
 * 1) Web Share API with file (iOS/Android when available)
 * 2) <a download> (desktop + Android Chrome)
 * 3) Open image in new tab so the user can long-press / Save Image
 * 4) data-URL navigation fallback
 */
async function saveImageBlob(blob: Blob, filename: string): Promise<"shared" | "downloaded" | "opened"> {
  const file = new File([blob], filename, { type: blob.type || "image/png" });

  // Prefer native share sheet on phones (works inside the user-gesture chain).
  try {
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
      share?: (data: ShareData) => Promise<void>;
    };
    if (typeof nav.share === "function") {
      const data: ShareData = { files: [file], title: filename };
      if (!nav.canShare || nav.canShare(data)) {
        await nav.share(data);
        return "shared";
      }
    }
  } catch (err) {
    // AbortError = user cancelled share — treat as done, don't force download.
    if (err instanceof DOMException && err.name === "AbortError") {
      return "shared";
    }
  }

  const url = URL.createObjectURL(blob);
  const isIos =
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

  // iOS Safari often ignores the download attribute — open the image instead.
  if (isIos) {
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) {
      // Popup blocked: navigate current tab (user can back out).
      window.location.href = url;
    }
    // Revoke later so the new tab can still load the blob.
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return "opened";
  }

  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
    return "downloaded";
  } catch {
    // Last resort: data URL in same/new window
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        const opened = window.open(dataUrl, "_blank", "noopener,noreferrer");
        if (!opened) window.location.href = dataUrl;
        URL.revokeObjectURL(url);
        resolve("opened");
      };
      reader.readAsDataURL(blob);
    });
  }
}

function canvasToPng(
  canvas: HTMLCanvasElement,
  filename: string,
): Promise<"shared" | "downloaded" | "opened" | "failed"> {
  return new Promise((resolve) => {
    // toBlob is async and can break iOS user-gesture — also try toDataURL path.
    const finish = async (blob: Blob | null) => {
      if (!blob) {
        try {
          const dataUrl = canvas.toDataURL("image/png");
          const res = await fetch(dataUrl);
          const b = await res.blob();
          resolve(await saveImageBlob(b, filename));
        } catch {
          resolve("failed");
        }
        return;
      }
      try {
        resolve(await saveImageBlob(blob, filename));
      } catch {
        resolve("failed");
      }
    };

    try {
      canvas.toBlob((blob) => void finish(blob), "image/png", 0.95);
    } catch {
      void finish(null);
    }
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawHeader(ctx: CanvasRenderingContext2D, title: string, subtitle: string) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = CYAN;
  ctx.font = "600 18px system-ui,Segoe UI,sans-serif";
  ctx.fillText("ELENCHOS · SPEECH REACH", 48, 48);

  ctx.fillStyle = TEXT;
  ctx.font = "700 36px system-ui,Segoe UI,sans-serif";
  ctx.fillText(title, 48, 100);

  ctx.fillStyle = MUTED;
  ctx.font = "400 18px system-ui,Segoe UI,sans-serif";
  ctx.fillText(subtitle, 48, 132);

  ctx.fillStyle = BORDER;
  ctx.fillRect(48, 148, W - 96, 1);
}

function drawFooter(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = MUTED;
  ctx.font = "400 14px system-ui,Segoe UI,sans-serif";
  ctx.fillText(
    "elenchos.live/research/speech-reach  ·  Aggregate only  ·  No individual names or posts",
    48,
    H - 28,
  );
}

/** Key metrics summary card (privacy-safe). */
export async function downloadMetricsSummaryImage(
  entry: SpeechReachEntry,
): Promise<"shared" | "downloaded" | "opened" | "failed"> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "failed";

  drawHeader(
    ctx,
    "Brazil 2026 — at a glance",
    "Still public. Only free For You recommendation is limited.",
  );

  const m = entry.metrics;
  const cards = [
    { label: "Change in post volume", value: formatPct(m.volumeChangePct, true) },
    { label: "Share from other voices", value: formatPct(m.nonListedSharePct) },
    { label: "Engagement from non-followers", value: formatPct(m.nonFollowerEngagementPct) },
    { label: "Accounts on the list", value: `~${entry.approximateScale}` },
  ];

  const cardW = 250;
  const cardH = 140;
  const gap = 20;
  const startX = 48;
  const startY = 180;

  cards.forEach((c, i) => {
    const x = startX + i * (cardW + gap);
    const y = startY;
    ctx.fillStyle = CARD;
    roundRect(ctx, x, y, cardW, cardH, 16);
    ctx.fill();
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = MUTED;
    ctx.font = "500 13px system-ui,Segoe UI,sans-serif";
    const lines = wrapText(ctx, c.label, cardW - 28);
    lines.forEach((line, li) => ctx.fillText(line, x + 18, y + 36 + li * 18));

    ctx.fillStyle = CYAN;
    ctx.font = "700 40px system-ui,Segoe UI,sans-serif";
    ctx.fillText(c.value, x + 18, y + 110);
  });

  // Key message box
  ctx.fillStyle = "rgba(34,211,238,0.08)";
  roundRect(ctx, 48, 360, W - 96, 180, 16);
  ctx.fill();
  ctx.strokeStyle = "rgba(34,211,238,0.35)";
  ctx.stroke();

  ctx.fillStyle = CYAN;
  ctx.font = "600 16px system-ui,Segoe UI,sans-serif";
  ctx.fillText("IN SIMPLE WORDS", 72, 400);

  const bullets = entry.simpleWords ?? [
    "Accounts can still post.",
    "Anyone can still find and read the posts.",
    "Only free For You recommendation is limited.",
    "Not recommended — not banned or deleted.",
  ];
  ctx.fillStyle = TEXT;
  ctx.font = "400 18px system-ui,Segoe UI,sans-serif";
  bullets.forEach((b, i) => {
    ctx.fillText(`•  ${b}`, 72, 440 + i * 28);
  });

  drawFooter(ctx);
  return canvasToPng(canvas, "elenchos-speech-reach-metrics.png");
}

/** Volume / other-voices time series as a shareable chart image. */
export async function downloadVolumeChartImage(
  series: TimeSeriesPoint[],
  labels: string[],
): Promise<"shared" | "downloaded" | "opened" | "failed"> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "failed";

  drawHeader(
    ctx,
    "Post volume & other voices",
    "Listed campaign accounts · sample estimate · no individual names",
  );

  const plotX = 80;
  const plotY = 180;
  const plotW = W - 160;
  const plotH = 380;

  ctx.fillStyle = CARD;
  roundRect(ctx, plotX - 20, plotY - 20, plotW + 40, plotH + 60, 16);
  ctx.fill();

  // Axes
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(plotX, plotY);
  ctx.lineTo(plotX, plotY + plotH);
  ctx.lineTo(plotX + plotW, plotY + plotH);
  ctx.stroke();

  const vols = series.map((s) => s.volumeIndex);
  const shares = series.map((s) => s.nonListedSharePct);
  const minV = 40;
  const maxV = 120;
  const minS = 30;
  const maxS = 80;

  const xAt = (i: number) =>
    plotX + (series.length <= 1 ? plotW / 2 : (i / (series.length - 1)) * plotW);
  const yVol = (v: number) =>
    plotY + plotH - ((v - minV) / (maxV - minV)) * plotH;
  const yShare = (s: number) =>
    plotY + plotH - ((s - minS) / (maxS - minS)) * plotH;

  // Volume area
  ctx.beginPath();
  series.forEach((_, i) => {
    const x = xAt(i);
    const y = yVol(vols[i]!);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(xAt(series.length - 1), plotY + plotH);
  ctx.lineTo(xAt(0), plotY + plotH);
  ctx.closePath();
  ctx.fillStyle = "rgba(34,211,238,0.2)";
  ctx.fill();

  // Volume line
  ctx.beginPath();
  series.forEach((_, i) => {
    const x = xAt(i);
    const y = yVol(vols[i]!);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = CYAN;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Other voices line
  ctx.beginPath();
  series.forEach((_, i) => {
    const x = xAt(i);
    const y = yShare(shares[i]!);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = VIOLET;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Activation marker ~ Aug 10 index
  const actIdx = labels.findIndex((l) => /aug\s*10/i.test(l) || l.includes("Aug 10"));
  if (actIdx >= 0) {
    const ax = xAt(actIdx);
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ax, plotY);
    ctx.lineTo(ax, plotY + plotH);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = AMBER;
    ctx.font = "500 13px system-ui,Segoe UI,sans-serif";
    ctx.fillText("Rule starts ≈", ax + 8, plotY + 18);
  }

  // Legend
  ctx.fillStyle = CYAN;
  ctx.fillRect(plotX, plotY + plotH + 24, 14, 4);
  ctx.fillStyle = MUTED;
  ctx.font = "400 13px system-ui,Segoe UI,sans-serif";
  ctx.fillText("Post volume (index)", plotX + 22, plotY + plotH + 30);

  ctx.fillStyle = VIOLET;
  ctx.fillRect(plotX + 200, plotY + plotH + 24, 14, 4);
  ctx.fillStyle = MUTED;
  ctx.fillText("Other voices %", plotX + 222, plotY + plotH + 30);

  // X labels
  ctx.fillStyle = MUTED;
  ctx.font = "400 12px system-ui,Segoe UI,sans-serif";
  labels.forEach((lab, i) => {
    ctx.fillText(lab, xAt(i) - 16, plotY + plotH + 50);
  });

  drawFooter(ctx);
  return canvasToPng(canvas, "elenchos-speech-reach-volume-chart.png");
}

/** Spectrum horizontal bar chart image. */
export async function downloadSpectrumChartImage(
  spectrum: SpectrumSlice[],
): Promise<"shared" | "downloaded" | "opened" | "failed"> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "failed";

  drawHeader(
    ctx,
    "Across the political spectrum",
    "High-level groups only · same rule for all · no individual names",
  );

  const colors = [CYAN, "#34d399", AMBER, VIOLET];
  const max = Math.max(...spectrum.map((s) => s.sharePct), 1);
  const barMaxW = W - 380;
  const startY = 200;
  const rowH = 70;

  spectrum.forEach((s, i) => {
    const y = startY + i * rowH;
    ctx.fillStyle = MUTED;
    ctx.font = "500 18px system-ui,Segoe UI,sans-serif";
    ctx.fillText(s.label, 48, y + 28);

    const bw = (s.sharePct / max) * barMaxW;
    ctx.fillStyle = colors[i % colors.length]!;
    roundRect(ctx, 320, y, bw, 36, 8);
    ctx.fill();

    ctx.fillStyle = TEXT;
    ctx.font = "700 18px system-ui,Segoe UI,sans-serif";
    ctx.fillText(`${s.sharePct}%`, 320 + bw + 16, y + 26);
  });

  ctx.fillStyle = MUTED;
  ctx.font = "400 15px system-ui,Segoe UI,sans-serif";
  ctx.fillText(
    "Rough share of sampled talk about major candidacies — not official party rankings.",
    48,
    startY + spectrum.length * rowH + 24,
  );

  drawFooter(ctx);
  return canvasToPng(canvas, "elenchos-speech-reach-spectrum.png");
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}
