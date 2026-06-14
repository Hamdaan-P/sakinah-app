/**
 * useOthersBlessingsStream — polls the community + others-blessings endpoints
 * and returns two sorted views:
 *   - `latest`     → newest first (by `created_at`)
 *   - `mostLiked`  → most likes first (client-side sort; no backend change)
 *
 * Returns ONLY real community blessings. When the backend has none, both
 * arrays are empty and the rotator hides itself — no synthetic placeholder
 * text appears (founder's call: example messages can mislead first-time
 * users into thinking the community is more active than it is).
 *
 * **Polling cadence**:
 *   - Healthy backend: every 10 s.
 *   - Visibility-paused when the tab is hidden; resumes on focus.
 *   - **Exponential back-off** when fetches fail. After 2 consecutive failures
 *     (both endpoints unreachable), schedule grows 30 s → 60 s → 2 min → 5 min
 *     cap. A single success resets the schedule to 10 s. Eliminates console
 *     spam when the backend is down — your local dev session won't fire 600
 *     pointless requests in 10 minutes.
 *
 * No new dependencies; uses `setTimeout` for variable scheduling.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '@/core/stores/auth.store';
import {
  getCommunityFeed,
  getOthersBlessings,
} from '../services/barkaLabsService';
import { useCommunityStore } from '../stores/community.store';
import type {
  BlessingDepth,
  PublicBlessing,
} from '../types/barka-labs.types';

export interface StreamItem {
  id: string;
  text: string;
  depth: BlessingDepth | null;
  likes_count: number;
  created_at: string;
}

interface UseOthersBlessingsStreamResult {
  latest: StreamItem[];
  mostLiked: StreamItem[];
  isLoading: boolean;
}

const POLL_INTERVAL_MS = 10_000;
const FETCH_LIMIT = 30;
/** Failure threshold before back-off kicks in. */
const FAILURE_BEFORE_BACKOFF = 2;
/** Back-off schedule (ms) — clamped to the last value once exhausted. */
const BACKOFF_SCHEDULE_MS = [30_000, 60_000, 120_000, 300_000];

/** Merge + dedupe two PublicBlessing arrays by id. */
function mergePublic(a: PublicBlessing[], b: PublicBlessing[]): PublicBlessing[] {
  const seen = new Set<string>();
  const out: PublicBlessing[] = [];
  for (const list of [a, b]) {
    for (const item of list) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      out.push(item);
    }
  }
  return out;
}

function toStreamItem(b: PublicBlessing): StreamItem {
  return {
    id: b.id,
    text: b.text,
    depth: b.depth,
    likes_count: b.likes_count ?? 0,
    created_at: b.created_at,
  };
}

/** A single endpoint call that tracks success/failure separately from the data. */
async function safeFetch<T>(promise: Promise<T>): Promise<{ ok: true; value: T } | { ok: false }> {
  try {
    const value = await promise;
    return { ok: true, value };
  } catch {
    return { ok: false };
  }
}

export function useOthersBlessingsStream(): UseOthersBlessingsStreamResult {
  const userId = useAuthStore((s) => s.user?.id);

  // Seed from the community store on mount — if the feed has already been
  // prefetched (BarkaLabsPage warms it on user-load), the rotator paints with
  // real data immediately instead of flashing a skeleton for the first poll
  // cycle.
  const seed = useCommunityStore.getState().feed;
  const [liveItems, setLiveItems] = useState<PublicBlessing[]>(seed);
  const [isLoading, setIsLoading] = useState(seed.length === 0);

  const userIdRef = useRef<string | undefined>(userId);
  userIdRef.current = userId;
  const inFlightRef = useRef(false);
  const failureCountRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    function nextDelay(): number {
      if (failureCountRef.current < FAILURE_BEFORE_BACKOFF) return POLL_INTERVAL_MS;
      const backoffIdx = Math.min(
        failureCountRef.current - FAILURE_BEFORE_BACKOFF,
        BACKOFF_SCHEDULE_MS.length - 1,
      );
      return BACKOFF_SCHEDULE_MS[backoffIdx];
    }

    function schedule(delayMs: number) {
      if (cancelled) return;
      timeoutId = setTimeout(() => {
        void tick();
      }, delayMs);
    }

    async function tick() {
      if (cancelled) return;
      if (inFlightRef.current) {
        schedule(nextDelay());
        return;
      }
      if (typeof document !== 'undefined' && document.hidden) {
        // Tab is hidden — defer to visibilitychange handler to resume.
        return;
      }

      const uid = userIdRef.current;
      inFlightRef.current = true;

      const feedResult = await safeFetch(
        getCommunityFeed(FETCH_LIMIT).then((r) => r.blessings),
      );
      const othersResult = uid
        ? await safeFetch(getOthersBlessings(uid, FETCH_LIMIT).then((r) => r.blessings))
        : { ok: true as const, value: [] as PublicBlessing[] };

      inFlightRef.current = false;
      if (cancelled) return;

      const allFailed = !feedResult.ok && !othersResult.ok;
      if (allFailed) {
        failureCountRef.current += 1;
      } else {
        failureCountRef.current = 0;
        const feed = feedResult.ok ? feedResult.value : [];
        const others = othersResult.ok ? othersResult.value : [];
        setLiveItems(mergePublic(others, feed));
      }

      setIsLoading(false);
      schedule(nextDelay());
    }

    void tick();

    const onVisible = () => {
      if (cancelled || document.hidden) return;
      // Wake immediately on focus so the user sees a fresh card right away.
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      void tick();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [userId]);

  return useMemo(() => {
    const liveStream = liveItems.map(toStreamItem);
    const latest = [...liveStream].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const mostLiked = [...liveStream].sort((a, b) => b.likes_count - a.likes_count);
    return { latest, mostLiked, isLoading };
  }, [liveItems, isLoading]);
}
