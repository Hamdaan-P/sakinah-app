/**
 * DisclaimerBanner — inline disclaimer for feature pages
 * Two variants: 'subtle' (footer strip) and 'banner' (visible card)
 */

import { Link } from 'react-router-dom';
import { Info } from '@phosphor-icons/react';
import { DISCLAIMERS } from '@/features/legal/types/disclaimer.types';

interface DisclaimerBannerProps {
  contentId: string;
  variant: 'subtle' | 'banner';
  className?: string;
}

export function DisclaimerBanner({ contentId, variant, className = '' }: DisclaimerBannerProps) {
  const content = DISCLAIMERS[contentId];
  if (!content) return null;

  if (variant === 'subtle') {
    return (
      <div className={`border-t border-[rgba(212,168,83,0.15)] px-4 py-2.5 ${className}`}>
        <p className="text-xs text-[#5C5749] text-center leading-relaxed">
          {content.shortBody}
          {content.learnMoreRoute && (
            <>
              {' '}
              <Link
                to={content.learnMoreRoute}
                className="text-[#D4A853]/70 hover:text-[#D4A853] transition-colors"
              >
                Learn more
              </Link>
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl bg-[#0F141F] border border-[rgba(212,168,83,0.15)] p-4 ${className}`}
    >
      <div className="flex gap-3">
        <div className="shrink-0 mt-0.5">
          <Info size={18} className="text-[#D4A853]/70" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#F5E8C7] mb-1">{content.title}</p>
          <p className="text-xs text-[#7A7363] leading-relaxed">{content.body}</p>
          {content.learnMoreRoute && (
            <Link
              to={content.learnMoreRoute}
              className="inline-block mt-2 text-xs text-[#D4A853]/70 hover:text-[#D4A853] transition-colors"
            >
              View full disclaimers
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
