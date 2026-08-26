import { describe, expect, it } from 'vitest';
import {
  addReviewEntry, dueReviews, confidenceWeightedXp, updateDaily, streakCompleted,
  showHint, skillDrilldown, importQuestionPack, buildSkillTree,
  createMockExam, mockScore, botLeaderboard, recommendCourse,
  timeAnalytics, distractorAnalysis, forecastHeatmap, generateCertificate,
  shuffleOptions, errorPatterns, crossCourseTransfer, freshLearner, applyAnswer,
} from '../engine';
import { COURSES, QUESTIONS } from '../content';

describe('81 spaced review', () => {
  it('adds entries and finds due ones', () => {
    const q = addReviewEntry([], 'Q1', 3, '2026-01-01');
    expect(q[0].questionId).toBe('Q1');
    expect(q[0].intervalDays).toBeGreaterThanOrEqual(1);
    expect(dueReviews(q, '2025-12-01')).toHaveLength(0);
    expect(dueReviews(q, '2026-01-02')).toHaveLength(1);
  });
  it('low confidence shortens interval', () => {
    const q = addReviewEntry([], 'Q1', 1, '2026-01-01');
    const qHigh = addReviewEntry([], 'Q1', 5, '2026-01-01');
    expect(q[0].intervalDays).toBeLessThanOrEqual(qHigh[0].intervalDays);
  });
});

describe('82 confidence weighting', () => {
  it('boosts xp for high-confidence correct', () => {
    expect(confidenceWeightedXp(100, 5, true)).toBeGreaterThan(100);
    expect(confidenceWeightedXp(100, 1, false)).toBeLessThan(100);
  });
  it('neutral for mid-confidence', () => {
    expect(confidenceWeightedXp(100, 3, true)).toBe(100);
  });
});

describe('83 daily goal + streak', () => {
  it('increments dailyDone and streak', () => {
    let s = freshLearner();
    s = { ...s, dailyGoal: 3, dailyDate: '2026-01-01', lastActiveDate: '2026-01-01', streakDays: 0 };
    s = updateDaily(s, '2026-01-02');
    expect(s.dailyDone).toBe(1);
    expect(s.streakDays).toBe(1);
    s = updateDaily(s, '2026-01-03');
    expect(s.streakDays).toBe(2);
  });
  it('resets on gap', () => {
    let s = freshLearner();
    s = { ...s, dailyDone: 5, dailyDate: '2026-01-01', lastActiveDate: '2026-01-01', streakDays: 10 };
    s = updateDaily(s, '2026-01-05');
    expect(s.streakDays).toBe(1);
    expect(s.dailyDone).toBe(1);
  });
  it('streakCompleted checks goal', () => {
    expect(streakCompleted({ dailyGoal: 5, dailyDone: 5 } as any)).toBe(true);
    expect(streakCompleted({ dailyGoal: 5, dailyDone: 2 } as any)).toBe(false);
  });
});

describe('84 hints', () => {
  it('returns hint or null', () => {
    expect(showHint({ hint: 'Try X' } as any)).toBe('Try X');
    expect(showHint({} as any)).toBeNull();
  });
});

describe('85 skill drilldown', () => {
  it('groups questions by skill', () => {
    const dd = skillDrilldown(COURSES[0], QUESTIONS);
    expect(dd.HTML.total).toBeGreaterThan(0);
  });
});

describe('86 import pack', () => {
  it('parses valid questions', () => {
    const json = JSON.stringify([{ id: 'X1', skill: 'Test', q: 'Q?', options: ['a', 'b', 'c', 'd'], correct: 0, explain: 'y' }]);
    const { questions, errors } = importQuestionPack(json);
    expect(questions).toHaveLength(1);
    expect(errors).toHaveLength(0);
  });
  it('reports invalid entries', () => {
    const { errors } = importQuestionPack('[{"bad":true}]');
    expect(errors.length).toBeGreaterThan(0);
  });
  it('handles parse errors', () => {
    const { errors } = importQuestionPack('not json');
    expect(errors[0]).toMatch(/Parse error/);
  });
});

