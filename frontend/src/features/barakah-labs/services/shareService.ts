/**
 * Share-with-one client — time-limited read-only quiet-report links.
 */

import { authPost } from '@/lib/api';

export type CreateShareResponse = {
  token: string;
  url: string;
  expiresAt: number;
};

export type SharedReportPayload = {
  weekId: string;
  summary: string;
  texture: string;
  thread: string;
  observation: string;
  next_seed_prompt: string;
  total_noticings: number;
  fromName: string;
  createdAt: number;
  expiresAt: number;
};

export async function createQuietReportShare(opts?: {
  weekId?: string;
  sharedWithUid?: string;
  sharedWithName?: string;
  ttlDays?: number;
}): Promise<CreateShareResponse> {
  return authPost<CreateShareResponse>('/share/create', {
    kind: 'quiet-report',
    week_id: opts?.weekId,
    shared_with_uid: opts?.sharedWithUid,
    shared_with_name: opts?.sharedWithName,
    ttl_days: opts?.ttlDays ?? 7,
  });
}

export async function fetchSharedQuietReport(token: string): Promise<SharedReportPayload> {
  // Public endpoint — no auth needed. Using a plain fetch keeps it usable
  // when the recipient isn't logged in.
  const backend =
    import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') ||
    `${window.location.protocol}//${window.location.hostname}:8000`;
  const res = await fetch(`${backend}/share/quiet-report/${encodeURIComponent(token)}`, {
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    let detail: string = text;
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === 'object' && parsed && 'detail' in parsed) {
        detail = String((parsed as { detail: unknown }).detail);
      }
    } catch {
      /* fall through with raw text */
    }
    throw new Error(detail || `HTTP ${res.status}`);
  }
  return (await res.json()) as SharedReportPayload;
}

export async function revokeQuietReportShare(token: string): Promise<void> {
  await authPost<{ status: string }>(`/share/revoke/${encodeURIComponent(token)}`, {});
}
