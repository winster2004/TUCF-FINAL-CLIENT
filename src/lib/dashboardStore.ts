import type { ATSAnalysis } from './api';
import { safeParseJSON } from './safeJson';

export interface DashboardTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

export interface CalendarTask {
  id: string;
  time: string;
  period: 'AM' | 'PM';
  task: string;
  dateLabel: string;
  accentClass: 'cyan' | 'orange' | 'purple';
}

export interface StoredResumeFile {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
}

export interface ATSMetrics {
  score: number;
  resumeStrength: number;
  keywordMatch: number;
  analyzedAt: string;
  resumeFileName: string;
}

export interface UserDashboardData {
  tasks: DashboardTask[];
  calendarTasks: CalendarTask[];
  resume: StoredResumeFile | null;
  atsMetrics: ATSMetrics | null;
  atsAnalysis: ATSAnalysis | null;
}

export interface DashboardUser {
  id: string;
  email: string;
}

const STORAGE_PREFIX = 'careerpro-dashboard';

const defaultData = (): UserDashboardData => ({
  tasks: [],
  calendarTasks: [
    { id: 'cal-1', time: '10:00', period: 'AM', task: 'Resume review', dateLabel: 'Today', accentClass: 'cyan' },
    { id: 'cal-2', time: '01:20', period: 'PM', task: 'Portfolio update', dateLabel: 'Today', accentClass: 'orange' },
    { id: 'cal-3', time: '09:30', period: 'AM', task: 'Keyword targeting', dateLabel: 'Tomorrow', accentClass: 'purple' },
    { id: 'cal-4', time: '04:00', period: 'PM', task: 'Mock session', dateLabel: 'Tomorrow', accentClass: 'orange' },
  ],
  resume: null,
  atsMetrics: null,
  atsAnalysis: null,
});

const getStorageKey = (user: DashboardUser) =>
  `${STORAGE_PREFIX}:${user.id}:${user.email.toLowerCase()}`;

export const readDashboardData = (user: DashboardUser): UserDashboardData => {
  const raw = localStorage.getItem(getStorageKey(user));
  if (!raw) {
    return defaultData();
  }

  const parsed = safeParseJSON<Partial<UserDashboardData>>(raw, 'dashboard.store');
  if (!parsed || typeof parsed !== 'object') {
    return defaultData();
  }

  return {
    tasks: parsed.tasks ?? [],
    calendarTasks: parsed.calendarTasks ?? defaultData().calendarTasks,
    resume: parsed.resume ?? null,
    atsMetrics: parsed.atsMetrics ?? null,
    atsAnalysis: parsed.atsAnalysis ?? null,
  };
};

export const writeDashboardData = (user: DashboardUser, data: UserDashboardData) => {
  localStorage.setItem(getStorageKey(user), JSON.stringify(data));
  window.dispatchEvent(new Event('dashboard-data-changed'));
};

export const updateDashboardData = (
  user: DashboardUser,
  updater: (current: UserDashboardData) => UserDashboardData,
) => {
  const next = updater(readDashboardData(user));
  writeDashboardData(user, next);
  return next;
};

export const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Could not read file.'));
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });

export const downloadStoredResume = (resume: StoredResumeFile) => {
  const anchor = document.createElement('a');
  anchor.href = resume.dataUrl;
  anchor.download = resume.name;
  anchor.click();
};

export const createTaskId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const buildATSMetrics = (analysis: ATSAnalysis, resumeFileName: string): ATSMetrics => {
  const requiredKeywords = analysis.totals.requiredKeywords || 1;
  const keywordMatch = Math.round((analysis.totals.matchedKeywords / requiredKeywords) * 100);
  const resumeStrength = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (analysis.score + analysis.experienceAnalysis.score + analysis.semanticSimilarity.score) / 3,
      ),
    ),
  );

  return {
    score: analysis.score,
    resumeStrength,
    keywordMatch,
    analyzedAt: new Date().toISOString(),
    resumeFileName,
  };
};
