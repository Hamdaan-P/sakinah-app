/**
 * Raya WhatsApp dashboard service — wraps the user-facing read endpoints in
 * `app/routes/raya_dashboard.py` (prefix `/raya/dashboard`).
 *
 * All endpoints are uid-scoped to the authed caller on the backend, so none
 * of these take a uid — the Firebase token identifies the user.
 *
 *   GET /raya/dashboard/activity?limit&channel
 *   GET /raya/dashboard/analytics
 *   GET /raya/dashboard/reminders
 *   GET /raya/dashboard/chats
 *   GET /raya/dashboard/chats/{session_id}/messages?limit
 *   GET /raya/dashboard/memories?category&limit
 *   GET /raya/dashboard/feedback?limit
 *
 * Plus the existing weekly insights endpoint (app/routes/profile.py), which
 * IS path-uid scoped (require_user_match).
 */

import { authGet } from '@/lib/api';
import type {
  ActivityResponse,
  AnalyticsResponse,
  ChatMessagesResponse,
  ChatsResponse,
  FeedbackResponse,
  MemoriesResponse,
  RemindersResponse,
  WeeklyInsights,
} from '../types';

export async function getActivity(limit = 50, channel?: string): Promise<ActivityResponse> {
  const q = new URLSearchParams({ limit: String(limit) });
  if (channel) q.set('channel', channel);
  return authGet<ActivityResponse>(`/raya/dashboard/activity?${q.toString()}`);
}

export async function getAnalytics(): Promise<AnalyticsResponse> {
  return authGet<AnalyticsResponse>('/raya/dashboard/analytics');
}

export async function getReminders(): Promise<RemindersResponse> {
  return authGet<RemindersResponse>('/raya/dashboard/reminders');
}

export async function getChats(): Promise<ChatsResponse> {
  return authGet<ChatsResponse>('/raya/dashboard/chats');
}

export async function getChatMessages(sessionId: string, limit = 100): Promise<ChatMessagesResponse> {
  return authGet<ChatMessagesResponse>(
    `/raya/dashboard/chats/${encodeURIComponent(sessionId)}/messages?limit=${limit}`,
  );
}

export async function getMemories(category?: string, limit = 50): Promise<MemoriesResponse> {
  const q = new URLSearchParams({ limit: String(limit) });
  if (category) q.set('category', category);
  return authGet<MemoriesResponse>(`/raya/dashboard/memories?${q.toString()}`);
}

export async function getFeedback(limit = 50): Promise<FeedbackResponse> {
  return authGet<FeedbackResponse>(`/raya/dashboard/feedback?limit=${limit}`);
}

export async function getWeeklyInsights(uid: string): Promise<WeeklyInsights> {
  return authGet<WeeklyInsights>(`/insights/weekly/${encodeURIComponent(uid)}`);
}
