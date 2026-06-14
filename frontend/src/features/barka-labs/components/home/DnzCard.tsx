/**
 * DnzCard — DinarZ rewards summary. Renders a blurred/teaser variant in demo
 * mode and a full clickable card otherwise.
 */

import { useTranslation } from 'react-i18next';
import { getDemoDisplayFont } from '@/i18n';
import { useNavigate } from 'react-router-dom';
import { Sparkle, ArrowRight } from '@phosphor-icons/react';
import { C } from '../../barka-labs.constants';
import type { BarkaLabsScreen } from '../../pages/BarkaLabsPage';
import { card, cardHover } from './_styles';
import { SectionTitle } from './SectionTitle';

interface DnzCardProps {
  isDemo: boolean;
  go: (s: BarkaLabsScreen) => void;
}

export function DnzCard({ isDemo, go }: DnzCardProps) {
  const { t } = useTranslation('demo');
  const displayFont = getDemoDisplayFont();
  const navigate = useNavigate();

  if (isDemo) {
    return (
      <div>
        <SectionTitle>{t('home.rewards.title')}</SectionTitle>
        <div
          role="button"
          tabIndex={0}
          className="rounded-2xl p-5 md:p-6 relative overflow-hidden cursor-pointer"
          style={{ ...card, borderColor: 'rgba(245,200,66,0.15)' }}
          onClick={() => navigate('/signup')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/signup'); } }}
        >
          {/* Blurred overlay */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(30,41,58,0.7)', backdropFilter: 'blur(4px)', zIndex: 2 }}>
            <div className="text-center px-4">
              <Sparkle size={28} weight="duotone" className="mx-auto mb-2" style={{ color: '#F5C842' }} />
              <p className="text-sm font-bold mb-1" style={{ color: '#EBDCB8' }}>{t('home.rewards.unlock')}</p>
              <p className="text-xs" style={{ color: '#7F8A9A' }}>{t('home.rewards.unlockDesc')}</p>
            </div>
          </div>
          {/* Background hint content */}
          <div className="flex items-center gap-3 mb-4 opacity-40">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black" style={{ background: `linear-gradient(135deg, ${C.dnz}, ${C.goldD})`, color: '#1E293A' }}>D</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#EBDCB8]">{t('home.rewards.dnzTitle')}</p>
              <p className="text-xs text-[#A7B1C0]">{t('home.rewards.islamicTokens')}</p>
            </div>
            <span className="text-2xl font-bold text-[#F5C842]" style={{ fontFamily: displayFont }}>???</span>
          </div>
          <div className="grid grid-cols-4 gap-2 opacity-40">
            {([
            { key: 'home.dnz.today', label: 'Today' },
            { key: 'home.dnz.week', label: 'Week' },
            { key: 'home.dnz.shukr', label: 'Shukr' },
            { key: 'home.dnz.twin', label: 'Twin' },
          ] as Array<{ key: string; label: string }>).map(l => (
              <div key={l.key} className="text-center py-2 rounded-xl" style={{ background: 'rgba(245,200,66,0.07)' }}>
                <p className="text-sm font-bold text-[#F5C842]">—</p>
                <p className="text-[9px] text-[#A7B1C0]">{t(l.key)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle>{t('home.dnz.title')}</SectionTitle>
      <div
        role="button"
        tabIndex={0}
        className={`rounded-2xl p-4 md:p-6 cursor-pointer ${cardHover}`}
        style={{ ...card, borderColor: 'rgba(245,200,66,0.2)' }}
        onClick={() => go('dnz')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('dnz'); } }}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-base md:text-lg font-black" style={{ background: `linear-gradient(135deg, ${C.dnz}, ${C.goldD})`, color: '#1E293A' }}>D</div>
          <div className="flex-1">
            <p className="text-[14px] md:text-[16px] font-bold text-[#EBDCB8]">{t('home.rewards.dnzTitle')}</p>
            <p className="text-xs md:text-sm text-[#A7B1C0]">{t('home.rewards.islamicTokens')}</p>
          </div>
          <ArrowRight size={18} className="text-[#F5C842] shrink-0" />
        </div>
      </div>
    </div>
  );
}