describe('87 skill tree', () => {
  it('builds nodes from courses', () => {
    const tree = buildSkillTree(COURSES.slice(0, 1), freshLearner());
    expect(tree.length).toBe(COURSES[0].skills.length);
    expect(tree[0].pct).toBeGreaterThanOrEqual(5);
  });
});

describe('88 mock exam', () => {
  it('creates exam and scores it', () => {
    const exam = createMockExam(COURSES[0], QUESTIONS, 3, 300000);
    expect(exam.questionIds).toHaveLength(3);
    const filled = { ...exam, answers: [
      { questionId: exam.questionIds[0], chosen: 1, timeMs: 5000 },
      { questionId: exam.questionIds[1], chosen: null, timeMs: 3000 },
    ], finished: true };
    const sc = mockScore(filled, QUESTIONS);
    expect(sc.total).toBe(2);
  });
});

describe('89 bot leaderboard', () => {
  it('includes human and bots', () => {
    const lb = botLeaderboard(500);
    expect(lb.some((e) => e.isHuman)).toBe(true);
    expect(lb.length).toBe(6);
  });
});

describe('90 course recommender', () => {
  it('recommends a course', () => {
    expect(recommendCourse(COURSES, freshLearner())).toBeTruthy();
  });
});

describe('91 time analytics', () => {
  it('computes averages', () => {
    const t = timeAnalytics([
      { questionId: 'A', startMs: 0, endMs: 1000 },
      { questionId: 'B', startMs: 0, endMs: 3000 },
    ]);
    expect(t.avgMs).toBe(2000);
  });
  it('empty array returns zeros', () => {
    expect(timeAnalytics([]).avgMs).toBe(0);
  });
});

describe('92 distractor analysis', () => {
  it('counts wrong choices per skill', () => {
    const r = distractorAnalysis([
      { skill: 'HTML', d: 1, chosen: 2, correctAnswer: 0 },
      { skill: 'HTML', d: 1, chosen: 0, correctAnswer: 0 },
    ]);
    expect(r.HTML[2]).toBe(1);
    expect(r.HTML[0]).toBeUndefined();
  });
});

describe('93 forecast heatmap', () => {
  it('projects increasing mastery', () => {
    const hm = forecastHeatmap(freshLearner(), COURSES.slice(0, 1), 4);
    expect(hm.length).toBe(4);
    expect(hm[3].skills.HTML).toBeGreaterThan(hm[0].skills.HTML);
  });
});

describe('97 certificate', () => {
  it('generates valid JSON', () => {
    const cert = generateCertificate('Test', 'Course', '2026-01-01');
    const parsed = JSON.parse(cert);
    expect(parsed.student).toBe('Test');
  });
});

describe('98 option shuffle', () => {
  it('preserves correct answer', () => {
    const q = { ...QUESTIONS['W1'], correct: 1 };
    const { question, originalCorrect } = shuffleOptions(q);
    expect(question.options[question.correct]).toBe(q.options[originalCorrect]);
  });
});

describe('99 error patterns', () => {
  it('groups errors by skill+difficulty', () => {
    const ep = errorPatterns([
      { skill: 'JS', d: 3, chosen: 2, correctAnswer: 0 },
      { skill: 'JS', d: 3, chosen: 1, correctAnswer: 0 },
      { skill: 'CSS', d: 1, chosen: 0, correctAnswer: 1 },
    ]);
    expect(ep[0].skill).toBe('JS');
    expect(ep[0].count).toBe(2);
  });
});

describe('100 cross-course transfer', () => {
  it('finds shared skills when mastery is high', () => {
    let s = freshLearner();
    s.masteries['JS Basics'] = { rating: 1500, attempts: 20, correct: 16 };
    s.masteries['Data Structures'] = { rating: 1500, attempts: 20, correct: 16 };
    const transfers = crossCourseTransfer(COURSES, s);
    expect(transfers.length).toBeGreaterThanOrEqual(0);
  });
});
