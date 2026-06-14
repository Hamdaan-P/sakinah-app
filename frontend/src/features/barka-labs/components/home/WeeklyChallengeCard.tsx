/**
 * WeeklyChallengeCard — rotating weekly community challenge prompt.
 */

import { useTranslation } from 'react-i18next';
import { getDemoDisplayFont } from '@/i18n';
import { Lightning, ArrowRight } from '@phosphor-icons/react';
import { card, cardHover } from './_styles';
import { SectionTitle } from './SectionTitle';

interface WeeklyChallengeCardProps {
  weekChallenge: string;
  daysLeft: number;
  participantCount: number;
  onClick: () => void;
}

export function WeeklyChallengeCard({ weekChallenge, daysLeft, participantCount, onClick }: WeeklyChallengeCardProps) {
  const { t } = useTranslation('demo');
  const displayFont = getDemoDisplayFont();

  return (
    <div>
      <SectionTitle>{t('home.challenge.title')}</SectionTitle>
      <div
        role="button"
        tabIndex={0}
        className={`rounded-2xl p-4 md:p-6 cursor-pointer ${cardHover}`}
        style={{ ...card, borderColor: 'rgba(215,181,106,0.2)' }}
        onClick={onClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      >
        <div className="flex items-start gap-3 md:gap-5">
          <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, rgba(215,181,106,0.12), rgba(215,181,106,0.04))' }}>
            <Lightning size={22} weight="fill" className="text-[#D7B56A]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] md:text-[18px] font-bold text-[#EBDCB8] leading-snug mb-2 md:mb-3" style={{ fontFamily: displayFont, lineHeight: 1.4 }}>{weekChallenge}</p>
            <div className="flex items-center gap-3 md:gap-5 text-[11px] md:text-[13px] text-[#A7B1C0] font-medium">
              <span>{t('home.challenge.daysLeft', { days: daysLeft })}</span>
              <span className="w-1 h-1 rounded-full bg-[#7F8A9A]" />
              <span>{t('home.challenge.joined', { count: participantCount.toLocaleString() })}</span>
            </div>
          </div>
          <ArrowRight size={18} className="text-[#D7B56A] mt-1 shrink-0" />
        </div>
      </div>
    </div>
  );
}
