import { Link } from "@tanstack/react-router";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { solvoTopicById, type SolvoTopic } from "@/lib/desk/solvo-topics";
import { sentimentTone } from "@/lib/score-colors";

export function SolvoTopicView({ topicId }: { topicId: string }) {
  const topic = solvoTopicById(topicId);
  if (!topic) {
    return (
      <main className="max-w-[860px] mx-auto px-4 py-10 space-y-3">
        <p className="text-[14px] text-muted-foreground">Topic not on this desk.</p>
        <Link to="/solvocreations-uae/research" className="text-cyan hover:underline text-[13px]">
          Back to Research
        </Link>
      </main>
    );
  }
  const tone = sentimentTone(topic.score, topic.label);
  return (
    <main className="max-w-[860px] mx-auto w-full px-3 sm:px-4 md:px-6 py-5 sm:py-8 space-y-5 mobile-safe-bottom">
      <Link
        to="/solvocreations-uae/research"
        className="inline-flex items-center gap-1.5 text-[13px] text-cyan hover:underline min-h-[36px]"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Research
      </Link>
      <aside className="rounded-2xl border border-amber-signal/45 bg-amber-signal/[0.12] px-4 py-3 flex items-start gap-2">
        <FlaskConical className="w-4 h-4 text-amber-signal shrink-0 mt-0.5" />
        <p className="text-[13px] text-foreground/90 leading-snug">
          Simulated briefing · not live X. Nine questions, same Socratic panel structure as
          elenchos.live topics.
        </p>
      </aside>
      <header className="space-y-2">
        <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-cyan">
          {topic.group} · {topic.audience}
        </p>
        <h1 className="page-hero-title text-[1.55rem] sm:text-3xl">{topic.name}</h1>
        <p className="text-[14px] text-muted-foreground max-w-2xl leading-relaxed">{topic.blurb}</p>
        <p className="text-[2rem] font-display font-semibold tabular-nums" style={{ color: tone.color }}>
          {topic.score}
          <span className="ml-2 text-[12px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
            {topic.label}
          </span>
        </p>
        <p className="text-[12px] font-mono text-muted-foreground">
          n={topic.sample} · official gap {topic.divergence} · simulated
        </p>
      </header>
      <ol className="space-y-3">
        {topic.questions.map((item, i) => (
          <QuestionPanel key={item.q} index={i + 1} item={item} />
        ))}
      </ol>
    </main>
  );
}

function QuestionPanel({
  index,
  item,
}: {
  index: number;
  item: SolvoTopic["questions"][number];
}) {
  const tone = sentimentTone(item.score, item.label);
  return (
    <li className="dash-panel p-4 sm:p-5 space-y-2.5">
      <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-cyan">
        Question {index} of 9
      </p>
      <h2 className="font-display font-semibold text-[16px] leading-snug">{item.cardTitle}</h2>
      <p className="text-[13.5px] text-foreground/90 leading-relaxed">{item.q}</p>
      <p className="text-[13px] text-muted-foreground leading-relaxed">{item.answer}</p>
      <ul className="text-[12.5px] text-muted-foreground space-y-1">
        {item.keyPoints.map((p) => (
          <li key={p}>· {p}</li>
        ))}
      </ul>
      <p className="text-[1.15rem] font-display font-semibold tabular-nums" style={{ color: tone.color }}>
        {item.score}
        <span className="ml-2 text-[11px] font-mono uppercase text-muted-foreground">{item.label}</span>
      </p>
    </li>
  );
}
