/**
 * NavigateLinks
 * Renders clickable navigation buttons when Raya suggests an in-app feature.
 * Style matches CompanionReferralChip (gold-bordered pill on navy background).
 */

import { useNavigate } from 'react-router-dom';
import { Compass, ArrowRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { NavigateLink } from '../types/chatbot.types';

interface NavigateLinksProps {
  links: NavigateLink[];
}

export function NavigateLinks({ links }: NavigateLinksProps) {
  const navigate = useNavigate();

  if (!links.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {links.map((link) => (
        <button
          key={link.route}
          onClick={() => navigate(link.route)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all',
            'bg-[#10151F]/80 border border-[#D4A853]/30 text-[#F5E8C7]',
            'hover:border-[#D4A853]/60 hover:bg-[#10151F]',
          )}
        >
          <Compass size={14} className="text-[#D4A853]" />
          <span>Open <strong className="text-[#D4A853]">{link.label}</strong></span>
          <ArrowRight size={12} className="text-[#D4A853]" />
        </button>
      ))}
    </div>
  );
}
