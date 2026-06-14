/**
 * Persistent disclaimer banner — present on every EIM page.
 * The non-advice notice is the §9 boundary the product must always honour.
 *
 * `context="mentor"` is used on the AI-Mentor analysis surfaces. It adds two
 * disclosures that doc 03 (AI mentor legal research) requires wherever the
 * mentor presents AI-generated analysis that draws on real investors'
 * documented philosophies:
 *   - AI-use disclosure (a SEBI finfluencer-rule requirement), and
 *   - a "not affiliated with / endorsed by any named investor" attribution
 *     notice (right-of-publicity / false-endorsement guardrail #6, #8, #9).
 * See EIM_V2_PLAN/03_AI_MENTOR_LEGAL_RESEARCH.md.
 */

import { Info } from '@phosphor-icons/react';

interface DisclaimerBannerProps {
  /** 'mentor' surfaces add AI-generated + not-affiliated/endorsed disclosure. */
  context?: 'general' | 'mentor';
}

export function DisclaimerBanner({ context = 'general' }: DisclaimerBannerProps = {}) {
  return (
    <div className="flex items-start gap-2.5 px-4 py-2.5 mx-3 mt-3 rounded-xl bg-[rgba(212,168,83,0.06)] border border-[rgba(212,168,83,0.18)]">
      <Info size={16} weight="bold" className="text-[#D4A853] shrink-0 mt-0.5" />
      {context === 'mentor' ? (
        <p className="text-[11px] leading-relaxed text-[#7A7363]">
          <span className="text-[#D4A853] font-semibold">AI-generated educational analysis.</span>{' '}
          Frameworks are described in third person from publicly documented investment
          philosophies — not affiliated with, endorsed by, or representing any named investor.
          Not investment advice, and no performance is promised. Consult a qualified scholar or
          adviser for personal decisions.
        </p>
      ) : (
        <p className="text-[11px] leading-relaxed text-[#7A7363]">
          <span className="text-[#D4A853] font-semibold">Educational simulation only.</span>{' '}
          No real trades. No financial advice. Scholar opinions shown are educational; consult a
          qualified scholar for personal decisions.
        </p>
      )}
    </div>
  );
}
