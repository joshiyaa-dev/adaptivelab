'use client';
import { useEffect, useMemo, useState } from 'react';
import type { LearnerState, MockSession, Question, TimerEntry, ReviewEntry } from '../lib/types';
import { COURSES, QUESTIONS } from '../lib/content';
import {
  pickNext, applyAnswer, freshLearner, masteryLabel, skillDrilldown,
  addReviewEntry, dueReviews, updateDaily, streakCompleted,
  createMockExam, mockScore, botLeaderboard, recommendCourse,
  timeAnalytics, distractorAnalysis, forecastHeatmap,
  shuffleOptions, errorPatterns, crossCourseTransfer, buildSkillTree,
  importQuestionPack,
} from '../lib/engine';

type Set = (s: LearnerState) => void;

// ---- Questions Tab ----
export function QuestionsPanel({ s, set }: { s: LearnerState; set: Set }) {
  const [courseId, setCourseId] = useState(COURSES[0].id);
  const course = COURSES.find((c) => c.id === courseId) ?? COURSES[0];
  const [current, setCurrent] = useState<Question | null>(null);
  const [shuffled, setShuffled] = useState<Question | null>(null);
  const [hint, setHint] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; explain: string } | null>(null);
  const [timerStart, setTimerStart] = useState<number>(Date.now());
  const [timers, setTimers] = useState<TimerEntry[]>([]);

  useEffect(() => {
    setCurrent(pickNext(course, QUESTIONS, s));
    setFeedback(null); setHint(false); setTimerStart(Date.now());
  }, [courseId, s.seenQuestionIds.length]);

  const answer = (choice: number) => {
    if (!current || feedback) return;
    const wasCorrect = choice === current.correct;
    const { question: sq } = shuffleOptions(current);
    const next = applyAnswer(s, { questionId: current.id, skill: current.skill, d: current.d, wasCorrect });
    const nextDaily = updateDaily(next, new Date().toISOString().slice(0, 10));
    // add to review queue (81)
    const updated = { ...nextDaily, confidences: { ...nextDaily.confidences, [current.id]: 3 } };
    updated.reviewQueue = addReviewEntry(updated.reviewQueue, current.id, 3, updated.dailyDate);
    set({ ...updated });
    setTimers([...timers, { questionId: current.id, startMs: timerStart, endMs: Date.now() }]);
    setFeedback({ correct: wasCorrect, explain: current.explain });
  };

  const nextQuestion = () => {
    setCurrent(pickNext(course, QUESTIONS, s));
    setFeedback(null); setHint(false); setTimerStart(Date.now());
  };

  const stats = useMemo(() => {
    const total = s.seenQuestionIds.length;
    const skillCount = Object.keys(s.masteries).length;
    return { total, skillCount };
  }, [s.seenQuestionIds.length]);

  return (
    <>
      <h2>Questions</h2>
      <div className="tabs-row">
        {COURSES.map((c) => <button key={c.id} className={courseId === c.id ? 'active' : ''} onClick={() => setCourseId(c.id)}>{c.title}</button>)}
      </div>
      <div className="stats-row"><span>{stats.total} answered</span><span>{stats.skillCount} skills touched</span><span>streak: {s.streakDays}d</span></div>

      {current && !feedback && (
        <div className="card question-card">
          <div className="q-header"><span className="tag">{current.skill}</span><span className="tag">d{current.d}</span></div>
          <p className="q-text">{current.q}</p>
          {hint && current.hint && <p className="hint-text">💡 {current.hint}</p>}
          <div className="options">{current.options.map((opt, i) => (
            <button key={i} className="option-btn" onClick={() => answer(i)}>{opt}</button>
          ))}</div>
          <div className="rowacts">
            {!hint && current.hint && <button className="linkbtn" onClick={() => setHint(true)}>💡 hint</button>}
          </div>
        </div>
      )}

      {feedback && (
        <div className={`card feedback-card ${feedback.correct ? 'correct' : 'wrong'}`}>
          <p className="feedback-label">{feedback.correct ? '✅ Correct!' : '❌ Incorrect'}</p>
          <p className="muted">{feedback.explain}</p>
          <button className="primary" onClick={nextQuestion}>Next →</button>
        </div>
      )}
    </>
  );
}

