import { useEffect, useState } from 'react';
import { loadArticles } from '../utils/dataLoader';
import type { Article } from '../types';

export default function Footer() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    loadArticles().then(setArticles).catch(() => {});
  }, []);

  const totalArticles = articles.length;

  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Article Stats Section */}
        {totalArticles > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-lg">📰</span>
              <h4 className="font-semibold text-sm uppercase tracking-widest text-gray-300">
                Sunday Thoughts — Article Library
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xs">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{totalArticles}</div>
                <div className="text-xs text-gray-300 mt-1">Total Articles</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-3 tracking-tight">Leadership Laboratory</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              A comprehensive workshop exploring the 4 Cs of Leadership,
              enriched with deep-read verified insights from Sunday Thoughts.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">The 4 Cs</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-communication" />
                Communication
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-customer" />
                Customer
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cognizance" />
                Cognizance
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-charisma" />
                Charisma
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>13 Workshop Sessions</li>
              <li>{totalArticles || 145} Curated Articles</li>
              <li>Intensive Workshop Format</li>
              <li>Evidence-Based Content</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Leadership Laboratory. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
