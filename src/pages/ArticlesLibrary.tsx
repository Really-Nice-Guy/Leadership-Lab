import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { loadArticles } from '../utils/dataLoader';
import { isArticleRead } from '../utils/progress';
import type { Article } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ArticlesLibrary() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles().then(articlesData => {
      // Sort newest first
      setArticles(articlesData.slice().sort((a, b) => b.number - a.number));
      setLoading(false);
    });
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      return (
        !searchTerm ||
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [articles, searchTerm]);

  if (loading) return <LoadingSpinner message="Loading articles..." />;

  const readCount = articles.filter(a => isArticleRead(a.number)).length;
  const pct = articles.length ? Math.round((readCount / articles.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            Sunday Thoughts
          </h1>
          <p className="text-gray-500 mb-5">
            {articles.length} articles · {readCount} read ({pct}%)
          </p>

          {/* Progress */}
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-6 max-w-xs">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: 'linear-gradient(to right, #10B981, #7C3AED)' }}
            />
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search by title or content…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full sm:w-96 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 text-sm bg-gray-50 focus:bg-white transition-colors mb-5"
          />

          <p className="text-xs text-gray-400 mt-3">
            {filteredArticles.length} of {articles.length} articles
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-400">No articles match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredArticles.map(article => (
                <ArticleCard key={article.number} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function snippet(content: string, maxLen = 110): string {
  // Strip "Sunday thoughts:" opener and trim
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

function ArticleCard({ article }: { article: Article }) {
  const read = isArticleRead(article.number);

  return (
    <Link
      to={`/article/${article.number}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col border border-gray-100 overflow-hidden"
    >
      {/* Colour stripe */}
      <div className="h-1 w-full bg-gray-200" />

      <div className="p-5 flex-1 flex flex-col gap-3">
        {/* Number + date row */}
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

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors leading-snug">
          {displayTitle(article)}
        </h3>

        {/* Snippet */}
        {article.content && (
          <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed flex-1">
            {snippet(article.content)}
          </p>
        )}
      </div>
    </Link>
  );
}
