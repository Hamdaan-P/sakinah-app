/**
 * "Your Best Reflections" card showing top-scoring blessings.
 */

import { useTranslation } from 'react-i18next';
import { getDemoDisplayFont } from '@/i18n';
import { Sparkle } from '@phosphor-icons/react';
import { cardStyle } from '../../barka-labs.constants';
import type { Blessing } from '../../types/barka-labs.types';
import { SourceChip } from '../common/SourceChip';

interface BestReflectionsCardProps {
  blessings: Blessing[];
}

export function BestReflectionsCard({ blessings }: BestReflectionsCardProps) {
  const { t } = useTranslation('demo');
  const hFont: React.CSSProperties = { fontFamily: getDemoDisplayFont() };

  if (blessings.length === 0) return null;

  return (
    <div className="rounded-2xl p-5" style={cardStyle}>
      <div className="flex items-center gap-2 text-[15px] font-semibold mb-4" style={{ ...hFont, color: '#EBDCB8' }}>
        <Sparkle size={18} style={{ color: '#D7B56A' }} />
        <SourceChip kind="yours" />
        {t('reflection.bestReflections')}
      </div>
      <div className="space-y-3">
        {blessings.map((b, i) => (
          <div key={b.id || i} className="p-3 rounded-xl" style={{ background: 'rgba(215,181,106,0.04)', border: '1px solid rgba(215,181,106,0.1)' }}>
            <p className="text-xs leading-relaxed italic mb-2" style={{ color: '#D5DDEA' }}>
              &ldquo;{b.text.length > 150 ? b.text.slice(0, 150) + '...' : b.text}&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                background: b.depth === 'profound' ? 'rgba(42,157,111,0.15)' : b.depth === 'thoughtful' ? 'rgba(215,181,106,0.15)' : 'rgba(127,138,154,0.15)',
                color: b.depth === 'profound' ? '#2A9D6F' : b.depth === 'thoughtful' ? '#D7B56A' : '#7F8A9A',
              }}>
                {b.depth}
              </span>
              <span className="text-[10px] font-semibold" style={{ color: '#D7B56A' }}>Score: {b.score}/5</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
