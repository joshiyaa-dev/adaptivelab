'use client';

import { useEffect, useMemo, useState } from 'react';
import { applyAnswer, freshLearner, mastery, masteryLabel, pickNext } from '@/lib/engine';
import { COURSES, QUESTIONS } from '@/lib/content';
import type { LearnerState } from '@/lib/types';

const KEY = 'adaptivelab_state_v1';

function load(): LearnerState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as LearnerState;
  } catch { /* ignore */ }
  return freshLearner();
}

type View = 'home' | 'quiz';

export default function Page() {
  const [state, setState] = useState<LearnerState | null>(null);
  const [view, setView] = useState<View>('home');
  const [courseId, setCourseId] = useState('web');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ chosen: number | null; wasCorrect: boolean; explain: string } | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => setState(load()), []);
  useEffect(() => { if (state) localStorage.setItem(KEY, JSON.stringify(state)); }, [state]);

  const course = useMemo(() => COURSES.find((c) => c.id === courseId)!, [courseId]);

  if (!state) return <main className="loading">Loading lab…</main>;

  const startCourse = (id: string) => {
    setCourseId(id);
    setView('quiz');
    setFeedback(null);
    setCurrentId(pickNext(COURSES.find((c) => c.id === id)!, QUESTIONS, state)?.id ?? null);
  };

  const answer = (chosen: number | null) => {
    if (!currentId || feedback) return;
    const q = QUESTIONS[currentId];
    const wasCorrect = chosen === q.correct;
    setState(applyAnswer(state, { questionId: q.id, skill: q.skill, d: q.d, wasCorrect }));
    setFeedback({ chosen, wasCorrect, explain: q.explain });
    setStreak((s) => (wasCorrect ? s + 1 : 0));
  };

  const next = () => {
    setFeedback(null);
    setCurrentId(pickNext(course, QUESTIONS, state)?.id ?? null);
  };

  // ---------- HOME ----------
  if (view === 'home') {
    return (
      <main>
        <header>
          <div><h1>🧪 AdaptiLab</h1>
            <p className="muted">{state.name} · {state.xp} XP · every answer retunes your path</p></div>
        </header>
        <section className="courses">
          {COURSES.map((c) => (
            <div key={c.id} className="card">
              <h2>{c.title}</h2>
              <p className="muted">{c.blurb}</p>
              <div className="skills">
                {c.skills.map((sk) => {
                  const m = mastery(state, sk);
                  const { label, pct } = masteryLabel(m.rating);
                  return (
                    <div key={sk} className="skill" title={m.attempts ? `${m.correct}/${m.attempts} correct` : 'not attempted yet'}>
                      <span>{sk} <em>{label}</em></span>
                      <div className="bar"><i style={{ width: `${pct}%` }} /></div>
                    </div>
                  );
                })}
              </div>
              <button className="primary" onClick={() => startCourse(c.id)}>
                {c.questionIds.some((id) => state.seenQuestionIds.includes(id)) ? 'Continue →' : 'Start →'}
              </button>
            </div>
          ))}
        </section>
        <footer className="foot">Adaptive engine: Elo ratings per skill · picks target ~62% expected success · data stays in your browser</footer>
      </main>
    );
  }

  // ---------- QUIZ ----------
  const q = currentId ? QUESTIONS[currentId] : null;
  const letters = ['A', 'B', 'C', 'D'];
  return (
    <main>
      <header>
        <button className="back" onClick={() => setView('home')}>← Courses</button>
        <div className="headmeta">
          <span>⚡ {state.xp} XP</span>
          <span>🔥 {streak}</span>
          <button className="linkbtn" onClick={() => {
            if (confirm('Reset all learning progress?')) { setState(freshLearner()); setView('home'); }
          }}>reset</button>
        </div>
      </header>

      {!q && (
        <section className="card quiz center">
          <h2>Course complete! 🎉</h2>
          <p className="muted">You have seen every question in this course. The engine now reinforces your weakest skills.</p>
          <button className="primary" onClick={next}>Keep training →</button>
        </section>
      )}

      {q && (
        <section className="card quiz">
          <div className="qtop">
            <span className="tag skill">{q.skill}</span>
            <span className="dots">{'●'.repeat(q.d)}<span className="dim">{'●'.repeat(5 - q.d)}</span></span>
          </div>
          <h2 className="qtext">{q.q}</h2>
          <div className="options">
            {q.options.map((o, i) => {
              let cls = '';
              if (feedback) {
                if (i === q.correct) cls = 'correct';
                else if (i === feedback.chosen) cls = 'wrong';
              }
              return (
                <button key={i} className={`opt ${cls}`} disabled={!!feedback} onClick={() => answer(i)}>
                  <b>{letters[i]}.</b> {o}
                </button>
              );
            })}
          </div>
          {feedback && (
            <>
              <div className={`verdict ${feedback.wasCorrect ? 'ok' : 'bad'}`}>
                {feedback.wasCorrect
                  ? `✅ Correct — +${10 * q.d} XP`
                  : feedback.chosen === null
                    ? '⏱ Skipped'
                    : '❌ Not quite'}
              </div>
              <div className="explain">{feedback.explain}</div>
              <button className="primary" onClick={next}>Next →</button>
            </>
          )}
        </section>
      )}
    </main>
  );
}
