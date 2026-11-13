import React, { useState } from 'react';
import { Search, X, RotateCcw, SlidersHorizontal } from 'lucide-react';
import {
  AttentionFilter,
  FilterState,
  ResumeVersion,
  SortOption,
  STAGES,
  Stage,
  WorkMode,
} from '../types/job';

interface FilterToolbarProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
  resumes: ResumeVersion[];
  totalCount: number;
  filteredCount: number;
  showStageFilter?: boolean;
  isMobileMode?: boolean;
}

const WORK_MODES: (WorkMode | 'All')[] = ['All', 'Remote', 'Hybrid', 'Onsite'];

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  onChange,
  onReset,
  resumes,
  totalCount,
  filteredCount,
  showStageFilter = true,
  isMobileMode = false,
}) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeFilterCount = [
    filters.stage !== 'All',
    filters.workMode !== 'All',
    filters.resumeVersionId !== 'All',
    filters.minPay > 0,
    filters.attention !== 'All',
  ].filter(Boolean).length;

  const hasActiveFilters = filters.search.trim() !== '' || activeFilterCount > 0;

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl p-3 sm:p-4">
      <div
        className={`flex gap-2.5 ${
          isMobileMode
            ? 'flex-col'
            : 'flex-col lg:flex-row lg:items-center'
        }`}
      >
        {/* Search Row + Mobile Filters Toggle */}
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-0">
            <Search
              className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              placeholder={
                isMobileMode
                  ? 'Search company, role, notes...'
                  : 'Search companies, roles, recruiters, resumes, or interview notes...'
              }
              aria-label="Search applications"
              className={`w-full pl-10 pr-9 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#0f172a] placeholder:text-[#6b7280] focus:outline-none focus:bg-white focus:border-[#059669] transition-colors ${
                isMobileMode ? 'h-11' : 'h-10'
              }`}
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => onChange({ ...filters, search: '' })}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[#6b7280] hover:text-[#0f172a] rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isMobileMode && (
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((v) => !v)}
              aria-expanded={mobileFiltersOpen}
              className={`h-11 px-3 inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                mobileFiltersOpen || activeFilterCount > 0
                  ? 'bg-[#ecfdf5] text-[#006948] border-[#a7f3d0]'
                  : 'bg-[#f9fafb] text-[#0f172a] border-[#e5e7eb]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              <span>
                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </span>
            </button>
          )}
        </div>

        {/* Filter Controls */}
        {(!isMobileMode || mobileFiltersOpen) && (
          <div
            className={
              isMobileMode
                ? 'grid grid-cols-2 gap-2 pt-1'
                : 'flex flex-wrap items-center gap-2'
            }
          >
            {showStageFilter && (
              <select
                aria-label="Filter by stage"
                value={filters.stage}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    stage: e.target.value as Stage | 'All',
                  })
                }
                className={`${
                  isMobileMode ? 'h-11 col-span-2' : 'h-10'
                } px-3 text-sm font-medium bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#0f172a] focus:outline-none focus:border-[#059669]`}
              >
                <option value="All">All Stages</option>
                {STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            )}

            {/* Work Mode Segmented Control */}
            <div
              role="group"
              aria-label="Filter by work mode"
              className={`grid grid-cols-4 items-center p-1 bg-[#f3f4f6] rounded-lg ${
                isMobileMode ? 'col-span-2' : 'inline-flex'
              }`}
            >
              {WORK_MODES.map((mode) => {
                const active = filters.workMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onChange({ ...filters, workMode: mode })}
                    className={`px-2.5 ${
                      isMobileMode ? 'py-2' : 'py-1.5'
                    } text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-white text-[#0f172a] shadow-xs'
                        : 'text-[#6b7280] hover:text-[#0f172a]'
                    }`}
                  >
                    {mode === 'All' ? 'All Modes' : mode}
                  </button>
                );
              })}
            </div>

            {/* Attention / Follow-up Filter */}
            <select
              aria-label="Filter by follow-up status"
              value={filters.attention}
              onChange={(e) =>
                onChange({
                  ...filters,
                  attention: e.target.value as AttentionFilter,
                })
              }
              className={`${
                isMobileMode ? 'h-11' : 'h-10'
              } px-3 text-sm font-medium bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#0f172a] focus:outline-none focus:border-[#059669]`}
            >
              <option value="All">All Statuses</option>
              <option value="DueToday">Due Today</option>
              <option value="Overdue">Overdue</option>
              <option value="Idle">No activity (5+ days)</option>
            </select>

            {/* Resume Version Filter */}
            <select
              aria-label="Filter by resume version"
              value={filters.resumeVersionId}
              onChange={(e) =>
                onChange({ ...filters, resumeVersionId: e.target.value })
              }
              className={`${
                isMobileMode ? 'h-11' : 'h-10 max-w-[190px]'
              } px-3 text-sm font-medium bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#0f172a] focus:outline-none focus:border-[#059669]`}
            >
              <option value="All">All Resumes</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>

            {/* Pay Floor Filter */}
            <select
              aria-label="Filter by minimum pay"
              value={filters.minPay}
              onChange={(e) =>
                onChange({ ...filters, minPay: Number(e.target.value) })
              }
              className={`${
                isMobileMode ? 'h-11' : 'h-10'
              } px-3 text-sm font-medium bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#0f172a] focus:outline-none focus:border-[#059669] tabular-nums`}
            >
              <option value={0}>Any Pay</option>
              <option value={160}>$160k+ Max</option>
              <option value={190}>$190k+ Max</option>
              <option value={220}>$220k+ Max</option>
              <option value={250}>$250k+ Max</option>
            </select>

            {/* Sort */}
            <select
              aria-label="Sort applications"
              value={filters.sortBy}
              onChange={(e) =>
                onChange({ ...filters, sortBy: e.target.value as SortOption })
              }
              className={`${
                isMobileMode ? 'h-11' : 'h-10'
              } px-3 text-sm font-medium bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#0f172a] focus:outline-none focus:border-[#059669]`}
            >
              <option value="updated_desc">Recently Updated</option>
              <option value="followup_asc">Follow-up Date</option>
              <option value="pay_desc">Highest Pay</option>
              <option value="pay_asc">Lowest Pay</option>
              <option value="rounds_desc">Most Rounds</option>
              <option value="company_asc">Company A–Z</option>
            </select>
          </div>
        )}
      </div>

      {/* Results & Reset Summary Row */}
      <div className="mt-2.5 pt-2.5 border-t border-[#f3f4f6] flex flex-wrap items-center justify-between gap-2 text-xs text-[#6b7280]">
        <div className="tabular-nums">
          Showing <span className="font-semibold text-[#0f172a]">{filteredCount}</span> of{' '}
          <span className="font-semibold text-[#0f172a]">{totalCount}</span> tracked roles
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 font-semibold text-[#059669] hover:text-[#006948] whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
