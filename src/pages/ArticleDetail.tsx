import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { loadArticles, loadSessions, getFourCColorClass, getFourCBorderClass } from '../utils/dataLoader';
import type { Article, Session } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadArticles(), loadSessions()])
      .then(([articlesData, sessionsData]) => {
        const foundArticle = articlesData.find(a => a.number === Number(id));
        setArticle(foundArticle || null);
        setSessions(sessionsData);
        setAllArticles(articlesData);
        setLoading(false);
      });
  }, [id]);

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

  const relatedSessions = sessions.filter(s =>
    s.articles.includes(article.number)
  );

  const relatedArticles = allArticles.filter(a =>
    a.number !== article.number &&
    a.sessions.some(s => article.sessions.includes(s))
  ).slice(0, 3);

  const currentIndex = allArticles.findIndex(a => a.number === article.number);
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;

  const inCurriculum = article.sessions.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <span className="bg-gray-900 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {article.number}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                {inCurriculum ? (
                  <span className="bg-gray-900 text-white text-xs px-3 py-1 rounded-full font-semibold">
                    Part of Curriculum
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-semibold">
                    Additional Reading
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                {article.title}
              </h1>
              <p className="text-gray-500">{article.date}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 tracking-wide">Topics</h3>
            <div className="flex flex-wrap gap-2">
              {article.topics.map((topic, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {article.content && (
            <div className="mb-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 tracking-wide">Article Content</h3>
              <div className="prose prose-gray prose-lg max-w-none prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {article.content}
                </div>
              </div>
            </div>
          )}

          {!article.content && (
            <div className="mb-6 pt-6 border-t border-gray-200">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-600">
                  Full article content will be available soon.
                </p>
              </div>
            </div>
          )}

          {relatedSessions.length > 0 && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 tracking-wide">
                Appears in These Sessions
              </h3>
              <div className="space-y-3">
                {relatedSessions.map(session => (
                  <Link
                    key={session.id}
                    to={`/curriculum#${session.id}`}
                    className={`block p-4 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 border-l-4 ${getFourCBorderClass(session.fourC)}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className={'px-3 py-1 rounded-full text-xs font-semibold text-white ' + getFourCColorClass(session.fourC)}>
                        {session.fourC}
                      </span>
                      <span className="text-sm text-gray-500">Day {session.day} &bull; {session.time}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {session.name}
                    </h4>
                    {article.relevance[session.id.replace('-', '_')] && (
                      <p className="text-sm text-gray-600 italic">
                        Why relevant: {article.relevance[session.id.replace('-', '_')]}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {relatedArticles.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Related Articles</h3>
            <div className="space-y-3">
              {relatedArticles.map(relArticle => (
                <Link
                  key={relArticle.number}
                  to={`/article/${relArticle.number}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="bg-gray-900 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {relArticle.number}
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {relArticle.title}
                      </h4>
                      <p className="text-sm text-gray-500">{relArticle.date}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          {prevArticle ? (
            <Link
              to={`/article/${prevArticle.number}`}
              className="flex items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-white hover:shadow-sm transition-all group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Previous</div>
                <div className="font-semibold text-gray-900">Article #{prevArticle.number}</div>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextArticle ? (
            <Link
              to={`/article/${nextArticle.number}`}
              className="flex items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-white hover:shadow-sm transition-all group"
            >
              <div className="text-right">
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Next</div>
                <div className="font-semibold text-gray-900">Article #{nextArticle.number}</div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
