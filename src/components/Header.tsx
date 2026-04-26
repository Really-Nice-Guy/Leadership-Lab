import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/':           'Home',
  '/curriculum': 'Curriculum',
  '/articles':   'Articles',
};

export default function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'Article';

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200/60">
      <div className="px-4">
        <div className="flex items-center justify-between py-3 gap-4">

          {/* Mobile: hamburger + logo */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors -ml-1"
              aria-label="Open navigation"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6, #F59E0B)' }}
              >
                <span className="text-white font-extrabold text-xs">LL</span>
              </div>
              <span className="font-bold text-gray-900 text-sm">Leadership Lab</span>
            </Link>
          </div>

          {/* Desktop: page breadcrumb */}
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-900">{title}</span>
          </div>

          {/* Right side: subtle stat pill */}
          <div className="hidden md:flex items-center">
            <span className="text-xs text-gray-400 font-medium">Leadership Laboratory</span>
          </div>
        </div>
      </div>
    </header>
  );
}
