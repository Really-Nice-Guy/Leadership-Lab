import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { loadArticles, loadSessions, getFourCColorClass, getFourCBorderClass } from '../utils/dataLoader';
import { markArticleRead, isArticleRead } from '../utils/progress';
import type { Article, Session } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ArticleContent from '../components/ArticleContent';

function displayTitle(article: Article): string {
  const t = article.title.trim();
  if (!t || /^sunday thoughts\s*:?$/i.test(t)) return `#${article.number}`;
  return t;
}

function useReadingProgress(contentRef: React.RefObject<HTMLDivElement | null>) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const el = contentRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      setProgress(total > 0 ? Math.min(100, Math.round((scrolled / total) * 100)) : 100);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, [contentRef]);
  return progress;
}

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [alreadyRead, setAlreadyRead] = useState(false);

  const readingProgress = useReadingProgress(contentRef);

  useEffect(() => {
    Promise.all([loadArticles(), loadSessions()]).then(([articlesData, sessionsData]) => {
      const foundArticle = articlesData.find(a => a.number === Number(id));
      setArticle(foundArticle || null);
      setSessions(sessionsData);
      setAllArticles(articlesData);
      setLoading(false);
      if (foundArticle) setAlreadyRead(isArticleRead(foundArticle.number));
    });
  }, [id]);

  useEffect(() => {
    if (article && readingProgress >= 80 && !alreadyRead) {
      markArticleRead(article.number, displayTitle(article));
      setAlreadyRead(true);
    }
  }, [readingProgress, article, alreadyRead]);

  if (loading) return <LoadingSpinner message="Loading article..." />;

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h2>
          <Link to="/articles" className="text-gray-900 hover:underline font-medium">← Back to Articles</Link>
        </div>
      </div>
    );
  }

  const relatedSessions = sessions.filter(s => s.articles.includes(article.number));
  const relatedArticles = allArticles
    .filter(a => a.number !== article.number && relatedSessions.some(s => s.articles.includes(a.number)))
    .slice(0, 3);

  // Prev / next by number order
  const sorted = [...allArticles].sort((a, b) => a.number - b.number);
  const currentIndex = sorted.findIndex(a => a.number === article.number);
  const prevArticle = currentIndex > 0 ? sorted[currentIndex - 1] : null;
  const nextArticle = currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;

  const accentColor = relatedSessions.length > 0
    ? ({ Communication: '#3B82F6', Customer: '#10B981', Cognizance: '#8B5CF6', Charisma: '#F59E0B' } as Record<string, string>)[relatedSessions[0]?.fourC]
    : undefined;

  return (
    <div ref={contentRef} className="min-h-screen bg-gray-50">
      {/* Fixed reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent">
        <div
          className="h-full transition-all duration-150"
          style={{ width: `${readingProgress}%`, background: 'linear-gradient(to right, #7C3AED, #2563EB, #F59E0B)' }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Articles
        </button>

        {/* Article header */}
        <div className="mb-8">
          {/* Article number + date */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
              style={{ background: accentColor ?? '#6B7280' }}
            >
              #{article.number}
            </span>
            <span className="text-sm text-gray-400">{article.date}</span>
            {alreadyRead && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                ✓ Read
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-snug mb-4">
            {displayTitle(article)}
          </h1>
        </div>

        {/* Divider */}
        <div
          className="h-px mb-8"
          style={{ background: accentColor ? `linear-gradient(to right, ${accentColor}40, transparent)` : '#E5E7EB' }}
        />

        {/* Article body */}
        <div className="mb-12">
          {article.content
            ? <ArticleContent content={article.content} />
            : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                <p className="text-gray-500">Full article content will be available soon.</p>
              </div>
            )
          }
        </div>

        {/* Reading progress */}
        <div className="flex items-center gap-3 mb-10 text-xs text-gray-400">
          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-150"
              style={{ width: `${readingProgress}%`, background: 'linear-gradient(to right, #7C3AED, #2563EB)' }}
            />
          </div>
          <span className="tabular-nums">{readingProgress}%</span>
        </div>

        {/* Related sessions */}
        {relatedSessions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">In These Sessions</h3>
            <div className="space-y-2">
              {relatedSessions.map(session => (
                <Link
                  key={session.id}
                  to={`/curriculum#${session.id}`}
                  className={`flex items-center gap-3 p-3.5 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 border-l-4 ${getFourCBorderClass(session.fourC)}`}
                >
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white flex-shrink-0 ${getFourCColorClass(session.fourC)}`}>
                    {session.fourC}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{session.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Related Articles</h3>
            <div className="space-y-2">
              {relatedArticles.map(rel => (
                <Link
                  key={rel.number}
                  to={`/article/${rel.number}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <span className="text-xs font-mono font-bold text-gray-400 w-8 flex-shrink-0">#{rel.number}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-gray-700">{displayTitle(rel)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{rel.date}</p>
                  </div>
                  {isArticleRead(rel.number) && (
                    <span className="text-xs text-emerald-600 font-semibold flex-shrink-0">✓</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Prev / Next */}
        <div className="flex justify-between gap-3 pt-4 border-t border-gray-100">
          {prevArticle ? (
            <Link
              to={`/article/${prevArticle.number}`}
              className="flex items-center gap-2 p-3.5 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition-all group flex-1 min-w-0"
            >
              <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-900 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div className="min-w-0">
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">#{prevArticle.number}</div>
                <div className="text-sm font-medium text-gray-900 truncate">{displayTitle(prevArticle)}</div>
              </div>
            </Link>
          ) : <div className="flex-1" />}

          {nextArticle ? (
            <Link
              to={`/article/${nextArticle.number}`}
              className="flex items-center gap-2 p-3.5 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition-all group flex-1 min-w-0 justify-end text-right"
            >
              <div className="min-w-0">
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">#{nextArticle.number}</div>
                <div className="text-sm font-medium text-gray-900 truncate">{displayTitle(nextArticle)}</div>
              </div>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-900 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : <div className="flex-1" />}
        </div>
      </div>
    </div>
  );
}
