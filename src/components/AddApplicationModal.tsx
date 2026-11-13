import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  JobApplication,
  ResumeVersion,
  STAGES,
  Stage,
  WorkMode,
} from '../types/job';
import { todayISO } from '../hooks/useJobTracker';

interface AddApplicationModalProps {
  isOpen: boolean;
  initialStage: Stage;
  resumes: ResumeVersion[];
  onClose: () => void;
  onAdd: (
    input: Omit<JobApplication, 'id' | 'updatedAt' | 'resumeVersionLabel'> & {
      initialNote?: string;
    }
  ) => void;
  isMobileMode?: boolean;
}

const WORK_MODES: WorkMode[] = ['Remote', 'Hybrid', 'Onsite'];

export const AddApplicationModal: React.FC<AddApplicationModalProps> = ({
  isOpen,
  initialStage,
  resumes,
  onClose,
  onAdd,
  isMobileMode = false,
}) => {
  const defaultResume =
    resumes.find((r) => r.isDefault)?.id ?? resumes[0]?.id ?? '';

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [stage, setStage] = useState<Stage>(initialStage);
  const [payMin, setPayMin] = useState<number>(175);
  const [payMax, setPayMax] = useState<number>(215);
  const [equityNote, setEquityNote] = useState('');
  const [workMode, setWorkMode] = useState<WorkMode>('Remote');
  const [location, setLocation] = useState('San Francisco, CA');
  const [resumeVersionId, setResumeVersionId] = useState(defaultResume);
  const [hiringContact, setHiringContact] = useState('');
  const [contactTitle, setContactTitle] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [priority, setPriority] = useState<'High' | 'Normal'>('Normal');
  const [initialNote, setInitialNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStage(initialStage);
      setResumeVersionId(
        resumes.find((r) => r.isDefault)?.id ?? resumes[0]?.id ?? ''
      );
    }
  }, [isOpen, initialStage, resumes]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    const minVal = Math.max(0, Number(payMin) || 0);
    const maxVal = Math.max(minVal, Number(payMax) || minVal);

    onAdd({
      company: company.trim(),
      role: role.trim(),
      stage,
      payMin: minVal,
      payMax: maxVal,
      equityNote: equityNote.trim() || undefined,
      location: location.trim() || 'Remote',
      workMode,
      resumeVersionId,
      hiringContact: hiringContact.trim(),
      contactTitle: contactTitle.trim(),
      jobUrl: jobUrl.trim(),
      appliedDate: stage === 'Saved' ? '' : todayISO(),
      followUpDate: followUpDate || undefined,
      priority,
      roundNotes: [],
      initialNote,
    });

    setCompany('');
    setRole('');
    setEquityNote('');
    setHiringContact('');
    setContactTitle('');
    setJobUrl('');
    setFollowUpDate('');
    setInitialNote('');
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center bg-[#0f172a]/40 backdrop-blur-[1px] ${
        isMobileMode ? 'items-end p-0' : 'items-center p-4'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Add job application"
      onClick={onClose}
    >
      <div
        className={
          isMobileMode
            ? 'w-full max-w-[430px] bg-white border-t border-x border-[#e5e7eb] rounded-t-3xl shadow-[0_-16px_32px_rgba(15,23,42,0.18)] overflow-hidden max-h-[90vh] flex flex-col'
            : 'w-full max-w-xl bg-white border border-[#e5e7eb] rounded-2xl shadow-[0_20px_30px_-10px_rgba(15,23,42,0.16)] overflow-hidden max-h-[92vh] flex flex-col'
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`border-b border-[#e5e7eb] ${
            isMobileMode ? 'px-5 pt-2.5 pb-3.5' : 'px-6 py-4'
          }`}
        >
          {isMobileMode && (
            <div
              aria-hidden="true"
              className="w-10 h-1.5 bg-[#d1d5db] rounded-full mx-auto mb-3"
            />
          )}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[#0f172a]">
              Track New Role
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 text-[#6b7280] hover:text-[#0f172a] hover:bg-[#f3f4f6] rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Company *
              </label>
              <input
                type="text"
                required
                autoFocus
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., Anthropic"
                className="w-full h-10 px-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Role Title *
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Staff Frontend Engineer"
                className="w-full h-10 px-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Current Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as Stage)}
                className="w-full h-10 px-3 text-sm font-semibold bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Resume Version
              </label>
              <select
                value={resumeVersionId}
                onChange={(e) => setResumeVersionId(e.target.value)}
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
                Base Pay Min ($k)
              </label>
              <input
                type="number"
                min={0}
                step={5}
                value={payMin}
                onChange={(e) => setPayMin(Number(e.target.value))}
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
                value={payMax}
                onChange={(e) => setPayMax(Number(e.target.value))}
                className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Work Mode
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
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
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Remote / NYC"
                className="w-full h-10 px-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Hiring Contact
              </label>
              <input
                type="text"
                value={hiringContact}
                onChange={(e) => setHiringContact(e.target.value)}
                placeholder="Recruiter or Hiring Manager"
                className="w-full h-10 px-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Follow-up Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full h-10 px-3 text-sm font-mono bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as 'High' | 'Normal')
                }
                className="w-full h-10 px-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
              >
                <option value="Normal">Normal</option>
                <option value="High">High Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Equity / Bonus Note
              </label>
              <input
                type="text"
                value={equityNote}
                onChange={(e) => setEquityNote(e.target.value)}
                placeholder="e.g., 0.12% equity"
                className="w-full h-10 px-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Job Link
              </label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://..."
                className="w-full h-10 px-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Prep or Outreach Note
            </label>
            <textarea
              rows={2}
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              placeholder="Why this role fits, referral contact, or key talking points..."
              className="w-full p-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#f3f4f6]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-[#4b5563] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f9fafb]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#059669] hover:bg-[#006948] rounded-lg transition-colors"
            >
              Save Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
