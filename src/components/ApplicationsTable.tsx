import React, { useState } from 'react';
import {
  Download,
  Trash2,
  ArrowUpDown,
  ExternalLink,
  AlertTriangle,
  Clock,
  Hourglass,
} from 'lucide-react';
import { JobApplication, STAGES, Stage } from '../types/job';
import { formatPayRange } from '../hooks/useJobTracker';
import {
  formatShortDate,
  getFollowUpInfo,
  getIdleDays,
  getLocalTodayISO,
  isApplicationIdle,
} from '../utils/dateStatus';
import { CompanyMark } from './CompanyMark';

interface ApplicationsTableProps {
  applications: JobApplication[];
  onSelectApplication: (app: JobApplication) => void;
  onMoveStage: (id: string, stage: Stage) => void;
  onBulkMoveStage: (ids: string[], stage: Stage) => void;
  onBulkDelete: (ids: string[]) => void;
  onExportCSV: () => void;
  onOpenAddModal: () => void;
  isMobileMode?: boolean;
}

export const ApplicationsTable: React.FC<ApplicationsTableProps> = ({
  applications,
  onSelectApplication,
  onMoveStage,
  onBulkMoveStage,
  onBulkDelete,
  onExportCSV,
  onOpenAddModal,
  isMobileMode = false,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStage, setBulkStage] = useState<Stage>('Applied');
  const today = getLocalTodayISO();

  const allSelected =
    applications.length > 0 &&
    applications.every((app) => selectedIds.includes(app.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applications.map((a) => a.id));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkMove = () => {
    if (selectedIds.length === 0) return;
    onBulkMoveStage(selectedIds, bulkStage);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    onBulkDelete(selectedIds);
    setSelectedIds([]);
  };

  if (applications.length === 0) {
    return (
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-12 text-center">
        <h3 className="text-lg font-bold text-[#0f172a]">
          No matching applications
        </h3>
        <p className="text-sm text-[#6b7280] mt-1 max-w-md mx-auto">
          Try clearing your active search or filters, or add a new company to
          your pipeline.
        </p>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-[#059669] hover:bg-[#006948] rounded-lg transition-colors"
        >
          Add Application
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">
      {/* Table Action Header */}
      <div className="px-4 py-3 border-b border-[#e5e7eb] flex flex-wrap items-center justify-between gap-3 bg-[#f9fafb]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-[#0f172a] tabular-nums">
            {selectedIds.length > 0
              ? `${selectedIds.length} selected`
              : `${applications.length} applications`}
          </span>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                aria-label="Move selected applications to stage"
                value={bulkStage}
                onChange={(e) => setBulkStage(e.target.value as Stage)}
                className="h-8 px-2.5 text-xs font-medium bg-white border border-[#e5e7eb] rounded-md text-[#0f172a]"
              >
                {STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    Move to {stage}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleBulkMove}
                className="h-8 px-3 text-xs font-semibold text-white bg-[#059669] hover:bg-[#006948] rounded-md transition-colors whitespace-nowrap"
              >
                Apply Stage
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="h-8 px-2.5 inline-flex items-center gap-1 text-xs font-semibold text-[#ba1a1a] bg-white border border-[#e5e7eb] hover:border-[#ba1a1a] rounded-md transition-colors whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onExportCSV}
          className="h-8 px-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0f172a] bg-white border border-[#e5e7eb] hover:border-[#0f172a] rounded-md transition-colors whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Download CSV</span>
        </button>
      </div>

      {/* Mobile Tap List View vs Desktop Table */}
      {isMobileMode ? (
        <div className="divide-y divide-[#f3f4f6]">
          {applications.map((app) => {
            const latest = app.roundNotes[app.roundNotes.length - 1];
            const isSelected = selectedIds.includes(app.id);
            const followUp = getFollowUpInfo(app, today);
            const idle = isApplicationIdle(app, today);
            const idleDays = idle ? getIdleDays(app, today) : 0;

            return (
              <div
                key={app.id}
                className={`p-3.5 space-y-2.5 ${
                  isSelected ? 'bg-[#ecfdf5]/40' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(app.id)}
                      aria-label={`Select ${app.company} ${app.role}`}
                      className="w-5 h-5 mt-1 rounded accent-[#059669] cursor-pointer shrink-0"
                    />
                    <button
                      type="button"
                      onClick={() => onSelectApplication(app)}
                      className="flex items-start gap-2.5 text-left min-w-0 flex-1"
                    >
                      <CompanyMark company={app.company} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                          <span className="font-semibold text-[#0f172a]">
                            {app.company}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{app.workMode}</span>
                        </div>
                        <div className="font-bold text-sm text-[#0f172a] leading-snug mt-0.5">
                          {app.role}
                        </div>
                      </div>
                    </button>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#059669] tabular-nums shrink-0 pt-0.5">
                    {formatPayRange(app.payMin, app.payMax)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pl-7">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {followUp.status === 'overdue' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-[#fef2f2] text-[#ba1a1a] border border-[#fecaca] tabular-nums">
                        <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                        <span>Overdue · {formatShortDate(followUp.date)}</span>
                      </span>
                    )}
                    {followUp.status === 'due_today' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-[#fffbeb] text-[#b45309] border border-[#fde68a]">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        <span>Due Today</span>
                      </span>
                    )}
                    {followUp.status === 'upcoming' && (
                      <span className="font-mono text-xs text-[#4b5563] tabular-nums">
                        Follow-up {formatShortDate(followUp.date)}
                      </span>
                    )}
                    {idle && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-semibold rounded-md bg-[#f3f4f6] text-[#374151] border border-[#d1d5db] tabular-nums">
                        <Hourglass className="w-3 h-3 text-[#6b7280]" aria-hidden="true" />
                        <span>Idle {idleDays}d</span>
                      </span>
                    )}
                  </div>

                  <select
                    aria-label={`Stage for ${app.company}`}
                    value={app.stage}
                    onChange={(e) =>
                      onMoveStage(app.id, e.target.value as Stage)
                    }
                    className="h-9 px-2.5 text-xs font-semibold rounded-md border border-[#e5e7eb] bg-[#f9fafb] text-[#0f172a]"
                  >
                    {STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>

                {latest && (
                  <button
                    type="button"
                    onClick={() => onSelectApplication(app)}
                    className="pl-7 text-left block w-full text-xs text-[#4b5563] truncate"
                  >
                    <span className="font-semibold text-[#0f172a]">
                      {latest.roundTitle}:
                    </span>{' '}
                    {latest.notes}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e5e7eb] text-xs font-semibold text-[#6b7280] bg-white">
              <th className="py-3 pl-4 pr-2 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all applications"
                  className="w-[18px] h-[18px] rounded accent-[#059669] cursor-pointer"
                />
              </th>
              <th className="py-3 px-3">Company &amp; Role</th>
              <th className="py-3 px-3">Stage</th>
              <th className="py-3 px-3">Follow-up</th>
              <th className="py-3 px-3 text-right">
                <span className="inline-flex items-center gap-1">
                  Pay Range
                  <ArrowUpDown className="w-3 h-3 opacity-50" aria-hidden="true" />
                </span>
              </th>
              <th className="py-3 px-3">Resume Version</th>
              <th className="py-3 px-3">Latest Round Note</th>
              <th className="py-3 pl-3 pr-4 text-right">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6] text-sm">
            {applications.map((app) => {
              const latest = app.roundNotes[app.roundNotes.length - 1];
              const isSelected = selectedIds.includes(app.id);
              const followUp = getFollowUpInfo(app, today);
              const idle = isApplicationIdle(app, today);
              const idleDays = idle ? getIdleDays(app, today) : 0;

              return (
                <tr
                  key={app.id}
                  className={`transition-colors ${
                    isSelected ? 'bg-[#ecfdf5]/40' : 'hover:bg-[#f9fafb]'
                  }`}
                >
                  <td className="py-3 pl-4 pr-2 align-middle">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(app.id)}
                      aria-label={`Select ${app.company} ${app.role}`}
                      className="w-[18px] h-[18px] rounded accent-[#059669] cursor-pointer"
                    />
                  </td>

                  <td className="py-3 px-3 align-middle">
                    <button
                      type="button"
                      onClick={() => onSelectApplication(app)}
                      className="flex items-center gap-3 text-left group min-w-[210px]"
                    >
                      <CompanyMark company={app.company} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                          <span className="font-semibold text-[#0f172a]">
                            {app.company}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{app.workMode}</span>
                          {app.jobUrl && (
                            <a
                              href={app.jobUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Open ${app.company} job posting`}
                              className="text-[#9ca3af] hover:text-[#059669] ml-0.5"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="font-semibold text-[#0f172a] group-hover:text-[#006948] truncate max-w-[240px]">
                          {app.role}
                        </div>
                      </div>
                    </button>
                  </td>

                  <td className="py-3 px-3 align-middle">
                    <select
                      aria-label={`Stage for ${app.company}`}
                      value={app.stage}
                      onChange={(e) =>
                        onMoveStage(app.id, e.target.value as Stage)
                      }
                      className={`h-8 px-2.5 text-xs font-semibold rounded-md border transition-colors focus:outline-none focus:border-[#059669] ${
                        app.stage === 'Offer'
                          ? 'bg-[#ecfdf5] text-[#006948] border-[#a7f3d0]'
                          : app.stage === 'Interview'
                          ? 'bg-[#f0f3ff] text-[#0f172a] border-[#cbd5e1]'
                          : 'bg-white text-[#374151] border-[#e5e7eb]'
                      }`}
                    >
                      {STAGES.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-3 px-3 align-middle whitespace-nowrap">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {followUp.status === 'overdue' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-[#fef2f2] text-[#ba1a1a] border border-[#fecaca] tabular-nums">
                          <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                          <span>Overdue · {formatShortDate(followUp.date)}</span>
                        </span>
                      )}
                      {followUp.status === 'due_today' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-[#fffbeb] text-[#b45309] border border-[#fde68a]">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          <span>Due Today</span>
                        </span>
                      )}
                      {followUp.status === 'upcoming' && (
                        <span className="font-mono text-xs text-[#0f172a] tabular-nums">
                          {formatShortDate(followUp.date)}
                        </span>
                      )}
                      {followUp.status === 'none' && !idle && (
                        <span className="text-xs text-[#9ca3af]">—</span>
                      )}
                      {idle && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-semibold rounded-md bg-[#f3f4f6] text-[#374151] border border-[#d1d5db] tabular-nums">
                          <Hourglass className="w-3 h-3 text-[#6b7280]" aria-hidden="true" />
                          <span>Idle {idleDays}d</span>
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3 align-middle text-right font-mono font-bold text-[#059669] tabular-nums whitespace-nowrap">
                    {formatPayRange(app.payMin, app.payMax)}
                  </td>

                  <td className="py-3 px-3 align-middle font-mono text-xs text-[#0f172a] whitespace-nowrap">
                    {app.resumeVersionLabel}
                  </td>

                  <td className="py-3 px-3 align-middle max-w-[260px]">
                    <button
                      type="button"
                      onClick={() => onSelectApplication(app)}
                      className="text-left block w-full hover:text-[#006948]"
                    >
                      {latest ? (
                        <div className="truncate text-xs text-[#374151]">
                          <span className="font-semibold text-[#0f172a]">
                            {latest.roundTitle}:
                          </span>{' '}
                          {latest.notes}
                        </div>
                      ) : (
                        <span className="text-xs text-[#9ca3af]">
                          Add round note...
                        </span>
                      )}
                    </button>
                  </td>

                  <td className="py-3 pl-3 pr-4 align-middle text-right font-mono text-xs text-[#6b7280] tabular-nums whitespace-nowrap">
                    {app.updatedAt}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};
