import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { loadSessions, loadArticles, getFourCColorClass, getFourCBorderClass, getFourCTextClass } from '../utils/dataLoader';
import type { Session, Article, Introspection, SessionResource } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

// === Types for SessionCard progressive reveal ===
type RevealItem =
  | { kind: 'description'; text: string }
  | { kind: 'coreTopics'; topics: string[] }
  | { kind: 'discussionPoint'; text: string; index: number; total: number }
  | { kind: 'introspection'; data: Introspection }
  | { kind: 'resources'; data: SessionResource[] }
  | { kind: 'articles' };

function buildRevealItems(session: Session): RevealItem[] {
  const items: RevealItem[] = [];
  if (session.description) {
    items.push({ kind: 'description', text: session.description });
  }
  items.push({ kind: 'coreTopics', topics: session.coreTopics });
  if (session.discussionPoints) {
    session.discussionPoints.forEach((text, i) => {
      items.push({ kind: 'discussionPoint', text, index: i, total: session.discussionPoints!.length });
    });
  }
  if (session.introspections) {
    session.introspections.forEach(intro => {
      items.push({ kind: 'introspection', data: intro });
    });
  }
  if (session.resources && session.resources.length > 0) {
    items.push({ kind: 'resources', data: session.resources });
  }
  if (session.articles.length > 0) {
    items.push({ kind: 'articles' });
  }
  return items;
}

// === Cognizance Grid Types & Constants ===
type CognizanceSection = 'grid' | 'culture' | 'goals-ack' | 'colleagues-env' | 'next6' | 'budget' | 'politics' | 'network';

const CLUSTER_COLORS: Record<string, { bg: string; hover: string; ring: string; number: number; gradient: string }> = {
  culture:          { bg: 'bg-teal-600',   hover: 'hover:bg-teal-500',   ring: 'ring-teal-400',   number: 1, gradient: 'from-teal-600 to-teal-800' },
  'goals-ack':      { bg: 'bg-blue-600',   hover: 'hover:bg-blue-500',   ring: 'ring-blue-400',   number: 2, gradient: 'from-blue-600 to-blue-800' },
  'colleagues-env': { bg: 'bg-indigo-600', hover: 'hover:bg-indigo-500', ring: 'ring-indigo-400', number: 3, gradient: 'from-indigo-600 to-indigo-800' },
  next6:            { bg: 'bg-rose-600',   hover: 'hover:bg-rose-500',   ring: 'ring-rose-400',   number: 4, gradient: 'from-rose-600 to-rose-800' },
  budget:           { bg: 'bg-amber-600',  hover: 'hover:bg-amber-500',  ring: 'ring-amber-400',  number: 5, gradient: 'from-amber-600 to-amber-800' },
  politics:         { bg: 'checkerboard',  hover: '',                     ring: 'ring-gray-400',   number: 6, gradient: 'from-gray-800 to-black' },
  network:          { bg: 'bg-orange-600', hover: 'hover:bg-orange-500', ring: 'ring-orange-400', number: 7, gradient: 'from-orange-600 to-orange-800' },
};

const SECTION_STYLES: Record<string, { lightBg: string; border: string; accent: string }> = {
  culture:          { lightBg: 'bg-teal-50',   border: 'border-teal-300',   accent: 'text-teal-700' },
  'goals-ack':      { lightBg: 'bg-blue-50',   border: 'border-blue-300',   accent: 'text-blue-700' },
  'colleagues-env': { lightBg: 'bg-indigo-50', border: 'border-indigo-300', accent: 'text-indigo-700' },
  next6:            { lightBg: 'bg-rose-50',   border: 'border-rose-300',   accent: 'text-rose-700' },
  budget:           { lightBg: 'bg-amber-50',  border: 'border-amber-300',  accent: 'text-amber-700' },
  politics:         { lightBg: 'bg-red-50',    border: 'border-red-300',    accent: 'text-red-700' },
  network:          { lightBg: 'bg-orange-50', border: 'border-orange-300', accent: 'text-orange-700' },
};

