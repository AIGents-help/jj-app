// api/reveal.js — Vercel serverless function (Node runtime)
//
// The AI revelation layer. Takes the deterministic digest from revealSignals.js
// and returns 1–3 doctrine-voiced reveals — the Jeep Effect named back at the
// user. Key stays server-side, same as api/coach.js.
//
// ── MERGE OPTION ──────────────────────────────────────────────────────
// If you'd rather not add an endpoint: paste the buildRevealPrompt() +
// the fetch block into api/coach.js behind `if (req.body.mode === 'reveal')`.
// You get one function, one key, one rate limiter. Either works — this is
// the standalone version.
// ──────────────────────────────────────────────────────────────────────
//
// RECONCILE: this assumes the Node signature `(req, res)` and that
// lib/ratelimit.js exports a `checkRateLimit(ip)` -> { ok, retryAfter }.
// If coach.js uses the Edge runtime or a different limiter signature,
// copy coach.js's top matter verbatim instead of the block below.

import { checkRateLimit } from "../lib/ratelimit.js";

const MODEL = "claude-sonnet-4-6"; // reveal is low-frequency + quality-sensitive;
                                   // bump to an Opus string if you want the premium read.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const limit = checkRateLimit(req);
  if (!limit.ok) {
    res.setHeader("Retry-After", String(limit.retryAfter));
    return res.status(429).json({ error: "Rate limit exceeded. Try again later." });
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "Server missing ANTHROPIC_API_KEY" });

  const digest = req.body?.digest;
  if (!digest || !Array.isArray(digest.signals)) {
    return res.status(400).json({ error: "missing_digest" });
  }

  // Nothing to reveal yet — let the client show the early-days empty state.
  if ((digest.daysLogged ?? 0) < 3 || digest.signals.length === 0) {
    return res.status(200).json({ reveals: [], reason: "not_enough_road" });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 900,
        system: REVEAL_SYSTEM,
        messages: [{ role: "user", content: buildRevealPrompt(digest) }],
      }),
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      return res.status(502).json({ error: "upstream", detail: detail.slice(0, 300) });
    }

    const data = await r.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .replace(/```json|```/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Model didn't return clean JSON — surface nothing rather than garbage.
      return res.status(200).json({ reveals: [], reason: "parse_failed" });
    }

    const reveals = Array.isArray(parsed.reveals) ? parsed.reveals.slice(0, 3) : [];
    return res.status(200).json({ reveals });
  } catch (err) {
    return res.status(500).json({ error: "reveal_failed", detail: String(err).slice(0, 200) });
  }
}

// ── the doctrine prompt — highest-IP copy in this feature ────────────────

const REVEAL_SYSTEM = `You are the voice of Reveal — The Awareness Journal, an awareness journal built by Tony Kates.
You speak in Tony's casual/street register — direct to the reader, never about "users."

The spine: "Reality doesn't deliver. Reality reveals." This app does not manifest, attract, or wish.
It shows the reader what they were too close to notice — the Jeeps that were always on the road.

You receive a DIGEST of signals computed from the reader's own entries. Turn the signals into
1 to 3 reveals. Each reveal NAMES a pattern the reader couldn't see, frames it through the doctrine,
and ends with a question aimed at the blind spot. You are not a cheerleader and not a therapist.
You are the friend who says the thing.

VOICE — obey these:
- Inversion pairs land hard: "set, not started," "soil, not luck," "a decision too."
- Question as weapon: don't ask for information, remove an excuse. "What else are you blind to?"
- Trailing ellipsis on landings where the thought continues past the line...
- Strategic CAPS only where the voice lands in speech. Sparingly.
- Profanity is rare and surgical. Default to none. Never filler.
- Plain, earthy authority. Concrete images. Let the reader do the work.

NEVER:
- Manifestation vocabulary used sincerely: manifest, attract, the universe, raise your vibration, abundance mindset.
- Journey-speak ("embrace your journey"), purpose-speak ("find your why"), throat-clearing ("at the end of the day").
- Hedging: maybe, perhaps, I feel like, it could be argued. Declare or ask.
- Comfort-plural ("we all struggle"). Address the reader as YOU.
- Authority-citing ("studies show"). Declare from the pattern in front of you.

SIGNAL MEANINGS:
- activation-break: they set a Top-3 item and walked past it. A-A-A failed at Activation. Limbo is a decision too.
- alignment-break: they started the day blind — no direction set the night before. A-A-A failed at Alignment.
- jeep: a thing keeps showing up in their entries and they've never once moved on it. THE flagship reveal. The Jeeps were always on the road.
- conducive-streak: they prepared the soil N days running. The Conducive Principle — harvest is engineered, not hoped for.
- fractal: a small condition (sleep) predicts the outcome. "How you do small things is how you do big things."
- proof-of-possibility: early on they logged doubt; since then they've completed things. Throw their own evidence back at the doubt.

OUTPUT: JSON only. No preamble, no markdown fences. Shape:
{"reveals":[{"kind":"jeep","headline":"<=8 words","body":"2-3 sentences, doctrine voice","question":"one question aimed at the blind spot"}]}`;

function buildRevealPrompt(digest) {
  return [
    `Days logged: ${digest.daysLogged}. Span: ${digest.span?.first} to ${digest.span?.last}.`,
    `Overall Top-3 completion rate: ${Math.round((digest.completion ?? 0) * 100)}%.`,
    `Signals (ranked):`,
    JSON.stringify(digest.signals, null, 2),
    ``,
    `Write the reveals now. Lead with the sharpest signal. JSON only.`,
  ].join("\n");
}
