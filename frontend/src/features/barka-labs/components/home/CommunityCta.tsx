/**
 * CommunityCta — teal "join the community" card.
 */

import { useTranslation } from 'react-i18next';
import { Users, ArrowRight } from '@phosphor-icons/react';
import { C } from '../../barka-labs.constants';
import { cardHover } from './_styles';

export function CommunityCta({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation('demo');

  return (
    <div
      role="button"
      tabIndex={0}
      className={`rounded-2xl p-4 md:p-5 cursor-pointer ${cardHover}`}
      style={{
        background: 'linear-gradient(135deg, rgba(58,191,173,0.08), rgba(42,157,111,0.04))',
        border: '1px solid rgba(58,191,173,0.18)',
      }}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(58,191,173,0.15)' }}>
          <Users size={22} weight="duotone" style={{ color: '#3ABFAD' }} />
        </div>
        <div className="flex-1">
          <p className="text-[12px] md:text-[13px] font-bold mb-1" style={{ color: '#3ABFAD' }}>{t('home.community.title')}</p>
          <p className="text-[11px] md:text-[12px] leading-relaxed m-0" style={{ color: C.t2 }}>
            {t('home.community.desc')}
          </p>
          <p className="text-[10px] mt-2 flex items-center gap-1 font-semibold" style={{ color: '#3ABFAD' }}>
            {t('home.community.action')} <ArrowRight size={10} />
          </p>
        </div>
      </div>
    </div>
  );
}