// ---- Review Tab (81) ----
export function ReviewPanel({ s, set }: { s: LearnerState; set: Set }) {
  const today = new Date().toISOString().slice(0, 10);
  const due = dueReviews(s.reviewQueue, today);
  const [currentReview, setCurrentReview] = useState<ReviewEntry | null>(due[0] ?? null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explain: string } | null>(null);

  const q = currentReview ? QUESTIONS[currentReview.questionId] : null;

  const answer = (choice: number) => {
    if (!q || !currentReview || feedback) return;
    const wasCorrect = choice === q.correct;
    const next = applyAnswer(s, { questionId: q.id, skill: q.skill, d: q.d, wasCorrect });
    const updated = { ...next, reviewQueue: addReviewEntry(next.reviewQueue, q.id, 3, today) };
    set(updated);
    setFeedback({ correct: wasCorrect, explain: q.explain });
  };

  const skip = () => {
    if (!currentReview) return;
    const remaining = due.filter((r) => r.questionId !== currentReview.questionId);
    setCurrentReview(remaining[0] ?? null);
    setFeedback(null);
  };

  return (
    <>
      <h2>Spaced Review <span className="muted">({due.length} due)</span></h2>
      {q && !feedback && (
        <div className="card question-card">
          <div className="q-header"><span className="tag">{q.skill}</span><span className="tag">d{q.d}</span><span className="tag muted">review · interval {currentReview?.intervalDays}d</span></div>
          <p className="q-text">{q.q}</p>
          <div className="options">{q.options.map((opt, i) => (
            <button key={i} className="option-btn" onClick={() => answer(i)}>{opt}</button>
          ))}</div>
          <button className="linkbtn" onClick={skip}>skip this review</button>
        </div>
      )}
      {feedback && (
        <div className={`card feedback-card ${feedback.correct ? 'correct' : 'wrong'}`}>
          <p className="feedback-label">{feedback.correct ? '✅ Correct!' : '❌ Incorrect'}</p>
          <p className="muted">{feedback.explain}</p>
          <button className="primary" onClick={() => { const remaining = due.filter((r) => r.questionId !== currentReview?.questionId); setCurrentReview(remaining[0] ?? null); setFeedback(null); }}>Next review →</button>
        </div>
      )}
      {!q && <p className="muted">All caught up! No reviews due today. 🎉</p>}
    </>
  );
}

