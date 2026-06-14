/**
 * CognitivePatternsSection — detected thinking patterns + detection counts.
 */

import { Lightning, TreeStructure } from '@phosphor-icons/react';
import { COGNITIVE_PATTERN_LABELS } from '../_insightsConstants';
import { Section } from './_primitives';

interface CognitivePatternsSectionProps {
  significantPatterns: Array<[string, { count: number }]>;
}

export function CognitivePatternsSection({ significantPatterns }: CognitivePatternsSectionProps) {
  return (
    <Section title="Cognitive Patterns" icon={TreeStructure} delay={0.45}>
      <div className="space-y-4">
        <p className="text-[#7A7363] text-[12px] leading-relaxed">
          These thinking patterns have been detected across multiple conversations. Raya gently challenges them when they appear.
        </p>
        {significantPatterns.map(([pattern, patternData]) => {
          const info = COGNITIVE_PATTERN_LABELS[pattern];
          return (
            <div key={pattern} className="rounded-xl p-3" style={{ background: 'rgba(10,14,22,0.6)' }}>
              <div className="flex items-start gap-2.5">
                <Lightning size={14} weight="fill" className="text-[#D4A853] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[#F5E8C7] text-[13px] font-medium">{info?.label ?? pattern}</p>
                  <p className="text-[#7A7363] text-[12px] mt-0.5">{info?.desc ?? ''}</p>
                  <p className="text-[#5C5749] text-[11px] mt-1">Detected {patternData.count} times</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
