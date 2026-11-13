import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Pencil,
  Check,
  Copy,
  ExternalLink,
  AlertTriangle,
  Clock,
  Hourglass,
} from 'lucide-react';
import {
  JobApplication,
  ResumeVersion,
  RoundNote,
  RoundOutcome,
  STAGES,
  Stage,
  WorkMode,
} from '../types/job';
import { formatPayRange, todayISO } from '../hooks/useJobTracker';
import {
  formatShortDate,
  getEffectiveFollowUpDate,
  getFollowUpInfo,
  getIdleDays,
  getLocalTodayISO,
  isApplicationIdle,
} from '../utils/dateStatus';
import { CompanyMark } from './CompanyMark';

interface ApplicationDrawerProps {
  application: JobApplication | null;
  resumes: ResumeVersion[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<JobApplication>) => void;
  onMoveStage: (id: string, stage: Stage) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onAddRoundNote: (appId: string, note: Omit<RoundNote, 'id'>) => void;
  onUpdateRoundNote: (
    appId: string,
    noteId: string,
    updates: Partial<RoundNote>
  ) => void;
  onDeleteRoundNote: (appId: string, noteId: string) => void;
  isMobileMode?: boolean;
}

const OUTCOMES: RoundOutcome[] = ['Scheduled', 'Pending', 'Passed', 'Follow-up'];
const WORK_MODES: WorkMode[] = ['Remote', 'Hybrid', 'Onsite'];

