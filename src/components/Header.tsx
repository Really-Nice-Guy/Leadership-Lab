import ProfileLink from './ProfileLink';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-gray-900 text-white py-4 px-4 sticky top-0 z-20 border-b border-gray-800">
      <div className="flex items-start gap-3">
        {/* Mobile: nav toggle */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors -ml-1"
          aria-label="Open navigation"
        >
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Identical to the footer's "Beyond the Lab" block */}
        <div>
          <h4 className="font-semibold mb-3 text-sm">Beyond the Lab</h4>
          <ProfileLink variant="footer" />
        </div>
      </div>
    </header>
  );
}
