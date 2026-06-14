/**
 * PsychologicalProfileSection — money motivation, crisis instinct, stress
 * area, sharing pattern + communication preferences.
 */

import { Brain } from '@phosphor-icons/react';
import {
  ADVICE_LABELS, CONVO_LABELS, CRISIS_LABELS, MOTIVATION_LABELS,
  SHARING_LABELS, STRESS_LABELS,
} from '../_insightsConstants';
import type { EmotionalProfile, KycProfile } from '../_insightsTypes';
import { Section } from './_primitives';

interface PsychologicalProfileSectionProps {
  kyc: KycProfile;
  emotional: EmotionalProfile | null;
}

export function PsychologicalProfileSection({ kyc, emotional }: PsychologicalProfileSectionProps) {
  return (
    <Section title="Psychological Profile" icon={Brain} delay={0.35}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {kyc.money_motivation && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(10,14,22,0.6)' }}>
              <p className="text-[#5C5749] text-[10px] uppercase tracking-wider mb-1">Money Motivation</p>
              <p className="text-[#C9C0A8] text-[13px] font-medium">
                {MOTIVATION_LABELS[kyc.money_motivation] ?? kyc.money_motivation}
              </p>
            </div>
          )}
          {kyc.crisis_instinct && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(10,14,22,0.6)' }}>
              <p className="text-[#5C5749] text-[10px] uppercase tracking-wider mb-1">Under Pressure</p>
              <p className="text-[#C9C0A8] text-[13px] font-medium">
                {CRISIS_LABELS[kyc.crisis_instinct] ?? kyc.crisis_instinct}
              </p>
            </div>
          )}
          {kyc.biggest_stress && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(10,14,22,0.6)' }}>
              <p className="text-[#5C5749] text-[10px] uppercase tracking-wider mb-1">Core Stress Area</p>
              <p className="text-[#C9C0A8] text-[13px] font-medium">
                {STRESS_LABELS[kyc.biggest_stress] ?? kyc.biggest_stress}
              </p>
            </div>
          )}
          {kyc.stress_sharing && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(10,14,22,0.6)' }}>
              <p className="text-[#5C5749] text-[10px] uppercase tracking-wider mb-1">How They Share</p>
              <p className="text-[#C9C0A8] text-[13px] font-medium">
                {SHARING_LABELS[kyc.stress_sharing] ?? kyc.stress_sharing.replace(/_/g, ' ')}
              </p>
            </div>
          )}
        </div>

        {(kyc.advice_style || kyc.conversation_pref) && (
          <div className="pt-3" style={{ borderTop: '1px solid rgba(212,168,83,0.08)' }}>
            <p className="text-[#5C5749] text-[10px] uppercase tracking-wider mb-2">Communication Style</p>
            <div className="space-y-1.5">
              {kyc.advice_style && (
                <p className="text-[#C9C0A8] text-[13px]">
                  Advice preference: <span className="text-[#D4A853]">{ADVICE_LABELS[kyc.advice_style] ?? kyc.advice_style.replace(/_/g, ' ')}</span>
                </p>
              )}
              {kyc.conversation_pref && (
                <p className="text-[#C9C0A8] text-[13px]">
                  Conversation style: <span className="text-[#D4A853]">{CONVO_LABELS[kyc.conversation_pref] ?? kyc.conversation_pref.replace(/_/g, ' ')}</span>
                </p>
              )}
              {emotional?.communicationStyle && (
                <p className="text-[#C9C0A8] text-[13px]">
                  Observed style: <span className="text-[#D4A853] capitalize">{emotional.communicationStyle}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {kyc.raya_help_goal && (
          <div className="pt-3" style={{ borderTop: '1px solid rgba(212,168,83,0.08)' }}>
            <p className="text-[#5C5749] text-[10px] uppercase tracking-wider mb-1.5">What they want from Raya</p>
            <p className="text-[#C9C0A8] text-[13px] italic">"{kyc.raya_help_goal}"</p>
          </div>
        )}
      </div>
    </Section>
  );
}