// ---- Mock Exam (88) ----
export function MockPanel({ s, set }: { s: LearnerState; set: Set }) {
  const [session, setSession] = useState<MockSession | null>(null);
  const [current, setCurrent] = useState(0);
  const [timers, setTimers] = useState<number[]>([]);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [showHint, setShowHint] = useState(false);

  const start = (courseId: string, count: number) => {
    const course = COURSES.find((c) => c.id === courseId) ?? COURSES[0];
    const exam = createMockExam(course, QUESTIONS, count, count * 120000);
    setSession(exam); setCurrent(0); setTimers([]); setStartedAt(Date.now());
  };

  const answer = (choice: number) => {
    if (!session) return;
    const elapsed = Date.now() - startedAt;
    const qId = session.questionIds[current];
    const updated = { ...session, answers: [...session.answers, { questionId: qId, chosen: choice, timeMs: elapsed }] };
    setSession(updated);
    if (current < session.questionIds.length - 1) { setCurrent(current + 1); setStartedAt(Date.now()); }
    else { setSession({ ...updated, finished: true }); }
  };

  const q = session && !session.finished ? QUESTIONS[session.questionIds[current]] : null;
  const score = session?.finished ? mockScore(session, QUESTIONS) : null;

  if (!session || session.finished) {
    return (
      <>
        <h2>Mock Exam</h2>
        <div className="bookgrid">
          {COURSES.map((c) => (
            <button key={c.id} className="btn" onClick={() => start(c.id, 10)}>⏱ {c.title} · 10 Qs</button>
          ))}
        </div>
        {score && (
          <div className="card">
            <h3>Result: {score.correct}/{score.total} ({score.pct}%)</h3>
            <p className="muted">Time: {Math.round(score.timeMs / 1000)}s · avg {Math.round(score.timeMs / Math.max(1, score.total) / 1000)}s per Q</p>
            <button className="primary" onClick={() => setSession(null)}>New exam</button>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <h2>Mock Exam · Q{current + 1}/{session.questionIds.length}</h2>
      {q && (
        <div className="card question-card">
          <div className="q-header"><span className="tag">{q.skill}</span><span className="tag">d{q.d}</span></div>
          <p className="q-text">{q.q}</p>
          {showHint && q.hint && <p className="hint-text">💡 {q.hint}</p>}
          <div className="options">{q.options.map((opt, i) => (
            <button key={i} className="option-btn" onClick={() => answer(i)}>{opt}</button>
          ))}</div>
          {!showHint && q.hint && <button className="linkbtn" onClick={() => setShowHint(true)}>💡 hint</button>}
        </div>
      )}
    </>
  );
}

// ---- Skill Tree (87) ----
export function SkillTreePanel({ s }: { s: LearnerState }) {
  const tree = buildSkillTree(COURSES, s);
  return (
    <>
      <h2>Skill Tree</h2>
      <div className="skill-tree">
        {COURSES.map((c) => (
          <div key={c.id} className="tree-group">
            <h3 className="tree-course">{c.title}</h3>
            {tree.filter((n) => n.courseId === c.id).map((n) => {
              const { label, pct } = masteryLabel(n.rating);
              return (
                <div key={n.skill} className="tree-node" style={{ '--pct': `${pct}%` } as React.CSSProperties}>
                  <span className="node-name">{n.skill}</span>
                  <div className="node-bar"><div className="node-fill" style={{ width: `${pct}%` }} /></div>
                  <span className="node-label">{label} {pct}%</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

// ---- Analytics (89-93, 99) ----
export function AnalyticsPanel({ s }: { s: LearnerState }) {
  const lb = botLeaderboard(s.xp);
  const transfers = crossCourseTransfer(COURSES, s);
  const hm = forecastHeatmap(s, COURSES, 8);
  const allRecords = Object.entries(s.masteries).flatMap(([skill, m]) =>
    Array.from({ length: m.attempts }, (_, i) => ({
      skill, d: 2 as 1 | 2 | 3 | 4 | 5, chosen: i < m.correct ? 0 : 1, correctAnswer: 0,
    }))
  );
  const eps = errorPatterns(allRecords);

  return (
    <>
      <h2>Analytics</h2>
      <div className="kpis">
        <div className="kpi"><b>{s.xp}</b><span>total XP</span></div>
        <div className="kpi"><b>{s.streakDays}</b><span>day streak</span></div>
        <div className="kpi"><b>{s.seenQuestionIds.length}</b><span>questions seen</span></div>
      </div>

      <h3>Leaderboard</h3>
      <div className="lb-list">{lb.map((e, i) => (
        <div key={e.name} className={`lb-row ${e.isHuman ? 'human' : ''}`}>
          <span className="lb-rank">#{i + 1}</span><span className="lb-name">{e.name}</span><span className="lb-xp">{e.xp} XP</span>
        </div>
      ))}</div>

      {transfers.length > 0 && <>
        <h3>Cross-course transfer</h3>
        {transfers.map((t, i) => <p key={i} className="muted">🎓 {t.from} ↔ {t.to}: {t.sharedSkills.join(', ')}</p>)}
      </>}

      {eps.length > 0 && <>
        <h3>Error patterns</h3>
        <table className="tbl"><thead><tr><th>Skill</th><th>Difficulty</th><th>Errors</th></tr></thead>
          <tbody>{eps.slice(0, 6).map((e, i) => <tr key={i}><td>{e.skill}</td><td>d{e.difficulty}</td><td className="warn-text">{e.count}</td></tr>)}</tbody>
        </table>
      </>}

      <h3>Forecast heatmap (next 8 weeks)</h3>
      <div className="heatmap">
        {hm.map((w) => (
          <div key={w.week} className="heat-row">
            <span className="heat-label">W{w.week}</span>
            {Object.entries(w.skills).map(([skill, pct]) => (
              <div key={skill} className="heat-cell" style={{ background: `rgba(99,102,241,${pct / 100})` }} title={`${skill}: ${pct}%`} />
            ))}
          </div>
        ))}
      </div>
      <div className="heat-legend">{Object.keys(hm[0]?.skills ?? {}).map((s) => <span key={s} className="heat-label">{s.slice(0, 4)}</span>)}</div>
    </>
  );
}

// ---- Settings (83, 96, 86) ----
export function SettingsPanel({ s, set }: { s: LearnerState; set: Set }) {
  const [packJson, setPackJson] = useState('');

  const importPack = () => {
    const { questions, errors } = importQuestionPack(packJson);
    if (errors.length) alert('Errors:\n' + errors.join('\n'));
    if (questions.length) alert(`Imported ${questions.length} questions`);
    setPackJson('');
  };

  const addProfile = () => {
    const name = prompt('Profile name:');
    if (!name) return;
    const id = `p-${Date.now()}`;
    const profiles = [...s.profiles, { id, name, createdAt: new Date().toISOString().slice(0, 10) }];
    set({ ...s, profiles, activeProfile: id });
  };

  const downloadBackup = () => {
    const blob = new Blob([JSON.stringify({ __adaptivelab__: 1, at: new Date().toISOString(), state: s }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `adaptivelab-${s.name}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data.__adaptivelab__ && data.state) set(data.state as LearnerState);
        else alert('Invalid backup');
      } catch { alert('Parse error'); }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <h2>Settings</h2>
      <div className="card-lite">
        <b>Daily goal</b>
        <input type="range" min={1} max={50} value={s.dailyGoal}
          onChange={(e) => set({ ...s, dailyGoal: Number(e.target.value) })} />
        <span className="muted"> {s.dailyGoal} questions/day</span>
      </div>

      <div className="card-lite">
        <b>Profiles</b>
        {s.profiles.map((p) => <p key={p.id} className={p.id === s.activeProfile ? 'good-text' : 'muted'}>{p.name}{p.id === s.activeProfile ? ' (active)' : ''}</p>)}
        <button className="btn" onClick={addProfile}>＋ add profile</button>
      </div>

      <div className="card-lite">
        <b>Import question pack (JSON)</b>
        <textarea className="search notesarea" rows={4} placeholder='[{"id":"X1","skill":"Test","q":"Q?","options":["a","b","c","d"],"correct":0,"explain":"..."}]'
          value={packJson} onChange={(e) => setPackJson(e.target.value)} />
        <button className="btn" onClick={importPack}>Import</button>
      </div>

      <div className="card-lite">
        <b>Backup / Restore</b>
        <div className="rowacts">
          <button className="btn" onClick={downloadBackup}>📥 download backup</button>
          <label className="btn">📤 upload backup <input type="file" accept=".json" onChange={importBackup} hidden /></label>
        </div>
      </div>

      <div className="card-lite">
        <b>Review queue</b>
        <p className="muted">{s.reviewQueue.length} entries · {dueReviews(s.reviewQueue, new Date().toISOString().slice(0, 10)).length} due today</p>
      </div>
    </>
  );
}
