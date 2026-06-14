/**
 * communityReportsService — client-side moderation report queue.
 *
 * Implements PDF Section 9 "Community Content Controls" at the frontend
 * layer: each report is persisted under `quran_circle_reports_v1` in
 * localStorage so the user has a record and the report-button can show
 * "already reported" state. A backend report queue with scholarly review
 * is a follow-up — once that exists this service will mirror the localStorage
 * write with an authPost.
 */

const STORAGE_KEY = 'quran_circle_reports_v1';
const LISTENERS = new Set<() => void>();

export type ReportCategory =
  | 'misinformation'
  | 'unsupervised-interpretation'
  | 'disrespectful'
  | 'sensitive-content'
  | 'other';

export interface CommunityReport {
  id: string;
  contentType: 'circle-note' | 'message';
  /** ID of the reported note / message. */
  contentId: string;
  /** Optional human-readable context for the audit trail. */
  contextLabel?: string;
  category: ReportCategory;
  note: string;
  createdAt: number;
  /** Submitter Firebase uid when known. */
  reporterUid?: string;
  /** Set by a future review pass once the backend pipeline lands. */
  status: 'pending' | 'reviewed' | 'dismissed';
}

function load(): CommunityReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CommunityReport[]) : [];
  } catch {
    return [];
  }
}

function save(list: CommunityReport[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* quota / disabled — ignore */
  }
  LISTENERS.forEach((fn) => fn());
}

function genId(): string {
  return `rep_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function onReportsChange(listener: () => void): () => void {
  LISTENERS.add(listener);
  return () => LISTENERS.delete(listener);
}

export function listReports(): CommunityReport[] {
  return load().sort((a, b) => b.createdAt - a.createdAt);
}

export function hasReported(contentId: string): boolean {
  return load().some((r) => r.contentId === contentId);
}

export function submitReport(input: {
  contentType: CommunityReport['contentType'];
  contentId: string;
  category: ReportCategory;
  note: string;
  contextLabel?: string;
  reporterUid?: string;
}): CommunityReport {
  const report: CommunityReport = {
    id: genId(),
    contentType: input.contentType,
    contentId: input.contentId,
    contextLabel: input.contextLabel,
    category: input.category,
    note: input.note.trim().slice(0, 1000),
    createdAt: Date.now(),
    reporterUid: input.reporterUid,
    status: 'pending',
  };
  const list = load();
  list.unshift(report);
  save(list);
  return report;
}
