import { Download, Share2 } from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
  label?: string;
  /** Async download/share — return mode for UI feedback */
  onDownload: () => void | Promise<"shared" | "downloaded" | "opened" | "failed" | void>;
  className?: string;
};

function prefersMobileShare(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const touch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    /iPad|iPhone|iPod|Android/i.test(ua);
  return touch && typeof navigator.share === "function";
}

/**
 * Mobile-first: uses Web Share when available; otherwise download / open image.
 * Keep onClick async so iOS keeps the user-gesture chain where possible.
 */
export function DownloadImageButton({
  label,
  onDownload,
  className = "",
}: Props) {
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const mobileShare = useMemo(() => prefersMobileShare(), []);
  const buttonLabel = label ?? (mobileShare ? "Share image" : "Download image");

  return (
    <div className={`inline-flex flex-col items-end gap-0.5 ${className}`}>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          setHint(null);
          void (async () => {
            try {
              const result = await onDownload();
              if (result === "opened") {
                setHint("Image opened — long-press to save");
              } else if (result === "shared") {
                setHint(null);
              } else if (result === "failed") {
                setHint("Could not save — try again");
              } else if (result === "downloaded") {
                setHint("Saved");
              }
            } catch {
              setHint("Could not save — try again");
            } finally {
              setBusy(false);
              window.setTimeout(() => setHint(null), 4000);
            }
          })();
        }}
        className="inline-flex items-center gap-1.5 min-h-[40px] sm:min-h-[36px] px-3 py-1.5 rounded-lg border border-border/80 bg-background/50 text-[11px] font-medium text-muted-foreground hover:text-cyan hover:border-cyan/40 transition-colors disabled:opacity-60 touch-manipulation"
      >
        {mobileShare ? (
          <Share2 className="w-3.5 h-3.5" aria-hidden />
        ) : (
          <Download className="w-3.5 h-3.5" aria-hidden />
        )}
        {busy ? "Preparing…" : buttonLabel}
      </button>
      {hint && (
        <span className="text-[10px] text-cyan/90 font-mono max-w-[200px] text-right leading-tight">
          {hint}
        </span>
      )}
    </div>
  );
}
