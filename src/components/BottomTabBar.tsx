import React from 'react';
import { Columns3, ListFilter, FileText, BarChart3 } from 'lucide-react';
import { AppScreen } from '../types/job';

interface BottomTabBarProps {
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

const TABS: {
  id: AppScreen;
  label: string;
  Icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'pipeline', label: 'Pipeline', Icon: Columns3 },
  { id: 'applications', label: 'Ledger', Icon: ListFilter },
  { id: 'resumes', label: 'Resumes', Icon: FileText },
  { id: 'insights', label: 'Insights', Icon: BarChart3 },
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeScreen,
  onNavigate,
}) => {
  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#e5e7eb]"
    >
      <div className="grid grid-cols-4 h-16">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeScreen === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#059669] ${
                isActive
                  ? 'text-[#059669]'
                  : 'text-[#6b7280] hover:text-[#0f172a]'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? 'stroke-[2.25]' : 'stroke-[1.75]'}`}
                aria-hidden="true"
              />
              <span
                className={`text-[11px] leading-none tracking-tight ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
