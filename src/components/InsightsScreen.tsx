import React from 'react';
import { Download, RotateCcw, Trash2, ArrowUpRight } from 'lucide-react';
import { JobApplication, ResumeVersion, STAGES, Stage } from '../types/job';
import { formatPayRange } from '../hooks/useJobTracker';
import { CompanyMark } from './CompanyMark';

interface InsightsScreenProps {
  applications: JobApplication[];
  resumes: ResumeVersion[];
  onSelectApplication: (app: JobApplication) => void;
  onExportCSV: () => void;
  onResetDemo: () => void;
  onClearAll: () => void;
  isMobileMode?: boolean;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({
  applications,
  resumes,
  onSelectApplication,
  onExportCSV,
  onResetDemo,
  onClearAll,
  isMobileMode = false,
}) => {
  const total = applications.length;
  const stageCounts: Record<Stage, number> = {
    Saved: applications.filter((a) => a.stage === 'Saved').length,
    Applied: applications.filter((a) => a.stage === 'Applied').length,
    Interview: applications.filter((a) => a.stage === 'Interview').length,
    Offer: applications.filter((a) => a.stage === 'Offer').length,
  };

  const submittedCount =
    stageCounts.Applied + stageCounts.Interview + stageCounts.Offer;
  const activeInterviewAndOffer = stageCounts.Interview + stageCounts.Offer;
  const interviewRate =
    submittedCount > 0
      ? Math.round((activeInterviewAndOffer / submittedCount) * 100)
      : 0;

  const payValues = applications.filter((a) => a.payMax > 0);
  const avgMidPay =
    payValues.length > 0
      ? Math.round(
          payValues.reduce((s, a) => s + (a.payMin + a.payMax) / 2, 0) /
            payValues.length
        )
      : 0;
  const highestMaxPay =
    payValues.length > 0
      ? Math.max(...payValues.map((a) => a.payMax))
      : 0;

  const allRounds = applications
    .flatMap((app) =>
      app.roundNotes.map((rn) => ({
        ...rn,
        app,
      }))
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const sortedByPay = [...applications]
    .filter((a) => a.payMax > 0)
    .sort((a, b) => b.payMax - a.payMax)
    .slice(0, 8);

  const globalMaxPay = Math.max(
    300,
    ...sortedByPay.map((a) => a.payMax)
  );

  return (
    <div className="space-y-6">
      {/* Top KPI Summary Strip */}
      <div
        className={
          isMobileMode
            ? 'grid grid-cols-2 gap-3'
            : 'grid grid-cols-2 lg:grid-cols-4 gap-4'
        }
      >
        <div className="bg-white border border-[#e5e7eb] rounded-xl p-4">
          <div className="text-xs font-semibold text-[#6b7280]">
            Roles Tracked
          </div>
          <div className="text-2xl font-extrabold text-[#0f172a] font-mono tabular-nums mt-1">
            {total}
          </div>
          <div className="text-xs text-[#6b7280] mt-1 tabular-nums">
            {submittedCount} applied · {stageCounts.Saved} shortlisted
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-xl p-4">
          <div className="text-xs font-semibold text-[#6b7280]">
            Application-to-Interview
          </div>
          <div className="text-2xl font-extrabold text-[#059669] font-mono tabular-nums mt-1">
            {interviewRate}%
          </div>
          <div className="text-xs text-[#6b7280] mt-1 tabular-nums">
            {activeInterviewAndOffer} of {submittedCount} applied roles
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-xl p-4">
          <div className="text-xs font-semibold text-[#6b7280]">
            Average Base Midpoint
          </div>
          <div className="text-2xl font-extrabold text-[#0f172a] font-mono tabular-nums mt-1">
            {avgMidPay > 0 ? `$${avgMidPay}k` : '—'}
          </div>
          <div className="text-xs text-[#6b7280] mt-1 tabular-nums">
            Top base ceiling: {highestMaxPay > 0 ? `$${highestMaxPay}k` : '—'}
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-xl p-4">
          <div className="text-xs font-semibold text-[#6b7280]">
            Interview Rounds Logged
          </div>
          <div className="text-2xl font-extrabold text-[#0f172a] font-mono tabular-nums mt-1">
            {allRounds.length}
          </div>
          <div className="text-xs text-[#6b7280] mt-1 tabular-nums">
            {stageCounts.Offer} active {stageCounts.Offer === 1 ? 'offer' : 'offers'}
          </div>
        </div>
      </div>

      {/* Middle 2-column Grid: Pipeline Funnel & Pay Band Spread */}
      <div
        className={
          isMobileMode
            ? 'grid grid-cols-1 gap-4'
            : 'grid grid-cols-1 lg:grid-cols-2 gap-6'
        }
      >
        {/* Pipeline Stage Breakdown */}
        <section className="bg-white border border-[#e5e7eb] rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#0f172a]">
              Pipeline Stage Distribution
            </h2>
            <p className="text-xs text-[#6b7280] mt-0.5">
              Live stage breakdown across all applications saved in your browser.
            </p>
          </div>

          <div className="space-y-3">
            {STAGES.map((stage) => {
              const count = stageCounts[stage];
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0f172a]">{stage}</span>
                    <span className="font-mono text-[#4b5563] tabular-nums">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stage === 'Offer'
                          ? 'bg-[#059669]'
                          : stage === 'Interview'
                          ? 'bg-[#10b981]'
                          : stage === 'Applied'
                          ? 'bg-[#0f172a]'
                          : 'bg-[#94a3b8]'
                      }`}
                      style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resume Effectiveness Table */}
          <div className="pt-4 border-t border-[#f3f4f6]">
            <h3 className="text-sm font-bold text-[#0f172a] mb-2.5">
              Resume Version Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#e5e7eb] text-[#6b7280]">
                    <th className="py-2 font-semibold">Resume</th>
                    <th className="py-2 text-right font-semibold">Apps</th>
                    <th className="py-2 text-right font-semibold">Interview+</th>
                    <th className="py-2 text-right font-semibold">Offer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6] tabular-nums">
                  {resumes.map((r) => {
                    const linked = applications.filter(
                      (a) => a.resumeVersionId === r.id
                    );
                    const intPlus = linked.filter(
                      (a) => a.stage === 'Interview' || a.stage === 'Offer'
                    ).length;
                    const offers = linked.filter(
                      (a) => a.stage === 'Offer'
                    ).length;
                    return (
                      <tr key={r.id}>
                        <td className="py-2 font-mono font-medium text-[#0f172a]">
                          {r.label}
                        </td>
                        <td className="py-2 text-right font-mono text-[#4b5563]">
                          {linked.length}
                        </td>
                        <td className="py-2 text-right font-mono font-semibold text-[#059669]">
                          {intPlus}
                        </td>
                        <td className="py-2 text-right font-mono font-semibold text-[#0f172a]">
                          {offers}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Compensation Range Comparison */}
        <section className="bg-white border border-[#e5e7eb] rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#0f172a]">
              Pay Range Comparison
            </h2>
            <p className="text-xs text-[#6b7280] mt-0.5">
              Top roles ranked by maximum base salary range. Click any row to open round notes.
            </p>
          </div>

          {sortedByPay.length === 0 ? (
            <p className="text-sm text-[#6b7280] py-8 text-center">
              Add applications with pay ranges to compare compensation bands.
            </p>
          ) : (
            <div className="space-y-3">
              {sortedByPay.map((app) => {
                const leftPct = Math.round((app.payMin / globalMaxPay) * 100);
                const widthPct = Math.max(
                  4,
                  Math.round(((app.payMax - app.payMin) / globalMaxPay) * 100)
                );

                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => onSelectApplication(app)}
                    className="w-full text-left group space-y-1.5 p-2 -mx-2 rounded-lg hover:bg-[#f9fafb] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-[#0f172a] group-hover:text-[#059669] truncate">
                          {app.company}
                        </span>
                        <span className="text-[#6b7280] truncate">
                          {app.role}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-[#059669] tabular-nums shrink-0">
                        {formatPayRange(app.payMin, app.payMax)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#f3f4f6] rounded-full relative overflow-hidden">
                      <div
                        className="absolute top-0 bottom-0 bg-[#059669] rounded-full"
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Recent Round Notes Activity + Local Storage Controls */}
      <div
        className={
          isMobileMode
            ? 'grid grid-cols-1 gap-4'
            : 'grid grid-cols-1 lg:grid-cols-3 gap-6'
        }
      >
        <section
          className={`${
            isMobileMode ? '' : 'lg:col-span-2'
          } bg-white border border-[#e5e7eb] rounded-xl p-5 space-y-4`}
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#0f172a]">
                Chronological Round Notes
              </h2>
              <p className="text-xs text-[#6b7280] mt-0.5">
                Every interview round and note across your pipeline, newest first.
              </p>
            </div>
          </div>

          {allRounds.length === 0 ? (
            <p className="text-sm text-[#6b7280] py-6 text-center">
              No round notes logged yet. Open any company card to log an interview round.
            </p>
          ) : (
            <div className="divide-y divide-[#f3f4f6]">
              {allRounds.slice(0, 8).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectApplication(item.app)}
                  className="w-full py-3 flex items-start justify-between gap-4 text-left hover:bg-[#f9fafb] px-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <CompanyMark company={item.app.company} size="sm" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                        <span className="font-bold text-[#0f172a]">
                          {item.app.company}
                        </span>
                        <span className="text-[#6b7280]">·</span>
                        <span className="font-semibold text-[#059669]">
                          {item.roundTitle}
                        </span>
                        <span className="text-[#6b7280]">·</span>
                        <span className="text-[#4b5563]">
                          {item.outcome}
                        </span>
                      </div>
                      <p className="text-sm text-[#374151] mt-1 line-clamp-2">
                        {item.notes}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-[#6b7280] tabular-nums shrink-0">
                    <span>{item.date}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Browser Storage & Backup Panel */}
        <section className="bg-white border border-[#e5e7eb] rounded-xl p-5 flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-[#0f172a]">
              Data &amp; Backup
            </h2>
            <p className="text-sm text-[#4b5563] leading-relaxed">
              Your applications, resume variants, and interview notes stay private in this browser. Export a CSV backup anytime or reset to the sample search.
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={onExportCSV}
              className="w-full h-10 px-4 inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#0f172a] bg-white border border-[#e5e7eb] hover:border-[#0f172a] rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Export Applications CSV</span>
            </button>

            <button
              type="button"
              onClick={onResetDemo}
              className="w-full h-10 px-4 inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#059669] bg-[#ecfdf5] hover:bg-[#d1fae5] rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Restore Sample Pipeline</span>
            </button>

            <button
              type="button"
              onClick={onClearAll}
              className="w-full h-10 px-4 inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#ba1a1a] bg-white border border-[#e5e7eb] hover:border-[#ba1a1a] rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              <span>Clear All Applications</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
