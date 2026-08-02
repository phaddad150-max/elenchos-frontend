import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, FlaskConical, Home, Loader2, Share2 } from "lucide-react";
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
            // Still try load by token (webhook may have won)
            if (fin.status !== 402) {
              /* continue */
            } else {
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

  return (
    <div className="page-shell dash-landing">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <SiteNav />
      <main className="max-w-[720px] mx-auto w-full px-3 sm:px-4 py-6 sm:py-8 mobile-safe-bottom relative flex-1">
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
          <article className="space-y-5">
            <header className="page-hero-banner p-4 sm:p-5 space-y-2">
              <p className="page-hero-kicker">
                <Share2 className="w-3.5 h-3.5" /> Your private report
              </p>
              <h1 className="page-hero-title text-[1.25rem] sm:text-xl">{report.title}</h1>
              <p className="text-[12px] font-mono text-muted-foreground break-all">
                Token · {report.token}
              </p>
              <p className="text-[12px] text-muted-foreground">{report.disclaimer}</p>
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

            {report.sections.map((s) => (
              <section
                key={s.heading}
                className="rounded-xl border border-border/90 bg-card/50 px-3.5 sm:px-4 py-3.5 space-y-2"
              >
                <h2 className="text-[13px] font-display font-semibold text-cyan">{s.heading}</h2>
                <ul className="space-y-1.5">
                  {s.body.map((line, i) => (
                    <li key={i} className="text-[13px] text-foreground/90 leading-relaxed">
                      {line}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <p className="text-[11px] font-mono text-muted-foreground">
              Save this URL — we do not store your email. Bookmark before closing.
            </p>
          </article>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
