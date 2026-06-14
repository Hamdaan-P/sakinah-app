/**
 * generateSummary — fetches Raya's natural-language read on the user and
 * caches it for 24 hours per user.
 */

import { authPost } from '@/lib/api';
import {
  ADVICE_LABELS,
  COGNITIVE_PATTERN_LABELS,
  CONVO_LABELS,
  CRISIS_LABELS,
  MOTIVATION_LABELS,
  STRESS_LABELS,
} from '../_insightsConstants';
import type { OverviewData } from '../_insightsTypes';
import type { InsightsAnalysis } from './_analysis';

interface GenerateSummaryArgs {
  userId: string;
  displayName: string;
  data: OverviewData;
  analysis: NonNullable<InsightsAnalysis>;
  force?: boolean;
}

export async function generateSummary({
  userId, displayName, data, analysis, force = false,
}: GenerateSummaryArgs): Promise<string | null> {
  const cacheKey = 'zaryah:raya_summary';
  if (!force) {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const cached = JSON.parse(raw) as { value: string; userId: string; ts: number };
        if (cached.userId === userId && Date.now() - cached.ts < 24 * 60 * 60 * 1000) {
          return cached.value;
        }
      }
    } catch { /* best-effort */ }
  }

  const { kyc, emotional } = data;
  const result = await authPost<{ summary: string }>(`/profile/summary/${userId}`, {
    name: kyc.full_name ?? displayName ?? '',
    age: analysis.age,
    occupation: kyc.occupation ?? '',
    location: [kyc.city, kyc.country].filter(Boolean).join(', '),
    life_stage: kyc.life_stage ?? '',
    iman_level: kyc.iman_level,
    school_of_thought: kyc.school_of_thought ?? '',
    pasco_archetype: kyc.pascoArchetype ?? '',
    pasco_traits: kyc.pascoTraits ?? [],
    money_motivation: MOTIVATION_LABELS[kyc.money_motivation ?? ''] ?? kyc.money_motivation ?? '',
    crisis_instinct: CRISIS_LABELS[kyc.crisis_instinct ?? ''] ?? kyc.crisis_instinct ?? '',
    biggest_stress: STRESS_LABELS[kyc.biggest_stress ?? ''] ?? kyc.biggest_stress ?? '',
    advice_style: ADVICE_LABELS[kyc.advice_style ?? ''] ?? kyc.advice_style ?? '',
    conversation_pref: CONVO_LABELS[kyc.conversation_pref ?? ''] ?? kyc.conversation_pref ?? '',
    raya_help_goal: kyc.raya_help_goal ?? '',
    top_emotions: analysis.topEmotions.map((e) => e.emotion),
    mood_trend: analysis.moodTrend,
    recurring_themes: emotional?.recurringThemes ?? [],
    triggers: emotional?.triggers ?? [],
    coping_patterns: emotional?.copingPatterns ?? [],
    growth_areas: emotional?.growthAreas ?? [],
    cognitive_patterns: analysis.significantPatterns.map(([p]) => COGNITIVE_PATTERN_LABELS[p]?.label ?? p),
    relationships: analysis.relationshipList.map(([name, rel]) => `${name} (${rel.relationship_type ?? 'unknown'}, ${rel.valence ?? 'neutral'})`),
    deep_reflections: {
      repeating_pattern: kyc.deep_repeating_pattern ?? '',
      night_thoughts: kyc.deep_night_thoughts ?? '',
      trying_to_change: kyc.deep_trying_to_change ?? '',
      feared_self: kyc.deep_feared_self ?? '',
      real_self: kyc.deep_real_self ?? '',
      five_year_test: kyc.deep_five_year_test ?? '',
      whose_life: kyc.deep_whose_life ?? '',
      younger_self: kyc.deep_younger_self ?? '',
    },
    total_conversations: analysis.totalConversations,
    total_messages: analysis.totalMessages,
    weekly_summary: data.weeklyInsights?.summary ?? '',
  }, 30000);

  if (result.summary) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ value: result.summary, userId, ts: Date.now() }));
    } catch { /* best-effort */ }
    return result.summary;
  }
  return null;
}
