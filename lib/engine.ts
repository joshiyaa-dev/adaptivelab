import type { Course, LearnerState, Question } from './types';

const K = 32;          // Elo step size
const D_SCALE = 180;   // difficulty → expected-score shift

export function freshLearner(name = 'Learner'): LearnerState {
  return { name, xp: 0, masteries: {}, seenQuestionIds: [] };
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

export interface AnswerRecord {
  questionId: string;
  skill: string;
  d: number;
  wasCorrect: boolean;
}

/** Apply an answer: Elo per skill + XP. Returns updated copy. */
export function applyAnswer(state: LearnerState, rec: AnswerRecord): LearnerState {
  const next: LearnerState = {
    ...state,
    masteries: { ...state.masteries },
    seenQuestionIds: [...state.seenQuestionIds],
  };
  const m = { ...mastery(state, rec.skill) };
  m.rating = eloUpdate(m.rating, rec.d, rec.wasCorrect);
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
