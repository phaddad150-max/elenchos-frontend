import { createFileRoute, Link, getRouteApi } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SolvoPlans } from "@/components/desk/SolvoPlans";

const parentRoute = getRouteApi("/publiceye-uae");

export const Route = createFileRoute("/publiceye-uae/desk")({
  validateSearch: (s: Record<string, unknown>): { cancelled?: "1" } =>
    s.cancelled === "1" || s.cancelled === true ? { cancelled: "1" } : {},
  component: PublicEyeDeskPage,
});

function PublicEyeDeskPage() {
  const { desk } = parentRoute.useLoaderData();
  const search = Route.useSearch();
  if (!desk) return null;
  return (
    <main className="max-w-[720px] mx-auto w-full px-3 sm:px-4 md:px-6 py-6 sm:py-10 space-y-8 mobile-safe-bottom">
      <header className="space-y-3 text-center">
        <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-cyan">BrandEye · UAE</p>
        <h1 className="page-hero-title text-[1.6rem] sm:text-[2rem] leading-tight">
          Public discourse for young operators
        </h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-xl mx-auto">
          Freelancers, founders, marketers, consultants. A live desk only opens after payment.
          Checkout is limited to the operator email.
        </p>
      </header>
      <Link
        to="/publiceye-uae"
        className="inline-flex items-center justify-center gap-1 text-[13px] text-cyan"
      >
        Back to dashboard <ArrowRight className="w-3.5 h-3.5" />
      </Link>
      {search.cancelled ? (
        <p className="text-[13px] text-amber-signal text-center">Checkout cancelled. Pick a plan below.</p>
      ) : null}
      <SolvoPlans market="publiceye" />
    </main>
  );
}
