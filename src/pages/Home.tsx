import { Link } from 'react-router-dom';
import { ChatCircle, Target, Brain, Sparkle } from 'phosphor-react';
import { useEffect, useState } from 'react';
import { loadArticles } from '../utils/dataLoader';
import type { Article } from '../types';

const TOPIC_STATS: { key: string; icon: string; color: string }[] = [
  { key: 'Thought Leadership', icon: '💡', color: 'text-amber-500' },
  { key: 'Technology',         icon: '⚙️', color: 'text-cyan-600' },
  { key: 'Geopolitics',        icon: '🌍', color: 'text-emerald-600' },
  { key: 'Macroeconomics',     icon: '📊', color: 'text-violet-600' },
];

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    loadArticles().then(setArticles).catch(() => {});
  }, []);

  const topicCounts: Record<string, number> = {};
  articles.forEach(a => {
    a.topics.forEach(t => {
      const topic = t.trim();
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
  });
  const totalArticles = articles.length;

  const fourCs = [
    {
      name: 'Communication',
      borderColor: 'border-communication',
      iconColor: 'text-communication',
      bgLight: 'bg-communication-light',
      description: 'How we interact and present',
      icon: ChatCircle
    },
    {
      name: 'Customer',
      borderColor: 'border-customer',
      iconColor: 'text-customer',
      bgLight: 'bg-customer-light',
      description: 'Internal and external stakeholder focus',
      icon: Target
    },
    {
      name: 'Cognizance',
      borderColor: 'border-cognizance',
      iconColor: 'text-cognizance',
      bgLight: 'bg-cognizance-light',
      description: 'Self-awareness, goals, culture, metrics',
      icon: Brain
    },
    {
      name: 'Charisma',
      borderColor: 'border-charisma',
      iconColor: 'text-charisma',
      bgLight: 'bg-charisma-light',
      description: 'Authenticity, trust, personal brand',
      icon: Sparkle
    }
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-b from-white to-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            <span className="text-gray-900">The Leadership Lab: </span>
            <span className="gradient-text">Transform Your Mind</span>
          </h1>
          <p className="text-xl md:text-2xl mb-2 text-gray-600 font-medium">
            The 4 Cs Framework
          </p>
          <p className="text-base mb-8 max-w-2xl mx-auto text-gray-500 leading-relaxed">
            A leadership workshop enriched with 28 deeply-verified insights from Sunday Thoughts
          </p>

          {/* Buttons + Stats Row */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/curriculum"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
              >
                Explore the Curriculum
              </Link>
              <Link
                to="/articles"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
              >
                Browse Articles
              </Link>
            </div>

            {/* Article Stats - Compact Inline */}
            {totalArticles > 0 && (
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2.5 border border-gray-200">
                <span className="text-sm font-bold text-gray-700">{totalArticles}</span>
                <span className="text-xs text-gray-400">articles</span>
                <span className="text-gray-300 mx-1">|</span>
                {TOPIC_STATS.map(t => (
                  <div key={t.key} className="flex items-center gap-1" title={t.key}>
                    <span className="text-xs">{t.icon}</span>
                    <span className={`text-sm font-bold ${t.color}`}>{topicCounts[t.key] || 0}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 tracking-tight">
            The 4 Cs of Leadership
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {fourCs.map((c) => {
              const IconComponent = c.icon;
              return (
                <div
                  key={c.name}
                  className={`${c.bgLight} rounded-xl shadow-md p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-l-4 ${c.borderColor}`}
                >
                  <div className="w-14 h-14 rounded-xl bg-white/80 flex items-center justify-center mb-4 shadow-sm">
                    <IconComponent size={32} weight="bold" className={c.iconColor} />
                  </div>
                  <h3 className={`text-2xl font-extrabold mb-2 ${c.iconColor}`}>
                    {c.name}
                  </h3>
                  <p className="text-gray-700 text-base font-medium leading-relaxed">{c.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 tracking-tight">
            Evidence-Based Leadership Development
          </h2>
          <p className="text-lg text-gray-600 mb-4 leading-relaxed">
            This curriculum integrates 2+ years of Sunday Thoughts leadership insights with a structured 4 Cs framework.
            Every article has been deep-read and verified for genuine relevance&mdash;not just keyword matching.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            We prioritize quality over quantity: sessions without genuinely relevant content remain thoughtfully incomplete,
            ensuring every resource truly serves your leadership development journey.
          </p>
        </div>
      </section>
    </div>
  );
}
