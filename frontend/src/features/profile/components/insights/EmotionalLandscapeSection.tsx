/**
 * EmotionalLandscapeSection — dominant emotions, mood trend, recurring
 * themes / triggers / coping / growth tag clusters.
 */

import { Heart, TrendUp } from '@phosphor-icons/react';
import type { EmotionalProfile, MoodEntry } from '../_insightsTypes';
import { Section, EmotionBar, TagPill } from './_primitives';

interface EmotionalLandscapeSectionProps {
  topEmotions: { emotion: string; pct: number }[];
  moodTrend: string;
  moodLog: MoodEntry[];
  emotional: EmotionalProfile | null;
}

export function EmotionalLandscapeSection({
  topEmotions, moodTrend, moodLog, emotional,
}: EmotionalLandscapeSectionProps) {
  return (
    <Section title="Emotional Landscape" icon={Heart} delay={0.4}>
      <div className="space-y-5">
        {topEmotions.length > 0 && (
          <div>
            <p className="text-[#5C5749] text-[10px] uppercase tracking-wider mb-3">Dominant Emotions</p>
            <div className="space-y-2.5">
              {topEmotions.map((e, i) => (
                <EmotionBar key={e.emotion} emotion={e.emotion} pct={e.pct} rank={i} />
              ))}
            </div>
          </div>
        )}

        {moodLog.length > 0 && (
          <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'rgba(10,14,22,0.6)' }}>
            {moodTrend === 'improving' && <TrendUp size={18} className="text-green-400" />}
            {moodTrend === 'declining' && <TrendUp size={18} className="text-red-400 rotate-180" />}
            {moodTrend === 'stable' && <TrendUp size={18} className="text-[#D4A853]" />}
            {moodTrend === 'unknown' && <TrendUp size={18} className="text-[#5C5749]" />}
            <div>
              <p className="text-[#C9C0A8] text-[13px] font-medium">
                {moodTrend === 'improving' && 'Emotional trend is improving'}
                {moodTrend === 'declining' && 'Emotional trend has been declining'}
                {moodTrend === 'stable' && 'Emotional state is stable'}
                {moodTrend === 'unknown' && 'Not enough data for trend analysis'}
              </p>
              <p className="text-[#5C5749] text-[11px]">Based on {moodLog.length} mood entries</p>
            </div>
          </div>
        )}

        {emotional?.recurringThemes?.length ? (
          <div>
            <p className="text-[#5C5749] text-[10px] uppercase tracking-wider mb-2">Recurring Themes</p>
            <div className="flex flex-wrap gap-1.5">
              {emotional.recurringThemes.slice(0, 8).map((t) => <TagPill key={t} text={t} color="#E8C97A" />)}
            </div>
          </div>
        ) : null}

        {emotional?.triggers?.length ? (
          <div>
            <p className="text-[#5C5749] text-[10px] uppercase tracking-wider mb-2">Emotional Triggers</p>
            <div className="flex flex-wrap gap-1.5">
              {emotional.triggers.slice(0, 6).map((t) => <TagPill key={t} text={t} color="#ef4444" />)}
            </div>
          </div>
        ) : null}

        {emotional?.copingPatterns?.length ? (
          <div>
            <p className="text-[#5C5749] text-[10px] uppercase tracking-wider mb-2">Coping Patterns</p>
            <div className="flex flex-wrap gap-1.5">
              {emotional.copingPatterns.slice(0, 6).map((t) => <TagPill key={t} text={t} color="#60a5fa" />)}
            </div>
          </div>
        ) : null}

        {emotional?.growthAreas?.length ? (
          <div>
            <p className="text-[#5C5749] text-[10px] uppercase tracking-wider mb-2">Growth Areas</p>
            <div className="flex flex-wrap gap-1.5">
              {emotional.growthAreas.slice(0, 6).map((t) => <TagPill key={t} text={t} color="#2A9D6F" />)}
            </div>
          </div>
        ) : null}
      </div>
    </Section>
  );
}
