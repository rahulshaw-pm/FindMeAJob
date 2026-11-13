export type Stage = 'Saved' | 'Applied' | 'Interview' | 'Offer';

export const STAGES: Stage[] = ['Saved', 'Applied', 'Interview', 'Offer'];

export type WorkMode = 'Remote' | 'Hybrid' | 'Onsite';

export type RoundOutcome = 'Scheduled' | 'Pending' | 'Passed' | 'Follow-up';

export type AppScreen = 'pipeline' | 'applications' | 'resumes' | 'insights';

export interface RoundNote {
  id: string;
  roundTitle: string;
  date: string; // YYYY-MM-DD
  interviewer: string;
  outcome: RoundOutcome;
  notes: string;
}

export interface ResumeVersion {
  id: string;
  label: string; // e.g., "v4.2 Staff Frontend"
  targetRole: string;
  updatedAt: string; // YYYY-MM-DD
  highlights: string;
  fileRef: string; // e.g., "Rahul_Shaw_Staff_FE_v4.2.pdf"
  isDefault?: boolean;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  stage: Stage;
  payMin: number; // Annual USD in thousands, e.g., 185 = $185k
  payMax: number; // Annual USD in thousands, e.g., 220 = $220k
  equityNote?: string;
  location: string;
  workMode: WorkMode;
  resumeVersionId: string;
  resumeVersionLabel: string; // Denormalized fallback so custom labels always display cleanly
  hiringContact: string;
  contactTitle: string;
  jobUrl: string;
  appliedDate: string; // YYYY-MM-DD
  updatedAt: string; // YYYY-MM-DD
  followUpDate?: string; // YYYY-MM-DD
  nextStepDate?: string; // YYYY-MM-DD legacy alias
  priority: 'High' | 'Normal';
  roundNotes: RoundNote[];
}

export type SortOption =
  | 'updated_desc'
  | 'followup_asc'
  | 'pay_desc'
  | 'pay_asc'
  | 'company_asc'
  | 'rounds_desc';

export type AttentionFilter = 'All' | 'DueToday' | 'Overdue' | 'Idle';

export interface FilterState {
  search: string;
  stage: Stage | 'All';
  workMode: WorkMode | 'All';
  resumeVersionId: string; // 'All' or specific id
  minPay: number; // 0 for all, or 140, 170, 200, 230
  attention: AttentionFilter;
  sortBy: SortOption;
}
