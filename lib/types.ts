export type Skill = string;

export interface Question {
  id: string;
  skill: Skill;
  d: 1 | 2 | 3 | 4 | 5;      // difficulty
  q: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explain: string;
}

export interface Course {
  id: string;
  title: string;
  blurb: string;
  skills: Skill[];
  questionIds: string[];
}

/** Per-skill mastery model (Elo-like). */
export interface SkillMastery {
  rating: number;      // starts 1200
  attempts: number;
  correct: number;
}

export interface LearnerState {
  name: string;
  xp: number;
  masteries: Record<string, SkillMastery>;
  seenQuestionIds: string[];
}

export interface AnswerRecord {
  questionId: string;
  skill: Skill;
  d: number;
  chosen: number | null; // null = timeout/skip
  correctRating: number; // learner rating at time of answer
}
