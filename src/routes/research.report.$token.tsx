import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Check,
  Download,
  FlaskConical,
  Globe2,
  Home,
  Loader2,
  Share2,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import type { DeskReport } from "@/lib/research-desk/build-report";

export const Route = createFileRoute("/research/report/$token")({
  head: () => ({
    meta: [
      { title: "Your research report · Elenchos" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { token } = Route.useParams();
  const [sessionId] = useState(() =>
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("session_id")
      : null,
  );

  const [report, setReport] = useState<DeskReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (sessionId) {
          const fin = await fetch("/api/research/finalize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, token }),
          });
          if (!fin.ok) {
            const j = (await fin.json().catch(() => ({}))) as { error?: string };
            if (fin.status === 402) {
              throw new Error(j.error || "Payment not completed");
            }
          }
        }
        const res = await fetch(`/api/research/report/${encodeURIComponent(token)}`);
        if (!res.ok) {
          throw new Error(
            sessionId
              ? "Report not ready yet — refresh in a few seconds."
              : "Report not found. Check your unique link.",
          );
        }
        const data = (await res.json()) as DeskReport;
        if (!cancelled) setReport(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load report");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, sessionId]);

  async function toggleShare(share: boolean) {
    setShareBusy(true);
    setShareMsg(null);
    try {
      const res = await fetch("/api/research/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, share }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        report?: DeskReport;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Could not update share setting");
      }
      if (data.report) setReport(data.report);
      setShareMsg(
        share
          ? "Shared on Elenchos. Others can find it under Library → Community reports."
          : "Removed from the public library. Your private link still works.",
      );
    } catch (e) {
      setShareMsg(e instanceof Error ? e.message : "Share update failed");
    } finally {
      setShareBusy(false);
    }
  }

  async function copyPublicLink() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/research/report/${encodeURIComponent(token)}`
        : "";
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setShareMsg("Copy failed — select the URL from your browser address bar.");
    }
  }

  const isShared = Boolean(report?.sharedPublic);

  return (
    <div className="page-shell dash-landing research-brief-shell">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />
      <main className="max-w-[720px] mx-auto w-full min-w-0 px-3 sm:px-4 py-6 sm:py-8 mobile-safe-bottom relative flex-1 overflow-x-clip">
        <div className="flex flex-wrap gap-2 mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-cyan min-h-[40px]"
          >
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <Link
            to="/research"
            className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-cyan min-h-[40px]"
          >
            <FlaskConical className="w-3.5 h-3.5" /> Research Desk
          </Link>
          <Link
            to="/research/library"
            className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-cyan min-h-[40px]"
          >
            Library
          </Link>
        </div>

        {loading && (
          <p className="inline-flex items-center gap-2 text-cyan font-mono text-[13px]">
            <Loader2 className="w-4 h-4 animate-spin" /> Preparing your report…
          </p>
        )}
        {error && !report && (
          <div className="rounded-xl border border-rose-signal/40 bg-rose-signal/10 px-4 py-3 text-[13px] text-foreground/90">
            {error}
          </div>
        )}

        {report && (
          <article className="space-y-5 min-w-0">
            <header className="page-hero-banner p-3.5 sm:p-5 space-y-2 overflow-hidden min-w-0">
              <p className="page-hero-kicker">
                <Share2 className="w-3.5 h-3.5" />{" "}
                {isShared ? "Shared report" : "Your private report"}
              </p>
              <h1 className="page-hero-title text-[1.15rem] sm:text-xl break-words [overflow-wrap:anywhere]">
                {report.title}
              </h1>
              <p className="text-[12px] font-mono text-muted-foreground break-all">
                Token · {report.token}
              </p>
              <p className="text-[12px] text-muted-foreground break-words leading-relaxed">
                {report.disclaimer}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={`/api/research/report/${encodeURIComponent(token)}?format=pdf`}
                  className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full border border-cyan/45 bg-cyan/15 text-cyan text-[12px] font-medium touch-manipulation"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </a>
                <a
                  href={`/api/research/report/${encodeURIComponent(token)}?format=txt`}
                  className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full border border-border text-[12px] text-muted-foreground touch-manipulation"
                >
                  Download text
                </a>
              </div>
            </header>

            {/* Share on Elenchos */}
            <section className="rounded-xl border border-cyan/30 bg-cyan/[0.06] px-3.5 sm:px-4 py-3.5 space-y-3 min-w-0">
              <div className="flex items-start gap-2.5">
                <Globe2 className="w-4 h-4 text-cyan shrink-0 mt-0.5" aria-hidden />
                <div className="min-w-0 space-y-1">
                  <p className="text-[13px] font-display font-semibold text-foreground">
                    Share on Elenchos?
                  </p>
                  <p className="text-[12px] text-muted-foreground leading-relaxed break-words">
                    Optional. List this paid report in the public Research library so others can
                    open it. Only the topic and report body are shown — no email or payment data.
                    You can turn sharing off any time with this same link.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                {!isShared ? (
                  <button
                    type="button"
                    disabled={shareBusy}
                    onClick={() => void toggleShare(true)}
                    className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full bg-cyan text-background text-[12px] font-semibold touch-manipulation disabled:opacity-50"
                  >
                    {shareBusy ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                    Share on Elenchos library
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={shareBusy}
                      onClick={() => void toggleShare(false)}
                      className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full border border-border text-[12px] text-muted-foreground touch-manipulation disabled:opacity-50"
                    >
                      {shareBusy ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : null}
                      Stop sharing
                    </button>
                    <button
                      type="button"
                      onClick={() => void copyPublicLink()}
                      className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full border border-cyan/40 bg-cyan/10 text-cyan text-[12px] font-medium touch-manipulation"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Link copied
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" /> Copy public link
                        </>
                      )}
                    </button>
                    <Link
                      to="/research/library"
                      className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full border border-border text-[12px] text-muted-foreground touch-manipulation"
                    >
                      Open library
                    </Link>
                  </>
                )}
              </div>
              {shareMsg && (
                <p className="text-[12px] text-foreground/85 leading-snug" role="status">
                  {shareMsg}
                </p>
              )}
            </section>

            {report.sections.map((s) => (
              <section
                key={s.heading}
                className="rounded-xl border border-border/90 bg-card/50 px-3.5 sm:px-4 py-3.5 space-y-2 min-w-0 overflow-hidden"
              >
                <h2 className="text-[13px] font-display font-semibold text-cyan break-words">
                  {s.heading}
                </h2>
                <ul className="space-y-1.5">
                  {s.body.map((line, i) => (
                    <li
                      key={i}
                      className="text-[13px] text-foreground/90 leading-relaxed break-words [overflow-wrap:anywhere]"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <p className="text-[11px] font-mono text-muted-foreground break-words">
              Save this URL — we do not store your email. Bookmark before closing.
            </p>
          </article>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
