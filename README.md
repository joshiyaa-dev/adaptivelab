# 🧪 AdaptiLab — Adaptive Learning Platform

Courses that adjust to you. Every answer updates an **Elo-style mastery rating
per skill**; the engine then picks the next question from your personal
"productive struggle zone" (~62% expected success) while surfacing your weakest
skills first. Static Next.js app — fully offline, data in your browser.

## Courses bundled

- **Web Foundations** — HTML, CSS, HTTP, accessibility, security
- **JavaScript Deep Dive** — basics → closures → event loop
- **Python for Programmers** — idioms, OOP internals, asyncio
- **Data Science Essentials** — statistics intuition, pandas, ML concepts

40 hand-written questions with explanations and difficulty ratings.

## How the adaptivity works (no magic)

| Piece | Mechanic |
|---|---|
| Mastery model | Per-skill Elo rating (start 1200, K=32); difficulty shifts the "opponent strength" |
| Question picking | Maximizes fit to ~62% expected success + weak-skill bonus; unseen questions first |
| Progress | XP by difficulty (participation XP even on misses), streak counter |
| Labels | Beginner → Developing → Proficient → Advanced → Master |

## Run

```bash
npm install
npm test       # 8 unit tests (Elo math, picker behavior, bookkeeping)
npm run dev    # http://localhost:3000
npm run build  # static export to out/
```

## Deploy

`output: 'export'` → any static host (Vercel auto-detected).
