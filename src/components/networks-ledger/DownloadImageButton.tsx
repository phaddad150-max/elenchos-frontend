import { Download } from "lucide-react";
import { useState } from "react";

type Props = {
  label?: string;
  onDownload: () => void;
  className?: string;
};

/** Small control for privacy-safe chart / summary PNG downloads. */
export function DownloadImageButton({
  label = "Download image",
  onDownload,
  className = "",
}: Props) {
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        try {
          onDownload();
        } finally {
          window.setTimeout(() => setBusy(false), 400);
        }
      }}
      className={`inline-flex items-center gap-1.5 min-h-[36px] px-2.5 py-1 rounded-lg border border-border/80 bg-background/50 text-[11px] font-medium text-muted-foreground hover:text-cyan hover:border-cyan/40 transition-colors disabled:opacity-60 ${className}`}
    >
      <Download className="w-3.5 h-3.5" aria-hidden />
      {busy ? "Saving…" : label}
    </button>
  );
}
