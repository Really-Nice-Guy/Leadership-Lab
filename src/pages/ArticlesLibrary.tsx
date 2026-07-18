import { useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { loadArticles, loadSessions } from '../utils/dataLoader';
import { isArticleRead } from '../utils/progress';
import type { Article, Session } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const CS = ['Communication', 'Customer', 'Cognizance', 'Charisma'] as const;
const CATS = ['Technology/AI', 'Macroeconomics', 'Geopolitics', 'Thought Leadership'] as const;

// Literal class strings so Tailwind's scanner keeps them.
const C_STYLE: Record<string, { stripe: string; chipActive: string; dot: string }> = {
  Communication: { stripe: 'bg-communication', chipActive: 'bg-communication-light text-communication border-communication', dot: 'bg-communication' },
  Customer:      { stripe: 'bg-customer',      chipActive: 'bg-customer-light text-customer border-customer',                 dot: 'bg-customer' },
  Cognizance:    { stripe: 'bg-cognizance',    chipActive: 'bg-cognizance-light text-cognizance border-cognizance',           dot: 'bg-cognizance' },
  Charisma:      { stripe: 'bg-charisma',      chipActive: 'bg-charisma-light text-charisma border-charisma',                 dot: 'bg-charisma' },
};

export default function ArticlesLibrary() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [search, setSearch] = useState('');
  const [cs, setCs] = useState<string[]>([]);
  const [sess, setSess] = useState<string[]>([]);        // selected session ids (sub-sections)
  const [cats, setCats] = useState<string[]>([]);
  const [shelf, setShelf] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadArticles(), loadSessions()]).then(([arts, sessData]) => {
      setArticles(arts.slice().sort((a, b) => b.number - a.number)); // newest first
      setSessions(sessData);
      setLoading(false);
    });
  }, []);

  // session id -> { name, fourC }
  const sessMeta = useMemo(() => {
    const m: Record<string, { name: string; fourC: string }> = {};
    sessions.forEach(s => { m[s.id] = { name: s.name, fourC: s.fourC }; });
    return m;
  }, [sessions]);

  // Sub-session chips to show = sessions belonging to the selected pillars.
  const visibleSessions = useMemo(
    () => sessions.filter(s => cs.includes(s.fourC)),
    [sessions, cs]
  );

  // If a pillar is deselected, drop any of its sessions from the active filter.
  useEffect(() => {
    setSess(prev => prev.filter(id => sessMeta[id] && cs.includes(sessMeta[id].fourC)));
  }, [cs, sessMeta]);

  const toggleIn = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter(x => x !== v) : [...list, v]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return articles.filter(a =>
      (!q || a.title.toLowerCase().includes(q) || a.content?.toLowerCase().includes(q)) &&
      (cs.length === 0 || (!!a.fourC && cs.includes(a.fourC))) &&
      (sess.length === 0 || (a.sessions ?? []).some(id => sess.includes(id))) &&
      (cats.length === 0 || (!!a.category && cats.includes(a.category))) &&
      (shelf.length === 0 || (!!a.shelfLife && shelf.includes(a.shelfLife)))
    );
  }, [articles, search, cs, sess, cats, shelf]);

  const count = (pred: (a: Article) => boolean) => articles.filter(pred).length;
  const anyFilter = cs.length > 0 || sess.length > 0 || cats.length > 0 || shelf.length > 0 || search.length > 0;

  if (loading) return <LoadingSpinner message="Loading articles..." />;

  const readCount = articles.filter(a => isArticleRead(a.number)).length;
  const pct = articles.length ? Math.round((readCount / articles.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header + facets */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Sunday Thoughts</h1>
          <p className="text-gray-500 mb-5">{articles.length} articles · {readCount} read ({pct}%)</p>

          <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-6 max-w-xs">
            <div className="h-full rounded-full transition-all duration-700"
                 style={{ width: `${pct}%`, background: 'linear-gradient(to right, #10B981, #7C3AED)' }} />
          </div>

          <input
            type="text"
            placeholder="Search by title or content…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-96 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 text-sm bg-gray-50 focus:bg-white transition-colors mb-6"
          />

          <div className="space-y-3">
            <FacetRow label="Pillar">
              {CS.map(c => (
                <Chip key={c} active={cs.includes(c)} activeClass={C_STYLE[c].chipActive}
                      onClick={() => toggleIn(cs, setCs, c)}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle ${C_STYLE[c].dot}`} />
                  {c} <span className="opacity-50">{count(a => a.fourC === c)}</span>
                </Chip>
              ))}
            </FacetRow>

            {/* Sub-sessions of the selected pillar(s) — this surfaces Cognizance's subsections */}
            {visibleSessions.length > 0 && (
              <FacetRow label="Session">
                {visibleSessions.map(s => (
                  <Chip key={s.id} active={sess.includes(s.id)} activeClass={C_STYLE[s.fourC].chipActive}
                        onClick={() => toggleIn(sess, setSess, s.id)}>
                    {s.name} <span className="opacity-50">{count(a => (a.sessions ?? []).includes(s.id))}</span>
                  </Chip>
                ))}
              </FacetRow>
            )}

            <FacetRow label="Topic">
              {CATS.map(cat => (
                <Chip key={cat} active={cats.includes(cat)} onClick={() => toggleIn(cats, setCats, cat)}>
                  {cat} <span className="opacity-50">{count(a => a.category === cat)}</span>
                </Chip>
              ))}
            </FacetRow>

            <FacetRow label="Shelf life">
              {(['ageless', 'dated'] as const).map(s => (
                <Chip key={s} active={shelf.includes(s)} onClick={() => toggleIn(shelf, setShelf, s)}>
                  {s === 'ageless' ? 'Timeless' : 'Dated'} <span className="opacity-50">{count(a => a.shelfLife === s)}</span>
                </Chip>
              ))}
            </FacetRow>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <p className="text-xs text-gray-400">{filtered.length} of {articles.length} articles</p>
            {anyFilter && (
              <button onClick={() => { setSearch(''); setCs([]); setSess([]); setCats([]); setShelf([]); }}
                      className="text-xs text-gray-500 hover:text-gray-900 underline underline-offset-2">
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-400">No articles match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(a => <ArticleCard key={a.number} article={a} sessMeta={sessMeta} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FacetRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-16 shrink-0 pt-1.5">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children, activeClass }:
  { active: boolean; onClick: () => void; children: ReactNode; activeClass?: string }) {
  const base = 'text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer';
  const on = activeClass ?? 'bg-gray-900 text-white border-gray-900';
  const off = 'bg-white text-gray-600 border-gray-200 hover:border-gray-300';
  return <button onClick={onClick} className={`${base} ${active ? on : off}`}>{children}</button>;
}

function snippet(content: string, maxLen = 110): string {
  const cleaned = content.replace(/^sunday thoughts\s*:\s*/i, '').trim();
  if (cleaned.length <= maxLen) return cleaned;
  const cut = cleaned.lastIndexOf(' ', maxLen);
  return cleaned.slice(0, cut > 0 ? cut : maxLen) + '…';
}

function formatDate(dateString: string): string {
  const parts = dateString?.split(' ') ?? [];
  if (parts.length >= 3) return `${parts[1].slice(0, 3)} '${parts[2].slice(-2)}`;
  if (parts.length === 2) return `${parts[1].slice(0, 3)}`;
  return dateString ?? '';
}

function displayTitle(article: Article): string {
  const t = article.title.trim();
  if (!t || /^sunday thoughts\s*:?$/i.test(t)) return `#${article.number}`;
  return t;
}

function ArticleCard({ article, sessMeta }:
  { article: Article; sessMeta: Record<string, { name: string; fourC: string }> }) {
  const read = isArticleRead(article.number);
  const stripe = article.fourC ? C_STYLE[article.fourC].stripe : 'bg-gray-200';
  const sessionNames = (article.sessions ?? []).map(id => sessMeta[id]?.name).filter(Boolean);

  return (
    <Link
      to={`/article/${article.number}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col border border-gray-100 overflow-hidden"
    >
      {/* Colour stripe — keyed to the article's C */}
      <div className={`h-1 w-full ${stripe}`} />

      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-gray-400">#{article.number}</span>
          <div className="flex items-center gap-1.5">
            {read && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">✓</span>
            )}
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
              {formatDate(article.date)}
            </span>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors leading-snug">
          {displayTitle(article)}
        </h3>

        {article.content && (
          <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed flex-1">
            {snippet(article.content)}
          </p>
        )}

        {/* C + session + topic tags */}
        <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-1">
          {article.fourC && (
            <span className="inline-flex items-center text-[10px] font-medium text-gray-500">
              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${C_STYLE[article.fourC].dot}`} />
              {article.fourC}
            </span>
          )}
          {sessionNames.slice(0, 1).map(name => (
            <span key={name} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
              {name}
            </span>
          ))}
          {article.category && (
            <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-full">
              {article.category}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
