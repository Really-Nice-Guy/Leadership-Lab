import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loadArticles, loadSessions, getFourCColorClass, getFourCTextClass, getFourCLightBgClass } from '../utils/dataLoader';
import { isArticleRead } from '../utils/progress';
import type { Article, Session } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ArticlesLibrary() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const [curriculumFilter, setCurriculumFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadArticles(), loadSessions()]).then(([articlesData, sessionsData]) => {
      setArticles(articlesData);
      setSessions(sessionsData);
      setLoading(false);
    });
  }, []);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filter === 'All' || article.sessions.some(s =>
      s.toLowerCase().includes(filter.toLowerCase())
    );
    const matchesCurriculum = curriculumFilter === 'All' ||
      (curriculumFilter === 'In Curriculum' && article.sessions.length > 0) ||
      (curriculumFilter === 'Not in Curriculum' && article.sessions.length === 0);

    return matchesSearch && matchesCategory && matchesCurriculum;
  });

  if (loading) {
    return <LoadingSpinner message="Loading articles..." />;
  }

  const readCount = articles.filter(a => isArticleRead(a.number)).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            Sunday Thoughts Article Library
          </h1>
          <p className="text-gray-500 mb-5">
            {articles.length} curated articles — {readCount} read
          </p>

          {/* Reading progress bar */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6 max-w-xs">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: articles.length ? `${Math.round((readCount / articles.length) * 100)}%` : '0%',
                background: 'linear-gradient(to right, #10B981, #F59E0B)',
              }}
            />
          </div>

          {/* Search */}
          <div className="mb-5">
            <input
              type="text"
              placeholder="Search articles…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-colors bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</span>
              {['All', 'Communication', 'Customer', 'Cognizance', 'Charisma'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    filter === cat
                      ? cat === 'All'
                        ? 'bg-gray-900 text-white'
                        : `${getFourCColorClass(cat)} text-white`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</span>
              {['All', 'In Curriculum', 'Not in Curriculum'].map(status => (
                <button
                  key={status}
                  onClick={() => setCurriculumFilter(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    curriculumFilter === status
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-3">
            Showing {filteredArticles.length} of {articles.length} articles
          </p>
        </div>
      </div>

      {/* Article grid */}
      <div className="px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-400">No articles found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredArticles.map(article => (
                <ArticleCard key={article.number} article={article} sessions={sessions} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  const parts = dateString.split(' ');
  if (parts.length >= 2) {
    const month = parts[1];
    const year = parts[2] || new Date().getFullYear().toString();
    return `${month} '${year.slice(-2)}`;
  }
  return dateString;
}

function ArticleCard({ article, sessions }: { article: Article; sessions: Session[] }) {
  const inCurriculum = article.sessions.length > 0;
  const read = isArticleRead(article.number);

  const sessionToFourC = new Map<string, string>();
  sessions.forEach(session => {
    sessionToFourC.set(session.id.toLowerCase(), session.fourC);
  });

  const fourCCategories = Array.from(
    new Set(
      article.sessions
        .map(sessionId => {
          const lower = sessionId.toLowerCase();
          return sessionToFourC.get(lower) ||
            (['Communication', 'Customer', 'Cognizance', 'Charisma'].includes(sessionId) ? sessionId : null);
        })
        .filter((cat): cat is string => cat !== null)
    )
  );

  return (
    <Link
      to={`/article/${article.number}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col border border-gray-100 overflow-hidden"
    >
      {/* Top accent stripe */}
      <div
        className="h-1 w-full"
        style={{
          background: fourCCategories.length > 0
            ? ({ Communication: '#3B82F6', Customer: '#10B981', Cognizance: '#8B5CF6', Charisma: '#F59E0B' } as Record<string, string>)[fourCCategories[0]] ?? '#E5E7EB'
            : '#E5E7EB',
        }}
      />

      <div className="p-5 flex-1 flex flex-col">
        {/* Number + date */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold text-gray-400">#{article.number}</span>
          <div className="flex items-center gap-2">
            {read && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                ✓ Read
              </span>
            )}
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
              {formatDate(article.date)}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 line-clamp-3 group-hover:text-gray-700 transition-colors leading-snug flex-1 mb-3">
          {article.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {article.topics.slice(0, 2).map((topic, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-500 font-medium">
              {topic}
            </span>
          ))}
          {article.topics.length > 2 && (
            <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-400">
              +{article.topics.length - 2}
            </span>
          )}
          {fourCCategories.map((fourC, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${getFourCLightBgClass(fourC)} ${getFourCTextClass(fourC)}`}
            >
              {fourC}
            </span>
          ))}
          {inCurriculum && (
            <span className="px-2 py-0.5 bg-gray-900 text-white rounded-full text-xs font-semibold">
              In Curriculum
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
