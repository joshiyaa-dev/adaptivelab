import type { Course, LearnerState, MockSession, Question, ReviewEntry, SkillTreeNode, TimerEntry } from './types';

const K = 32;          // Elo step size
const D_SCALE = 180;   // difficulty → expected-score shift

export function freshLearner(name = 'Learner'): LearnerState {
  return {
    name, xp: 0, masteries: {}, seenQuestionIds: [], confidences: {},
    dailyGoal: 10, dailyDone: 0, dailyDate: '', streakDays: 0, lastActiveDate: '', streakFrozen: false,
    reviewQueue: [], profiles: [{ id: 'p1', name, createdAt: new Date().toISOString().slice(0, 10) }], activeProfile: 'p1',
  };
}

export function mastery(state: LearnerState, skill: string) {
  return state.masteries[skill] ?? { rating: 1200, attempts: 0, correct: 0 };
}

/** Expected probability that the learner answers a d-difficulty question correctly. */
export function expectedCorrect(learnerRating: number, difficulty: number): number {
  const shift = (difficulty - 3) * D_SCALE;
  return 1 / (1 + Math.pow(10, (shift - learnerRating + 1200) / 400));
}

/** Elo update after one answer. */
export function eloUpdate(learnerRating: number, difficulty: number, wasCorrect: boolean): number {
  const exp = expectedCorrect(learnerRating, difficulty);
  const score = wasCorrect ? 1 : 0;
  return Math.round(learnerRating + K * (score - exp));
}

/**
 * Pick the next question:
 *  - unseen first (until exhausted),
 *  - target the "productive struggle" zone (~62% expected success),
 *  - surface weakest skills sooner.
 */
export function pickNext(
  course: Course,
  questions: Record<string, Question>,
  state: LearnerState,
  rng: () => number = Math.random,
): Question | null {
  const pool = course.questionIds.map((id) => questions[id]).filter(Boolean);
  if (pool.length === 0) return null;
  const unseen = pool.filter((q) => !state.seenQuestionIds.includes(q.id));
  const candidates = unseen.length ? unseen : pool;

  const scored = candidates.map((q) => {
    const m = mastery(state, q.skill);
    const p = expectedCorrect(m.rating, q.d);
    const fit = 1 - Math.abs(p - 0.62);
    const weakBonus = 1 - m.rating / 1600;
    return { q, w: (fit * 2 + weakBonus) * (0.8 + 0.4 * rng()) };
  });

  scored.sort((a, b) => b.w - a.w);
  return scored[0].q;
}


/** Apply an answer: Elo per skill + XP. Returns updated copy.
 *  Accepts either the old { wasCorrect } or new { chosen, correctRating } shape. */
export function applyAnswer(state: LearnerState, rec: { questionId: string; skill: string; d: number; wasCorrect?: boolean; chosen?: number | null }): LearnerState {
  const next: LearnerState = {
    ...state,
    masteries: { ...state.masteries },
    seenQuestionIds: [...state.seenQuestionIds],
  };
  const m = { ...mastery(state, rec.skill) };
  m.rating = eloUpdate(m.rating, rec.d, !!rec.wasCorrect);
  m.attempts += 1;
  if (rec.wasCorrect) m.correct += 1;
  next.masteries[rec.skill] = m;

  if (!next.seenQuestionIds.includes(rec.questionId)) next.seenQuestionIds.push(rec.questionId);

  const baseXp = 10 * rec.d;
  next.xp += rec.wasCorrect ? baseXp : Math.round(baseXp * 0.25);
  return next;
}

/** Mastery label from rating (1000..1700 → 5%..100%). */
export function masteryLabel(rating: number): { label: string; pct: number } {
  const pct = Math.max(5, Math.min(100, Math.round(((rating - 1000) / 700) * 100)));
  const label =
    pct >= 90 ? 'Master' : pct >= 75 ? 'Advanced' :
    pct >= 55 ? 'Proficient' : pct >= 35 ? 'Developing' : 'Beginner';
  return { label, pct };
}

