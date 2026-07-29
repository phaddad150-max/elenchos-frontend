import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ELENCHOS_CONTACT_EMAIL, ELENCHOS_CONTACT_MAILTO } from "@/lib/contact";
import "./gap-runner.css";

type Phase = "title" | "playing" | "quiz" | "over";
type EntKind = "citizen" | "official" | "noise";

type Entity = {
  id: number;
  kind: EntKind;
  lane: number;
  x: number;
  y: number;
  r: number;
};

type Quiz = {
  q: string;
  options: { label: string; correct: boolean }[];
};

const W = 960;
const H = 540;
const LANES = 3;
const LANE_Y = [H * 0.28, H * 0.5, H * 0.72];
const ROUND_MS = 55_000;
const MAX_HITS = 3;

const QUIZZES: Quiz[] = [
  {
    q: "Citizen posts cheer a tech partnership. Media calls it “reckless power grab.” What’s the Elenchos move?",
    options: [
      { label: "Call it proven truth either way", correct: false },
      { label: "Flag a narrative gap — sample citizens vs media frames", correct: true },
      { label: "Ignore citizens; trust the headline", correct: false },
    ],
  },
  {
    q: "Your X sample is tiny (n≈0). What should scores claim?",
    options: [
      { label: "Strong national consensus", correct: false },
      { label: "Not enough data — don’t invent certainty", correct: true },
      { label: "Whatever Grok “feels” is true", correct: false },
    ],
  },
  {
    q: "Data, not dogma means…",
    options: [
      { label: "Public samples + method over vibes", correct: true },
      { label: "Never question official lines", correct: false },
      { label: "Games replace real analysis", correct: false },
    ],
  },
  {
    q: "High-scrutiny state/media holograms in the fog are best treated as…",
    options: [
      { label: "Sole factual spine", correct: false },
      { label: "Frames to triangulate — not swallow whole", correct: true },
      { label: "Always illegal to read", correct: false },
    ],
  },
];

const TOPICS = [
  { id: "commercial-space-race", label: "Commercial Space Race" },
  { id: "global-ai-race", label: "Global AI Race" },
  { id: "eastern-mediterranean-alliance", label: "East Med Alliance" },
  { id: "elon-musk-public-voices", label: "Public Voices on Elon Musk" },
];

function isDesktopViewport() {
  if (typeof window === "undefined") return true;
  const wide = window.innerWidth >= 900;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;
  // Desktop-first: require width + prefer fine pointer (mouse)
  return wide && (fine || !coarse);
}

