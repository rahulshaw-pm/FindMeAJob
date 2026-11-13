import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  JobApplication,
  ResumeVersion,
  RoundNote,
  Stage,
  FilterState,
} from '../types/job';
import { SEED_APPLICATIONS, SEED_RESUMES } from '../data/seedData';
import {
  getEffectiveFollowUpDate,
  getFollowUpInfo,
  getLocalTodayISO,
  isApplicationIdle,
} from '../utils/dateStatus';

const APPLICATIONS_STORAGE_KEY = 'findmeajob_applications_v1';
const RESUMES_STORAGE_KEY = 'findmeajob_resumes_v1';

function readStoredJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function todayISO(): string {
  return getLocalTodayISO();
}

export function formatPayRange(payMin: number, payMax: number): string {
  if (!payMin && !payMax) return 'Comp TBD';
  if (payMin && !payMax) return `$${payMin}k+`;
  if (!payMin && payMax) return `Up to $${payMax}k`;
  if (payMin === payMax) return `$${payMin}k`;
  return `$${payMin}k – $${payMax}k`;
}

export const DEFAULT_FILTERS: FilterState = {
  search: '',
  stage: 'All',
  workMode: 'All',
  resumeVersionId: 'All',
  minPay: 0,
  attention: 'All',
  sortBy: 'updated_desc',
};

