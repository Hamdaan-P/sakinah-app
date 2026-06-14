/**
 * useInsightsData — loads all Firestore + API data feeding the InsightsReport.
 */

import { useEffect, useState } from 'react';
import {
  loadConversations, loadEmotionalProfile, loadKycProfile, loadMoodLog,
  loadRelationships, loadWeeklyInsights,
} from './_dataLoaders';
import type { OverviewData } from '../_insightsTypes';

export function useInsightsData(userId: string | undefined) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const [kyc, emotional, moodLog, relationships, conversations, weeklyInsights] = await Promise.all([
          loadKycProfile(userId),
          loadEmotionalProfile(userId),
          loadMoodLog(userId),
          loadRelationships(userId),
          loadConversations(userId),
          loadWeeklyInsights(userId),
        ]);
        if (cancelled) return;
        setData({ kyc, emotional, moodLog, relationships, conversations, weeklyInsights });
      } catch (e) {
        console.error('Error loading profile report:', e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  return { data, isLoading };
}
