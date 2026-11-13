import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';

export type ScreenMode = 'mobile' | 'desktop';

interface ScreenModeToggleProps {
  mode: ScreenMode;
  onChange: (mode: ScreenMode) => void;
}

export const ScreenModeToggle: React.FC<ScreenModeToggleProps> = ({
  mode,
  onChange,
}) => {
  return (
    <div
      role="group"
      aria-label="Screen layout mode"
      className="inline-flex items-center p-0.5 bg-[#f3f4f6] border border-[#e5e7eb] rounded-lg shrink-0"
    >
      <button
        type="button"
        onClick={() => onChange('mobile')}
        aria-pressed={mode === 'mobile'}
        className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
          mode === 'mobile'
            ? 'bg-white text-[#0f172a] shadow-xs'
            : 'text-[#6b7280] hover:text-[#0f172a]'
        }`}
      >
        <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Mobile</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('desktop')}
        aria-pressed={mode === 'desktop'}
        className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
          mode === 'desktop'
            ? 'bg-white text-[#0f172a] shadow-xs'
            : 'text-[#6b7280] hover:text-[#0f172a]'
        }`}
      >
        <Monitor className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Desktop</span>
      </button>
    </div>
  );
};
