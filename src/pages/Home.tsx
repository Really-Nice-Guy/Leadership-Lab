import { Link } from 'react-router-dom';
import { ChatCircle, Target, Brain, Sparkle, ArrowRight } from 'phosphor-react';
import { useEffect, useState } from 'react';
import { loadArticles, loadSessions } from '../utils/dataLoader';
import { getLastVisited, getProgressStats } from '../utils/progress';
import type { Article } from '../types';

interface LastVisited {
  type: 'session' | 'article';
  id: string;
  name: string;
}

interface Stats {
  startedSessions: number;
  readArticles: number;
  sessionPct: number;
  articlePct: number;
}

const FOUR_CS = [
  {
    name: 'Communication',
    description: 'How we interact and present ourselves',
    longDesc: 'Mastering messaging, storytelling, active listening, and executive presence.',
    icon: ChatCircle,
    gradient: 'from-blue-500 to-blue-700',
    lightBg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    accent: '#3B82F6',
    sessions: 4,
  },
  {
    name: 'Customer',
    description: 'Internal and external stakeholder focus',
    longDesc: 'Understanding clients, peers, and partners — delivering value that matters.',
    icon: Target,
    gradient: 'from-emerald-500 to-emerald-700',
    lightBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    accent: '#10B981',
    sessions: 3,
  },
  {
    name: 'Cognizance',
    description: 'Self-awareness, goals, culture, metrics',
    longDesc: 'Knowing yourself, your environment, your team — and acting with clarity.',
    icon: Brain,
    gradient: 'from-violet-500 to-violet-700',
    lightBg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-700',
    accent: '#8B5CF6',
    sessions: 5,
  },
  {
    name: 'Charisma',
    description: 'Authenticity, trust, personal brand',
    longDesc: 'Building genuine influence through presence, energy, and earned credibility.',
    icon: Sparkle,
    gradient: 'from-amber-500 to-amber-700',
    lightBg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    accent: '#F59E0B',
    sessions: 3,
  },
];

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [lastVisited, setLastVisited] = useState<LastVisited | null>(null);
  const [stats, setStats] = useState<Stats>({ startedSessions: 0, readArticles: 0, sessionPct: 0, articlePct: 0 });
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    Promise.all([loadArticles(), loadSessions()]).then(([arts, sessions]) => {
      setArticles(arts);
      const ids = sessions.map(s => s.id);
      setTotalSessions(ids.length);
      setStats(getProgressStats(ids, arts.length));
      setLastVisited(getLastVisited());
    });
  }, []);

  const totalArticles = articles.length;
  const hasProgress = stats.startedSessions > 0 || stats.readArticles > 0;

  return (
    <div className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-white via-gray-50 to-gray-100 px-6 pt-14 pb-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            The Leadership Laboratory
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
            Transform Your Leadership.<br />
            <span className="gradient-text">The 4 Cs Framework.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl leading-relaxed mb-8">
            A structured workshop built on {totalArticles > 0 ? totalArticles : '28+'} deeply-verified Sunday Thoughts insights — covering Communication, Customer, Cognizance, and Charisma.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/curriculum"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
            >
              Explore Curriculum
              <ArrowRight size={16} weight="bold" />
            </Link>
            <Link
              to="/articles"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-900 hover:text-gray-900 transition-colors"
            >
              Browse Articles
            </Link>
          </div>
        </div>
      </section>

      {/* ── Continue where you left off ──────────────────────── */}
      {lastVisited && (
        <section className="px-6 py-6 bg-gray-900">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">{lastVisited.type === 'article' ? '📄' : '🎯'}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Continue where you left off
                  </p>
                  <p className="text-white font-semibold text-base leading-snug mt-0.5 line-clamp-1">
                    {lastVisited.name}
                  </p>
                </div>
              </div>
              <Link
                to={lastVisited.type === 'article' ? `/article/${lastVisited.id}` : '/curriculum'}
                className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors text-sm"
              >
                Resume
                <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Overall progress bar (only shown if started) ─────── */}
      {hasProgress && (
        <section className="px-6 py-5 bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex-1 min-w-40">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-gray-500">Curriculum progress</span>
                  <span className="font-bold text-gray-900">{stats.sessionPct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${stats.sessionPct}%`, background: 'linear-gradient(to right, #3B82F6, #8B5CF6)' }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{stats.startedSessions} of {totalSessions} sessions explored</p>
              </div>
              <div className="flex-1 min-w-40">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-gray-500">Articles read</span>
                  <span className="font-bold text-gray-900">{stats.articlePct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${stats.articlePct}%`, background: 'linear-gradient(to right, #10B981, #F59E0B)' }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{stats.readArticles} of {totalArticles} articles read</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Netflix-style 4 Cs tiles ─────────────────────────── */}
      <section className="px-6 py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">The 4 Cs of Leadership</h2>
              <p className="text-sm text-gray-500 mt-1">Four dimensions — each with dedicated sessions and curated articles</p>
            </div>
            <Link to="/curriculum" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FOUR_CS.map(c => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.name}
                  to="/curriculum"
                  className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200"
                >
                  {/* Colored banner (Netflix tile style) */}
                  <div
                    className={`relative h-28 bg-gradient-to-br ${c.gradient} flex items-end p-5`}
                  >
                    {/* Large background icon */}
                    <Icon
                      size={80}
                      weight="fill"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/15"
                    />
                    <div className="relative z-10">
                      <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-1">
                        <Icon size={20} weight="bold" className="text-white" />
                      </div>
                    </div>
                    {/* Session count badge */}
                    <span className="absolute top-4 right-4 text-xs font-bold bg-black/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
                      {c.sessions} sessions
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="bg-white p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{c.name}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-3">{c.longDesc}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${c.text} ${c.lightBg} px-2.5 py-1 rounded-full`}>
                        {c.description}
                      </span>
                      <span className="text-xs text-gray-400 group-hover:text-gray-700 transition-colors flex items-center gap-1">
                        Explore <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Evidence-based section ───────────────────────────── */}
      <section className="px-6 py-12 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">
            Evidence-Based Leadership Development
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-4">
            This curriculum integrates 2+ years of Sunday Thoughts leadership insights with a structured 4 Cs framework.
            Every article has been deep-read and verified for genuine relevance — not just keyword matching.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            We prioritize quality over quantity: sessions without genuinely relevant content remain thoughtfully incomplete,
            ensuring every resource truly serves your leadership development journey.
          </p>
          {totalArticles > 0 && (
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-center">
                <div className="text-2xl font-extrabold text-gray-900">{totalArticles}</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">Curated Articles</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-center">
                <div className="text-2xl font-extrabold text-gray-900">13</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">Workshop Sessions</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-center">
                <div className="text-2xl font-extrabold text-gray-900">4</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">Leadership Pillars</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-center">
                <div className="text-2xl font-extrabold text-gray-900">2+</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">Years of Insights</div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
