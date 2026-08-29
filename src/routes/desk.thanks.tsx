import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { DESK_DEMO_ORG, DESK_DEMO_TOKEN } from "@/lib/desk/catalog";

export const Route = createFileRoute("/desk/thanks")({
  validateSearch: (s: Record<string, unknown>): { session_id?: string; demo?: "1" } => {
    const out: { session_id?: string; demo?: "1" } = {};
    if (typeof s.session_id === "string" && s.session_id) out.session_id = s.session_id;
    if (s.demo === "1" || s.demo === true) out.demo = "1";
    return out;
  },
  component: DeskThanksPage,
});

function DeskThanksPage() {
  const { session_id: sessionId, demo } = Route.useSearch();
  const [state, setState] = useState<"wait" | "ok" | "err">(demo === "1" ? "ok" : "wait");
  const [token, setToken] = useState<string | null>(demo === "1" ? DESK_DEMO_TOKEN : null);
  const [org, setOrg] = useState(demo === "1" ? DESK_DEMO_ORG : "");

  useEffect(() => {
    if (demo === "1") {
      setToken(DESK_DEMO_TOKEN);
      setOrg(DESK_DEMO_ORG);
      setState("ok");
      return;
    }
    if (!sessionId) {
      setState("err");
      return;
    }
    let n = 0;
    const tick = async () => {
      const res = await fetch(`/api/desk/thanks?session_id=${encodeURIComponent(sessionId)}`);
      const data = (await res.json()) as { paid?: boolean; manageToken?: string; orgName?: string };
      if (data.paid && data.manageToken) {
        setToken(data.manageToken);
        setOrg(data.orgName || "");
        setState("ok");
        return true;
      }
      return false;
    };
    void tick();
    const id = window.setInterval(() => {
      n += 1;
      void tick().then((done) => {
        if (done || n > 20) {
          window.clearInterval(id);
          if (!token && n > 20) setState("err");
        }
      });
    }, 1500);
    return () => window.clearInterval(id);
  }, [sessionId, token, demo]);

  return (
    <div className="page-shell dash-landing">
      <SiteNav />
      <main className="max-w-[640px] mx-auto px-4 py-12 space-y-4 mobile-safe-bottom">
        {state === "wait" ? (
          <p className="inline-flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Confirming payment…
          </p>
        ) : null}
        {state === "ok" && token ? (
          <>
            <h1 className="page-hero-title text-2xl">Payment received</h1>
            {demo === "1" ? (
              <p className="text-[12px] font-mono uppercase tracking-[0.14em] text-amber-signal">
                Walkthrough · no card charged
              </p>
            ) : null}
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              {org ? `${org}: ` : ""}your desk tables exist. Next: brand it, pick topics, Generate
              the live URL. Scoring stays on Elenchos.
            </p>
            <Link
              to="/desk/studio"
              search={{ token }}
              className="inline-flex min-h-[44px] items-center justify-center px-5 rounded-full border border-cyan/50 bg-cyan/15 text-cyan font-display font-semibold"
            >
              Open studio
            </Link>
          </>
        ) : null}
        {state === "err" ? (
          <p className="text-[14px] text-muted-foreground">
            We could not match this session yet. If you paid, wait a minute and refresh, or contact us.
          </p>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
