import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { loadArticles, loadSessions, getFourCColorClass, getFourCBorderClass } from '../utils/dataLoader';
import { markArticleRead, isArticleRead } from '../utils/progress';
import type { Article, Session } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

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
    Promise.all([loadArticles(), loadSessions()])
      .then(([articlesData, sessionsData]) => {
        const foundArticle = articlesData.find(a => a.number === Number(id));
        setArticle(foundArticle || null);
        setSessions(sessionsData);
        setAllArticles(articlesData);
        setLoading(false);
        if (foundArticle) {
          setAlreadyRead(isArticleRead(foundArticle.number));
        }
      });
  }, [id]);

  // Auto mark as read when 80% through
  useEffect(() => {
    if (article && readingProgress >= 80 && !alreadyRead) {
      markArticleRead(article.number, article.title);
      setAlreadyRead(true);
    }
  }, [readingProgress, article, alreadyRead]);

  if (loading) {
    return <LoadingSpinner message="Loading article..." />;
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h2>
          <Link to="/articles" className="text-gray-900 hover:underline font-medium">
            Back to Articles Library
          </Link>
        </div>
      </div>
    );
  }

  const relatedSessions = sessions.filter(s => s.articles.includes(article.number));
  const relatedArticles = allArticles.filter(a =>
    a.number !== article.number &&
    a.sessions.some(s => article.sessions.includes(s))
  ).slice(0, 3);

  const currentIndex = allArticles.findIndex(a => a.number === article.number);
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;
  const inCurriculum = article.sessions.length > 0;

  return (
    <div ref={contentRef} className="min-h-screen bg-gray-50">

      {/* ── Reading progress bar (fixed to top) ── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent md:left-64">
        <div
          className="h-full transition-all duration-150"
          style={{
            width: `${readingProgress}%`,
            background: 'linear-gradient(to right, #3B82F6, #8B5CF6, #F59E0B)',
          }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm transition-all text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Main content card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Coloured top bar based on 4C */}
          {inCurriculum && relatedSessions.length > 0 && (
            <div
              className="h-1.5"
              style={{
                background: ({
                  Communication: 'linear-gradient(to right, #3B82F6, #1D4ED8)',
                  Customer: 'linear-gradient(to right, #10B981, #047857)',
                  Cognizance: 'linear-gradient(to right, #8B5CF6, #5B21B6)',
                  Charisma: 'linear-gradient(to right, #F59E0B, #B45309)',
                } as Record<string, string>)[relatedSessions[0]?.fourC] ?? '#E5E7EB',
              }}
            />
          )}

          <div className="p-8">
            {/* Article number + read status */}
            <div className="flex items-start gap-4 mb-6">
              <span className="bg-gray-900 text-white rounded-2xl w-14 h-14 flex items-center justify-center text-xl font-extrabold flex-shrink-0">
                {article.number}
              </span>
              <div className="flex-1 pt-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {inCurriculum ? (
                    <span className="bg-gray-900 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      Part of Curriculum
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-semibold">
                      Additional Reading
                    </span>
                  )}
                  {alreadyRead && (
                    <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full font-semibold">
                      ✓ Read
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-snug">
                  {article.title}
                </h1>
                <p className="text-gray-400 text-sm mt-2">{article.date}</p>
              </div>
            </div>

            {/* Reading progress inline */}
            {article.content && (
              <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-150"
                    style={{
                      width: `${readingProgress}%`,
                      background: 'linear-gradient(to right, #3B82F6, #8B5CF6)',
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-400 tabular-nums w-10 text-right">
                  {readingProgress}%
                </span>
                {alreadyRead && <span className="text-xs text-emerald-600 font-semibold">Read ✓</span>}
              </div>
            )}

            {/* Topics */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {article.topics.map((topic, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 font-medium">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Article content */}
            {article.content ? (
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Article Content</h3>
                <div className="prose prose-gray prose-lg max-w-none prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-gray-700 prose-p:text-lg">
                  <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                    {article.content}
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-6 border-t border-gray-100">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                  <p className="text-gray-500">Full article content will be available soon.</p>
                </div>
              </div>
            )}

            {/* Related sessions */}
            {relatedSessions.length > 0 && (
              <div className="pt-6 mt-6 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Appears in These Sessions
                </h3>
                <div className="space-y-3">
                  {relatedSessions.map(session => (
                    <Link
                      key={session.id}
                      to={`/curriculum#${session.id}`}
                      className={`block p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 border-l-4 ${getFourCBorderClass(session.fourC)}`}
                    >
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className={'px-2.5 py-1 rounded-full text-xs font-bold text-white ' + getFourCColorClass(session.fourC)}>
                          {session.fourC}
                        </span>
                        <span className="text-xs text-gray-400">Day {session.day} · {session.time}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">{session.name}</h4>
                      {article.relevance[session.id.replace('-', '_')] && (
                        <p className="text-xs text-gray-500 italic">
                          {article.relevance[session.id.replace('-', '_')]}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Related Articles</h3>
            <div className="space-y-2">
              {relatedArticles.map(relArticle => (
                <Link
                  key={relArticle.number}
                  to={`/article/${relArticle.number}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <span className="bg-gray-900 text-white rounded-xl w-9 h-9 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {relArticle.number}
                  </span>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm group-hover:text-gray-700 transition-colors">
                      {relArticle.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">{relArticle.date}</p>
                  </div>
                  {isArticleRead(relArticle.number) && (
                    <span className="ml-auto text-xs text-emerald-600 font-semibold flex-shrink-0">✓ Read</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Prev / Next navigation */}
        <div className="flex justify-between gap-3">
          {prevArticle ? (
            <Link
              to={`/article/${prevArticle.number}`}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition-all group flex-1 min-w-0"
            >
              <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-900 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div className="min-w-0">
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Previous</div>
                <div className="font-semibold text-gray-900 text-sm truncate">
                  #{prevArticle.number} · {prevArticle.title}
                </div>
              </div>
            </Link>
          ) : <div className="flex-1" />}

          {nextArticle ? (
            <Link
              to={`/article/${nextArticle.number}`}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition-all group flex-1 min-w-0 justify-end text-right"
            >
              <div className="min-w-0">
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Next</div>
                <div className="font-semibold text-gray-900 text-sm truncate">
                  #{nextArticle.number} · {nextArticle.title}
                </div>
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
