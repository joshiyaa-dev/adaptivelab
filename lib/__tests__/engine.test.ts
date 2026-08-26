import { describe, expect, it } from 'vitest';
import { applyAnswer, eloUpdate, expectedCorrect, freshLearner, masteryLabel, pickNext } from '../engine';
import { COURSES, QUESTIONS } from '../content';

describe('Elo engine', () => {
  it('harder questions have lower expected success', () => {
    const r = 1200;
    expect(expectedCorrect(r, 1)).toBeGreaterThan(expectedCorrect(r, 3));
    expect(expectedCorrect(r, 5)).toBeLessThan(expectedCorrect(r, 3));
  });
  it('correct answers raise rating; wrong lower it', () => {
    expect(eloUpdate(1200, 3, true)).toBeGreaterThan(1200);
    expect(eloUpdate(1200, 3, false)).toBeLessThan(1200);
  });
  it('upsetting a hard question gains more than an easy one', () => {
    const gainHard = eloUpdate(1200, 5, true) - 1200;
    const gainEasy = eloUpdate(1200, 1, true) - 1200;
    expect(gainHard).toBeGreaterThan(gainEasy);
  });
});

describe('adaptive picker', () => {
  const course = COURSES[0];
  it('returns questions from the course', () => {
    const q = pickNext(course, QUESTIONS, freshLearner());
    expect(course.questionIds.map((id) => QUESTIONS[id])).toContainEqual(q);
  });
  it('avoids seen questions while unseen remain', () => {
    let s = freshLearner();
    for (let i = 0; i < 8; i++) {
      const q = pickNext(course, QUESTIONS, s)!;
      s = applyAnswer(s, { questionId: q.id, skill: q.skill, d: q.d, wasCorrect: true });
      const again = pickNext(course, QUESTIONS, s);
      expect(again!.id).not.toBe(q.id);
    }
  });
  it('weak skills surface after failures', () => {
    let s = freshLearner();
    // fail everything in HTML repeatedly
    for (const id of ['W1', 'W2', 'W9']) {
      s = applyAnswer(s, { questionId: id, skill: QUESTIONS[id].skill, d: QUESTIONS[id].d, wasCorrect: false });
    }
    // next pick should most likely be from a weak (HTML) skill
    const q = pickNext(course, QUESTIONS, s)!;
    expect(['HTML', 'CSS', 'Accessibility', 'Web Security', 'HTTP']).toContain(q.skill);
  });
});

describe('applyAnswer bookkeeping', () => {
  it('tracks attempts/correct and xp', () => {
    let s = freshLearner();
    s = applyAnswer(s, { questionId: 'J1', skill: 'JS Basics', d: 4, wasCorrect: true });
    s = applyAnswer(s, { questionId: 'J2', skill: 'JS Basics', d: 2, wasCorrect: false });
    const m = s.masteries['JS Basics'];
    expect(m.attempts).toBe(2);
    expect(m.correct).toBe(1);
    expect(s.xp).toBe(40 + 5); // 10*4 + round(10*2*0.25)
    expect(s.seenQuestionIds).toEqual(['J1', 'J2']);
  });
});

describe('mastery labels', () => {
  it('maps rating bands', () => {
    expect(masteryLabel(1000).label).toBe('Beginner');
    expect(masteryLabel(1350).pct).toBeGreaterThanOrEqual(35);
    expect(masteryLabel(1700)).toEqual({ label: 'Master', pct: 100 });
  });
});