const GRID_CELLS: { label: string; cluster: Exclude<CognizanceSection, 'grid'> }[] = [
  // Row 1
  { label: 'Culture',       cluster: 'culture' },
  { label: 'Goals',         cluster: 'goals-ack' },
  { label: 'The ACK Model', cluster: 'goals-ack' },
  { label: 'Environment',   cluster: 'colleagues-env' },
  { label: 'Competition',   cluster: 'colleagues-env' },
  // Row 2
  { label: 'Development',   cluster: 'next6' },
  { label: 'Strengths',     cluster: 'next6' },
  { label: 'Opportunities', cluster: 'next6' },
  { label: 'Colleagues',    cluster: 'colleagues-env' },
  { label: 'Budget',        cluster: 'budget' },
  // Row 3
  { label: 'Career',        cluster: 'next6' },
  { label: 'Accolades',     cluster: 'next6' },
  { label: 'Mistakes',      cluster: 'next6' },
  { label: 'Politics',      cluster: 'politics' },
  { label: 'Network',       cluster: 'network' },
];

// === Visually rich Session Content Display ===
function SessionContentDisplay({
  session,
  articles,
  filterDiscussionPoints,
}: {
  session: Session;
  articles: Article[];
  filterDiscussionPoints?: (dp: string) => boolean;
}) {
  const getArticleById = (id: number) => articles.find(a => a.number === id);
  const discussionPoints = session.discussionPoints
    ? filterDiscussionPoints
      ? session.discussionPoints.filter(filterDiscussionPoints)
      : session.discussionPoints
    : [];

  return (
    <div className="space-y-8">
      {/* Session header with colored accent */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-full bg-gradient-to-b from-cognizance to-cognizance/30" />
        <div className="pl-6">
          <h3 className="text-2xl font-bold text-gray-900 leading-tight">{session.name}</h3>
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-cognizance/10 text-cognizance">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {session.time}
            </span>
          </div>
        </div>
      </div>

      {/* Description as a quote-style block */}
      {session.description && (
        <div className="relative bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <svg className="absolute top-3 left-4 w-8 h-8 text-cognizance/15" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983z"/></svg>
          <p className="text-gray-600 italic leading-relaxed pl-8 text-base">{session.description}</p>
        </div>
      )}

      {/* Core Topics as colorful badges */}
      {session.coreTopics.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-md bg-cognizance/10 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-cognizance" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            </span>
            <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Core Topics</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {session.coreTopics.map((topic, idx) => (
              <span key={idx} className="px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200 shadow-sm">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Discussion Points as cards */}
      {discussionPoints.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </span>
            <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Discussion Points</h4>
          </div>
          <div className="space-y-2">
            {(() => {
              // Group numbered sub-items (e.g. "1. Foo", "2. Bar") under their parent item
              const grouped: { point: string; children: string[]; isVideoBreak: boolean; videoResource?: { url: string; title: string } }[] = [];
              for (let i = 0; i < discussionPoints.length; i++) {
                const point = discussionPoints[i];
                const isVideoBreak = point.startsWith('Video Break:');
                const videoResource = isVideoBreak
                  ? session.resources?.find(r => r.title === point.replace('Video Break: ', ''))
                  : undefined;
                // Collect any following numbered sub-items (e.g. "1. ...", "2. ...")
                const children: string[] = [];
                while (i + 1 < discussionPoints.length && /^\d+\.\s/.test(discussionPoints[i + 1])) {
                  children.push(discussionPoints[i + 1].replace(/^\d+\.\s/, ''));
                  i++;
                }
                grouped.push({ point, children, isVideoBreak, videoResource });
              }

              let counter = 0;
              return grouped.map((item, gIdx) => {
                counter++;
                const currentNum = counter;

                if (item.isVideoBreak && item.videoResource) {
                  return (
                    <a
                      key={gIdx}
                      href={item.videoResource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 hover:shadow-md transition-shadow group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"/>
                        </svg>
                      </div>
                      <div>
                        <span className="text-base font-semibold text-red-800">{item.point}</span>
                        <span className="block text-sm text-red-500 mt-0.5">Click to watch on YouTube</span>
                      </div>
                    </a>
                  );
                }

                return (
                  <div key={gIdx}>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow transition-shadow">
                      <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                        {currentNum}
                      </span>
                      <span className="text-gray-700 leading-relaxed">{item.point}</span>
                    </div>
                    {item.children.length > 0 && (
                      <div className="ml-10 mt-1.5 space-y-1.5">
                        {item.children.map((child, cIdx) => (
                          <div key={cIdx} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-100">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                              {cIdx + 1}
                            </span>
                            <span className="text-gray-700 text-sm font-medium">{child}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Introspections as gradient-accented cards */}
      {session.introspections && session.introspections.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </span>
            <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Introspections</h4>
          </div>
          {session.introspections.map((intro, idx) => (
            <div key={idx} className="relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-50/50 p-5 shadow-sm">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-amber-600 rounded-r" />
              <h5 className="font-bold text-amber-900 mb-3 pl-3 text-base">{intro.title}</h5>
              <ul className="space-y-2 pl-3">
                {intro.prompts.map((prompt, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2.5 text-amber-800">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-xs font-bold mt-0.5">{pIdx + 1}</span>
                    <span className="leading-relaxed">{prompt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Resources as rich link cards */}
      {session.resources && session.resources.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            </span>
            <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Resources</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {session.resources.map((resource, idx) => (
              <a
                key={idx}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-4 rounded-xl bg-white border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">{resource.title}</span>
                  {resource.source && (
                    <span className="block text-xs text-gray-500 mt-0.5">{resource.source}</span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Related Articles as rich cards */}
      {session.hasContent && session.articles.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-md bg-cognizance/10 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-cognizance" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </span>
            <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Related Articles</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {session.articles.map(articleId => {
              const article = getArticleById(articleId);
              if (!article) return null;
              return (
                <Link
                  key={articleId}
                  to={`/article/${articleId}`}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:border-cognizance/30 hover:shadow-md transition-all group"
                >
                  <span className="rounded-xl w-10 h-10 flex items-center justify-center text-sm font-bold flex-shrink-0 bg-gradient-to-br from-cognizance to-cognizance/80 text-white shadow-sm">
                    {article.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-gray-800 group-hover:text-cognizance transition-colors text-sm leading-tight">{article.title}</h5>
                    <p className="text-xs text-gray-500 mt-1">{article.date}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {!session.hasContent && session.articles.length === 0 && session.emptyReason && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-700">
            <strong>No deeply relevant articles found.</strong>
            <span className="block mt-2 text-gray-500">{session.emptyReason}</span>
          </p>
        </div>
      )}
    </div>
  );
}

// === Back to Grid Button ===
function BackToGridButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <button
        onClick={onClick}
        className="group px-6 py-3 bg-gradient-to-r from-cognizance to-cognizance/80 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Cognition Grid
      </button>
    </div>
  );
}

// === Cognizance Grid Section ===
function CognizanceGridSection({ sessions, articles }: { sessions: Session[]; articles: Article[] }) {
  const [activeSection, setActiveSection] = useState<CognizanceSection>('grid');
  const containerRef = useRef<HTMLDivElement>(null);

  const getSession = (id: string) => sessions.find(s => s.id === id);

  const goBackToGrid = () => {
    setActiveSection('grid');
    setTimeout(() => containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const openSection = (section: CognizanceSection) => {
    setActiveSection(section);
    setTimeout(() => containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  // Filter out "7 Tiny Daily Habits" and its numbered items from Metrics
  const filterMetricsDiscussionPoints = (dp: string) => {
    if (dp.includes('7 Tiny Daily Habits')) return false;
    if (/^\d+\.\s/.test(dp)) return false;
    return true;
  };

  // === Grid View ===
  if (activeSection === 'grid') {
    return (
      <div ref={containerRef} className="rounded-2xl border-2 border-cognizance/30 bg-gradient-to-br from-cognizance/5 via-white to-cognizance/5 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <span className="px-4 py-1.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-cognizance to-cognizance/80 shadow-sm">
            Cognizance
          </span>
          <span className="text-sm text-gray-500">
            Self-awareness, goals, culture, metrics
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-5">Cognition</h3>
        <div className="grid grid-cols-5 gap-2">
          {GRID_CELLS.map((cell, idx) => {
            const colors = CLUSTER_COLORS[cell.cluster];
            return (
              <button
                key={idx}
                onClick={() => openSection(cell.cluster)}
                className={`${colors.bg} ${colors.hover} ${cell.cluster === 'politics' ? 'text-black' : 'text-white'} rounded-xl py-4 px-2 text-sm font-semibold transition-all cursor-pointer text-center shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex flex-col items-center gap-1.5`}
              >
                <span className={`w-6 h-6 rounded-full ${cell.cluster === 'politics' ? 'bg-black/20' : 'bg-white/25'} flex items-center justify-center text-xs font-bold backdrop-blur-sm`}>
                  {colors.number}
                </span>
                <span className={`leading-tight ${cell.cluster === 'politics' ? 'bg-black/20 px-2 py-0.5 rounded backdrop-blur-sm text-white' : ''}`}>{cell.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // === Section Views ===
  const styles = SECTION_STYLES[activeSection] || { lightBg: 'bg-white', border: 'border-gray-200', accent: 'text-gray-700' };

  return (
    <div ref={containerRef} className={`rounded-2xl border-2 ${styles.border} ${styles.lightBg} p-6 shadow-sm`}>
      {/* Breadcrumb back link */}
      <div className="mb-6">
        <button
          onClick={goBackToGrid}
          className="group text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 transition-colors"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Cognition Grid
        </button>
      </div>

      {/* Culture */}
      {activeSection === 'culture' && getSession('culture') && (
        <div>
          <SessionContentDisplay session={getSession('culture')!} articles={articles} />
          <BackToGridButton onClick={goBackToGrid} />
        </div>
      )}

      {/* Goals & ACK Model */}
      {activeSection === 'goals-ack' && (
        <div className="space-y-10">
          {getSession('goals') && (
            <SessionContentDisplay session={getSession('goals')!} articles={articles} />
          )}
          {getSession('metrics') && (
            <>
              <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div><div className="relative flex justify-center"><span className="bg-blue-50 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Metrics</span></div></div>
              <SessionContentDisplay
                session={getSession('metrics')!}
                articles={articles}
                filterDiscussionPoints={filterMetricsDiscussionPoints}
              />
            </>
          )}
          {getSession('creating-value') && (
            <>
              <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div><div className="relative flex justify-center"><span className="bg-blue-50 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Creating Value</span></div></div>
              <SessionContentDisplay session={getSession('creating-value')!} articles={articles} />
            </>
          )}
          <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div><div className="relative flex justify-center"><span className="bg-blue-50 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">ACK Model</span></div></div>
          <div className="bg-white rounded-xl p-8 border border-blue-200 shadow-sm text-center">
            <h3 className="text-2xl font-bold text-gray-900"><a href="/The ACK Model.jpeg" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 underline decoration-blue-400 underline-offset-4 transition-colors">The ACK Model</a></h3>
          </div>
          <BackToGridButton onClick={goBackToGrid} />
        </div>
      )}

      {/* Colleagues, Competition & Environment */}
      {activeSection === 'colleagues-env' && (
        <div className="space-y-10">
          {getSession('colleagues') && (
            <SessionContentDisplay session={getSession('colleagues')!} articles={articles} />
          )}
          {getSession('competition') && (
            <>
              <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div><div className="relative flex justify-center"><span className="bg-indigo-50 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Competition</span></div></div>
              <SessionContentDisplay session={getSession('competition')!} articles={articles} />
            </>
          )}
          {getSession('environment') && (
            <>
              <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div><div className="relative flex justify-center"><span className="bg-indigo-50 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Environment</span></div></div>
              <SessionContentDisplay session={getSession('environment')!} articles={articles} />
            </>
          )}
          <BackToGridButton onClick={goBackToGrid} />
        </div>
      )}

      {/* The Next 6 */}
      {activeSection === 'next6' && (
        <div className="space-y-6">
          <div className="text-center mb-4">
            <h3 className="text-3xl font-bold text-gray-900">The Next 6</h3>
            <p className="text-lg text-gray-500 italic mt-2">Let me think about myself 360 Degrees Around me</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'What are my strengths? How do I play with them?',
              'What are my opportunities? Am I aware?',
              'What do I remember as my one big win in my career?',
              'What if at all I can think of a mistake I made, small or big, recent or past?',
              'What do I want to build as a new set of skills?',
              'What am I passionate about? Do I invest my time in that beyond my job?',
            ].map((item, idx) => (
              <div key={idx} className="relative overflow-hidden rounded-xl bg-white border border-rose-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-rose-500 to-rose-700 rounded-r" />
                <div className="flex items-start gap-3 pl-2">
                  <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    {idx + 1}
                  </span>
                  <span className="text-gray-800 leading-relaxed font-medium pt-1.5">{item}</span>
                </div>
              </div>
            ))}
          </div>
          <BackToGridButton onClick={goBackToGrid} />
        </div>
      )}

      {/* Budget */}
      {activeSection === 'budget' && getSession('budget') && (
        <div>
          <SessionContentDisplay session={getSession('budget')!} articles={articles} />
          <BackToGridButton onClick={goBackToGrid} />
        </div>
      )}

      {/* Politics */}
      {activeSection === 'politics' && getSession('politics') && (
        <div>
          <SessionContentDisplay session={getSession('politics')!} articles={articles} />
          <BackToGridButton onClick={goBackToGrid} />
        </div>
      )}

      {/* Network */}
      {activeSection === 'network' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-8 border border-orange-200 shadow-sm text-center">
            <h3 className="text-3xl font-bold text-gray-900"><a href="https://drive.google.com/file/d/1t97yibxlg0H9cR4Igp4AyZJeJzT0IHci/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 underline decoration-orange-400 underline-offset-4 transition-colors">Networking</a></h3>
          </div>
          <BackToGridButton onClick={goBackToGrid} />
        </div>
      )}
    </div>
  );
}

// === Main Curriculum Component ===
export default function Curriculum() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadSessions(), loadArticles()])
      .then(([sessionsData, articlesData]) => {
        setSessions(sessionsData);
        setArticles(articlesData);
        setLoading(false);
      });
  }, []);

  const toggleSession = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const cognizanceSessions = sessions.filter(s => s.fourC === 'Cognizance');
  const nonCognizanceSessions = sessions.filter(s => s.fourC !== 'Cognizance');

  const filteredNonCognizance = filter === 'All'
    ? nonCognizanceSessions
    : nonCognizanceSessions.filter(s => s.fourC === filter);

  const showCognizanceGrid = filter === 'All' || filter === 'Cognizance';

  if (loading) {
    return <LoadingSpinner message="Loading curriculum..." />;
  }

  const allNonCognizanceSessions = filteredNonCognizance;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 tracking-tight">
            Leadership Laboratory Curriculum
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            A comprehensive workshop exploring the 4 Cs of Leadership
          </p>

          <div className="flex flex-wrap gap-2">
            {['All', 'Communication', 'Customer', 'Cognizance', 'Charisma'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === cat
                    ? cat === 'All'
                      ? 'bg-gray-900 text-white'
                      : `${getFourCColorClass(cat)} text-white`
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {allNonCognizanceSessions.filter(s => s.day === 1).map(session => (
            <SessionCard
              key={session.id}
              session={session}
              articles={articles}
              isExpanded={expandedSessions.has(session.id)}
              onToggle={() => toggleSession(session.id)}
            />
          ))}

          {/* Cognition Grid */}
          {showCognizanceGrid && cognizanceSessions.length > 0 && (
            <CognizanceGridSection sessions={cognizanceSessions} articles={articles} />
          )}

          {allNonCognizanceSessions.filter(s => s.day === 2).map(session => (
            <SessionCard
              key={session.id}
              session={session}
              articles={articles}
              isExpanded={expandedSessions.has(session.id)}
              onToggle={() => toggleSession(session.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// === SessionCard Component (for non-cognizance sessions — enhanced visuals) ===
function SessionCard({
  session,
  articles,
  isExpanded,
  onToggle,
}: {
  session: Session;
  articles: Article[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [step, setStep] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const revealItems = buildRevealItems(session);
  const totalSteps = revealItems.length;
  const allRevealed = step >= totalSteps;

  useEffect(() => {
    if (!isExpanded) setStep(0);
  }, [isExpanded]);

  const advance = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (step < totalSteps) setStep(s => s + 1);
  }, [step, totalSteps]);

  const goBack = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (step > 0) setStep(s => s - 1);
  }, [step]);

  const revealAll = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setStep(totalSteps);
  }, [totalSteps]);

  useEffect(() => {
    if (!isExpanded) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setStep(s => Math.min(s + 1, totalSteps));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setStep(s => Math.max(s - 1, 0));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isExpanded, totalSteps]);

  const getArticleById = (id: number) => articles.find(a => a.number === id);
  const accentBorder = getFourCBorderClass(session.fourC);
  const accentText = getFourCTextClass(session.fourC);

  const renderItem = (item: RevealItem, idx: number) => {
    const isCurrent = idx === step - 1;
    const isPast = idx < step - 1;
    const isVisible = idx < step;

    if (!isVisible) return null;

    switch (item.kind) {
      case 'description':
        return (
          <div key={`desc-${idx}`} className={`transition-all duration-500 ease-out ${isCurrent ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-50'}`}>
            <div className={`relative bg-white rounded-xl p-5 shadow-sm border transition-all duration-500 ${isCurrent ? 'border-gray-200' : 'border-gray-100'}`}>
              <svg className={`absolute top-3 left-4 w-6 h-6 transition-all duration-500 ${isCurrent ? 'text-gray-200' : 'text-gray-100'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983z"/></svg>
              <p className={`leading-relaxed italic pl-7 transition-all duration-500 ${isCurrent ? 'text-base text-gray-600' : 'text-sm text-gray-400'}`}>
                {item.text}
              </p>
            </div>
          </div>
        );

      case 'coreTopics':
        return (
          <div key={`topics-${idx}`} className={`transition-all duration-500 ease-out ${isCurrent ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-500 ${isCurrent ? 'bg-gray-100' : 'bg-gray-50'}`}>
                <svg className={`w-3 h-3 transition-all duration-500 ${isCurrent ? accentText : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              </span>
              <h4 className={`font-bold text-xs uppercase tracking-wider transition-all duration-500 ${isCurrent ? accentText : 'text-gray-300'}`}>Core Topics</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.topics.map((topic, tIdx) => (
                <span
                  key={tIdx}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-500 ${
                    isCurrent
                      ? 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200 shadow-sm'
                      : 'bg-gray-50 text-gray-400 border border-gray-100'
                  }`}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        );

      case 'discussionPoint': {
        const isVideoBreak = item.text.startsWith('Video Break:');
        const videoResource = isVideoBreak
          ? session.resources?.find(r => r.title === item.text.replace('Video Break: ', ''))
          : null;

        return (
          <div key={`dp-${idx}`} className={`transition-all duration-500 ease-out ${isCurrent ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-50'}`}>
            {isVideoBreak && videoResource ? (
              <a
                href={videoResource.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 group ${
                  isCurrent
                    ? 'bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 shadow-sm hover:shadow-md'
                    : 'bg-gray-50 border border-gray-100'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${isCurrent ? 'bg-red-600 shadow-sm group-hover:scale-105' : 'bg-gray-300'}`}>
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"/>
                  </svg>
                </div>
                <div>
                  <span className={`text-base font-semibold transition-all duration-500 ${isCurrent ? 'text-red-800' : 'text-gray-400'}`}>
                    {item.text}
                  </span>
                  {isCurrent && (
                    <span className="block text-sm text-red-500 mt-0.5">Click to watch on YouTube</span>
                  )}
                </div>
              </a>
            ) : (
              <div className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-500 ${
                isCurrent ? 'bg-white border border-gray-100 shadow-sm' : 'bg-transparent'
              }`}>
                <span className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold mt-0.5 transition-all duration-500 ${
                  isCurrent ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-300'
                }`}>
                  {item.index + 1}
                </span>
                <p className={`leading-relaxed transition-all duration-500 ${
                  isCurrent ? 'text-base font-medium text-gray-900' : 'text-sm text-gray-400'
                }`}>
                  {item.text}
                </p>
              </div>
            )}
          </div>
        );
      }

      case 'introspection':
        return (
          <div key={`intro-${idx}`} className={`transition-all duration-500 ease-out ${isCurrent ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-50'}`}>
            <div className={`relative overflow-hidden rounded-xl p-5 transition-all duration-500 ${
              isCurrent
                ? 'bg-gradient-to-br from-amber-50 via-white to-amber-50/50 border border-amber-200 shadow-sm'
                : 'bg-gray-50 border border-gray-100'
            }`}>
              <div className={`absolute top-0 left-0 w-1 h-full rounded-r transition-all duration-500 ${isCurrent ? 'bg-gradient-to-b from-amber-400 to-amber-600' : 'bg-gray-200'}`} />
              <h5 className={`font-bold mb-3 pl-3 transition-all duration-500 ${
                isCurrent ? 'text-base text-amber-900' : 'text-sm text-gray-400'
              }`}>{item.data.title}</h5>
              <ul className="space-y-2 pl-3">
                {item.data.prompts.map((prompt: string, pIdx: number) => (
                  <li key={pIdx} className={`flex items-start gap-2.5 transition-all duration-500 ${
                    isCurrent ? 'text-amber-800' : 'text-gray-400 text-xs'
                  }`}>
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 transition-all duration-500 ${
                      isCurrent ? 'bg-amber-200 text-amber-700' : 'bg-gray-100 text-gray-300'
                    }`}>{pIdx + 1}</span>
                    <span className="leading-relaxed">{prompt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'resources':
        return (
          <div key={`res-${idx}`} className={`transition-all duration-500 ease-out ${isCurrent ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-500 ${isCurrent ? 'bg-blue-100' : 'bg-gray-50'}`}>
                <svg className={`w-3 h-3 transition-all duration-500 ${isCurrent ? 'text-blue-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              </span>
              <h4 className={`font-bold text-xs uppercase tracking-wider transition-all duration-500 ${isCurrent ? 'text-blue-700' : 'text-gray-300'}`}>Resources</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {item.data.map((resource: SessionResource, rIdx: number) => (
                <a
                  key={rIdx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-500 group ${
                    isCurrent
                      ? 'bg-white border border-blue-100 hover:border-blue-300 hover:shadow-md'
                      : 'bg-gray-50 border border-gray-100'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500 ${isCurrent ? 'bg-blue-50 group-hover:bg-blue-100' : 'bg-gray-100'}`}>
                    <svg className={`w-4 h-4 transition-all duration-500 ${isCurrent ? 'text-blue-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  <div>
                    <span className={`text-sm font-semibold transition-all duration-500 ${isCurrent ? 'text-gray-800 group-hover:text-blue-700' : 'text-gray-400'}`}>{resource.title}</span>
                    {resource.source && (
                      <span className={`block text-xs mt-0.5 transition-all duration-500 ${isCurrent ? 'text-gray-500' : 'text-gray-300'}`}>{resource.source}</span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        );

      case 'articles':
        return (
          <div key={`art-${idx}`} className={`transition-all duration-500 ease-out ${isCurrent ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-500 ${isCurrent ? 'bg-gray-100' : 'bg-gray-50'}`}>
                <svg className={`w-3 h-3 transition-all duration-500 ${isCurrent ? accentText : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </span>
              <h4 className={`font-bold text-xs uppercase tracking-wider transition-all duration-500 ${isCurrent ? accentText : 'text-gray-300'}`}>Related Articles</h4>
            </div>
            {session.hasContent ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {session.articles.map(articleId => {
                  const article = getArticleById(articleId);
                  if (!article) return null;
                  return (
                    <Link
                      key={articleId}
                      to={`/article/${articleId}`}
                      onClick={e => e.stopPropagation()}
                      className={`flex items-start gap-3 p-4 rounded-xl transition-all duration-500 group ${
                        isCurrent
                          ? 'bg-white border border-gray-100 hover:border-gray-300 hover:shadow-md'
                          : 'bg-gray-50/50 border border-gray-100'
                      }`}
                    >
                      <span className={`rounded-xl w-10 h-10 flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all duration-500 ${
                        isCurrent ? `bg-gradient-to-br ${getFourCColorClass(session.fourC)} text-white shadow-sm` : 'bg-gray-200 text-gray-500'
                      }`}>
                        {article.number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h5 className={`font-semibold text-sm leading-tight transition-all duration-500 ${isCurrent ? 'text-gray-800 group-hover:text-blue-700' : 'text-gray-400'}`}>
                          {article.title}
                        </h5>
                        <p className={`text-xs mt-1 transition-all duration-500 ${isCurrent ? 'text-gray-500' : 'text-gray-300'}`}>{article.date}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
                <p className="text-sm text-gray-700">
                  <strong>No deeply relevant articles found.</strong>
                  {session.emptyReason && (
                    <span className="block mt-2 text-gray-500">{session.emptyReason}</span>
                  )}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div
        onClick={onToggle}
        className="p-6 cursor-pointer hover:bg-gray-50/80 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${getFourCColorClass(session.fourC)} shadow-sm`}>
                {session.fourC}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {session.time}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {session.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              <span>{session.articles.length} article{session.articles.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="ml-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-gray-100 rotate-180' : 'bg-gray-50'}`}>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t" ref={contentRef}>
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100">
            <div
              className={`h-full ${getFourCColorClass(session.fourC)} transition-all duration-500 ease-out rounded-r-full`}
              style={{ width: `${totalSteps > 0 ? (step / totalSteps) * 100 : 0}%` }}
            />
          </div>

          {/* Content area */}
          <div
            className="px-6 pt-5 pb-3 cursor-pointer min-h-[120px]"
            onClick={advance}
          >
            {step === 0 && (
              <div className="text-center py-8 select-none">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-50 border border-gray-200 text-gray-400 animate-pulse">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                  Click here or press <kbd className="px-2 py-0.5 bg-white rounded text-xs font-mono text-gray-500 border shadow-sm">Space</kbd> to begin
                </div>
              </div>
            )}
            <div className="space-y-4">
              {revealItems.map((item, idx) => renderItem(item, idx))}
            </div>
          </div>

          {/* Navigation controls */}
          <div className="px-6 pb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={goBack}
                disabled={step === 0}
                className="px-3 py-1.5 text-sm rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100 flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>
              <button
                onClick={advance}
                disabled={allRevealed}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white ${getFourCColorClass(session.fourC)} hover:shadow-md flex items-center gap-1`}
              >
                {step === 0 ? 'Start' : allRevealed ? 'Complete' : 'Next'}
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            <div className="flex items-center gap-3">
              {!allRevealed && (
                <button
                  onClick={revealAll}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Show all
                </button>
              )}
              <span className="text-xs text-gray-400 font-mono">
                {step}/{totalSteps}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
