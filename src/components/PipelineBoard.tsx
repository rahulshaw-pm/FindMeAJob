import React, { useState } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  FileText,
  MessageSquareText,
  Calendar,
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

interface PipelineBoardProps {
  applications: JobApplication[];
  onMoveStage: (id: string, nextStage: Stage) => void;
  onSelectApplication: (app: JobApplication) => void;
  onAddToStage: (stage: Stage) => void;
  isMobileMode?: boolean;
}

const STAGE_DESCRIPTIONS: Record<Stage, string> = {
  Saved: 'Shortlisted & prepping',
  Applied: 'Waiting on response',
  Interview: 'In active rounds',
  Offer: 'Reviewing terms',
};

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  applications,
  onMoveStage,
  onSelectApplication,
  onAddToStage,
  isMobileMode = false,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null);
  const [mobileStage, setMobileStage] = useState<Stage>('Interview');
  const today = getLocalTodayISO();

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStage: Stage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedId;
    if (id) {
      onMoveStage(id, targetStage);
    }
    setDraggedId(null);
    setDragOverStage(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverStage(null);
  };

  const stagesToRender = isMobileMode ? [mobileStage] : STAGES;

  return (
    <div className="space-y-3">
      {isMobileMode && (
        <div
          role="tablist"
          aria-label="Pipeline stage tabs"
          className="grid grid-cols-4 gap-1 p-1 bg-[#e5e7eb]/70 rounded-xl"
        >
          {STAGES.map((stage) => {
            const count = applications.filter((a) => a.stage === stage).length;
            const active = mobileStage === stage;
            return (
              <button
                key={stage}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMobileStage(stage)}
                className={`min-h-[44px] px-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex flex-col items-center justify-center leading-tight ${
                  active
                    ? 'bg-white text-[#0f172a] shadow-xs'
                    : 'text-[#4b5563] hover:text-[#0f172a]'
                }`}
              >
                <span className="truncate max-w-full">{stage}</span>
                <span
                  className={`font-mono text-[11px] tabular-nums mt-0.5 ${
                    active ? 'text-[#059669] font-bold' : 'text-[#6b7280]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div
        className={
          isMobileMode
            ? 'grid grid-cols-1 gap-3 items-start'
            : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start'
        }
      >
        {stagesToRender.map((stage) => {
          const stageIdx = STAGES.indexOf(stage);
        const columnApps = applications.filter((app) => app.stage === stage);
        const isDropTarget = dragOverStage === stage;
        const avgMidPay =
          columnApps.length > 0
            ? Math.round(
                columnApps.reduce(
                  (sum, app) => sum + (app.payMin + app.payMax) / 2,
                  0
                ) / columnApps.length
              )
            : 0;

        return (
          <section
            key={stage}
            aria-label={`${stage} applications`}
            onDragOver={(e) => handleDragOver(e, stage)}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverStage(null);
              }
            }}
            onDrop={(e) => handleDrop(e, stage)}
            className={`rounded-xl border transition-colors p-3 flex flex-col gap-3 min-h-[420px] ${
              isDropTarget
                ? 'bg-[#ecfdf5]/60 border-[#059669]'
                : 'bg-[#f3f4f6]/75 border-[#e5e7eb]'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-start justify-between gap-2 px-1 pt-0.5">
              <div>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-base font-bold tracking-tight text-[#0f172a]">
                    {stage}
                  </h2>
                  <span className="font-mono text-xs font-semibold text-[#6b7280] tabular-nums">
                    {columnApps.length}
                  </span>
                </div>
                <p className="text-xs text-[#6b7280] mt-0.5 tabular-nums">
                  {STAGE_DESCRIPTIONS[stage]}
                  {avgMidPay > 0 ? ` · Avg ~$${avgMidPay}k` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onAddToStage(stage)}
                aria-label={`Add application to ${stage}`}
                title={`Add to ${stage}`}
                className="w-8 h-8 rounded-lg border border-[#e5e7eb] bg-white text-[#0f172a] hover:border-[#059669] hover:text-[#059669] flex items-center justify-center transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Cards Stack */}
            <div className="flex flex-col gap-2.5 flex-1">
              {columnApps.length === 0 ? (
                <div className="flex-1 min-h-[220px] border border-dashed border-[#d1d5db] rounded-lg flex flex-col items-center justify-center p-5 text-center">
                  <p className="text-sm font-medium text-[#6b7280]">
                    No roles in {stage}
                  </p>
                  <p className="text-xs text-[#9ca3af] mt-1">
                    Drop a card here or add a role to start tracking.
                  </p>
                  <button
                    type="button"
                    onClick={() => onAddToStage(stage)}
                    className="mt-3 px-3 py-1.5 text-xs font-semibold text-[#059669] bg-white border border-[#e5e7eb] hover:border-[#059669] rounded-md transition-colors"
                  >
                    Add to {stage}
                  </button>
                </div>
              ) : (
                columnApps.map((app) => {
                  const latestRound =
                    app.roundNotes[app.roundNotes.length - 1] ?? null;
                  const isDragging = draggedId === app.id;
                  const prevStage = stageIdx > 0 ? STAGES[stageIdx - 1] : null;
                  const nextStage =
                    stageIdx < STAGES.length - 1 ? STAGES[stageIdx + 1] : null;
                  const followUp = getFollowUpInfo(app, today);
                  const idle = isApplicationIdle(app, today);
                  const idleDays = idle ? getIdleDays(app, today) : 0;

                  return (
                    <article
                      key={app.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app.id)}
                      onDragEnd={handleDragEnd}
                      className={`group bg-white border rounded-xl p-4 transition-all flex flex-col gap-3 ${
                        followUp.status === 'overdue'
                          ? 'border-[#fca5a5]'
                          : followUp.status === 'due_today'
                          ? 'border-[#fcd34d]'
                          : 'border-[#e5e7eb] hover:border-[#9ca3af]'
                      } ${
                        isDragging
                          ? 'opacity-45 scale-[0.99]'
                          : 'shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_20px_-4px_rgba(15,23,42,0.07)]'
                      }`}
                    >
                      {/* Company + Drag Handle */}
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectApplication(app)}
                          className="flex items-start gap-2.5 text-left min-w-0 flex-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059669] rounded"
                        >
                          <CompanyMark company={app.company} size="md" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                              <span className="font-semibold text-[#0f172a] truncate">
                                {app.company}
                              </span>
                              {app.priority === 'High' && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-medium text-[#006948] shrink-0">
                                    Priority
                                  </span>
                                </>
                              )}
                            </div>
                            <h3 className="text-[15px] font-bold text-[#0f172a] leading-snug mt-0.5 line-clamp-2 group-hover:text-[#006948] transition-colors">
                              {app.role}
                            </h3>
                          </div>
                        </button>
                        <span
                          aria-hidden="true"
                          title="Drag to move column"
                          className="text-[#d1d5db] group-hover:text-[#9ca3af] cursor-grab active:cursor-grabbing pt-0.5 shrink-0"
                        >
                          <GripVertical className="w-4 h-4" />
                        </span>
                      </div>

                      {/* Pay Range Highlight */}
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-mono text-base font-bold text-[#059669] tabular-nums tracking-tight">
                          {formatPayRange(app.payMin, app.payMax)}
                        </span>
                        {app.equityNote && (
                          <span className="text-xs text-[#6b7280] truncate max-w-[140px]">
                            {app.equityNote}
                          </span>
                        )}
                      </div>

                      {/* Resume Version & Work Mode (Clean unboxed metadata) */}
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-[#4b5563]">
                        <span className="inline-flex items-center gap-1 font-mono font-medium text-[#0f172a]">
                          <FileText
                            className="w-3.5 h-3.5 text-[#6b7280]"
                            aria-hidden="true"
                          />
                          {app.resumeVersionLabel}
                        </span>
                        <span aria-hidden="true" className="text-[#9ca3af]">
                          ·
                        </span>
                        <span>{app.workMode}</span>
                        {app.location && (
                          <>
                            <span aria-hidden="true" className="text-[#9ca3af]">
                              ·
                            </span>
                            <span className="truncate max-w-[140px]">
                              {app.location}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Follow-up Date, Due Today / Overdue & Idle Status Row */}
                      {(followUp.status !== 'none' || idle) && (
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {followUp.status === 'overdue' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-[#fef2f2] text-[#ba1a1a] border border-[#fecaca] tabular-nums">
                                <AlertTriangle
                                  className="w-3 h-3 shrink-0"
                                  aria-hidden="true"
                                />
                                <span>
                                  Overdue · {formatShortDate(followUp.date)}
                                </span>
                              </span>
                            )}

                            {followUp.status === 'due_today' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-[#fffbeb] text-[#b45309] border border-[#fde68a] tabular-nums">
                                <Clock
                                  className="w-3 h-3 shrink-0"
                                  aria-hidden="true"
                                />
                                <span>Due Today</span>
                              </span>
                            )}

                            {followUp.status === 'upcoming' && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#4b5563] tabular-nums">
                                <Calendar
                                  className="w-3.5 h-3.5 text-[#059669] shrink-0"
                                  aria-hidden="true"
                                />
                                <span>
                                  Follow-up{' '}
                                  <span className="font-mono font-semibold text-[#0f172a]">
                                    {formatShortDate(followUp.date)}
                                  </span>
                                </span>
                              </span>
                            )}
                          </div>

                          {idle && (
                            <span
                              title={`No updates logged in ${idleDays} days`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-semibold rounded-md bg-[#f3f4f6] text-[#374151] border border-[#d1d5db] tabular-nums"
                            >
                              <Hourglass
                                className="w-3 h-3 text-[#6b7280] shrink-0"
                                aria-hidden="true"
                              />
                              <span>Idle {idleDays}d</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Round Notes Preview */}
                      <button
                        type="button"
                        onClick={() => onSelectApplication(app)}
                        className="pt-2.5 border-t border-[#f3f4f6] text-left flex flex-col gap-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059669] rounded"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 font-semibold text-[#0f172a] truncate">
                            <MessageSquareText
                              className="w-3.5 h-3.5 text-[#059669] shrink-0"
                              aria-hidden="true"
                            />
                            <span className="truncate">
                              {latestRound
                                ? latestRound.roundTitle
                                : 'Round Notes'}
                            </span>
                          </span>
                          <span className="font-mono text-[11px] text-[#6b7280] tabular-nums shrink-0">
                            {app.roundNotes.length}{' '}
                            {app.roundNotes.length === 1 ? 'round' : 'rounds'}
                          </span>
                        </div>
                        {latestRound ? (
                          <p className="text-xs text-[#4b5563] leading-relaxed line-clamp-2">
                            <span className="font-medium text-[#0f172a]">
                              {latestRound.outcome}
                            </span>
                            {' — '}
                            {latestRound.notes}
                          </p>
                        ) : (
                          <p className="text-xs text-[#9ca3af]">
                            No interview notes yet. Add prep or round feedback.
                          </p>
                        )}
                      </button>

                      {/* Footer Quick Actions */}
                      <div className="pt-2 border-t border-[#f3f4f6] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          {prevStage && (
                            <button
                              type="button"
                              onClick={() => onMoveStage(app.id, prevStage)}
                              aria-label={`Move ${app.company} back to ${prevStage}`}
                              title={`Move to ${prevStage}`}
                              className={`${
                                isMobileMode ? 'min-h-[40px] px-2.5' : 'h-7 px-2'
                              } inline-flex items-center gap-0.5 text-xs font-medium text-[#4b5563] hover:text-[#0f172a] hover:bg-[#f3f4f6] rounded-md transition-colors whitespace-nowrap`}
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                              <span>{prevStage}</span>
                            </button>
                          )}
                          {nextStage && (
                            <button
                              type="button"
                              onClick={() => onMoveStage(app.id, nextStage)}
                              aria-label={`Advance ${app.company} to ${nextStage}`}
                              title={`Move to ${nextStage}`}
                              className={`${
                                isMobileMode ? 'min-h-[40px] px-2.5' : 'h-7 px-2'
                              } inline-flex items-center gap-0.5 text-xs font-semibold text-[#059669] hover:text-[#006948] hover:bg-[#ecfdf5] rounded-md transition-colors whitespace-nowrap`}
                            >
                              <span>{nextStage}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onSelectApplication(app)}
                          className={`${
                            isMobileMode ? 'min-h-[40px] px-3' : 'h-7 px-2.5'
                          } text-xs font-semibold text-[#0f172a] hover:bg-[#f3f4f6] rounded-md transition-colors whitespace-nowrap shrink-0`}
                        >
                          Notes &amp; Edit
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        );
      })}
      </div>
    </div>
  );
};
