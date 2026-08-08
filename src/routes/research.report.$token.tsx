import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Check,
  FlaskConical,
  Globe2,
  Home,
  Library,
  Loader2,
  Share2,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { CommissionedReportView } from "@/components/research/CommissionedReportView";
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
  const [status, setStatus] = useState<string>("loading");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    const res = await fetch(`/api/research/report/${encodeURIComponent(token)}`);
    if (res.status === 202) {
      const j = (await res.json().catch(() => ({}))) as { status?: string };
      setStatus(j.status || "generating");
      setReport(null);
      return false;
    }
    if (!res.ok) {
      throw new Error(
        sessionId
          ? "Report not ready yet — building your briefing…"
          : "Report not found. Check your unique link.",
      );
    }
    const data = (await res.json()) as DeskReport;
    setReport(data);
    setStatus(data.generationStatus || "ready");
    return true;
  }, [token, sessionId]);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: number | undefined;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (sessionId) {
          setStatus("generating");
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
            // Still try load — webhook may have completed
          }
        }

        const ready = await loadReport();
        if (cancelled) return;
        if (!ready) {
          // Poll while generating
          let attempts = 0;
          const poll = async () => {
            if (cancelled) return;
            attempts += 1;
            try {
              const ok = await loadReport();
              // Backend pipeline can take several minutes (X fetch + Pass-1)
              if (ok || attempts > 120) {
                setLoading(false);
                if (!ok && attempts > 120) {
                  setError(
                    "Generation is taking longer than expected. Your unique link will work when ready — refresh in a few minutes.",
                  );
                }
                return;
              }
            } catch {
              /* keep polling */
            }
            pollTimer = window.setTimeout(poll, 2500);
          };
          pollTimer = window.setTimeout(poll, 2000);
          return;
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load report");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (pollTimer) window.clearTimeout(pollTimer);
    };
  }, [token, sessionId, loadReport]);

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

  async function sendEmail(email: string) {
    setEmailBusy(true);
    setEmailMsg(null);
    try {
      const res = await fetch("/api/research/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Could not send email");
      }
      setEmailMsg("Link sent. Check your inbox (and spam).");
    } catch (e) {
      setEmailMsg(e instanceof Error ? e.message : "Email failed");
    } finally {
      setEmailBusy(false);
    }
  }

  const isShared = Boolean(report?.sharedPublic);
  const generating =
    loading ||
    status === "generating" ||
    status === "paid" ||
    (sessionId && !report && !error);

  return (
    <div className="page-shell dash-landing research-brief-shell">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />
      {/* Same width rhythm as live topic analysis pages */}
      <main className="max-w-[1400px] mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 py-5 md:py-8 mobile-safe-bottom relative flex-1 overflow-x-clip">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground mb-4"
        >
          <Link to="/" className="hover:text-cyan min-h-[36px] inline-flex items-center gap-1">
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <span aria-hidden>/</span>
          <Link to="/topics" className="hover:text-cyan min-h-[36px] inline-flex items-center">
            Topics
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground/85">Commissioned briefing</span>
          <span className="text-border mx-1 hidden sm:inline">·</span>
          <Link
            to="/research"
            className="hover:text-cyan min-h-[36px] inline-flex items-center gap-1"
          >
            <FlaskConical className="w-3.5 h-3.5" /> Desk
          </Link>
          <Link
            to="/research/library"
            className="hover:text-cyan min-h-[36px] inline-flex items-center gap-1"
          >
            <Library className="w-3.5 h-3.5" /> Library
          </Link>
        </nav>

        {generating && !report && (
          <div className="rounded-2xl border border-cyan/35 bg-cyan/[0.06] px-5 py-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-cyan animate-spin mx-auto" />
            <p className="font-display font-semibold text-[16px]">Building your briefing…</p>
            <p className="text-[13px] text-muted-foreground max-w-md mx-auto leading-relaxed">
              Payment received. Running the same Topics analysis workflow (public sample + scored
              insights). This can take a few minutes — keep this tab open or return with your unique
              link.
            </p>
          </div>
        )}

        {error && !report && (
          <div className="rounded-xl border border-rose-signal/40 bg-rose-signal/10 px-4 py-3 text-[13px] text-foreground/90">
            {error}
          </div>
        )}

        {report && (
          <CommissionedReportView
            report={report}
            token={token}
            onEmail={sendEmail}
            emailBusy={emailBusy}
            emailMsg={emailMsg}
            shareSlot={
              <section className="rounded-xl border border-cyan/30 bg-cyan/[0.06] px-3.5 sm:px-4 py-3.5 space-y-3 min-w-0">
                <div className="flex items-start gap-2.5">
                  <Globe2 className="w-4 h-4 text-cyan shrink-0 mt-0.5" aria-hidden />
                  <div className="min-w-0 space-y-1">
                    <p className="text-[13px] font-display font-semibold text-foreground">
                      Share on Elenchos?
                    </p>
                    <p className="text-[12px] text-muted-foreground leading-relaxed break-words">
                      Optional. Topic-analysis shares appear under{" "}
                      <strong className="text-foreground/85">Topics → Archived</strong>{" "}
                      (Commissioned). Deep-dive shares appear under{" "}
                      <strong className="text-foreground/85">
                        Library → Independently commissioned
                      </strong>
                      . Topic + report body only — no email or payment data.
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
                    </>
                  )}
                </div>
                {shareMsg && (
                  <p className="text-[12px] text-foreground/85 leading-snug" role="status">
                    {shareMsg}
                  </p>
                )}
              </section>
            }
          />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
