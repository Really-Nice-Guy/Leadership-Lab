import { UserCircle, ArrowUpRight } from 'phosphor-react';

/** External leadership-development portfolio, presented as a "Leadership Profile". */
export const PROFILE_URL =
  'https://leadership-development-portfolio.reallyniceguy.chatgpt.site/';

/** Signature Leadership Lab gradient — keeps this link visually continuous with the brand mark. */
const BRAND_GRADIENT = 'linear-gradient(135deg, #3B82F6, #8B5CF6, #F59E0B)';

type Variant = 'hero' | 'sidebar' | 'footer' | 'card';

interface ProfileLinkProps {
  variant?: Variant;
  onClick?: () => void;
}

/** Gradient avatar that personifies the "Profile" — a person mark in the brand gradient. */
function ProfileAvatar({ size, rounded = 'rounded-full' }: { size: number; rounded?: string }) {
  return (
    <span
      className={`${rounded} flex items-center justify-center flex-shrink-0`}
      style={{ width: size, height: size, background: BRAND_GRADIENT }}
    >
      <UserCircle size={Math.round(size * 0.95)} weight="fill" className="text-white" />
    </span>
  );
}

/**
 * A clean, intuitive link out to the external Leadership Profile.
 * Rendered in every place the app offers navigation to its own sections:
 * the sidebar menu, the Home hero, the Home footer of the page, and the site Footer.
 */
export default function ProfileLink({ variant = 'hero', onClick }: ProfileLinkProps) {
  const anchor = {
    href: PROFILE_URL,
    target: '_blank',
    rel: 'noopener noreferrer',
    onClick,
  };

  if (variant === 'sidebar') {
    return (
      <a
        {...anchor}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5"
      >
        <ProfileAvatar size={22} />
        Leadership Profile
        <ArrowUpRight size={13} weight="bold" className="ml-auto text-gray-600" />
      </a>
    );
  }

  if (variant === 'footer') {
    return (
      <a
        {...anchor}
        className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-semibold text-white"
      >
        <ProfileAvatar size={24} />
        Leadership Profile
        <ArrowUpRight size={14} weight="bold" className="text-gray-400" />
      </a>
    );
  }

  if (variant === 'card') {
    return (
      <a
        {...anchor}
        className="group flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      >
        <ProfileAvatar size={56} rounded="rounded-2xl" />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900">Leadership Profile</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            See the 4 Cs in practice — explore the leadership development portfolio.
          </p>
        </div>
        <span className="flex-shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-gray-400 group-hover:text-gray-900 transition-colors">
          Visit
          <ArrowUpRight
            size={16}
            weight="bold"
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </span>
      </a>
    );
  }

  // 'hero' — matches the outline CTA button on the Home hero
  return (
    <a
      {...anchor}
      className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-900 hover:text-gray-900 transition-colors"
    >
      <ProfileAvatar size={22} />
      Leadership Profile
      <ArrowUpRight size={16} weight="bold" />
    </a>
  );
}
