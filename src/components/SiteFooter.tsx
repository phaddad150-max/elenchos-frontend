export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-6 pb-20 md:pb-0">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 space-y-1.5 text-muted-foreground">
        <p className="text-[10px] sm:text-[11px] font-mono whitespace-nowrap overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <strong className="text-foreground/80">Disclaimer</strong>: Independent research project for testing purposes only. Experimental analysis of public discourse. Provided &ldquo;as is&rdquo; with no warranties. Not professional advice. Use at your own risk.
        </p>
        <p className="text-[10px] sm:text-[11px] font-mono whitespace-nowrap">&copy; 2026 Elenchos &bull; Independent Research Project</p>
      </div>
    </footer>
  );
}
