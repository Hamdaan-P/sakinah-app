/**
 * InsightCards — "Did you know" + "Shukr effect" hero cards at the top of
 * BarkaLabsHome.
 */

import { useTranslation } from 'react-i18next';
import { Heartbeat, Lightning } from '@phosphor-icons/react';
import { C } from '../../barka-labs.constants';

export function InsightCards() {
  const { t } = useTranslation('demo');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      <div
        className="rounded-2xl p-4 md:p-5 flex items-start gap-3"
        style={{
          background: 'linear-gradient(135deg, rgba(42,157,111,0.08), rgba(42,157,111,0.02))',
          border: '1px solid rgba(42,157,111,0.18)',
        }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(42,157,111,0.15)' }}>
          <Heartbeat size={20} weight="duotone" style={{ color: '#2A9D6F' }} />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: '#2A9D6F' }}>{t('home.insight.didYouKnow')}</p>
          <p className="text-[12px] leading-relaxed m-0" style={{ color: C.t2 }}>
            {t('home.insight.didYouKnowText')}
          </p>
        </div>
      </div>

      <div
        className="rounded-2xl p-4 md:p-5 flex items-start gap-3"
        style={{
          background: 'linear-gradient(135deg, rgba(215,181,106,0.08), rgba(215,181,106,0.02))',
          border: '1px solid rgba(215,181,106,0.18)',
        }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(215,181,106,0.15)' }}>
          <Lightning size={20} weight="duotone" style={{ color: '#D7B56A' }} />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: C.gold }}>{t('home.insight.shukrEffect')}</p>
          <p className="text-[12px] leading-relaxed m-0" style={{ color: C.t2 }}>
            {t('home.insight.shukrEffectText')}
          </p>
        </div>
      </div>
    </div>
  );
}
