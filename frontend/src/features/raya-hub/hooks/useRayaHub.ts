/**
 * useRayaHub — TanStack Query hooks for the Raya hub's intelligence
 * widgets (weekly Quiet Report + Tafakkur seeds). Both are best-effort
 * surfaces: a failure shows a graceful empty state, never blocks the page.
 */

import { useQuery } from '@tanstack/react-query';
import { getQuietReport, getTafakkurSeeds } from '../services/rayaHubService';
import type { QuietReport, TafakkurSeedsResponse } from '../types';

export function useTafakkurSeeds(uid: string | undefined) {
  return useQuery<TafakkurSeedsResponse>({
    queryKey: ['raya', 'tafakkur-seeds', uid],
    queryFn: () => getTafakkurSeeds(uid as string),
    enabled: !!uid,
    staleTime: 60 * 60 * 1000, // an hour — seeds are slow-moving
    retry: 1,
  });
}

export function useQuietReport(uid: string | undefined) {
  return useQuery<QuietReport>({
    queryKey: ['raya', 'quiet-report', uid],
    queryFn: () => getQuietReport(uid as string),
    enabled: !!uid,
    staleTime: 6 * 60 * 60 * 1000, // weekly cadence — cache generously
    retry: 1,
  });
}
