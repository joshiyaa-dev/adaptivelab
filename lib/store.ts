import { freshLearner } from './engine';
import type { LearnerState } from './types';

const KEY = 'adaptivelab_state_v1';

export function loadState(): LearnerState {
  if (typeof window === 'undefined') return freshLearner();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LearnerState>;
      const base = freshLearner();
      return { ...base, ...parsed } as LearnerState;
    }
  } catch { /* fallthrough */ }
  const s = freshLearner();
  saveState(s);
  return s;
}

export function saveState(s: LearnerState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function resetState(): LearnerState {
  if (typeof window === 'undefined') return freshLearner();
  localStorage.removeItem(KEY);
  return loadState();
}
