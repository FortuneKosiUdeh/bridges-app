# Bridges — demo

This is a minimal Next.js scaffold for the Bridges app (Lawrence & Andover community events).

## Run locally
1. Install:
   npm install

2. Start dev:
   npm run dev
   Open http://localhost:3000

## Environment variables (for optional features)
- NEXT_PUBLIC_MAPBOX_TOKEN (Mapbox)
- OPENAI_API_KEY (for /api/translate)
- NEXTAUTH_SECRET (if you add real auth later)

## Deploy to Vercel
1. Push repo to GitHub.
2. Sign into Vercel → New Project → import repo.
3. Set env vars in Vercel dashboard (NEXT_PUBLIC_MAPBOX_TOKEN, OPENAI_API_KEY if used).
4. Deploy — Vercel auto-deploys on pushes.

Notes:
- The demo uses `public/events.json` as static source and `pages/api/events` returns it.
- Profiles, badges, and check-ins are stored in browser `localStorage` for MVP.