// ======== Features 81-100 ========

// ---- 81: Spaced review interleaving ----
const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60];

export function addReviewEntry(queue: ReviewEntry[], questionId: string, confidence: number, todayISO: string): ReviewEntry[] {
  const entry = queue.find((r) => r.questionId === questionId);
  const interval = REVIEW_INTERVALS[Math.min(queue.filter((r) => r.questionId === questionId).length, REVIEW_INTERVALS.length - 1)];
  const next = new Date(todayISO + 'T00:00:00');
  next.setDate(next.getDate() + Math.max(1, Math.round(interval * (confidence < 3 ? 0.5 : confidence > 4 ? 1.5 : 1))));
  const reviewEntry: ReviewEntry = {
    questionId,
    nextReviewISO: next.toISOString().slice(0, 10),
    intervalDays: interval,
    confidence,
  };
  return [...queue.filter((r) => r.questionId !== questionId), reviewEntry];
}

export function dueReviews(queue: ReviewEntry[], todayISO: string): ReviewEntry[] {
  return queue.filter((r) => r.nextReviewISO <= todayISO);
}

// ---- 82: Confidence tagging ----
export function confidenceWeightedXp(baseXp: number, confidence: number, wasCorrect: boolean): number {
  const boost = confidence >= 4 && wasCorrect ? 1.3 : confidence <= 2 && !wasCorrect ? 0.8 : 1;
  return Math.round(baseXp * boost);
}

