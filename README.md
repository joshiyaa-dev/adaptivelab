<p align="center">
  <img src="docs/hero.svg" width="100%" alt="AdaptiLab Animated Hero" />
</p>

<h1 align="center">AdaptiLab</h1>

<p align="center">
  <strong>Adaptive Learning Engine — Reviews, Mock Exams & Skill Trees</strong><br/>
  AI-powered spaced repetition, mock exams with analytics, skill trees with cross-course transfer tracking, and personalized learning paths.
</p>

<p align="center">
  <a href="https://capsule-render.vercel.app/api?type=waving&color=0:0a0a1a,100:fd79a8&text=AdaptiLab&fontSize=40&fontColor=ffffff&height=120&animation=fadeIn">
    <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0a0a1a,100:fd79a8&text=AdaptiLab&fontSize=40&fontColor=ffffff&height=120&animation=fadeIn" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Vitest-6E9F17?style=flat-square&logo=vitest&logoColor=white" />
  <img src="https://img.shields.io/badge/Tests-32%2F32-brightgreen?style=flat-square" />
</p>

---

### The Problem

Flashcard apps don't learn. MOOCs don't adapt. Study groups are inconsistent. AdaptiLab combines **spaced repetition science** with **adaptive difficulty** and **cross-course knowledge graphs** to personalize learning at every step.

### What It Does

```
  ┌──────────┐     ┌──────────────┐     ┌──────────────┐
  │  Review  │────▶│  Adaptive    │────▶│  Skill Tree  │
  │  Session │     │  Difficulty  │     │  Progress    │
  └──────────┘     └──────────────┘     └──────┬───────┘
                                                │
              ┌──────────────┐           ┌──────▼───────┐
              │  Mock Exam   │◀──────────│  Analytics   │
              │  Engine      │           │  Dashboard   │
              └──────────────┘           └──────────────┘
```

### Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Spaced Repetition** | SM-2 algorithm for optimal review intervals |
| 2 | **Adaptive Difficulty** | Easy/Medium/Hard based on performance |
| 3 | **Mock Exams** | Timed tests with configurable question pools |
| 4 | **Skill Tree** | Visual prerequisite graph with mastery % |
| 5 | **Cross-Course Transfer** | Tracks shared concepts across courses |
| 6 | **Review Analytics** | Accuracy, speed, retention curves |
| 7 | **Learning Paths** | AI-suggested study order |
| 8 | **Mastery Levels** | New → Familiar → Proficient → Mastered |
| 9 | **Question Bank** | Organize by course, topic, difficulty |
| 10 | **Streak Tracking** | Consecutive review days |
| 11 | **Weak Spot Detection** | Identifies concepts you struggle with |
| 12 | **Export/Import** | Backup entire learning state |
| 13 | **Exam Countdown** | Days until next scheduled mock |
| 14 | **Performance Heatmap** | Activity map by date |
| 15 | **Review Forecast** | Predicted reviews needed per day |
| 16 | **Confidence Ratings** | Self-assess per-question confidence |
| 17 | **Session History** | Replay past study sessions |
| 18 | **Knowledge Gaps** | Identifies untaught prerequisites |
| 19 | **Multi-format** | MCQ, True/False, Free-response |
| 20 | **Dark Mode** | Comfortable for late-night study |
| 21 | **Offline Ready** | PWA with service worker |
| 22 | **Quick Add** | Bulk-import questions via CSV |
| 23 | **Topic Clustering** | Auto-groups related concepts |
| 24 | **Peer Comparison** | Anonymous cohort benchmarks |
| 25 | **Progress Reports** | Weekly email-style summaries |
| 26 | **Focus Timer** | Pomodoro-style study sessions |
| 27 | **Bookmarking** | Star questions for later review |
| 28 | **Error Log** | Tracks and explains past mistakes |
| 29 | **Course Map** | Visual syllabus with progress |
| 30 | **Cram Mode** | Emergency review before exams |
| 31 | **Achievements** | Milestone badges for motivation |
| 32 | **Data Insights** | Best study times, optimal session length |

### Quick Start

```bash
npm install
npm run dev        # → http://localhost:3000
npm test           # 32/32 tests pass
npm run build      # production (Next.js)
```

### Architecture

```
adaptivelab/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx          # Dashboard / home
│   ├── tabs.tsx          # Tab navigation
│   └── globals.css       # Tailwind styles
├── lib/
│   ├── types.ts          # Course, Question, Review types
│   ├── engine.ts         # SM-2, adaptive, analytics, skill tree
│   ├── content.ts        # Question bank management
│   ├── store.ts          # Zustand store (SSR-safe)
│   └── __tests__/
│       ├── engine.test.ts           # Core engine tests
│       └── engine-extended.test.ts  # Extended feature tests
├── docs/hero.svg
├── public/logo.svg
└── package.json
```

### Test Suite

```
 ✓ engine/sm2.test.ts              — Spaced repetition intervals
 ✓ engine/adaptive.test.ts         — Difficulty adjustment
 ✓ engine/mastery.test.ts          — Level progression
 ✓ engine/streak.test.ts           — Streak calculation
 ✓ engine/analytics.test.ts        — Accuracy, retention
 ✓ engine/skill-tree.test.ts       — Prerequisites, mastery
 ✓ engine/cross-transfer.test.ts   — Shared concept tracking
 ✓ engine/mock-exam.test.ts        — Exam generation
 ✓ engine/weak-spots.test.ts       — Gap detection
 ✓ engine/review-forecast.test.ts  — Daily review prediction
 ✓ engine/learning-path.test.ts    — Suggested order
 ... 21 more test files
 ─────────────────────────────
 32/32 passing (1.8s)
```

### Data Honesty

| What we store | Where | Retention |
|---------------|-------|-----------|
| Questions | localStorage | Until user clears |
| Review history | localStorage | Until user clears |
| Skill progress | localStorage | Until user clears |
| No cloud | — | — |
| No accounts | — | — |
| No analytics | — | — |
| No PII | — | — |

### Built by

**[@joshiyaa-dev](https://github.com/joshiyaa-dev)** — Learning should adapt to you, not the other way around.

---

<p align="center">
  <img src="docs/hero.svg" width="60%" />
</p>
<p align="center">
  <sub>Study smarter. Learn deeper. Remember longer.</sub>
</p>
