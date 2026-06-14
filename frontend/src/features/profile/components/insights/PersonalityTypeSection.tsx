/**
 * PersonalityTypeSection — PASCO archetype label, description, and core traits.
 */

import { Compass } from '@phosphor-icons/react';
import { PASCO_INFO } from '../_insightsConstants';
import type { KycProfile } from '../_insightsTypes';
import { Section, TagPill } from './_primitives';

export function PersonalityTypeSection({ kyc }: { kyc: KycProfile }) {
  if (!kyc.pascoArchetype || !PASCO_INFO[kyc.pascoArchetype]) return null;
  const info = PASCO_INFO[kyc.pascoArchetype];

  return (
    <Section title="Personality Type" icon={Compass} delay={0.3}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-[18px] font-bold"
            style={{
              background: `${info.color}18`,
              border: `1px solid ${info.color}30`,
              color: info.color,
            }}
          >
            {info.label.charAt(0)}
          </div>
          <div>
            <p className="text-[#F5E8C7] text-[15px] font-semibold">{info.label}</p>
            <p className="text-[#7A7363] text-[12px] leading-relaxed">{info.desc}</p>
          </div>
        </div>

        {kyc.pascoTraits?.length ? (
          <div>
            <p className="text-[#5C5749] text-[10px] uppercase tracking-wider mb-2">Core Traits</p>
            <div className="flex flex-wrap gap-1.5">
              {kyc.pascoTraits.map((t) => (
                <TagPill key={t} text={t} color={info.color ?? '#D4A853'} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Section>
  );
}