export function useJobTracker() {
  const [applications, setApplications] = useState<JobApplication[]>(() =>
    readStoredJSON<JobApplication[]>(APPLICATIONS_STORAGE_KEY, SEED_APPLICATIONS)
  );
  const [resumes, setResumes] = useState<ResumeVersion[]>(() =>
    readStoredJSON<ResumeVersion[]>(RESUMES_STORAGE_KEY, SEED_RESUMES)
  );
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  useEffect(() => {
    try {
      window.localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(applications));
    } catch {
      // Ignore storage quota errors
    }
  }, [applications]);

  useEffect(() => {
    try {
      window.localStorage.setItem(RESUMES_STORAGE_KEY, JSON.stringify(resumes));
    } catch {
      // Ignore storage quota errors
    }
  }, [resumes]);

  const addApplication = useCallback(
    (
      input: Omit<JobApplication, 'id' | 'updatedAt' | 'resumeVersionLabel'> & {
        initialNote?: string;
      }
    ) => {
      const matchedResume = resumes.find((r) => r.id === input.resumeVersionId);
      const today = todayISO();
      const roundNotes: RoundNote[] = input.roundNotes ? [...input.roundNotes] : [];
      if (input.initialNote && input.initialNote.trim()) {
        roundNotes.unshift({
          id: `rn-${Date.now()}`,
          roundTitle: input.stage === 'Saved' ? 'Initial Research' : `${input.stage} Note`,
          date: today,
          interviewer: input.hiringContact || 'Self',
          outcome: input.stage === 'Offer' ? 'Passed' : 'Pending',
          notes: input.initialNote.trim(),
        });
      }

      const newApp: JobApplication = {
        ...input,
        id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        resumeVersionLabel: matchedResume?.label ?? 'Custom Resume',
        updatedAt: today,
        appliedDate:
          input.appliedDate || (input.stage !== 'Saved' ? today : ''),
        roundNotes,
      };
      setApplications((prev) => [newApp, ...prev]);
      return newApp;
    },
    [resumes]
  );

  const updateApplication = useCallback(
    (id: string, updates: Partial<JobApplication>) => {
      setApplications((prev) =>
        prev.map((app) => {
          if (app.id !== id) return app;
          let resumeVersionLabel = app.resumeVersionLabel;
          if (updates.resumeVersionId) {
            const found = resumes.find((r) => r.id === updates.resumeVersionId);
            if (found) resumeVersionLabel = found.label;
          }
          const nextStage = updates.stage ?? app.stage;
          const appliedDate =
            updates.appliedDate !== undefined
              ? updates.appliedDate
              : !app.appliedDate && nextStage !== 'Saved'
              ? todayISO()
              : app.appliedDate;

          return {
            ...app,
            ...updates,
            resumeVersionLabel,
            appliedDate,
            updatedAt: todayISO(),
          };
        })
      );
    },
    [resumes]
  );

  const moveStage = useCallback((id: string, stage: Stage) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app;
        return {
          ...app,
          stage,
          appliedDate: !app.appliedDate && stage !== 'Saved' ? todayISO() : app.appliedDate,
          updatedAt: todayISO(),
        };
      })
    );
  }, []);

  const bulkMoveStage = useCallback((ids: string[], stage: Stage) => {
    const idSet = new Set(ids);
    const today = todayISO();
    setApplications((prev) =>
      prev.map((app) =>
        idSet.has(app.id)
          ? {
              ...app,
              stage,
              appliedDate: !app.appliedDate && stage !== 'Saved' ? today : app.appliedDate,
              updatedAt: today,
            }
          : app
      )
    );
  }, []);

  const bulkDeleteApplications = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setApplications((prev) => prev.filter((app) => !idSet.has(app.id)));
  }, []);

  const deleteApplication = useCallback((id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
  }, []);

  const duplicateApplication = useCallback((id: string) => {
    setApplications((prev) => {
      const target = prev.find((a) => a.id === id);
      if (!target) return prev;
      const copy: JobApplication = {
        ...target,
        id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        role: `${target.role} (Copy)`,
        updatedAt: todayISO(),
        roundNotes: target.roundNotes.map((rn, idx) => ({
          ...rn,
          id: `rn-${Date.now()}-${idx}`,
        })),
      };
      return [copy, ...prev];
    });
  }, []);

  const addRoundNote = useCallback(
    (appId: string, note: Omit<RoundNote, 'id'>) => {
      setApplications((prev) =>
        prev.map((app) => {
          if (app.id !== appId) return app;
          const nextNote: RoundNote = {
            ...note,
            id: `rn-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          };
          return {
            ...app,
            updatedAt: todayISO(),
            roundNotes: [...app.roundNotes, nextNote],
          };
        })
      );
    },
    []
  );

  const updateRoundNote = useCallback(
    (appId: string, noteId: string, updates: Partial<RoundNote>) => {
      setApplications((prev) =>
        prev.map((app) => {
          if (app.id !== appId) return app;
          return {
            ...app,
            updatedAt: todayISO(),
            roundNotes: app.roundNotes.map((rn) =>
              rn.id === noteId ? { ...rn, ...updates } : rn
            ),
          };
        })
      );
    },
    []
  );

  const deleteRoundNote = useCallback((appId: string, noteId: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        return {
          ...app,
          updatedAt: todayISO(),
          roundNotes: app.roundNotes.filter((rn) => rn.id !== noteId),
        };
      })
    );
  }, []);

  // Resume Version CRUD
  const addResume = useCallback(
    (input: Omit<ResumeVersion, 'id' | 'updatedAt'>) => {
      const newRes: ResumeVersion = {
        ...input,
        id: `res-${Date.now()}`,
        updatedAt: todayISO(),
      };
      setResumes((prev) => {
        const cleaned = input.isDefault
          ? prev.map((r) => ({ ...r, isDefault: false }))
          : prev;
        return [newRes, ...cleaned];
      });
      return newRes;
    },
    []
  );

  const updateResume = useCallback(
    (id: string, updates: Partial<ResumeVersion>) => {
      setResumes((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            return { ...r, ...updates, updatedAt: todayISO() };
          }
          if (updates.isDefault) {
            return { ...r, isDefault: false };
          }
          return r;
        })
      );
      if (updates.label) {
        setApplications((prev) =>
          prev.map((app) =>
            app.resumeVersionId === id
              ? { ...app, resumeVersionLabel: updates.label! }
              : app
          )
        );
      }
    },
    []
  );

  const deleteResume = useCallback((id: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const resetDemoData = useCallback(() => {
    setApplications(SEED_APPLICATIONS);
    setResumes(SEED_RESUMES);
    setFilters(DEFAULT_FILTERS);
  }, []);

  const clearAllApplications = useCallback(() => {
    setApplications([]);
  }, []);

  const filteredApplications = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const today = getLocalTodayISO();

    const matched = applications.filter((app) => {
      if (filters.stage !== 'All' && app.stage !== filters.stage) return false;
      if (filters.workMode !== 'All' && app.workMode !== filters.workMode)
        return false;
      if (
        filters.resumeVersionId !== 'All' &&
        app.resumeVersionId !== filters.resumeVersionId
      )
        return false;
      if (filters.minPay > 0 && app.payMax < filters.minPay) return false;

      if (filters.attention !== 'All') {
        const info = getFollowUpInfo(app, today);
        if (filters.attention === 'DueToday' && info.status !== 'due_today') {
          return false;
        }
        if (filters.attention === 'Overdue' && info.status !== 'overdue') {
          return false;
        }
        if (filters.attention === 'Idle' && !isApplicationIdle(app, today)) {
          return false;
        }
      }

      if (query) {
        const haystack = [
          app.company,
          app.role,
          app.location,
          app.workMode,
          app.resumeVersionLabel,
          app.hiringContact,
          app.contactTitle,
          getEffectiveFollowUpDate(app),
          ...app.roundNotes.map((r) => `${r.roundTitle} ${r.interviewer} ${r.notes}`),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });

    return [...matched].sort((a, b) => {
      switch (filters.sortBy) {
        case 'followup_asc': {
          const da = getEffectiveFollowUpDate(a) || '9999-12-31';
          const db = getEffectiveFollowUpDate(b) || '9999-12-31';
          return da.localeCompare(db) || b.updatedAt.localeCompare(a.updatedAt);
        }
        case 'pay_desc':
          return b.payMax - a.payMax || b.payMin - a.payMin;
        case 'pay_asc':
          return a.payMin - b.payMin || a.payMax - b.payMax;
        case 'company_asc':
          return a.company.localeCompare(b.company);
        case 'rounds_desc':
          return b.roundNotes.length - a.roundNotes.length;
        case 'updated_desc':
        default:
          return b.updatedAt.localeCompare(a.updatedAt);
      }
    });
  }, [applications, filters]);

  const exportCSV = useCallback(() => {
    const today = getLocalTodayISO();
    const headers = [
      'Company',
      'Role',
      'Stage',
      'Pay Min ($k)',
      'Pay Max ($k)',
      'Work Mode',
      'Location',
      'Resume Version',
      'Hiring Contact',
      'Follow-up Date',
      'Follow-up Status',
      'Applied Date',
      'Updated Date',
      'Rounds Count',
      'Latest Round Note',
    ];
    const escape = (val: string | number) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const rows = filteredApplications.map((app) => {
      const latest = app.roundNotes[app.roundNotes.length - 1];
      const fInfo = getFollowUpInfo(app, today);
      const statusLabel =
        fInfo.status === 'overdue'
          ? 'Overdue'
          : fInfo.status === 'due_today'
          ? 'Due Today'
          : fInfo.status === 'upcoming'
          ? 'Scheduled'
          : isApplicationIdle(app, today)
          ? 'Idle'
          : '';
      return [
        app.company,
        app.role,
        app.stage,
        app.payMin,
        app.payMax,
        app.workMode,
        app.location,
        app.resumeVersionLabel,
        app.hiringContact,
        fInfo.date,
        statusLabel,
        app.appliedDate,
        app.updatedAt,
        app.roundNotes.length,
        latest ? `${latest.roundTitle}: ${latest.notes}` : '',
      ]
        .map(escape)
        .join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `findmeajob-applications-${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredApplications]);

  return {
    applications,
    filteredApplications,
    resumes,
    filters,
    setFilters,
    resetFilters: () => setFilters(DEFAULT_FILTERS),
    addApplication,
    updateApplication,
    moveStage,
    bulkMoveStage,
    bulkDeleteApplications,
    deleteApplication,
    duplicateApplication,
    addRoundNote,
    updateRoundNote,
    deleteRoundNote,
    addResume,
    updateResume,
    deleteResume,
    resetDemoData,
    clearAllApplications,
    exportCSV,
  };
}
