/**
 * InnerWorldSection — verbatim deep-reflection answers from onboarding.
 */

import { Quotes } from '@phosphor-icons/react';
import type { KycProfile } from '../_insightsTypes';
import { Section, QuoteBlock } from './_primitives';

export function InnerWorldSection({ kyc }: { kyc: KycProfile }) {
  return (
    <Section title="Inner World" icon={Quotes} delay={0.5}>
      <div className="space-y-4">
        <p className="text-[#7A7363] text-[12px] leading-relaxed mb-1">
          Responses from deep self-reflection during onboarding — in their own words.
        </p>
        {kyc.deep_repeating_pattern && <QuoteBlock label="A pattern they keep repeating" text={kyc.deep_repeating_pattern} />}
        {kyc.deep_night_thoughts && <QuoteBlock label="What keeps them up at night" text={kyc.deep_night_thoughts} />}
        {kyc.deep_trying_to_change && <QuoteBlock label="What they're trying to change" text={kyc.deep_trying_to_change} />}
        {kyc.deep_feared_self && <QuoteBlock label="What they fear becoming" text={kyc.deep_feared_self} />}
        {kyc.deep_real_self && <QuoteBlock label="Who they really are" text={kyc.deep_real_self} />}
        {kyc.deep_five_year_test && <QuoteBlock label="5-year life test" text={kyc.deep_five_year_test} />}
        {kyc.deep_whose_life && <QuoteBlock label="Whose life they're living" text={kyc.deep_whose_life} />}
        {kyc.deep_younger_self && <QuoteBlock label="What they'd tell their younger self" text={kyc.deep_younger_self} />}
      </div>
    </Section>
  );
}
