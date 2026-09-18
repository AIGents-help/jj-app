// RevealCard.jsx
// The REVEAL intelligence surface inside Journey Journal.
//
// Renders in two layers:
//   1. Deterministic signals from revealSignals.js — instant, offline, never empty.
//   2. The AI reveal from /api/reveal — the Jeep Effect named back at the reader.
//
// The card is NEVER blocked on the API. Deterministic lines paint immediately;
// the AI headline slots in when it returns. If the API is down, the card still
// works. The AI reveal is cached once per day (journey:reveal:YYYY-MM-DD) so it
// reads like a daily artifact and protects the global rate limiter — "Look again"
// is a deliberate re-spend, not a refresh reflex.
//
// Tailwind classes assume your existing setup. Swap class names to match your
// design tokens; the structure is what matters.

import { useEffect, useState, useCallback } from "react";
import { computeSignals } from "../lib/revealSignals.js";

const REVEAL_KEY = "journey:reveal:";

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

export default function RevealCard() {
  const [signals, setSignals] = useState([]);
  const [digest, setDigest] = useState(null);
  const [reveals, setReveals] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [ready, setReady] = useState(false);

  // 1) deterministic layer — runs on mount, paints instantly
  useEffect(() => {
    const { signals, digest } = computeSignals();
    setSignals(signals);
    setDigest(digest);
    setReady(true);

    // 2) AI layer — use today's cache if present, else fetch once
    const cached = readCache();
    if (cached) {
      setReveals(cached);
      setStatus("done");
    } else if (digest && digest.daysLogged >= 3 && digest.signals.length > 0) {
      fetchReveal(digest);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReveal = useCallback(async (d) => {
    setStatus("loading");
    try {
      const res = await fetch("/api/reveal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ digest: d }),
      });
      const data = await res.json();
      const next = Array.isArray(data.reveals) ? data.reveals : [];
      setReveals(next);
      writeCache(next);
      setStatus("done");
    } catch {
      // Deterministic lines still carry the card — fail quiet.
      setStatus("error");
    }
  }, []);

  if (!ready) return null;

  const enoughRoad = digest && digest.daysLogged >= 3 && signals.length > 0;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <header className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
          What&rsquo;s revealing itself
        </h2>
        {enoughRoad && (
          <button
            onClick={() => digest && fetchReveal(digest)}
            disabled={status === "loading"}
            className="text-sm text-neutral-500 underline-offset-2 hover:text-neutral-800 hover:underline disabled:opacity-40 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            {status === "loading" ? "Looking\u2026" : "Look again"}
          </button>
        )}
      </header>

      {!enoughRoad ? (
        <EmptyState days={digest?.daysLogged ?? 0} />
      ) : (
        <div className="space-y-4">
          {/* AI reveal — the headline. Falls through silently if absent. */}
          {reveals.length > 0 && (
            <div className="space-y-3">
              {reveals.map((r, i) => (
                <AiReveal key={i} reveal={r} />
              ))}
            </div>
          )}
          {status === "loading" && reveals.length === 0 && (
            <p className="text-sm text-neutral-400">Reading the road behind you&hellip;</p>
          )}

          {/* Deterministic signal lines — always present, the floor under the AI */}
          <ul className="space-y-2.5 border-t border-neutral-100 pt-4 dark:border-neutral-800">
            {signals.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                <span aria-hidden className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                <span>{signalLine(s)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function AiReveal({ reveal }) {
  return (
    <div className="rounded-xl bg-orange-50 p-4 dark:bg-orange-950/30">
      {reveal.headline && (
        <p className="font-medium text-orange-900 dark:text-orange-200">{reveal.headline}</p>
      )}
      {reveal.body && (
        <p className="mt-1.5 text-sm leading-relaxed text-orange-950/80 dark:text-orange-100/80">
          {reveal.body}
        </p>
      )}
      {reveal.question && (
        <p className="mt-2 text-sm font-medium italic text-orange-900 dark:text-orange-200">
          {reveal.question}
        </p>
      )}
    </div>
  );
}

function EmptyState({ days }) {
  return (
    <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
      {days <= 1
        ? "Day 1. The road\u2019s still empty."
        : `${days} days in. Not enough road yet.`}{" "}
      Keep logging \u2014 the Jeeps show up once there&rsquo;s something to see&hellip;
    </p>
  );
}

// ── doctrine-voiced deterministic lines (no AI) ──────────────────────────
// These pass VOICE-AND-LANGUAGE.md: inversion, question-as-weapon, trailing
// ellipsis, no manifestation vocab, no hedging. They are the card's floor.
function signalLine(s) {
  const f = s.facts || {};
  switch (s.kind) {
    case "activation-break": {
      const what = f.repeats?.[0] || f.sample?.[f.sample.length - 1]?.text;
      return what
        ? `You set \u201C${what}\u201D and walked past it. ${f.count} times you set, didn\u2019t start. Limbo is a decision too\u2026`
        : `${f.count} times you set a Top 3 and let it sit. Set it or drop it \u2014 limbo is a decision too\u2026`;
    }
    case "alignment-break":
      return `${f.count} mornings you started blind \u2014 no direction set the night before. Align before you activate\u2026`;
    case "jeep":
      return `\u201C${f.token}\u201D keeps showing up. ${f.count} entries, never once moved on. The Jeeps were always on the road \u2014 what else are you blind to?`;
    case "conducive-streak":
      return `${f.streak} days running you set tomorrow before tomorrow arrived. That\u2019s soil, not luck\u2026`;
    case "fractal":
      return `Your wins cluster on your best-slept days \u2014 ${f.deltaPct} points higher. How you do the small thing is how you do the big one\u2026`;
    case "proof-of-possibility": {
      const d = f.earlyDoubt?.[0];
      return d
        ? `Day ${d.dayIndex} you named it \u201C${d.word}.\u201D Since then you\u2019ve closed ${f.totalCompleted}. The doubt was never the truth\u2026`
        : `You\u2019ve closed ${f.totalCompleted} since you started doubting. Proof was sitting in your own pages\u2026`;
    }
    default:
      return "";
  }
}

// ── per-day cache ────────────────────────────────────────────────────────
function readCache() {
  try {
    const raw = localStorage.getItem(REVEAL_KEY + todayYmd());
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.reveals) ? parsed.reveals : null;
  } catch {
    return null;
  }
}
function writeCache(reveals) {
  try {
    localStorage.setItem(REVEAL_KEY + todayYmd(), JSON.stringify({ reveals, ts: Date.now() }));
  } catch {
    /* storage full / unavailable — non-fatal */
  }
}
