/**
 * useRayaSummary — auto-loads + caches Raya's natural-language read, exposes
 * `summary`, `isLoading`, and a `regenerate()` callback.
 */

import { useCallback, useEffect, useState } from 'react';
import { generateSummary } from './_summary';
import type { OverviewData } from '../_insightsTypes';
import type { InsightsAnalysis } from './_analysis';

interface UseRayaSummaryArgs {
  userId: string | undefined;
  displayName: string | undefined;
  data: OverviewData | null;
  analysis: InsightsAnalysis;
}

export function useRayaSummary({ userId, displayName, data, analysis }: UseRayaSummaryArgs) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-load on data ready (24h cache short-circuits the network call)
  useEffect(() => {
    if (!data || !analysis || !userId) return;
    if (summary || isLoading) return;
    const hasEnough = !!(data.kyc.full_name && (data.kyc.iman_level != null || data.kyc.crisis_instinct || analysis.topEmotions.length > 0));
    if (!hasEnough) return;

    let cancelled = false;
    setIsLoading(true);
    (async () => {
      try {
        const result = await generateSummary({
          userId,
          displayName: displayName ?? '',
          data,
          analysis,
          force: false,
        });
        if (!cancelled && result) setSummary(result);
      } catch (e) {
        console.error('Failed to generate summary:', e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [data, analysis, userId, displayName, summary, isLoading]);

  const regenerate = useCallback(async () => {
    if (!data || !analysis || !userId) return;
    setIsLoading(true);
    try {
      const result = await generateSummary({
        userId,
        displayName: displayName ?? '',
        data,
        analysis,
        force: true,
      });
      if (result) setSummary(result);
    } catch (e) {
      console.error('Failed to generate summary:', e);
    } finally {
      setIsLoading(false);
    }
  }, [data, analysis, userId, displayName]);

  return { summary, isLoading, regenerate };
}
