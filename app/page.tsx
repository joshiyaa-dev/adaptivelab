'use client';
import { useEffect, useState } from 'react';
import { loadState, saveState, resetState } from '../lib/store';
import { freshLearner } from '../lib/engine';
import type { LearnerState } from '../lib/types';
import { QuestionsPanel, ReviewPanel, MockPanel, SkillTreePanel, AnalyticsPanel, SettingsPanel } from './tabs';

type Tab = 'questions' | 'review' | 'mock' | 'skilltree' | 'analytics' | 'settings';
const tabs: Tab[] = ['questions', 'review', 'mock', 'skilltree', 'analytics', 'settings'];

export default function AdaptiLab() {
  const [s, setS] = useState<LearnerState>(() => loadState());
  const [tab, setTab] = useState<Tab>('questions');
  useEffect(() => saveState(s), [s]);

  return (
    <div className="shell">
      <header>
        <div className="brand"><img src="/logo.svg" width={26} alt=""/> AdaptiLab <span className="sub">learn · adapt · master</span></div>
        <nav>{tabs.map((t) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t === 'skilltree' ? 'skill tree' : t[0].toUpperCase() + t.slice(1)}</button>)}</nav>
        <span className="muted">Welcome, {s.name}</span>
      </header>

      <main>
        {tab === 'questions' && <QuestionsPanel s={s} set={setS} />}
        {tab === 'review' && <ReviewPanel s={s} set={setS} />}
        {tab === 'mock' && <MockPanel s={s} set={setS} />}
        {tab === 'skilltree' && <SkillTreePanel s={s} />}
        {tab === 'analytics' && <AnalyticsPanel s={s} />}
        {tab === 'settings' && <SettingsPanel s={s} set={setS} />}
      </main>

      <footer className="foot">
        AdaptiLab — every answer teaches ·{' '}
        <button className="linkbtn" onClick={() => setS(resetState())}>reset demo</button>
      </footer>
    </div>
  );
}