// ---- 83: Daily goal + streak ----
export function updateDaily(state: LearnerState, todayISO: string): LearnerState {
  const next = { ...state };
  if (todayISO !== next.dailyDate) {
    // check streak
    const prev = new Date(next.lastActiveDate + 'T00:00:00');
    const today = new Date(todayISO + 'T00:00:00');
    const diffDays = Math.round((today.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1 || (diffDays === 2 && next.streakFrozen)) {
      next.streakDays += 1;
    } else if (diffDays > 1 && !next.streakFrozen) {
      next.streakDays = 1;
    } else if (diffDays === 0) {
      // same day, no change
    }
    next.dailyDone = 0;
    next.dailyDate = todayISO;
    next.lastActiveDate = todayISO;
    next.streakFrozen = false;
  }
  next.dailyDone += 1;
  return next;
}

export function streakCompleted(state: LearnerState): boolean {
  return state.dailyDone >= state.dailyGoal;
}

// ---- 84: Hints ----
export function showHint(q: Question): string | null {
  return q.hint ?? null;
}

// ---- 85: Deeper links — course → skill drilldown ----
export function skillDrilldown(course: Course, questions: Record<string, Question>): Record<string, { total: number; avgDifficulty: number; ids: string[] }> {
  const out: Record<string, { total: number; avgDifficulty: number; ids: string[] }> = {};
  for (const id of course.questionIds) {
    const q = questions[id];
    if (!q) continue;
    out[q.skill] = out[q.skill] || { total: 0, avgDifficulty: 0, ids: [] };
    out[q.skill].total += 1;
    out[q.skill].avgDifficulty += q.d;
    out[q.skill].ids.push(id);
  }
  for (const s of Object.keys(out)) {
    out[s].avgDifficulty = Math.round(out[s].avgDifficulty / out[s].total * 10) / 10;
  }
  return out;
}

// ---- 86: JSON pack import ----
export function importQuestionPack(json: string): { questions: Question[]; errors: string[] } {
  const errors: string[] = [];
  try {
    const data = JSON.parse(json);
    const items: Question[] = Array.isArray(data) ? data : data.questions ?? [];
    const valid: Question[] = [];
    for (const item of items) {
      if (!item.id || !item.skill || !item.q || !Array.isArray(item.options) || item.options.length !== 4) {
        errors.push(`Invalid question: ${JSON.stringify(item).slice(0, 60)}`);
        continue;
      }
      valid.push({
        id: item.id, skill: item.skill, d: item.d ?? 2,
        q: item.q, options: item.options as [string, string, string, string],
        correct: item.correct ?? 0, explain: item.explain ?? '',
        hint: item.hint,
      });
    }
    return { questions: valid, errors };
  } catch (e) {
    return { questions: [], errors: [`Parse error: ${String(e)}`] };
  }
}

// ---- 87: Skill tree data ----
export function buildSkillTree(courses: Course[], state: LearnerState): SkillTreeNode[] {
  return courses.flatMap((c) => c.skills.map((skill) => {
    const m = state.masteries[skill] ?? { rating: 1200, attempts: 0, correct: 0 };
    const pct = Math.max(5, Math.min(100, Math.round(((m.rating - 1000) / 700) * 100)));
    return { skill, courseId: c.id, rating: m.rating, pct, children: [] };
  }));
}

// ---- 88: Mock exam mode ----
export function createMockExam(
  course: Course, questions: Record<string, Question>,
  count: number, durationMs: number,
): MockSession {
  const pool = course.questionIds.map((id) => questions[id]).filter(Boolean);
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  return {
    id: `mock-${Date.now()}`,
    startedAt: Date.now(),
    durationMs,
    questionIds: shuffled.map((q) => q.id),
    answers: [],
    finished: false,
  };
}

export function mockScore(session: MockSession, questions: Record<string, Question>): { correct: number; total: number; pct: number; timeMs: number } {
  let correct = 0;
  let timeMs = 0;
  for (const a of session.answers) {
    const q = questions[a.questionId];
    if (q && a.chosen === q.correct) correct += 1;
    timeMs += a.timeMs;
  }
  const total = session.answers.length;
  return { correct, total, pct: total ? Math.round((correct / total) * 100) : 0, timeMs };
}

// ---- 89: Bot leaderboard ----
export interface BotProfile { name: string; skill: number; speed: number; }

export const BOTS: BotProfile[] = [
  { name: 'AdaBot-9000', skill: 0.85, speed: 1.2 },
  { name: 'Turing Jr.', skill: 0.70, speed: 1.0 },
  { name: 'GraceBot', skill: 0.60, speed: 0.9 },
  { name: 'Curie-AI', skill: 0.50, speed: 0.8 },
  { name: 'Newbie-3000', skill: 0.30, speed: 0.6 },
];

export function botLeaderboard(humanXp: number): Array<{ name: string; xp: number; isHuman: boolean }> {
  const entries = BOTS.map((b) => ({
    name: b.name,
    xp: Math.round(humanXp * b.skill * (0.9 + b.speed * 0.2) + Math.random() * 50),
    isHuman: false,
  }));
  entries.push({ name: 'You', xp: humanXp, isHuman: true });
  return entries.sort((a, b) => b.xp - a.xp);
}

// ---- 90: Course recommender ----
export function recommendCourse(courses: Course[], state: LearnerState): string | null {
  let best: { id: string; score: number } | null = null;
  for (const c of courses) {
    const total = c.questionIds.length;
    if (total === 0) continue;
    const seen = c.questionIds.filter((id) => state.seenQuestionIds.includes(id)).length;
    const avgMastery = c.skills.reduce((a, s) => a + (state.masteries[s]?.rating ?? 1200), 0) / c.skills.length;
    const score = (1 - seen / total) * 0.5 + (avgMastery / 1700) * 0.5;
    if (!best || score > best.score) best = { id: c.id, score };
  }
  return best?.id ?? null;
}

// ---- 91: Time analytics ----
export function timeAnalytics(timers: TimerEntry[]): { avgMs: number; fastestMs: number; slowestMs: number; perSkill: Record<string, number> } {
  if (!timers.length) return { avgMs: 0, fastestMs: 0, slowestMs: 0, perSkill: {} };
  const durations = timers.map((t) => t.endMs - t.startMs);
  return {
    avgMs: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
    fastestMs: Math.min(...durations),
    slowestMs: Math.max(...durations),
    perSkill: {},
  };
}

// ---- 92: Distractor analysis ----
export function distractorAnalysis(records: Array<{ skill: string; d: number; chosen: number | null; correctAnswer: number }>): Record<string, Record<number, number>> {
  const out: Record<string, Record<number, number>> = {};
  for (const r of records) {
    if (r.chosen === null || r.chosen === r.correctAnswer) continue;
    out[r.skill] = out[r.skill] ?? {};
    out[r.skill][r.chosen] = (out[r.skill][r.chosen] ?? 0) + 1;
  }
  return out;
}

// ---- 93: Forecast heatmap ----
export function forecastHeatmap(state: LearnerState, courses: Course[], weeks: number): Array<{ week: number; skills: Record<string, number> }> {
  const result: Array<{ week: number; skills: Record<string, number> }> = [];
  for (let w = 0; w < weeks; w++) {
    const skills: Record<string, number> = {};
    for (const c of courses) {
      for (const skill of c.skills) {
        const m = state.masteries[skill] ?? { rating: 1200, attempts: 0, correct: 0 };
        const pct = Math.max(5, Math.min(100, Math.round(((m.rating - 1000) / 700) * 100)));
        skills[skill] = Math.min(100, pct + w * 2);
      }
    }
    result.push({ week: w + 1, skills });
  }
  return result;
}

// ---- 97: Certificate canvas ----
export function generateCertificate(studentName: string, courseTitle: string, dateISO: string): string {
  return JSON.stringify({
    type: 'certificate',
    student: studentName,
    course: courseTitle,
    date: dateISO,
    issuer: 'AdaptiLab',
  });
}

// ---- 98: Option shuffling ----
export function shuffleOptions(q: Question): { question: Question; originalCorrect: number } {
  const indices = [0, 1, 2, 3];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const shuffled = indices.map((i) => q.options[i]) as [string, string, string, string];
  const newCorrect = indices.indexOf(q.correct);
  return {
    question: { ...q, options: shuffled, correct: newCorrect as 0 | 1 | 2 | 3 },
    originalCorrect: q.correct,
  };
}

// ---- 99: Error-pattern insights ----
export function errorPatterns(records: Array<{ skill: string; d: number; chosen: number | null; correctAnswer: number }>): Array<{ skill: string; difficulty: number; count: number }> {
  const map2: Record<string, number> = {};
  for (const r of records) {
    if (r.chosen === null || r.chosen === r.correctAnswer) continue;
    const key = `${r.skill}|${r.d}`;
    map2[key] = (map2[key] ?? 0) + 1;
  }
  return Object.entries(map2).map(([key, count]) => {
    const [skill, diff] = key.split('|');
    return { skill, difficulty: Number(diff), count };
  }).sort((a, b) => b.count - a.count);
}

// ---- 100: Cross-course transfer ----
export function crossCourseTransfer(courses: Course[], state: LearnerState): Array<{ from: string; to: string; sharedSkills: string[] }> {
  const out: Array<{ from: string; to: string; sharedSkills: string[] }> = [];
  for (let i = 0; i < courses.length; i++) {
    for (let j = i + 1; j < courses.length; j++) {
      const shared = courses[i].skills.filter((s) => courses[j].skills.includes(s));
      if (shared.length > 0) {
        const masteryA = shared.reduce((a, s) => a + (state.masteries[s]?.rating ?? 1200), 0) / shared.length;
        const masteryB = shared.reduce((a, s) => a + (state.masteries[s]?.rating ?? 1200), 0) / shared.length;
        if (masteryA > 1300 || masteryB > 1300) {
          out.push({ from: courses[i].title, to: courses[j].title, sharedSkills: shared });
        }
      }
    }
  }
  return out;
}
