import { JobApplication } from '../types/job';

export type FollowUpStatus = 'overdue' | 'due_today' | 'upcoming' | 'none';

export const IDLE_THRESHOLD_DAYS = 5;

export function getLocalTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseISODateUTC(iso: string): number | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function diffDaysISO(fromISO: string, toISO: string): number {
  const fromMs = parseISODateUTC(fromISO);
  const toMs = parseISODateUTC(toISO);
  if (fromMs === null || toMs === null) return 0;
  return Math.round((toMs - fromMs) / 86_400_000);
}

export function formatShortDate(iso?: string): string {
  if (!iso) return '';
  const ms = parseISODateUTC(iso);
  if (ms === null) return iso;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(ms));
}

export function getEffectiveFollowUpDate(app: JobApplication): string {
  return app.followUpDate || app.nextStepDate || '';
}

export function getFollowUpInfo(
  app: JobApplication,
  todayISO: string = getLocalTodayISO()
): {
  date: string;
  status: FollowUpStatus;
  daysDelta: number;
} {
  const date = getEffectiveFollowUpDate(app);
  if (!date) {
    return { date: '', status: 'none', daysDelta: 0 };
  }
  const daysDelta = diffDaysISO(todayISO, date); // negative => past, 0 => today, positive => future
  if (daysDelta < 0) {
    return { date, status: 'overdue', daysDelta };
  }
  if (daysDelta === 0) {
    return { date, status: 'due_today', daysDelta: 0 };
  }
  return { date, status: 'upcoming', daysDelta };
}

export function getIdleDays(
  app: JobApplication,
  todayISO: string = getLocalTodayISO()
): number {
  const candidateDates = [
    app.updatedAt,
    app.appliedDate,
    ...app.roundNotes.map((r) => r.date),
  ].filter((d): d is string => Boolean(d && /^\d{4}-\d{2}-\d{2}$/.test(d)));

  if (candidateDates.length === 0) return 0;
  const latestActivity = candidateDates.sort().slice(-1)[0];
  return Math.max(0, diffDaysISO(latestActivity, todayISO));
}

export function isApplicationIdle(
  app: JobApplication,
  todayISO: string = getLocalTodayISO()
): boolean {
  if (app.stage === 'Offer') return false;
  return getIdleDays(app, todayISO) >= IDLE_THRESHOLD_DAYS;
}

export interface UpcomingInterviewItem {
  id: string;
  app: JobApplication;
  roundTitle: string;
  date: string;
  interviewer: string;
  isToday: boolean;
  daysAway: number;
}

export function getUpcomingInterviews(
  applications: JobApplication[],
  todayISO: string = getLocalTodayISO()
): UpcomingInterviewItem[] {
  const items: UpcomingInterviewItem[] = [];

  for (const app of applications) {
    const scheduledRounds = app.roundNotes.filter(
      (rn) => rn.outcome === 'Scheduled' && rn.date && rn.date >= todayISO
    );

    if (scheduledRounds.length > 0) {
      for (const rn of scheduledRounds) {
        const daysAway = diffDaysISO(todayISO, rn.date);
        items.push({
          id: `${app.id}-${rn.id}`,
          app,
          roundTitle: rn.roundTitle,
          date: rn.date,
          interviewer: rn.interviewer || app.hiringContact || 'Hiring Team',
          isToday: daysAway === 0,
          daysAway,
        });
      }
    } else if (app.stage === 'Interview') {
      const followUp = getEffectiveFollowUpDate(app);
      if (followUp && followUp >= todayISO) {
        const daysAway = diffDaysISO(todayISO, followUp);
        items.push({
          id: `${app.id}-followup`,
          app,
          roundTitle: 'Interview Follow-up',
          date: followUp,
          interviewer: app.hiringContact || 'Hiring Team',
          isToday: daysAway === 0,
          daysAway,
        });
      }
    }
  }

  return items.sort((a, b) => a.date.localeCompare(b.date));
}