export const ApplicationDrawer: React.FC<ApplicationDrawerProps> = ({
  application,
  resumes,
  onClose,
  onUpdate,
  onMoveStage,
  onDelete,
  onDuplicate,
  onAddRoundNote,
  onUpdateRoundNote,
  onDeleteRoundNote,
  isMobileMode = false,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  // New Round Note Form
  const [roundTitle, setRoundTitle] = useState('');
  const [roundDate, setRoundDate] = useState(todayISO());
  const [roundInterviewer, setRoundInterviewer] = useState('');
  const [roundOutcome, setRoundOutcome] = useState<RoundOutcome>('Scheduled');
  const [roundText, setRoundText] = useState('');

  // Inline round editing
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editRoundTitle, setEditRoundTitle] = useState('');
  const [editRoundDate, setEditRoundDate] = useState('');
  const [editRoundInterviewer, setEditRoundInterviewer] = useState('');
  const [editRoundOutcome, setEditRoundOutcome] =
    useState<RoundOutcome>('Pending');
  const [editRoundText, setEditRoundText] = useState('');

  useEffect(() => {
    setConfirmDelete(false);
    setEditingNoteId(null);
    setRoundTitle('');
    setRoundDate(todayISO());
    setRoundInterviewer('');
    setRoundOutcome('Scheduled');
    setRoundText('');
  }, [application?.id]);

  useEffect(() => {
    if (!application) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [application, onClose]);

  if (!application) return null;

  const handleAddRound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roundTitle.trim() && !roundText.trim()) return;
    onAddRoundNote(application.id, {
      roundTitle: roundTitle.trim() || 'Interview Round',
      date: roundDate || todayISO(),
      interviewer: roundInterviewer.trim() || 'Team',
      outcome: roundOutcome,
      notes: roundText.trim(),
    });
    setRoundTitle('');
    setRoundDate(todayISO());
    setRoundInterviewer('');
    setRoundOutcome('Scheduled');
    setRoundText('');
  };

  const startEditRound = (rn: RoundNote) => {
    setEditingNoteId(rn.id);
    setEditRoundTitle(rn.roundTitle);
    setEditRoundDate(rn.date);
    setEditRoundInterviewer(rn.interviewer);
    setEditRoundOutcome(rn.outcome);
    setEditRoundText(rn.notes);
  };

  const saveEditRound = (noteId: string) => {
    onUpdateRoundNote(application.id, noteId, {
      roundTitle: editRoundTitle.trim() || 'Interview Round',
      date: editRoundDate,
      interviewer: editRoundInterviewer.trim(),
      outcome: editRoundOutcome,
      notes: editRoundText.trim(),
    });
    setEditingNoteId(null);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex bg-[#0f172a]/40 backdrop-blur-[1px] ${
        isMobileMode ? 'items-end justify-center' : 'justify-end'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={`${application.company} application details`}
      onClick={onClose}
    >
      <div
        className={
          isMobileMode
            ? 'w-full max-w-[430px] bg-white max-h-[90vh] overflow-y-auto rounded-t-3xl border-t border-x border-[#e5e7eb] shadow-[0_-16px_32px_rgba(15,23,42,0.18)] flex flex-col'
            : 'w-full max-w-2xl bg-white h-full overflow-y-auto border-l border-[#e5e7eb] shadow-[0_20px_30px_-10px_rgba(15,23,42,0.16)] flex flex-col'
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Drawer Header */}
        <div
          className={`sticky top-0 z-10 bg-white border-b border-[#e5e7eb] ${
            isMobileMode ? 'px-5 pt-2.5 pb-3.5' : 'px-6 py-4'
          }`}
        >
          {isMobileMode && (
            <div
              aria-hidden="true"
              className="w-10 h-1.5 bg-[#d1d5db] rounded-full mx-auto mb-3"
            />
          )}
          <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <CompanyMark company={application.company} size="lg" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                <span className="font-bold text-[#0f172a]">
                  {application.company}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono font-semibold text-[#059669] tabular-nums">
                  {formatPayRange(application.payMin, application.payMax)}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-[#0f172a] leading-snug mt-0.5 truncate">
                {application.role}
              </h2>
              {(() => {
                const today = getLocalTodayISO();
                const followUp = getFollowUpInfo(application, today);
                const idle = isApplicationIdle(application, today);
                const idleDays = idle ? getIdleDays(application, today) : 0;
                if (followUp.status === 'none' && !idle) return null;
                return (
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
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
                      <span className="text-xs font-medium text-[#4b5563] tabular-nums">
                        Follow-up{' '}
                        <span className="font-mono font-semibold text-[#0f172a]">
                          {formatShortDate(followUp.date)}
                        </span>
                      </span>
                    )}
                    {idle && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-semibold rounded-md bg-[#f3f4f6] text-[#374151] border border-[#d1d5db] tabular-nums">
                        <Hourglass className="w-3 h-3 text-[#6b7280]" aria-hidden="true" />
                        <span>Idle {idleDays}d</span>
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details drawer"
            className="p-2 text-[#6b7280] hover:text-[#0f172a] hover:bg-[#f3f4f6] rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Stage Switcher */}
          <div>
            <div className="text-xs font-semibold text-[#6b7280] mb-2">
              Pipeline Stage
            </div>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#f3f4f6] rounded-xl">
              {STAGES.map((stage) => {
                const active = application.stage === stage;
                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => onMoveStage(application.id, stage)}
                    className={`py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                      active
                        ? 'bg-[#059669] text-white shadow-xs'
                        : 'text-[#4b5563] hover:text-[#0f172a]'
                    }`}
                  >
                    {stage}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Details Form (Auto-persisted on change) */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-[#0f172a] border-b border-[#f3f4f6] pb-2">
              Role, Compensation &amp; Resume
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={application.company}
                  onChange={(e) =>
                    onUpdate(application.id, { company: e.target.value })
                  }
                  className="w-full h-10 px-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Role Title
                </label>
                <input
                  type="text"
                  value={application.role}
                  onChange={(e) =>
                    onUpdate(application.id, { role: e.target.value })
                  }
                  className="w-full h-10 px-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Base Pay Min ($k)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={application.payMin || ''}
                  onChange={(e) =>
                    onUpdate(application.id, {
                      payMin: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Base Pay Max ($k)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={application.payMax || ''}
                  onChange={(e) =>
                    onUpdate(application.id, {
                      payMax: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Resume Version
                </label>
                <select
                  value={application.resumeVersionId}
                  onChange={(e) =>
                    onUpdate(application.id, {
                      resumeVersionId: e.target.value,
                    })
                  }
                  className="w-full h-10 px-3 text-sm font-mono bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Work Mode
                </label>
                <select
                  value={application.workMode}
                  onChange={(e) =>
                    onUpdate(application.id, {
                      workMode: e.target.value as WorkMode,
                    })
                  }
                  className="w-full h-10 px-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
                >
                  {WORK_MODES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={application.location}
                  onChange={(e) =>
                    onUpdate(application.id, { location: e.target.value })
                  }
                  placeholder="e.g., San Francisco, CA"
                  className="w-full h-10 px-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Equity / Bonus Note
                </label>
                <input
                  type="text"
                  value={application.equityNote ?? ''}
                  onChange={(e) =>
                    onUpdate(application.id, { equityNote: e.target.value })
                  }
                  placeholder="e.g., 0.15% equity or $120k RSU"
                  className="w-full h-10 px-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Recruiter / Hiring Manager
                </label>
                <input
                  type="text"
                  value={application.hiringContact}
                  onChange={(e) =>
                    onUpdate(application.id, { hiringContact: e.target.value })
                  }
                  placeholder="Name"
                  className="w-full h-10 px-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Contact Title
                </label>
                <input
                  type="text"
                  value={application.contactTitle}
                  onChange={(e) =>
                    onUpdate(application.id, { contactTitle: e.target.value })
                  }
                  placeholder="e.g., Engineering Director"
                  className="w-full h-10 px-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={getEffectiveFollowUpDate(application)}
                  onChange={(e) =>
                    onUpdate(application.id, {
                      followUpDate: e.target.value,
                      nextStepDate: e.target.value,
                    })
                  }
                  className="w-full h-10 px-3 text-sm font-mono bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Applied Date
                </label>
                <input
                  type="date"
                  value={application.appliedDate}
                  onChange={(e) =>
                    onUpdate(application.id, { appliedDate: e.target.value })
                  }
                  className="w-full h-10 px-3 text-sm font-mono bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Priority
                </label>
                <select
                  value={application.priority}
                  onChange={(e) =>
                    onUpdate(application.id, {
                      priority: e.target.value as 'High' | 'Normal',
                    })
                  }
                  className="w-full h-10 px-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
                >
                  <option value="High">High Priority</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Job Posting URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={application.jobUrl}
                  onChange={(e) =>
                    onUpdate(application.id, { jobUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="flex-1 h-10 px-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
                />
                {application.jobUrl && (
                  <a
                    href={application.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 px-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0f172a] bg-white border border-[#e5e7eb] hover:border-[#0f172a] rounded-lg shrink-0"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* Round Notes Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-2">
              <h3 className="text-sm font-bold text-[#0f172a]">
                Interview Rounds &amp; Notes ({application.roundNotes.length})
              </h3>
            </div>

            {/* Existing Rounds */}
            <div className="space-y-3">
              {application.roundNotes.length === 0 ? (
                <p className="text-sm text-[#6b7280] py-3">
                  No rounds logged yet. Use the form below to record your first screen, system design, or prep note.
                </p>
              ) : (
                application.roundNotes.map((rn) => {
                  const isEditing = editingNoteId === rn.id;
                  return (
                    <div
                      key={rn.id}
                      className="border border-[#e5e7eb] rounded-xl p-4 bg-[#f9fafb]/60 space-y-2"
                    >
                      {isEditing ? (
                        <div className="space-y-2.5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <input
                              type="text"
                              value={editRoundTitle}
                              onChange={(e) => setEditRoundTitle(e.target.value)}
                              placeholder="Round title"
                              className="h-9 px-2.5 text-sm bg-white border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#059669]"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="date"
                                value={editRoundDate}
                                onChange={(e) => setEditRoundDate(e.target.value)}
                                className="h-9 px-2 text-xs font-mono bg-white border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#059669]"
                              />
                              <select
                                value={editRoundOutcome}
                                onChange={(e) =>
                                  setEditRoundOutcome(
                                    e.target.value as RoundOutcome
                                  )
                                }
                                className="h-9 px-2 text-xs font-semibold bg-white border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#059669]"
                              >
                                {OUTCOMES.map((o) => (
                                  <option key={o} value={o}>
                                    {o}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={editRoundInterviewer}
                            onChange={(e) =>
                              setEditRoundInterviewer(e.target.value)
                            }
                            placeholder="Interviewer(s)"
                            className="w-full h-9 px-2.5 text-sm bg-white border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#059669]"
                          />
                          <textarea
                            rows={2}
                            value={editRoundText}
                            onChange={(e) => setEditRoundText(e.target.value)}
                            className="w-full p-2.5 text-sm bg-white border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#059669]"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingNoteId(null)}
                              className="px-3 py-1.5 text-xs font-semibold text-[#4b5563] bg-white border border-[#e5e7eb] rounded-md"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => saveEditRound(rn.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#059669] rounded-md inline-flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Save Round
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-bold text-[#0f172a]">
                                {rn.roundTitle}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#6b7280] mt-0.5 tabular-nums">
                                <span className="font-mono">{rn.date}</span>
                                <span aria-hidden="true">·</span>
                                <span>{rn.interviewer || 'Team'}</span>
                                <span aria-hidden="true">·</span>
                                <span
                                  className={`font-semibold ${
                                    rn.outcome === 'Passed'
                                      ? 'text-[#059669]'
                                      : rn.outcome === 'Follow-up'
                                      ? 'text-[#d97706]'
                                      : 'text-[#0f172a]'
                                  }`}
                                >
                                  {rn.outcome}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => startEditRound(rn)}
                                aria-label={`Edit ${rn.roundTitle}`}
                                className="p-1.5 text-[#6b7280] hover:text-[#0f172a] hover:bg-white rounded-md"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onDeleteRoundNote(application.id, rn.id)
                                }
                                aria-label={`Delete ${rn.roundTitle}`}
                                className="p-1.5 text-[#6b7280] hover:text-[#ba1a1a] hover:bg-white rounded-md"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">
                            {rn.notes}
                          </p>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Round Note Form */}
            <form
              onSubmit={handleAddRound}
              className="border border-[#e5e7eb] rounded-xl p-4 bg-white space-y-3"
            >
              <div className="text-xs font-bold text-[#0f172a]">
                Log Interview Round or Note
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  required
                  value={roundTitle}
                  onChange={(e) => setRoundTitle(e.target.value)}
                  placeholder="Round (e.g., Hiring Manager Screen)"
                  className="sm:col-span-1 h-9 px-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
                />
                <input
                  type="text"
                  value={roundInterviewer}
                  onChange={(e) => setRoundInterviewer(e.target.value)}
                  placeholder="Interviewer(s)"
                  className="h-9 px-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={roundDate}
                    onChange={(e) => setRoundDate(e.target.value)}
                    className="h-9 px-2 text-xs font-mono bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
                  />
                  <select
                    value={roundOutcome}
                    onChange={(e) =>
                      setRoundOutcome(e.target.value as RoundOutcome)
                    }
                    className="h-9 px-2 text-xs font-semibold bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
                  >
                    {OUTCOMES.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea
                rows={2}
                required
                value={roundText}
                onChange={(e) => setRoundText(e.target.value)}
                placeholder="Questions asked, technical tradeoffs, interviewer signals, and next steps..."
                className="w-full p-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0f172a] hover:bg-[#1e293b] rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Round Note</span>
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-[#e5e7eb] px-6 py-4 bg-[#f9fafb] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onDuplicate(application.id);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0f172a] bg-white border border-[#e5e7eb] hover:border-[#0f172a] rounded-lg transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicate</span>
            </button>

            {confirmDelete ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onDelete(application.id);
                    onClose();
                  }}
                  className="px-3 py-2 text-xs font-semibold text-white bg-[#ba1a1a] hover:bg-[#93000a] rounded-lg"
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-2 text-xs font-semibold text-[#4b5563]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#ba1a1a] bg-white border border-[#e5e7eb] hover:border-[#ba1a1a] rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#059669] hover:bg-[#006948] rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
