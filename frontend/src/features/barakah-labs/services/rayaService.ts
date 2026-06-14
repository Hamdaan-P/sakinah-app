/**
 * Raya intelligence client for Barakah Labs.
 *
 * Two endpoints:
 * - GET /raya/tafakkur-seeds/{user_id} → personalized seed prompts for s11
 * - GET /raya/quiet-report/{user_id}    → Friday letter for s19 (cached)
 *
 * Both gracefully degrade — if the backend is unreachable or returns an
 * empty payload, callers can still render the screens.
 */

import { authGet as get } from '@/lib/api';

export type RayaSeed = { context: string; prompt: string };

export type QuietReport = {
  weekId: string;
  summary: string;
  texture: string;
  thread: string;
  observation: string;
  next_seed_prompt: string;
  total_noticings: number;
  source: 'cache' | 'llm' | 'fallback';
};

export async function fetchTafakkurSeeds(userId: string): Promise<RayaSeed[]> {
  const res = await get<{ seeds: RayaSeed[] }>(`/raya/tafakkur-seeds/${userId}`);
  return res.seeds ?? [];
}

export async function fetchQuietReport(
  userId: string,
  weekId?: string,
  opts?: { force?: boolean },
): Promise<QuietReport> {
  const params = new URLSearchParams();
  if (weekId) params.set('week_id', weekId);
  if (opts?.force) params.set('force', 'true');
  const qs = params.toString();
  return get<QuietReport>(`/raya/quiet-report/${userId}${qs ? `?${qs}` : ''}`);
}

/**
 * In-page Raya chat — used by s07 (Door → Raya) and s14 (Tafakkur → Raya).
 * Posts to the same /chat endpoint the main chatbot uses, so the response
 * quality + tone is identical.
 *
 * `context` is the structured handoff payload the backend prompt builder
 * reads. The canonical key for Barakah Labs door entries is:
 *
 *   { door_handoff: {
 *       door: 'trials' | 'tafakkur' | 'fear' | 'dua' | 'silence' | 'action' | 'tohfa' | 'shukr',
 *       reflection: '<user's written reflection>',
 *       guidance_mode?: 'fear' | 'dua' | 'action',  // door-specific Raya behavior
 *       heart_state?: 'heavy',                      // layers Quran+Hadith+Seerah anchoring
 *   } }
 *
 * Only send `door_handoff` on the FIRST turn after entering Raya from a
 * door surface. Subsequent turns in the same session should omit it — the
 * session_id carries memory and we don't want Raya to repeat the
 * "I see you just finished tafakkur" opener every reply.
 */
export type RayaChatResponse = {
  response: string;
  confidence?: number;
  suggestions?: string[];
};

export type RayaGuidanceMode = 'fear' | 'dua' | 'action';
export type RayaHeartState = 'heavy';

export type RayaDoorHandoff = {
  door: string;
  reflection: string;
  guidance_mode?: RayaGuidanceMode;
  heart_state?: RayaHeartState;
};

export type RayaChatContext = {
  door_handoff?: RayaDoorHandoff;
  [key: string]: unknown;
};

export async function chatWithRaya(
  userId: string,
  sessionId: string,
  message: string,
  userName?: string,
  context?: RayaChatContext,
): Promise<RayaChatResponse> {
  const { authPost } = await import('@/lib/api');
  return authPost<RayaChatResponse>('/chat', {
    user_id: userId,
    session_id: sessionId,
    message,
    user_name: userName,
    context: context && Object.keys(context).length > 0 ? context : undefined,
  });
}

/** Refresh the shared seed for a circle. Owner-only on the server. */
export type CircleSharedSeed = {
  context: string;
  prompt: string;
  weekId: string;
  offeredBy: string;
};

export async function refreshCircleSharedSeed(circleId: string): Promise<CircleSharedSeed> {
  const { authPost } = await import('@/lib/api');
  return authPost<CircleSharedSeed>(`/raya/circle-seed/${circleId}`, {});
}
