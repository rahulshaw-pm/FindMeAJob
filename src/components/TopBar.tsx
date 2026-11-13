import React from 'react';
import { Plus } from 'lucide-react';
import { AppScreen } from '../types/job';

interface TopBarProps {
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  onOpenAddModal: () => void;
  isMobileMode?: boolean;
}

const NAV_ITEMS: { id: AppScreen; label: string }[] = [
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'applications', label: 'Applications' },
  { id: 'resumes', label: 'Resumes' },
  { id: 'insights', label: 'Insights' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeScreen,
  onNavigate,
  onOpenAddModal,
  isMobileMode = false,
}) => {
  if (isMobileMode) {
    return (
      <header className="bg-white border-b border-[#e5e7eb]">
        <div className="px-4 h-14 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onNavigate('pipeline')}
            className="text-lg font-extrabold tracking-[-0.03em] text-[#0f172a] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#059669]"
          >
            FindMeAJob
          </button>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 min-h-[40px] text-xs font-semibold text-white bg-[#059669] hover:bg-[#006948] active:scale-[0.98] rounded-lg transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059669]"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Track Role</span>
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-[#e5e7eb]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('pipeline')}
          className="text-xl font-extrabold tracking-[-0.03em] text-[#0f172a] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#059669]"
        >
          FindMeAJob
        </button>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative py-5 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#059669] ${
                  isActive
                    ? 'text-[#0f172a]'
                    : 'text-[#6b7280] hover:text-[#0f172a]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-[#059669]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary CTA */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#059669] hover:bg-[#006948] active:scale-[0.98] rounded-lg transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059669]"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* Responsive Mobile Fallback Nav Strip when in Desktop mode on narrow viewport */}
      <nav
        aria-label="Compact navigation"
        className="flex md:hidden items-center gap-1 px-4 pb-2.5 overflow-x-auto border-t border-[#f3f4f6]"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#0f172a] text-white'
                  : 'text-[#6b7280] hover:text-[#0f172a] hover:bg-[#f3f4f6]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
