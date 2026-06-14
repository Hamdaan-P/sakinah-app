/**
 * WeeklyReadSection — Raya's latest weekly assessment summary + bullet
 * insights.
 */

import { Star } from '@phosphor-icons/react';
import type { WeeklyInsights } from '../_insightsTypes';
import { Section } from './_primitives';

export function WeeklyReadSection({ weeklyInsights }: { weeklyInsights: WeeklyInsights }) {
  return (
    <Section title="Raya's Latest Assessment" icon={Star} delay={0.65} accent>
      <div className="space-y-4">
        <p className="text-[#C9C0A8] text-[14px] leading-[1.75] italic">
          "{weeklyInsights.summary}"
        </p>

        {weeklyInsights.insights?.length > 0 && (
          <div className="pt-3 space-y-3" style={{ borderTop: '1px solid rgba(212,168,83,0.1)' }}>
            {weeklyInsights.insights.slice(0, 5).map((insight, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4A853] mt-2 flex-shrink-0" />
                <div>
                  <p className="text-[#F5E8C7] text-[13px] font-medium">{insight.title}</p>
                  <p className="text-[#7A7363] text-[12px]">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
