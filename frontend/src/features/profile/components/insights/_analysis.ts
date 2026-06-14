/**
 * useInsightsAnalysis — derives the radar scores, top emotions, completeness
 * percentage, and other aggregates from the loaded insights data.
 */

import { useMemo } from 'react';
import { clamp, getAge, getMoodTrend, getTopEmotions, isHistoricalFigure } from '../_insightsHelpers';
import type { OverviewData, RadarScore } from '../_insightsTypes';

export function useInsightsAnalysis(data: OverviewData | null) {
  return useMemo(() => {
    if (!data) return null;
    const { kyc, emotional, moodLog, relationships, conversations } = data;

    const totalMessages = conversations.reduce((s, c) => s + c.messageCount, 0);
    const topEmotions = emotional?.dominantEmotions?.length ? getTopEmotions(emotional.dominantEmotions) : [];
    const moodTrend = getMoodTrend(moodLog);
    const age = getAge(kyc.date_of_birth ?? '');

    const cognitivePatterns = emotional?.cognitivePatterns ?? {};
    const significantPatterns = Object.entries(cognitivePatterns)
      .filter(([, d]) => d.count >= 2)
      .sort((a, b) => b[1].count - a[1].count);

    const relationshipList = Object.entries(relationships)
      .filter(([name, d]) => (d.mention_count ?? 0) >= 2 && !isHistoricalFigure(name))
      .sort((a, b) => (b[1].mention_count ?? 0) - (a[1].mention_count ?? 0));

    const interests = kyc.islamic_interests ?? kyc.islamicInterests ?? [];
    const hobbies = kyc.hobbies ?? [];

    // Count how many data dimensions are populated
    const dimensions = [
      !!kyc.full_name,
      kyc.iman_level != null,
      !!kyc.pascoArchetype,
      !!kyc.crisis_instinct,
      topEmotions.length > 0,
      moodLog.length >= 5,
      totalMessages > 10,
      relationshipList.length > 0,
    ];
    const completeness = Math.round((dimensions.filter(Boolean).length / dimensions.length) * 100);

    // ---- Radar chart scores ----
    // Every dimension has a motivating baseline (30 = "you're here, that's a start").
    // Bonuses layer on based on actual data. No one ever sees a zero.
    const BASELINE = 30;

    const spiritualityScore = kyc.iman_level != null
      ? Math.max(BASELINE, kyc.iman_level)
      : BASELINE
        + (kyc.school_of_thought ? 10 : 0)
        + ((kyc.islamic_interests?.length ?? kyc.islamicInterests?.length ?? 0) > 0 ? 10 : 0)
        + (kyc.deep_deen_struggle ? 10 : 0)
        + (kyc.islamicKnowledgeLevel ? 10 : 0);

    const engagementScore = BASELINE + Math.min(70, totalMessages * 0.6);

    const awarenessBonus =
      (kyc.deep_repeating_pattern ? 15 : 0) +
      (kyc.deep_feared_self ? 15 : 0) +
      (kyc.deep_real_self ? 15 : 0) +
      (kyc.deep_trying_to_change ? 15 : 0) +
      (kyc.deep_night_thoughts ? 10 : 0);
    const awarenessScore = BASELINE + awarenessBonus;

    const emotionBonus =
      (topEmotions.length > 0 ? 20 : 0) +
      ((emotional?.recurringThemes?.length ?? 0) > 0 ? 15 : 0) +
      ((emotional?.copingPatterns?.length ?? 0) > 0 ? 15 : 0) +
      (moodLog.length >= 10 ? 20 : moodLog.length >= 5 ? 10 : moodLog.length > 0 ? 5 : 0);
    const emotionScore = BASELINE + emotionBonus;

    const peopleScore = BASELINE + Math.min(70, relationshipList.length * 15);

    const growthBonus =
      (moodTrend === 'improving' ? 25 : moodTrend === 'stable' ? 15 : moodTrend === 'declining' ? 5 : 10) +
      ((emotional?.growthAreas?.length ?? 0) > 0 ? 20 : 0) +
      (significantPatterns.length > 0 ? 20 : 0) + // awareness of patterns = growth
      (kyc.deep_trying_to_change ? 15 : 0);
    const growthScore = BASELINE + growthBonus;

    const radarScores: RadarScore[] = [
      { axis: 'Spirituality', value: Math.round(clamp(spiritualityScore)), color: '#2A9D6F' },
      { axis: 'Engagement', value: Math.round(clamp(engagementScore)), color: '#D4A853' },
      { axis: 'Self-Awareness', value: Math.round(clamp(awarenessScore)), color: '#A78BFA' },
      { axis: 'Emotional Depth', value: Math.round(clamp(emotionScore)), color: '#EC4899' },
      { axis: 'Relationships', value: Math.round(clamp(peopleScore)), color: '#3B82F6' },
      { axis: 'Growth', value: Math.round(clamp(growthScore)), color: '#F59E0B' },
    ];

    return {
      totalMessages,
      totalConversations: conversations.length,
      topEmotions,
      moodTrend,
      age,
      significantPatterns,
      relationshipList,
      completeness,
      interests,
      hobbies,
      radarScores,
    };
  }, [data]);
}

export type InsightsAnalysis = ReturnType<typeof useInsightsAnalysis>;
