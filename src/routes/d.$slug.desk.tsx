import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { UAE_DEMO_SLUG } from "@/lib/desk/catalog";

const slugRoute = getRouteApi("/d/$slug");

export const Route = createFileRoute("/d/$slug/desk")({
  component: TenantDeskPlansPage,
});

function TenantDeskPlansPage() {
  const { desk } = slugRoute.useLoaderData();
  if (!desk) return null;
  const uae = desk.tenant.slug === UAE_DEMO_SLUG || desk.tenant.email === "uae-demo@elenchos.live";
  if (uae) {
    return (
      <main className="max-w-[720px] mx-auto px-4 py-10 space-y-2">
        <p className="text-[14px] text-muted-foreground">This Solvo prototype has no public checkout.</p>
        <Link to="/solvocreations-uae" className="text-cyan hover:underline text-[13px]">
          Back to overview
        </Link>
      </main>
    );
  }
  return (
    <main className="max-w-[720px] mx-auto px-4 py-10 space-y-2">
      <p className="text-[14px] text-muted-foreground">Plans for this desk are not public.</p>
      <Link to="/d/$slug" params={{ slug: desk.tenant.slug || "" }} className="text-cyan hover:underline text-[13px]">
        Back to overview
      </Link>
    </main>
  );
}
