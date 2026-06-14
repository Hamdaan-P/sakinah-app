/**
 * InsightsReport — Premium personal assessment component.
 *
 * Orchestrates data loading, analysis aggregation, Raya summary fetching, and
 * composes per-section components from `./insights/`.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gauge, Quotes, ShareNetwork, Sparkle } from '@phosphor-icons/react';
import { useAuthStore } from '@/core/stores/auth.store';
import { useInsightsData } from './insights/_useInsightsData';
import { useInsightsAnalysis } from './insights/_analysis';
import { useRayaSummary } from './insights/_useRayaSummary';
import { Section } from './insights/_primitives';
import { RadarChart } from './insights/RadarChart';
import { RayaSummarySection } from './insights/RayaSummarySection';
import { PersonalityTypeSection } from './insights/PersonalityTypeSection';
import { PsychologicalProfileSection } from './insights/PsychologicalProfileSection';
import { EmotionalLandscapeSection } from './insights/EmotionalLandscapeSection';
import { CognitivePatternsSection } from './insights/CognitivePatternsSection';
import { InnerWorldSection } from './insights/InnerWorldSection';
import { RelationshipMapSection } from './insights/RelationshipMapSection';
import { WeeklyReadSection } from './insights/WeeklyReadSection';
import { ShareCardModal } from './insights/ShareCardModal';

export function InsightsReport() {
  const { user } = useAuthStore();
  const [showShareCard, setShowShareCard] = useState(false);

  const { data, isLoading } = useInsightsData(user?.id);
  const analysis = useInsightsAnalysis(data);
  const { summary, isLoading: summaryLoading, regenerate } = useRayaSummary({
    userId: user?.id,
    displayName: user?.displayName,
    data,
    analysis,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
            <Sparkle size={24} className="text-[#D4A853]" />
          </motion.div>
          <p className="text-[#7A7363] text-xs">Loading your insights...</p>
        </div>
      </div>
    );
  }

  if (!data || !analysis) return null;

  const { kyc, emotional, moodLog } = data;
  const hasDeepReflections = kyc.deep_repeating_pattern || kyc.deep_night_thoughts || kyc.deep_trying_to_change || kyc.deep_feared_self || kyc.deep_real_self || kyc.deep_five_year_test || kyc.deep_whose_life || kyc.deep_younger_self;
  const hasPsychology = kyc.crisis_instinct || kyc.money_motivation || kyc.biggest_stress;
  const hasEmotional = analysis.topEmotions.length > 0 || emotional?.recurringThemes?.length;
  const hasEnoughForLetter = !!(kyc.full_name && (kyc.iman_level != null || kyc.crisis_instinct || analysis.topEmotions.length > 0));
  const hasRadarData = analysis.radarScores.some((s) => s.value > 0);

  return (
    <div className="space-y-0">
      {/* Share button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end mb-4">
        <button
          onClick={() => setShowShareCard(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all hover:scale-[1.02]"
          style={{
            background: 'rgba(212,168,83,0.08)',
            border: '1px solid rgba(212,168,83,0.2)',
            color: '#D4A853',
          }}
        >
          <ShareNetwork size={14} />
          Share Profile Card
        </button>
      </motion.div>

      <RayaSummarySection
        summary={summary}
        isLoading={summaryLoading}
        onRegenerate={regenerate}
        hasEnoughData={hasEnoughForLetter}
      />

      {hasRadarData && (
        <Section title="Your Profile at a Glance" icon={Gauge} delay={0.12}>
          <RadarChart scores={analysis.radarScores} />
          <p className="text-[#5C5749] text-[11px] text-center mt-3">
            Scored from your KYC, conversations, reflections, and emotional data.
          </p>
        </Section>
      )}

      {kyc.deep_deen_struggle && (
        <Section title="Deen Struggle" icon={Quotes} delay={0.18}>
          <p className="text-[#C9C0A8] text-[13px] leading-relaxed italic">"{kyc.deep_deen_struggle}"</p>
        </Section>
      )}

      <PersonalityTypeSection kyc={kyc} />

      {hasPsychology && <PsychologicalProfileSection kyc={kyc} emotional={emotional} />}

      {hasEmotional && (
        <EmotionalLandscapeSection
          topEmotions={analysis.topEmotions}
          moodTrend={analysis.moodTrend}
          moodLog={moodLog}
          emotional={emotional}
        />
      )}

      {analysis.significantPatterns.length > 0 && (
        <CognitivePatternsSection significantPatterns={analysis.significantPatterns} />
      )}

      {hasDeepReflections && <InnerWorldSection kyc={kyc} />}

      {analysis.relationshipList.length > 0 && (
        <RelationshipMapSection relationshipList={analysis.relationshipList} />
      )}

      {data.weeklyInsights?.summary && <WeeklyReadSection weeklyInsights={data.weeklyInsights} />}

      <AnimatePresence>
        {showShareCard && (
          <ShareCardModal
            onClose={() => setShowShareCard(false)}
            name={kyc.full_name ?? user?.displayName ?? 'User'}
            archetype={kyc.pascoArchetype}
            imanLevel={kyc.iman_level}
            topEmotions={analysis.topEmotions.map((e) => e.emotion)}
            moodTrend={analysis.moodTrend}
            totalConversations={analysis.totalConversations}
            completeness={analysis.completeness}
            quote={kyc.deep_real_self ?? kyc.raya_help_goal ?? undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
