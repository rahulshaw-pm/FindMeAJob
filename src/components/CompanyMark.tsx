import React from 'react';

const PALETTES = [
  'bg-[#0f172a] text-white',
  'bg-[#006948] text-white',
  'bg-[#1e293b] text-white',
  'bg-[#047857] text-white',
  'bg-[#334155] text-white',
  'bg-[#065f46] text-white',
];

function hashCompany(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return h % PALETTES.length;
}

interface CompanyMarkProps {
  company: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CompanyMark: React.FC<CompanyMarkProps> = ({ company, size = 'md' }) => {
  const initials = company
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

  const palette = PALETTES[hashCompany(company)];
  const sizeClass =
    size === 'sm'
      ? 'w-7 h-7 text-[11px] rounded-md'
      : size === 'lg'
      ? 'w-11 h-11 text-sm rounded-xl'
      : 'w-9 h-9 text-xs rounded-lg';

  return (
    <div
      aria-hidden="true"
      className={`${sizeClass} ${palette} shrink-0 flex items-center justify-center font-bold tracking-tight select-none`}
    >
      {initials}
    </div>
  );
};
