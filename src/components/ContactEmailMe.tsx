import { useState, type FormEvent } from "react";
import { Mail, Loader2, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ELENCHOS_CONTACT_CTA,
  ELENCHOS_X_HANDLE,
  ELENCHOS_X_URL,
  buildContactMailto,
} from "@/lib/contact";

type Variant = "link" | "button" | "inline";

interface Props {
  /** Context for subject line / analytics */
  source?: string;
  variant?: Variant;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Soft contact CTA — opens a message-style dialog.
 * Posts to /api/public/contact when Resend is configured; else mailto fallback.
 * Does not display the raw inbox address in page chrome.
 */
export function ContactEmailMe({
  source = "site",
  variant = "link",
  className = "",
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [statusText, setStatusText] = useState("");

  const reset = () => {
    setName("");
    setEmail("");
    setMessage("");
    setHoneypot("");
    setStatus("idle");
    setStatusText("");
  };

  const triggerClass =
    variant === "button"
      ? `inline-flex items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/10 text-cyan hover:bg-cyan/20 px-3.5 py-2 text-[12px] font-medium transition-colors ${className}`
      : variant === "inline"
        ? `text-cyan hover:underline font-medium ${className}`
        : `text-cyan hover:underline ${className}`;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (honeypot.trim()) {
      // Bot trap — fake success
      setStatus("ok");
      setStatusText("Message sent. Thank you.");
      return;
    }
    const msg = message.trim();
    if (msg.length < 3) {
      setStatus("err");
      setStatusText("Please write a short message.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus("err");
      setStatusText("A valid reply email helps us respond.");
      return;
    }

    setBusy(true);
    setStatus("idle");
    setStatusText("");
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: msg,
          source,
          website: honeypot, // honeypot field
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fallbackMailto?: boolean;
      };

      if (res.ok && data.ok) {
        setStatus("ok");
        setStatusText("Message sent. We’ll get back to you when we can.");
        setMessage("");
        return;
      }

      // Server asks client to use mail app
      if (data.fallbackMailto || res.status === 503) {
        const href = buildContactMailto({
          name: name.trim(),
          fromEmail: email.trim(),
          message: msg,
          source,
        });
        window.location.href = href;
        setStatus("ok");
        setStatusText("Opening your email app… If nothing opens, try again or message us on X.");
        return;
      }

      setStatus("err");
      setStatusText(data.error || "Could not send. Try again or message us on X.");
    } catch {
      const href = buildContactMailto({
        name: name.trim(),
        fromEmail: email.trim(),
        message: msg,
        source,
      });
      window.location.href = href;
      setStatus("ok");
      setStatusText("Opening your email app as a fallback…");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <button type="button" className={triggerClass}>
          {children ?? (
            <>
              <Mail className="w-3.5 h-3.5 inline-block mr-1 align-[-2px]" aria-hidden />
              {ELENCHOS_CONTACT_CTA}
            </>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-border bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Email me</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
            Corrections, privacy rights, challenges, or a short note. We read every
            message. This is a small independent project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-3 pt-1">
          {/* Honeypot — hidden from humans */}
          <div className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden" aria-hidden>
            <label>
              Website
              <input
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Your name <span className="normal-case tracking-normal">(optional)</span>
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-cyan/40"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Your email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={200}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-cyan/40"
              placeholder="you@example.com"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Message
            </span>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={4000}
              rows={5}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-cyan/40 resize-y min-h-[120px]"
              placeholder="How can we help?"
            />
          </label>

          {statusText ? (
            <p
              className={`text-[12px] leading-snug ${
                status === "err" ? "text-rose-signal" : "text-emerald-signal"
              }`}
              role="status"
            >
              {statusText}
            </p>
          ) : null}

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan/45 bg-cyan/15 text-cyan hover:bg-cyan/25 px-4 py-2.5 text-[13px] font-medium disabled:opacity-50 min-h-[44px] touch-manipulation"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Send message
            </button>
            <a
              href={ELENCHOS_X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-[12px] font-mono text-muted-foreground hover:text-cyan min-h-[44px] px-2"
            >
              {ELENCHOS_X_HANDLE}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
