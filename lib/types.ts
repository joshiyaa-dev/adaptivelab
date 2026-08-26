export type Skill = string;

export interface Question {
  id: string;
  skill: Skill;
  d: 1 | 2 | 3 | 4 | 5;
  q: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explain: string;
  hint?: string;
}

export interface Course {
  id: string;
  title: string;
  blurb: string;
  skills: Skill[];
  questionIds: string[];
}

export interface SkillMastery {
  rating: number;
  attempts: number;
  correct: number;
}

export interface AnswerRecord {
  questionId: string;
  skill: Skill;
  d: number;
  chosen: number | null;
  correctAnswer: number; // correct option index (0-3)
  correctRating: number;
}

export interface LearnerState {
  name: string;
  xp: number;
  masteries: Record<string, SkillMastery>;
  seenQuestionIds: string[];
  confidences: Record<string, number>; // questionId → 1..5
  dailyGoal: number;
  dailyDone: number;
  dailyDate: string;        // yyyy-mm-dd
  streakDays: number;
  lastActiveDate: string;   // yyyy-mm-dd
  streakFrozen: boolean;
  reviewQueue: ReviewEntry[];
  profiles: UserProfile[];
  activeProfile: string;
}

export interface ReviewEntry {
  questionId: string;
  nextReviewISO: string; // yyyy-mm-dd
  intervalDays: number;
  confidence: number;
}

export interface UserProfile {
  id: string;
  name: string;
  createdAt: string;
}

export interface SkillTreeNode {
  skill: string;
  courseId: string;
  rating: number;
  pct: number;
  children: string[];
}

export interface MockSession {
  id: string;
  startedAt: number;
  durationMs: number;
  questionIds: string[];
  answers: Array<{ questionId: string; chosen: number | null; timeMs: number }>;
  finished: boolean;
}

export interface TimerEntry {
  questionId: string;
  startMs: number;
  endMs: number;
}
