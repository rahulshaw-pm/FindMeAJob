import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { JobApplication, ResumeVersion } from '../types/job';

interface ResumesScreenProps {
  resumes: ResumeVersion[];
  applications: JobApplication[];
  onAddResume: (
    input: Omit<ResumeVersion, 'id' | 'updatedAt'>
  ) => ResumeVersion;
  onUpdateResume: (id: string, updates: Partial<ResumeVersion>) => void;
  onDeleteResume: (id: string) => void;
  onFilterByResume: (resumeId: string) => void;
  isMobileMode?: boolean;
}

export const ResumesScreen: React.FC<ResumesScreenProps> = ({
  resumes,
  applications,
  onAddResume,
  onUpdateResume,
  onDeleteResume,
  onFilterByResume,
  isMobileMode = false,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Create form state
  const [label, setLabel] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [fileRef, setFileRef] = useState('');
  const [highlights, setHighlights] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Edit form state
  const [editLabel, setEditLabel] = useState('');
  const [editTargetRole, setEditTargetRole] = useState('');
  const [editFileRef, setEditFileRef] = useState('');
  const [editHighlights, setEditHighlights] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onAddResume({
      label: label.trim(),
      targetRole: targetRole.trim() || 'General Engineering',
      fileRef: fileRef.trim() || `${label.trim().replace(/\s+/g, '_')}.pdf`,
      highlights: highlights.trim(),
      isDefault,
    });
    setLabel('');
    setTargetRole('');
    setFileRef('');
    setHighlights('');
    setIsDefault(false);
    setShowCreateForm(false);
  };

  const startEdit = (r: ResumeVersion) => {
    setEditingId(r.id);
    setEditLabel(r.label);
    setEditTargetRole(r.targetRole);
    setEditFileRef(r.fileRef);
    setEditHighlights(r.highlights);
  };

  const saveEdit = (id: string) => {
    if (!editLabel.trim()) return;
    onUpdateResume(id, {
      label: editLabel.trim(),
      targetRole: editTargetRole.trim(),
      fileRef: editFileRef.trim(),
      highlights: editHighlights.trim(),
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#e5e7eb] rounded-xl p-5">
        <div>
          <h2 className="text-lg font-bold text-[#0f172a]">
            Resume Variants
          </h2>
          <p className="text-sm text-[#6b7280] mt-0.5">
            Track tailored resume positioning and see which variants earn interviews.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateForm((v) => !v)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#0f172a] hover:bg-[#1e293b] rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>{showCreateForm ? 'Close Form' : 'New Resume Variant'}</span>
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-[#059669] rounded-xl p-5 space-y-4"
        >
          <h3 className="text-base font-bold text-[#0f172a]">
            Add Resume Version
          </h3>
          <div
            className={
              isMobileMode
                ? 'grid grid-cols-1 gap-3'
                : 'grid grid-cols-1 md:grid-cols-3 gap-4'
            }
          >
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Version Label *
              </label>
              <input
                type="text"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., v4.3 AI Infrastructure"
                className="w-full h-10 px-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Staff AI Systems Engineer"
                className="w-full h-10 px-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                File Reference
              </label>
              <input
                type="text"
                value={fileRef}
                onChange={(e) => setFileRef(e.target.value)}
                placeholder="e.g., Resume_AI_Infra_v4.3.pdf"
                className="w-full h-10 px-3 text-sm font-mono bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">
              Positioning &amp; Key Highlights
            </label>
            <textarea
              rows={2}
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              placeholder="Summarize what projects, metrics, or narrative this version emphasizes..."
              className="w-full p-3 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:bg-white focus:border-[#059669]"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <label className="inline-flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-[18px] h-[18px] rounded accent-[#059669]"
              />
              <span>Set as default resume for new applications</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-sm font-semibold text-[#4b5563] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f9fafb]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white bg-[#059669] hover:bg-[#006948] rounded-lg"
              >
                Save Version
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Resumes Grid */}
      <div
        className={
          isMobileMode
            ? 'grid grid-cols-1 gap-3.5'
            : 'grid grid-cols-1 md:grid-cols-2 gap-4'
        }
      >
        {resumes.map((resume) => {
          const linked = applications.filter(
            (a) => a.resumeVersionId === resume.id
          );
          const interviewsOrOffers = linked.filter(
            (a) => a.stage === 'Interview' || a.stage === 'Offer'
          ).length;
          const submitted = linked.filter((a) => a.stage !== 'Saved').length;
          const conversionPct =
            submitted > 0
              ? Math.round((interviewsOrOffers / submitted) * 100)
              : 0;
          const isEditing = editingId === resume.id;

          return (
            <article
              key={resume.id}
              className="bg-white border border-[#e5e7eb] rounded-xl p-5 flex flex-col justify-between gap-4"
            >
              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#374151] mb-1">
                        Version Label
                      </label>
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="w-full h-9 px-3 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#059669]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#374151] mb-1">
                        Target Role
                      </label>
                      <input
                        type="text"
                        value={editTargetRole}
                        onChange={(e) => setEditTargetRole(e.target.value)}
                        className="w-full h-9 px-3 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#059669]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1">
                      File Reference
                    </label>
                    <input
                      type="text"
                      value={editFileRef}
                      onChange={(e) => setEditFileRef(e.target.value)}
                      className="w-full h-9 px-3 text-sm font-mono border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#059669]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1">
                      Highlights
                    </label>
                    <textarea
                      rows={2}
                      value={editHighlights}
                      onChange={(e) => setEditHighlights(e.target.value)}
                      className="w-full p-2.5 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#059669]"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#4b5563] border border-[#e5e7eb] rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => saveEdit(resume.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#059669] rounded-lg inline-flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                          <span className="font-mono font-semibold text-[#059669]">
                            {resume.isDefault ? 'Default Resume' : 'Variant'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            Updated {resume.updatedAt}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-[#0f172a] mt-0.5">
                          {resume.label}
                        </h3>
                        <p className="text-sm font-medium text-[#374151]">
                          {resume.targetRole}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(resume)}
                          aria-label={`Edit ${resume.label}`}
                          className="p-2 text-[#6b7280] hover:text-[#0f172a] hover:bg-[#f3f4f6] rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {resumes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onDeleteResume(resume.id)}
                            aria-label={`Delete ${resume.label}`}
                            className="p-2 text-[#6b7280] hover:text-[#ba1a1a] hover:bg-[#fef2f2] rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-[#4b5563] leading-relaxed">
                      {resume.highlights || 'No highlights documented yet.'}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs font-mono text-[#6b7280]">
                      <FileText className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{resume.fileRef}</span>
                    </div>
                  </div>

                  {/* Metrics + Actions Footer */}
                  <div className="pt-3.5 border-t border-[#f3f4f6] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4 text-xs tabular-nums">
                      <div>
                        <span className="text-[#6b7280]">Linked: </span>
                        <span className="font-mono font-bold text-[#0f172a]">
                          {linked.length}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6b7280]">Interviews/Offers: </span>
                        <span className="font-mono font-bold text-[#059669]">
                          {interviewsOrOffers}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6b7280]">Interview Rate: </span>
                        <span className="font-mono font-bold text-[#0f172a]">
                          {conversionPct}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!resume.isDefault && (
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateResume(resume.id, { isDefault: true })
                          }
                          className="px-2.5 py-1.5 text-xs font-semibold text-[#4b5563] hover:text-[#0f172a] border border-[#e5e7eb] rounded-md transition-colors"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onFilterByResume(resume.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#059669] hover:text-[#006948] bg-[#ecfdf5] rounded-md transition-colors whitespace-nowrap"
                      >
                        <span>Filter Pipeline</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};