export function GapRunnerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [desktop, setDesktop] = useState(true);
  const [phase, setPhase] = useState<Phase>("title");
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [signals, setSignals] = useState(0);
  const [gapsCaught, setGapsCaught] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_MS);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [tip, setTip] = useState("Socrates: Collect cyan citizen signals. Avoid rose noise fog.");
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const stateRef = useRef({
    running: false,
    lane: 1,
    ents: [] as Entity[],
    nextId: 1,
    spawnAcc: 0,
    quizAcc: 0,
    score: 0,
    hits: 0,
    signals: 0,
    gaps: 0,
    started: 0,
    keys: new Set<string>(),
  });

  useEffect(() => {
    const check = () => setDesktop(isDesktopViewport());
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const endRound = useCallback(() => {
    const s = stateRef.current;
    s.running = false;
    setScore(s.score);
    setHits(s.hits);
    setSignals(s.signals);
    setGapsCaught(s.gaps);
    setPhase("over");
  }, []);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.running = true;
    s.lane = 1;
    s.ents = [];
    s.nextId = 1;
    s.spawnAcc = 0;
    s.quizAcc = 0;
    s.score = 0;
    s.hits = 0;
    s.signals = 0;
    s.gaps = 0;
    s.started = performance.now();
    setScore(0);
    setHits(0);
    setSignals(0);
    setGapsCaught(0);
    setTimeLeft(ROUND_MS);
    setQuiz(null);
    setQuizFeedback(null);
    setTip("Socrates: Cyan = citizen pulse. Rose fog = noise. Amber = official line.");
    setPhase("playing");
  }, []);

  const openQuiz = useCallback(() => {
    const s = stateRef.current;
    s.running = false;
    const q = QUIZZES[Math.floor(Math.random() * QUIZZES.length)];
    setQuiz(q);
    setQuizFeedback(null);
    setPhase("quiz");
    setTip("Socrates: Pause. Check the gap before you run again.");
  }, []);

  const answerQuiz = useCallback(
    (correct: boolean) => {
      const s = stateRef.current;
      if (correct) {
        s.score += 25;
        s.gaps += 1;
        setQuizFeedback("Gap spotted. Data, not dogma.");
        setTip("Socrates: Good. Method over vibes.");
      } else {
        setQuizFeedback("Not quite — re-read the method: sample first, claim later.");
        setTip("Socrates: Insufficient certainty is still a valid answer.");
      }
      setScore(s.score);
      setGapsCaught(s.gaps);
      setTimeout(() => {
        setQuiz(null);
        setQuizFeedback(null);
        if (s.hits >= MAX_HITS || performance.now() - s.started >= ROUND_MS) {
          endRound();
          return;
        }
        s.running = true;
        s.quizAcc = 0;
        setPhase("playing");
      }, 1100);
    },
    [endRound],
  );

  // Keyboard
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      s.keys.add(e.key.toLowerCase());
      if (phase !== "playing") return;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        s.lane = Math.max(0, s.lane - 1);
        e.preventDefault();
      }
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        s.lane = Math.min(LANES - 1, s.lane + 1);
        e.preventDefault();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      stateRef.current.keys.delete(e.key.toLowerCase());
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [phase]);

  // Game loop
  useEffect(() => {
    if (phase !== "playing" && phase !== "quiz") return;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = stateRef.current;
      const canvas = canvasRef.current;
      if (!canvas) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        raf = requestAnimationFrame(tick);
        return;
      }

      if (s.running) {
        const elapsed = now - s.started;
        setTimeLeft(Math.max(0, ROUND_MS - elapsed));
        if (elapsed >= ROUND_MS) {
          endRound();
        }

        s.spawnAcc += dt;
        const spawnEvery = Math.max(0.45, 0.95 - elapsed / 80_000);
        if (s.spawnAcc >= spawnEvery) {
          s.spawnAcc = 0;
          const roll = Math.random();
          const kind: EntKind =
            roll < 0.42 ? "citizen" : roll < 0.62 ? "official" : "noise";
          s.ents.push({
            id: s.nextId++,
            kind,
            lane: Math.floor(Math.random() * LANES),
            x: W + 30,
            y: LANE_Y[Math.floor(Math.random() * LANES)],
            r: kind === "noise" ? 22 : 16,
          });
          // fix y to lane
          const e = s.ents[s.ents.length - 1];
          e.y = LANE_Y[e.lane];
        }

        s.quizAcc += dt;
        if (s.quizAcc > 18 && s.signals + s.gaps > 2) {
          s.quizAcc = 0;
          openQuiz();
        }

        const speed = 180 + elapsed / 400;
        const px = 110;
        const py = LANE_Y[s.lane];

        for (const e of s.ents) {
          e.x -= speed * dt;
        }

        // collisions
        const next: Entity[] = [];
        for (const e of s.ents) {
          if (e.x < -40) continue;
          const dy = Math.abs(e.y - py);
          const dx = Math.abs(e.x - px);
          if (dx < 36 && dy < 34) {
            if (e.kind === "citizen") {
              s.score += 10;
              s.signals += 1;
              setTip("Citizen signal logged. Pulse +10.");
            } else if (e.kind === "official") {
              s.score += 5;
              setTip("Official line noted — compare to the square later.");
            } else {
              s.hits += 1;
              s.score = Math.max(0, s.score - 8);
              setTip("Noise fog hit. Don’t swallow the frame unexamined.");
              if (s.hits >= MAX_HITS) {
                setScore(s.score);
                setHits(s.hits);
                setSignals(s.signals);
                endRound();
              }
            }
            setScore(s.score);
            setHits(s.hits);
            setSignals(s.signals);
            continue;
          }
          next.push(e);
        }
        s.ents = next;
      }

      // Draw
      ctx.clearRect(0, 0, W, H);
      // starfield
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#050a14");
      g.addColorStop(1, "#0B1220");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(34,211,238,0.15)";
      for (let i = 0; i < 60; i++) {
        const sx = (i * 97 + (s.started % 1000) * 0.02) % W;
        const sy = (i * 53) % H;
        ctx.fillRect(sx, sy, 2, 2);
      }

      // lanes
      for (let i = 0; i < LANES; i++) {
        ctx.strokeStyle = "rgba(34,211,238,0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, LANE_Y[i]);
        ctx.lineTo(W, LANE_Y[i]);
        ctx.stroke();
      }

      // hologram frame
      ctx.strokeStyle = "rgba(34,211,238,0.35)";
      ctx.lineWidth = 2;
      ctx.strokeRect(16, 16, W - 32, H - 32);
      ctx.font = "600 12px ui-monospace, monospace";
      ctx.fillStyle = "#22D3EE";
      ctx.fillText("elenchos.live · GapRunner · data not dogma", 28, 40);

      // entities
      for (const e of s.ents) {
        if (e.kind === "citizen") {
          ctx.fillStyle = "#22D3EE";
          ctx.shadowColor = "#22D3EE";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#0B1220";
          ctx.font = "bold 10px sans-serif";
          ctx.fillText("C", e.x - 4, e.y + 3);
        } else if (e.kind === "official") {
          ctx.fillStyle = "#F59E0B";
          ctx.shadowColor = "#F59E0B";
          ctx.shadowBlur = 10;
          roundRect(ctx, e.x - 18, e.y - 12, 36, 24, 6);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#0B1220";
          ctx.font = "bold 9px sans-serif";
          ctx.fillText("OFF", e.x - 10, e.y + 3);
        } else {
          ctx.fillStyle = "rgba(244,63,94,0.55)";
          ctx.shadowColor = "#F43F5E";
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.ellipse(e.x, e.y, e.r * 1.4, e.r, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // player — stylized Analyst (blonde bob + glasses jacket)
      const px = 110;
      const py = LANE_Y[s.lane];
      drawAnalyst(ctx, px, py);

      // HUD chips
      ctx.fillStyle = "rgba(18,26,43,0.85)";
      roundRect(ctx, W - 210, 24, 180, 72, 10);
      ctx.fill();
      ctx.fillStyle = "#22D3EE";
      ctx.font = "600 11px ui-monospace, monospace";
      ctx.fillText(`SCORE  ${s.score}`, W - 192, 48);
      ctx.fillStyle = "#94A3B8";
      ctx.fillText(`signals ${s.signals} · hits ${s.hits}/${MAX_HITS}`, W - 192, 68);
      const secs = Math.ceil(Math.max(0, ROUND_MS - (now - s.started)) / 1000);
      ctx.fillStyle = "#F8FAFC";
      ctx.fillText(`time ${secs}s`, W - 192, 86);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, endRound, openQuiz]);

  if (!desktop) {
    return (
      <div className="gr-shell gr-mobile-block">
        <div className="gr-panel">
          <p className="gr-kicker">GapRunner</p>
          <h1 className="gr-title">Desktop only</h1>
          <p className="gr-body">
            GapRunner is built for desktop browsers (keyboard + wide screen). Open{" "}
            <strong>elenchos.live/gap-runner</strong> on a computer to play.
          </p>
          <p className="gr-body gr-muted">
            Same cast as @elenchospulse · awareness game · not a fact-check court.
          </p>
          <div className="gr-actions">
            <Link to="/topics" className="gr-btn gr-btn-primary">
              Live Topics instead
            </Link>
            <a href={ELENCHOS_CONTACT_MAILTO} className="gr-link">
              {ELENCHOS_CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gr-shell">
      <div className="gr-layout">
        <aside className="gr-cast">
          <img
            src="/gap-runner/cast-dashboard.jpg"
            alt="Elenchos Analyst and Socrates — same cast as @elenchospulse"
            className="gr-cast-img"
          />
          <p className="gr-cast-cap">
            Cast locked from @elenchospulse · Analyst + Socrates · cyan holograms
          </p>
        </aside>

        <div className="gr-main">
          <header className="gr-header">
            <div>
              <p className="gr-kicker">elenchos.live · awareness mini-game</p>
              <h1 className="gr-title">GapRunner</h1>
            </div>
            <div className="gr-header-meta">
              <span>Desktop</span>
              <span>Data, not dogma</span>
            </div>
          </header>

          <div className="gr-stage-wrap">
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="gr-canvas"
              aria-label="GapRunner playfield"
            />

            {phase === "title" && (
              <div className="gr-overlay">
                <h2>Spot the gap. Don’t swallow the noise.</h2>
                <p>
                  Move with <kbd>↑</kbd> <kbd>↓</kbd> or <kbd>W</kbd> <kbd>S</kbd>. Collect{" "}
                  <span className="gr-cyan">citizen signals</span>, note{" "}
                  <span className="gr-amber">official lines</span>, dodge{" "}
                  <span className="gr-rose">noise fog</span>. Socrates will pause you for gap
                  checks.
                </p>
                <button type="button" className="gr-btn gr-btn-primary" onClick={startGame}>
                  Start run
                </button>
                <p className="gr-fine">
                  Entertainment / education only — not legal fact-checks. Real analysis lives on
                  Topics.
                </p>
              </div>
            )}

            {phase === "quiz" && quiz && (
              <div className="gr-overlay gr-quiz">
                <p className="gr-kicker">Gap check · Socrates</p>
                <h2>{quiz.q}</h2>
                <div className="gr-quiz-opts">
                  {quiz.options.map((o) => (
                    <button
                      key={o.label}
                      type="button"
                      className="gr-btn gr-btn-ghost"
                      disabled={!!quizFeedback}
                      onClick={() => answerQuiz(o.correct)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                {quizFeedback && <p className="gr-feedback">{quizFeedback}</p>}
              </div>
            )}

            {phase === "over" && (
              <div className="gr-overlay">
                <h2>Run complete</h2>
                <p className="gr-scoreline">
                  Score <strong>{score}</strong> · signals {signals} · gaps caught {gapsCaught} ·
                  hits {hits}
                </p>
                <p>
                  Fun is over — method continues. See live citizen vs official/media analysis:
                </p>
                <div className="gr-topic-links">
                  {TOPICS.map((t) => (
                    <Link key={t.id} to="/topics/$topicId" params={{ topicId: t.id }} className="gr-btn gr-btn-ghost">
                      {t.label}
                    </Link>
                  ))}
                </div>
                <div className="gr-actions">
                  <button type="button" className="gr-btn gr-btn-primary" onClick={startGame}>
                    Run again
                  </button>
                  <Link to="/topics" className="gr-btn gr-btn-ghost">
                    All Topics
                  </Link>
                </div>
                <p className="gr-fine">
                  GapRunner does not verify news or judge real people. Contact:{" "}
                  <a href={ELENCHOS_CONTACT_MAILTO}>{ELENCHOS_CONTACT_EMAIL}</a>
                </p>
              </div>
            )}
          </div>

          <p className="gr-tip" role="status">
            {tip}
          </p>
          <p className="gr-fine gr-center">
            Human-managed · AI-assisted analysis on Topics ·{" "}
            <a href={ELENCHOS_CONTACT_MAILTO}>{ELENCHOS_CONTACT_EMAIL}</a> ·{" "}
            <Link to="/privacy">Privacy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawAnalyst(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // jacket body
  ctx.fillStyle = "#94A3B8";
  ctx.shadowColor = "#22D3EE";
  ctx.shadowBlur = 14;
  roundRect(ctx, x - 18, y - 8, 36, 40, 10);
  ctx.fill();
  ctx.shadowBlur = 0;
  // head
  ctx.fillStyle = "#FDE68A";
  ctx.beginPath();
  ctx.arc(x, y - 22, 16, 0, Math.PI * 2);
  ctx.fill();
  // hair bob
  ctx.fillStyle = "#E8C547";
  ctx.beginPath();
  ctx.ellipse(x, y - 28, 18, 12, 0, Math.PI, 0);
  ctx.fill();
  // glasses
  ctx.strokeStyle = "#1E293B";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 12, y - 26, 10, 8);
  ctx.strokeRect(x + 2, y - 26, 10, 8);
  ctx.beginPath();
  ctx.moveTo(x - 2, y - 22);
  ctx.lineTo(x + 2, y - 22);
  ctx.stroke();
  // glow ring
  ctx.strokeStyle = "rgba(34,211,238,0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y + 4, 28, 0, Math.PI * 2);
  ctx.stroke();
}
