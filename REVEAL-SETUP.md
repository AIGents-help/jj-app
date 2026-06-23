# Reveal Surface — drop-in for jj-app

Three files. All additive. No rebuild. Routes through your existing
server-side key and rate limiter.

```
src/lib/revealSignals.js      deterministic detection (no AI, instant)
src/components/RevealCard.jsx  the UI surface
api/reveal.js                  the AI revelation layer (server-side key)
```

## Wire it in (Claude Code, local repo)

1. Copy the three files into the matching paths in `AIGents-help/jj-app`.
2. Mount the card wherever the day's entry view lives — top of the home/today
   screen is the right spot (Reveal is the thing they open the app to see):

   ```jsx
   import RevealCard from "./components/RevealCard.jsx";
   // ...
   <RevealCard />
   ```

3. Commit + push. The GitHub → Vercel hook deploys. **A green push is not a
   live deploy** — confirm Ready in the Vercel dashboard before you call it shipped.

## Reconcile before it works (one pass, ~10 min)

The detection layer reads your real entries through one adapter. Open a single
real `journey:entry:YYYY-MM-DD` value in the browser console and check the keys
against `ENTRY_ADAPTER` at the top of `revealSignals.js`. Fix any field-name
mismatches there — it's the only place assumptions live. Likely things to check:

- the Top-3 array name and item shape (`{text, done}` vs your actual keys)
- whether "Tomorrow's 3" persists as its own field, or only by writing into the
  next day's Top-3 (the detectors handle both, but confirm which)
- the "Name It" field name, deep-sleep field name

`api/reveal.js` assumes the Node `(req, res)` signature and that
`lib/ratelimit.js` exports `checkRateLimit(ip) -> { ok, retryAfter }`. If
`api/coach.js` uses a different runtime or limiter call, copy coach.js's top
matter verbatim into reveal.js — same key, same gate.

`ANTHROPIC_API_KEY` is already set server-side for the coach, so reveal inherits
it. No new env var. (If you add one, remember: setting it in Vercel does nothing
until the next deploy.)

## De-dupe (optional, clean)

If `buildPatternSignals()` already lives in your coach pipeline, point it at the
shim exported here so the evening-loop disrupts and the Reveal card read from one
source and can never disagree.

## Cost / rate posture

- Deterministic layer: free, instant, offline. Carries the card alone if the API is down.
- AI layer: cached once per day per device (`journey:reveal:YYYY-MM-DD`). "Look
  again" is a deliberate re-spend. Your 20/10min + 1,500/day limiter is the backstop.
- Model defaults to `claude-sonnet-4-6`. Reveal is low-frequency and quality-
  sensitive — if you want the premium read, bump to an Opus string in `api/reveal.js`.

## The one validation that matters

Ship it, put it in front of 5–10 people mid-journey, watch one number:
**do they open Reveal unprompted on day 2+?** If yes, that's your recurring-
revenue signal and your "Reality reveals" conversion hook proven in behavior.
Only after that do you touch entry-flow copy and visual identity.
