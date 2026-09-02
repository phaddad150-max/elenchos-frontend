export function BrandEyeLockup({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 min-w-0 ${className}`}>
      <img
        src="/brand/brandeye-mark.jpg"
        alt=""
        className="h-9 w-9 rounded-lg object-cover border border-cyan/25 shrink-0"
      />
      <span className="flex flex-col leading-none min-w-0">
        <span className="text-[1.05rem] font-display font-semibold tracking-tight text-foreground">
          BrandEye
        </span>
        <span className="hidden sm:block text-[9px] font-mono uppercase tracking-[0.16em] text-muted-foreground mt-0.5">
          UAE public discourse
        </span>
      </span>
    </span>
  );
}
