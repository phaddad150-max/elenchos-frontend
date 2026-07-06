import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { useState } from "react";

export function TopicRequestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [topic, setTopic] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md grid place-items-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong rounded-3xl max-w-md w-full p-7 relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-display font-semibold mb-1">Request a topic</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Suggest a new topic for analysis. We review all requests and add popular ones as soon as we can.
            </p>
            {sent ? (
              <div className="text-sm text-emerald-signal py-6 text-center font-mono">
                ✓ Got it. We will review your suggestion and add it if there is enough public conversation to analyze.
              </div>
            ) : (
              <>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. ‘rural broadband subsidy’"
                  className="w-full bg-secondary/60 border border-border rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-colors"
                />
                <button
                  disabled={!topic.trim()}
                  onClick={() => {
                    setSent(true);
                    setTimeout(() => {
                      setSent(false);
                      setTopic("");
                      onClose();
                    }, 1600);
                  }}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-cyan text-primary-foreground font-medium py-3 rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                  Send suggestion
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
