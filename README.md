# The 1 Month Journey

An Awareness Journal built on the Kates Doctrine (REFUZE / YNOT.LIFE).
Vite + React PWA with an AI Awareness Coach.

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
