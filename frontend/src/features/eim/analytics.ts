/**
 * EIM analytics — minimal, fire-and-forget event helper (P10).
 *
 * Per master plan §10 P10: capture which parts of EIM users actually engage
 * with so we can prioritise polish for the public launch. Deliberately tiny:
 * - No SDK, no external service, no event properties stored server-side.
 * - One typed event name per call site; backend increments a (event, UTC-day)
 *   counter only.
 * - No user id is sent to the analytics endpoint; auth happens at the request
 *   level (so anonymous spam can't pollute counters) but is not persisted
 *   alongside the event.
 * - Fire-and-forget. Failures are logged at debug level and never throw.
 *
 * The event vocabulary must stay in sync with `_EVENTS` in
 * `backend/langchain_backend/app/eim_analytics.py`. Adding a new event
 * requires both files to be updated.
 */

import { authPost } from '@/lib/api';

export type EimAnalyticsEvent =
  | 'eim_home_opened'
  | 'eim_lesson_started'
  | 'eim_lesson_completed'
  | 'eim_level_completed'
  | 'eim_playbook_opened'
  | 'eim_candlesticks_opened'
  | 'eim_candlestick_pattern_opened'
  | 'eim_mentor_analysis_run'
  | 'eim_mentor_followup_asked'
  | 'eim_compare_run'
  | 'eim_simulator_position_added'
  | 'eim_scholar_faq_searched'
  | 'eim_streak_milestone_reached'
  | 'eim_ulama_screening_viewed'
  | 'eim_investability_viewed';

const ENDPOINT = '/api/eim/analytics';
const IS_DEV = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

/**
 * Send one EIM-usage event. Never throws — analytics is best-effort.
 * Safe to call from `useEffect`, event handlers, and unmount callbacks.
 *
 * In dev, also logs to `console.debug` so devs can see firing locally
 * without setting up the backend.
 */
export function eimTrack(event: EimAnalyticsEvent): void {
  if (IS_DEV) {
     
    console.debug('[EIM analytics]', event);
  }
  // Wrap in a microtask so a failed network call cannot block the caller.
  void Promise.resolve().then(async () => {
    try {
      await authPost(ENDPOINT, { event }, /* timeoutMs */ 5000);
    } catch (e) {
      // Best-effort — analytics must never affect the user flow.
      if (IS_DEV) {
         
        console.debug('[EIM analytics] send failed:', event, e);
      }
    }
  });
}
