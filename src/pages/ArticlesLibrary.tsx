import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loadArticles, loadSessions, getFourCColorClass, getFourCTextClass, getFourCLightBgClass } from '../utils/dataLoader';
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 tracking-tight">
            Sunday Thoughts Article Library
          </h1>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 md:w-96 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Category</span>
              {['All', 'Communication', 'Customer', 'Cognizance', 'Charisma'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filter === cat
                      ? cat === 'All'
                        ? 'bg-gray-900 text-white'
                        : `${getFourCColorClass(cat)} text-white`
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Status</span>
              {['All', 'In Curriculum', 'Not in Curriculum'].map(status => (
                <button
                  key={status}
                  onClick={() => setCurriculumFilter(status)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    curriculumFilter === status
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Showing {filteredArticles.length} of {articles.length} articles
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(article => (
            <ArticleCard key={article.number} article={article} sessions={sessions} />
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No articles found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  const parts = dateString.split(' ');
  if (parts.length >= 2) {
    const month = parts[1];
    const year = parts[2] || new Date().getFullYear().toString();
    const yearShort = year.slice(-2);
    return `${month} '${yearShort}`;
  }
  return dateString;
}

function ArticleCard({ article, sessions }: { article: Article; sessions: Session[] }) {
  const inCurriculum = article.sessions.length > 0;

  const sessionToFourC = new Map<string, string>();
  sessions.forEach(session => {
    sessionToFourC.set(session.id.toLowerCase(), session.fourC);
  });

  const fourCCategories = Array.from(
    new Set(
      article.sessions
        .map(sessionId => {
          const sessionIdLower = sessionId.toLowerCase();
          return sessionToFourC.get(sessionIdLower) ||
                 (['Communication', 'Customer', 'Cognizance', 'Charisma'].includes(sessionId) ? sessionId : null);
        })
        .filter((cat): cat is string => cat !== null)
    )
  );

  const formattedDate = formatDate(article.date);

  return (
    <Link
      to={`/article/${article.number}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 p-6 block border border-gray-200"
    >
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-gray-400 text-sm font-mono font-medium flex-shrink-0">
          #{article.number}
        </span>
        <div className="flex-1 flex items-baseline gap-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-700 flex-1">
            {article.title}
          </h3>
          <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-xs font-medium whitespace-nowrap flex-shrink-0 border border-gray-200">
            {formattedDate}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {article.topics.slice(0, 3).map((topic, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600 font-medium"
          >
            {topic}
          </span>
        ))}
        {article.topics.length > 3 && (
          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
            +{article.topics.length - 3}
          </span>
        )}
        {fourCCategories.map((fourC, idx) => (
          <span
            key={idx}
            className={`px-2 py-0.5 rounded text-xs font-semibold ${getFourCLightBgClass(fourC)} ${getFourCTextClass(fourC)}`}
          >
            {fourC}
          </span>
        ))}
        {inCurriculum && (
          <span className="px-2 py-0.5 bg-gray-900 text-white rounded text-xs font-semibold">
            In Curriculum
          </span>
        )}
      </div>
    </Link>
  );
}
