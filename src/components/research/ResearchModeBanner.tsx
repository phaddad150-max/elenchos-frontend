import { BookOpen, Layers } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function ResearchModeBanner({ message }: { message: string }) {
  return (
    <div
      className="rounded-xl border border-cyan/30 bg-cyan/5 px-3.5 py-2.5 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3"
      role="status"
    >
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <BookOpen className="w-4 h-4 text-cyan shrink-0 mt-0.5" aria-hidden />
        <p className="text-[12.5px] sm:text-[13px] text-foreground/90 leading-snug">{message}</p>
      </div>
      <Link
        to="/research/library"
        search={{ section: "topics" }}
        className="inline-flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-[0.14em] text-muted-foreground hover:text-cyan shrink-0 self-start sm:self-center"
      >
        <Layers className="w-3.5 h-3.5" aria-hidden />
        Library topics
      </Link>
    </div>
  );
}
