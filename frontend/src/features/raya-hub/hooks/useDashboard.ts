/**
 * useDashboard — TanStack Query hooks for the Raya WhatsApp dashboard tabs.
 *
 * Every read is best-effort: a failure renders an empty state, never blocks
 * the page. Chat-thread messages are fetched lazily (only when a thread is
 * opened) via `useChatMessages(sessionId)`.
 */

import { useQuery } from '@tanstack/react-query';
import {
  getActivity,
  getAnalytics,
  getChatMessages,
  getChats,
  getFeedback,
  getMemories,
  getReminders,
  getWeeklyInsights,
} from '../services/dashboardService';

const FIVE_MIN = 5 * 60 * 1000;

export function useActivity(enabled = true, limit = 50) {
  return useQuery({
    queryKey: ['raya', 'dashboard', 'activity', limit],
    queryFn: () => getActivity(limit),
    enabled,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useAnalytics(enabled = true) {
  return useQuery({
    queryKey: ['raya', 'dashboard', 'analytics'],
    queryFn: () => getAnalytics(),
    enabled,
    staleTime: FIVE_MIN,
    retry: 1,
  });
}

export function useReminders(enabled = true) {
  return useQuery({
    queryKey: ['raya', 'dashboard', 'reminders'],
    queryFn: () => getReminders(),
    enabled,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useChats(enabled = true) {
  return useQuery({
    queryKey: ['raya', 'dashboard', 'chats'],
    queryFn: () => getChats(),
    enabled,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useChatMessages(sessionId: string | null) {
  return useQuery({
    queryKey: ['raya', 'dashboard', 'chat-messages', sessionId],
    queryFn: () => getChatMessages(sessionId as string),
    enabled: !!sessionId,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useMemories(enabled = true) {
  return useQuery({
    queryKey: ['raya', 'dashboard', 'memories'],
    queryFn: () => getMemories(),
    enabled,
    staleTime: FIVE_MIN,
    retry: 1,
  });
}

export function useFeedback(enabled = true) {
  return useQuery({
    queryKey: ['raya', 'dashboard', 'feedback'],
    queryFn: () => getFeedback(),
    enabled,
    staleTime: FIVE_MIN,
    retry: 1,
  });
}

export function useWeeklyInsights(uid: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['raya', 'dashboard', 'weekly-insights', uid],
    queryFn: () => getWeeklyInsights(uid as string),
    enabled: !!uid && enabled,
    staleTime: 6 * 60 * 60 * 1000,
    retry: 1,
  });
}
