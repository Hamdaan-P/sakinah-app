/**
 * PASCO Report — The full report tab, now entirely PASCO-based.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDemoDisplayFont } from '@/i18n';
import { ArrowLeft, Sparkle, ClipboardText } from '@phosphor-icons/react';
import { C, cardStyle } from '../barka-labs.constants';
import { PascoAssessment } from './PascoAssessment';
import { PascoResults } from './PascoResults';
import type { PascoResult } from '../data/pasco-scoring';
import type { BarkaLabsStats } from '../types/barka-labs.types';
import type { Blessing } from '../types/barka-labs.types';
import type { BarkaLabsScreen } from '../pages/BarkaLabsPage';

// hFont computed inside component via getDemoDisplayFont()

interface Props {
  stats: BarkaLabsStats;
  blessings: Blessing[];
  go: (s: BarkaLabsScreen) => void;
  isDemo?: boolean;
}

export function BarkaLabsReport({ go, isDemo }: Props) {
  const { t } = useTranslation('demo');
  const hFont: React.CSSProperties = { fontFamily: getDemoDisplayFont() };
  const [showPascoAssessment, setShowPascoAssessment] = useState(false);
  const [pascoResult, setPascoResult] = useState<PascoResult | null>(() => {
    try {
      const saved = localStorage.getItem('pasco_result');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [showPascoResults, setShowPascoResults] = useState(false);

  return (
    <div className="space-y-6">

      {/* -- Header -- */}
      <div className="flex items-center gap-3">
        <button onClick={() => go('home')} className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer" style={cardStyle}>
          <ArrowLeft size={18} style={{ color: C.t1 }} />
        </button>
        <h2 className="text-xl font-bold" style={{ ...hFont, color: C.t1 }}>
          {t('report.title')}
        </h2>
      </div>

      {/* ═══════ PASCO CONTENT ═══════ */}
      {showPascoResults && pascoResult ? (
        <PascoResults result={pascoResult} onClose={() => setShowPascoResults(false)} isDemo={isDemo} />
      ) : pascoResult ? (
        /* Summary card when assessment is completed */
        <div
          role="button"
          tabIndex={0}
          className="rounded-2xl p-5 md:p-6 cursor-pointer transition-all hover:scale-[1.005]"
          style={{ ...cardStyle, borderColor: 'rgba(139,126,200,0.2)' }}
          onClick={() => setShowPascoResults(true)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowPascoResults(true); } }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,126,200,0.12)' }}>
                <ClipboardText size={22} weight="duotone" style={{ color: '#8B7EC8' }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#EBDCB8' }}>{pascoResult.archetype.name}</p>
                <p className="text-[10px]" style={{ color: '#7F8A9A' }}>{t('report.tapBreakdown')}</p>
              </div>
            </div>
            <Sparkle size={18} weight="duotone" style={{ color: C.gold }} />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(['P', 'A', 'S', 'CO'] as const).map(key => {
              const dim = { P: { color: '#5B8DEF' }, A: { color: '#2A9D6F' }, S: { color: '#D7B56A' }, CO: { color: '#8B7EC8' } }[key];
              return (
                <div key={key} className="text-center py-2 rounded-xl" style={{ background: `${dim.color}08` }}>
                  <p className="text-base font-bold" style={{ color: dim.color, fontFamily: 'Cormorant Garamond, serif' }}>{pascoResult.dimensionScores[key]}</p>
                  <p className="text-[8px] font-medium" style={{ color: '#7F8A9A' }}>{t(`pasco.dim.${key}`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* CTA to start assessment */
        <div
          role="button"
          tabIndex={0}
          className="rounded-2xl p-6 md:p-8 text-center cursor-pointer transition-all hover:scale-[1.005]"
          style={{ ...cardStyle, borderColor: 'rgba(139,126,200,0.25)', background: 'linear-gradient(160deg, rgba(139,126,200,0.06), rgba(215,181,106,0.04))' }}
          onClick={() => setShowPascoAssessment(true)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowPascoAssessment(true); } }}
        >
          <ClipboardText size={44} weight="duotone" className="mx-auto mb-4" style={{ color: '#8B7EC8' }} />
          <p className="text-xl md:text-2xl font-bold mb-2" style={{ color: '#EBDCB8', fontFamily: getDemoDisplayFont() }}>
            {t('report.discover')}
          </p>
          <p className="text-sm mb-2 font-medium" style={{ color: '#A7B1C0' }}>
            {t('report.discoverSubtitle')}
          </p>
          <p className="text-xs mb-6 max-w-md mx-auto" style={{ color: '#7F8A9A' }}>
            {t('report.discoverDesc')}
          </p>
          <button
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #8B7EC8, #5B8DEF)', color: '#FFFFFF', boxShadow: '0 4px 20px rgba(139,126,200,0.3)' }}
          >
            <ClipboardText size={18} weight="fill" /> {t('report.startAssessment')}
          </button>
        </div>
      )}

      {/* PASCO Assessment overlay */}
      {showPascoAssessment && (
        <PascoAssessment
          onComplete={(result) => {
            setPascoResult(result);
            localStorage.setItem('pasco_result', JSON.stringify(result));
            setShowPascoAssessment(false);
            setShowPascoResults(true);
          }}
          onClose={() => setShowPascoAssessment(false)}
          initialAnswers={pascoResult?.answers}
        />
      )}

      {/* -- Back -- */}
      <button
        onClick={() => go('home')}
        className="w-full rounded-xl py-3.5 text-sm font-bold cursor-pointer"
        style={{ background: `linear-gradient(135deg, ${C.emL}, ${C.emD})`, color: C.t1, border: 'none' }}
      >
        {t('report.backToDashboard')}
      </button>
    </div>
  );
}
