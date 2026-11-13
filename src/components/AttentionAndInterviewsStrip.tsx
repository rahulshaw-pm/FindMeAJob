import React, { useState } from 'react';
import {
  CalendarClock,
  AlertTriangle,
  Clock,
  Hourglass,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
} from 'lucide-react';
import { AttentionFilter, JobApplication } from '../types/job';
import {
  formatShortDate,
  getFollowUpInfo,
  getIdleDays,
  getLocalTodayISO,
  getUpcomingInterviews,
  isApplicationIdle,
} from '../utils/dateStatus';
import { CompanyMark } from './CompanyMark';

interface AttentionAndInterviewsStripProps {
  applications: JobApplication[];
  activeAttentionFilter: AttentionFilter;
  onSelectAttentionFilter: (filter: AttentionFilter) => void;
  onSelectApplication: (app: JobApplication) => void;
  isMobileMode?: boolean;
}

export const AttentionAndInterviewsStrip: React.FC<
  AttentionAndInterviewsStripProps
> = ({
  applications,
  activeAttentionFilter,
  onSelectAttentionFilter,
  onSelectApplication,
  isMobileMode = false,
}) => {
  const [alertsExpanded, setAlertsExpanded] = useState(true);
  const today = getLocalTodayISO();

  const upcomingInterviews = getUpcomingInterviews(applications, today);

  const overdueApps = applications.filter(
    (app) => getFollowUpInfo(app, today).status === 'overdue'
  );
  const dueTodayApps = applications.filter(
    (app) => getFollowUpInfo(app, today).status === 'due_today'
  );
  const idleApps = applications
    .filter((app) => isApplicationIdle(app, today))
    .sort((a, b) => getIdleDays(b, today) - getIdleDays(a, today));

  const hasAlerts =
    overdueApps.length > 0 || dueTodayApps.length > 0 || idleApps.length > 0;

  return (
    <div className="space-y-3">
      {/* Upcoming Interviews Summary Strip */}
      <section
        aria-label="Upcoming interviews summary"
        className="bg-white border border-[#e5e7eb] rounded-xl px-4 py-3.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <CalendarClock
              className="w-4 h-4 text-[#059669]"
              aria-hidden="true"
            />
            <h2 className="text-sm font-bold text-[#0f172a]">
              Upcoming Interviews
            </h2>
            <span className="font-mono text-xs font-semibold text-[#059669] tabular-nums">
              {upcomingInterviews.length}
            </span>
          </div>
          {upcomingInterviews.length > 0 && (
            <span className="text-xs text-[#6b7280] tabular-nums">
              Next up:{' '}
              <span className="font-semibold text-[#0f172a]">
                {upcomingInterviews[0].app.company}
              </span>{' '}
              ({upcomingInterviews[0].isToday
                ? 'Today'
                : formatShortDate(upcomingInterviews[0].date)}
              )
            </span>
          )}
        </div>

        {upcomingInterviews.length === 0 ? (
          <p className="text-xs text-[#6b7280]">
            No upcoming interviews scheduled. Log a round as{' '}
            <span className="font-semibold text-[#0f172a]">Scheduled</span> or
            set a follow-up date on an active Interview role.
          </p>
        ) : (
          <div
            className={
              isMobileMode
                ? 'grid grid-cols-1 gap-2'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5'
            }
          >
            {upcomingInterviews.slice(0, 4).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectApplication(item.app)}
                className="flex items-center justify-between gap-2.5 p-2.5 rounded-lg border border-[#e5e7eb] bg-[#f9fafb]/70 hover:bg-white hover:border-[#059669] transition-colors text-left group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CompanyMark company={item.app.company} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-bold text-[#0f172a] truncate group-hover:text-[#006948]">
                        {item.app.company}
                      </span>
                      <span aria-hidden="true" className="text-[#9ca3af]">
                        ·
                      </span>
                      <span className="text-[#6b7280] truncate">
                        {item.interviewer}
                      </span>
                    </div>
                    <div className="text-xs text-[#374151] truncate mt-0.5">
                      {item.roundTitle}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-block font-mono text-[11px] font-bold px-2 py-0.5 rounded-md tabular-nums ${
                      item.isToday
                        ? 'bg-[#fffbeb] text-[#b45309] border border-[#fde68a]'
                        : 'bg-[#ecfdf5] text-[#006948] border border-[#a7f3d0]'
                    }`}
                  >
                    {item.isToday ? 'Today' : formatShortDate(item.date)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Follow-up & Idle Application Alerts */}
      {hasAlerts && (
        <section
          aria-label="Follow-up and idle application alerts"
          className="bg-white border border-[#e5e7eb] rounded-xl px-4 py-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-xs font-bold text-[#0f172a]">
                Follow-up Queue
              </span>

              {overdueApps.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onSelectAttentionFilter(
                      activeAttentionFilter === 'Overdue' ? 'All' : 'Overdue'
                    )
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors whitespace-nowrap tabular-nums ${
                    activeAttentionFilter === 'Overdue'
                      ? 'bg-[#ba1a1a] text-white border-[#ba1a1a]'
                      : 'bg-[#fef2f2] text-[#ba1a1a] border-[#fecaca] hover:border-[#ba1a1a]'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{overdueApps.length} Overdue</span>
                </button>
              )}

              {dueTodayApps.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onSelectAttentionFilter(
                      activeAttentionFilter === 'DueToday' ? 'All' : 'DueToday'
                    )
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors whitespace-nowrap tabular-nums ${
                    activeAttentionFilter === 'DueToday'
                      ? 'bg-[#b45309] text-white border-[#b45309]'
                      : 'bg-[#fffbeb] text-[#b45309] border-[#fde68a] hover:border-[#b45309]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{dueTodayApps.length} Due Today</span>
                </button>
              )}

              {idleApps.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onSelectAttentionFilter(
                      activeAttentionFilter === 'Idle' ? 'All' : 'Idle'
                    )
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors whitespace-nowrap tabular-nums ${
                    activeAttentionFilter === 'Idle'
                      ? 'bg-[#0f172a] text-white border-[#0f172a]'
                      : 'bg-[#f3f4f6] text-[#374151] border-[#d1d5db] hover:border-[#0f172a]'
                  }`}
                >
                  <Hourglass className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{idleApps.length} Quiet (5+ days)</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setAlertsExpanded((v) => !v)}
              aria-expanded={alertsExpanded}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#6b7280] hover:text-[#0f172a] whitespace-nowrap"
            >
              <span>{alertsExpanded ? 'Hide list' : 'Show list'}</span>
              {alertsExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {alertsExpanded && (
            <div className="mt-2.5 pt-2.5 border-t border-[#f3f4f6] flex flex-wrap items-center gap-2">
              {overdueApps.map((app) => {
                const info = getFollowUpInfo(app, today);
                return (
                  <button
                    key={`od-${app.id}`}
                    type="button"
                    onClick={() => onSelectApplication(app)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#fef2f2]/70 hover:bg-[#fef2f2] border border-[#fecaca] rounded-md text-[#0f172a] transition-colors"
                  >
                    <span className="font-bold">{app.company}</span>
                    <span className="font-mono text-[11px] text-[#ba1a1a] tabular-nums">
                      Overdue ({formatShortDate(info.date)})
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-[#ba1a1a]" />
                  </button>
                );
              })}

              {dueTodayApps.map((app) => (
                <button
                  key={`dt-${app.id}`}
                  type="button"
                  onClick={() => onSelectApplication(app)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#fffbeb]/80 hover:bg-[#fffbeb] border border-[#fde68a] rounded-md text-[#0f172a] transition-colors"
                >
                  <span className="font-bold">{app.company}</span>
                  <span className="font-mono text-[11px] text-[#b45309]">
                    Due Today
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-[#b45309]" />
                </button>
              ))}

              {idleApps.map((app) => {
                const days = getIdleDays(app, today);
                return (
                  <button
                    key={`idle-${app.id}`}
                    type="button"
                    onClick={() => onSelectApplication(app)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#f9fafb] hover:bg-[#f3f4f6] border border-[#e5e7eb] rounded-md text-[#0f172a] transition-colors"
                  >
                    <span className="font-bold">{app.company}</span>
                    <span className="font-mono text-[11px] text-[#4b5563] tabular-nums">
                      Idle {days}d · {app.stage}
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-[#6b7280]" />
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
