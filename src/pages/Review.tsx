import { useEffect, useMemo, useState } from 'react';
import { loadSessions } from '../utils/dataLoader';
import type { Session } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

type Status = 'pending' | 'approved' | 'rejected';

interface Pick {
  sessionId: string;
  title: string;
  speaker: string;
  source: string;
  url: string;
  minutes: number;
  why: string;
  status: Status;
}

interface Run {
  date: string;
  label?: string;
  picks: Pick[];
}

// Literal class strings so Tailwind keeps them.
const C_STYLE: Record<string, { dot: string; text: string }> = {
  Communication: { dot: 'bg-communication', text: 'text-communication' },
  Customer:      { dot: 'bg-customer',      text: 'text-customer' },
  Cognizance:    { dot: 'bg-cognizance',    text: 'text-cognizance' },
  Charisma:      { dot: 'bg-charisma',      text: 'text-charisma' },
};

export default function Review() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [sessMeta, setSessMeta] = useState<Record<string, { name: string; fourC: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/data/media-runs.json').then(r => r.json()),
      loadSessions(),
    ])
      .then(([runData, sessions]: [Run[], Session[]]) => {
        setRuns(runData.slice().sort((a, b) => b.date.localeCompare(a.date))); // newest first
        const m: Record<string, { name: string; fourC: string }> = {};
        sessions.forEach(s => { m[s.id] = { name: s.name, fourC: s.fourC }; });
        setSessMeta(m);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const setStatus = (runIdx: number, sessionId: string, status: Status) => {
    setRuns(prev => prev.map((run, i) =>
      i !== runIdx ? run : { ...run, picks: run.picks.map(p =>
        p.sessionId === sessionId ? { ...p, status: p.status === status ? 'pending' : status } : p) }
    ));
  };

  // Approved picks that go live: runs are newest-first, so the first approved per session wins.
  const approvedLive = useMemo(() => {
    const bySession: Record<string, Pick> = {};
    for (const run of runs) {
      for (const p of run.picks) {
        if (p.status === 'approved' && !bySession[p.sessionId]) bySession[p.sessionId] = p;
      }
    }
    return bySession;
  }, [runs]);

  const exportMedia = () => {
    const out: Record<string, unknown> = {};
    Object.entries(approvedLive).forEach(([sid, p]) => {
      out[sid] = { title: p.title, speaker: p.speaker, source: p.source, url: p.url, minutes: p.minutes, why: p.why };
    });
    const blob = new Blob([JSON.stringify(out, null, 1)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'media.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSpinner message="Loading recommendations..." />;

  const liveCount = Object.keys(approvedLive).length;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Media Review</h1>
            <p className="text-gray-500 mt-1">Agent 3 recommendations by run — approve to include, then export.</p>
          </div>
          <button
            onClick={exportMedia}
            disabled={liveCount === 0}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Export media.json ({liveCount})
          </button>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs px-4 py-3 mb-8">
          Your approvals live in this page only and reset on refresh. Review, then <strong>Export</strong> and commit
          <code className="mx-1 px-1 rounded bg-amber-100">public/data/media.json</code> in one sitting.
        </div>

        {runs.map((run, ri) => (
          <RunSection key={run.date} run={run} runIdx={ri} sessMeta={sessMeta} onSet={setStatus} defaultOpen={ri === 0} />
        ))}

        {runs.length === 0 && (
          <p className="text-gray-400 text-center py-16">No runs found in media-runs.json.</p>
        )}
      </div>
    </div>
  );
}

function RunSection({ run, runIdx, sessMeta, onSet, defaultOpen }:
  { run: Run; runIdx: number; sessMeta: Record<string, { name: string; fourC: string }>;
    onSet: (runIdx: number, sessionId: string, status: Status) => void; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const approved = run.picks.filter(p => p.status === 'approved').length;
  const rejected = run.picks.filter(p => p.status === 'rejected').length;
  const dateLabel = new Date(run.date + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="mb-6 border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
        <div>
          <span className="text-base font-semibold text-gray-900">{dateLabel}</span>
          {run.label && <span className="ml-2 text-xs text-gray-400">{run.label}</span>}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-emerald-600 font-medium">{approved} approved</span>
          {rejected > 0 && <span className="text-gray-400">· {rejected} rejected</span>}
          <span className="text-gray-300">· {run.picks.length} picks</span>
          <span className="text-gray-400 ml-1">{open ? '▾' : '▸'}</span>
        </div>
      </button>

      {open && (
        <div className="divide-y divide-gray-100 border-t border-gray-100">
          {run.picks.map(p => {
            const meta = sessMeta[p.sessionId];
            const c = meta?.fourC ? C_STYLE[meta.fourC] : undefined;
            return (
              <div key={p.sessionId} className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    {c && <span className={`inline-block w-1.5 h-1.5 rounded-full ${c.dot}`} />}
                    <span className={`text-[11px] font-semibold uppercase tracking-wide ${c?.text ?? 'text-gray-400'}`}>
                      {meta?.name ?? p.sessionId}
                    </span>
                    {p.minutes > 20 && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">over 20m</span>
                    )}
                  </div>
                  <a href={p.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-gray-900 hover:underline underline-offset-2">
                    {p.title} ↗
                  </a>
                  <p className="text-xs text-gray-500 mt-0.5">{p.speaker} · {p.source} · ≈{p.minutes} min</p>
                  <p className="text-xs text-gray-500 mt-1">{p.why}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSet(runIdx, p.sessionId, 'approved')}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      p.status === 'approved'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400'}`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onSet(runIdx, p.sessionId, 'rejected')}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      p.status === 'rejected'
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
