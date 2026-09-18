# Journey Journal

A personal direction system built on the Journey Journal method and Kates Doctrine (REFUZE / YNOT.LIFE).

Journey is the product. Journey Journal is the method. REVEAL is the pattern intelligence. REFUZE is the doctrine.

The Vite + React PWA supports 1-, 7-, 30- and 90-day Journeys, guided Morning Direction and Evening Reckoning, an Outcome Letter, evidence-based objective review, voice entry and REVEAL pattern detection.

## Run locally
```
npm install
npm run dev
```

## Deploy (Vercel)
1. Import this repo at vercel.com
2. Framework auto-detects as Vite
3. Add an Environment Variable: ANTHROPIC_API_KEY = your key
4. Deploy

## Notes
- The AI coach calls /api/coach (serverless). The API key never reaches the browser.
- Add icon-192.png and icon-512.png to the repo root for the PWA install icon.
