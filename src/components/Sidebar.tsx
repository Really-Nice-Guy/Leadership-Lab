import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ChatCircle, Target, Brain, Sparkle } from 'phosphor-react';
import { loadSessions, loadArticles } from '../utils/dataLoader';
import { getProgressStats, getLastVisited } from '../utils/progress';

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

const NAV_ITEMS = [
  { path: '/',           label: 'Home',       emoji: '🏠' },
  { path: '/curriculum', label: 'Curriculum', emoji: '🎓' },
  { path: '/articles',   label: 'Articles',   emoji: '📚' },
];

const FOUR_C_META: { name: string; icon: typeof ChatCircle; color: string }[] = [
  { name: 'Communication', icon: ChatCircle, color: 'text-communication' },
  { name: 'Customer',      icon: Target,     color: 'text-customer' },
  { name: 'Cognizance',    icon: Brain,      color: 'text-cognizance' },
  { name: 'Charisma',      icon: Sparkle,    color: 'text-charisma' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const [stats, setStats] = useState<Stats>({ startedSessions: 0, readArticles: 0, sessionPct: 0, articlePct: 0 });
  const [lastVisited, setLastVisited] = useState<LastVisited | null>(null);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalArticles, setTotalArticles] = useState(0);

  useEffect(() => {
    Promise.all([loadSessions(), loadArticles()]).then(([sessions, articles]) => {
      const ids = sessions.map(s => s.id);
      setTotalSessions(ids.length);
      setTotalArticles(articles.length);
      setStats(getProgressStats(ids, articles.length));
      setLastVisited(getLastVisited());
    });
  }, [location.pathname]);

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-gray-950 text-white
          flex flex-col overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/10 flex-shrink-0">
          <Link to="/" onClick={onClose} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6, #F59E0B)' }}>
              <span className="text-white font-extrabold text-sm">LL</span>
            </div>
            <div>
              <div className="text-sm font-bold leading-tight text-white">Leadership Lab</div>
              <div className="text-xs text-gray-500 leading-tight">The 4 Cs Framework</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="px-3 pt-4 pb-2 flex-shrink-0">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-2">Menu</p>
          {NAV_ITEMS.map(item => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all text-sm font-medium ${
                  active
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-base leading-none">{item.emoji}</span>
                {item.label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-communication" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 mx-4 my-2" />

        {/* Progress Section */}
        <div className="px-4 py-3 flex-shrink-0">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Your Progress</p>

          <div className="space-y-4">
            {/* Sessions */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-gray-400">Sessions explored</span>
                <span className="text-xs font-bold text-white tabular-nums">
                  {stats.startedSessions}<span className="text-gray-600">/{totalSessions}</span>
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${stats.sessionPct}%`,
                    background: 'linear-gradient(to right, #3B82F6, #8B5CF6)',
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-600 mt-1">{stats.sessionPct}% complete</p>
            </div>

            {/* Articles */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-gray-400">Articles read</span>
                <span className="text-xs font-bold text-white tabular-nums">
                  {stats.readArticles}<span className="text-gray-600">/{totalArticles}</span>
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${stats.articlePct}%`,
                    background: 'linear-gradient(to right, #10B981, #F59E0B)',
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-600 mt-1">{stats.articlePct}% read</p>
            </div>
          </div>
        </div>

        {/* Continue where you left off */}
        {lastVisited && (
          <>
            <div className="border-t border-white/10 mx-4 my-1" />
            <div className="px-4 py-3 flex-shrink-0">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Continue</p>
              <Link
                to={lastVisited.type === 'article' ? `/article/${lastVisited.id}` : '/curriculum'}
                onClick={onClose}
                className="group block bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-3 transition-all"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-lg leading-none mt-0.5">
                    {lastVisited.type === 'article' ? '📄' : '🎯'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">
                      {lastVisited.type === 'article' ? 'Last article' : 'Last session'}
                    </p>
                    <p className="text-xs font-medium text-gray-300 leading-snug line-clamp-2 group-hover:text-white transition-colors">
                      {lastVisited.name}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-communication">
                      Resume →
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* 4 Cs legend */}
        <div className="border-t border-white/10 mx-4 mb-0 mt-2" />
        <div className="px-4 py-4 flex-shrink-0">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">The 4 Cs</p>
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-2">
            {FOUR_C_META.map(({ name, icon: Icon, color }) => (
              <div key={name} className="flex items-center gap-1.5">
                <Icon size={10} className={color} weight="fill" />
                <span className="text-xs text-gray-500">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
