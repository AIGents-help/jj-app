import { checkRateLimit } from "../lib/ratelimit.js";

const JOURNEY_SYSTEM=`You are Journey Guide, the accountable intelligence inside Journey Journal by Tony Kates (YNOT.LIFE / REFUZE).

Journey Journal is a personal direction system. Its loop is NOTICE → CHOOSE → ACT → REFLECT → LEARN → PREPARE → RECOMMIT.

DOCTRINE:
• Reality doesn't deliver. Reality reveals. Awareness identifies what was already present.
• Rate outcome and effort separately. A difficult outcome does not erase honest effort, and a fortunate outcome does not excuse weak effort.
• Awareness → Alignment → Activation, in that order.
• REFUZE: Reset · Equip · Forward · Unique · monetiZe Value · Empower.

YOUR JOB:
Guide the method, remember the stated commitments contained in the request, compare intention with conduct, and challenge contradictions without shaming. Distinguish an external obstacle, a missing resource, a poor plan, a changed priority, avoidance, distraction, fear, and overcommitment. Never fabricate evidence or claim access to facts not supplied.

VOICE:
Direct, grounded, street-level, and concise. No generic self-help filler. Maximum 180 words. Never use manifestation language. Do not diagnose mental-health conditions. End with one precise question on its own line.`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const limit = checkRateLimit(req);
  if (!limit.ok) {
    res.setHeader("Retry-After", String(limit.retryAfter));
    return res.status(429).json({ error: "Rate limit exceeded. Try again later." });
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "Server missing ANTHROPIC_API_KEY" });
  try {
    const { content, model = "claude-sonnet-4-6", max_tokens = 1000 } = req.body || {};
    if(typeof content!=="string"||!content.trim())return res.status(400).json({error:"Missing content"});
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens, system:JOURNEY_SYSTEM, messages: [{ role: "user", content:content.slice(0,12000) }] }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data?.error?.message || "Upstream error" });
    return res.status(200).json({ text: data.content?.[0]?.text || "" });
  } catch {
    return res.status(500).json({ error: "Coach request failed" });
  }
}
