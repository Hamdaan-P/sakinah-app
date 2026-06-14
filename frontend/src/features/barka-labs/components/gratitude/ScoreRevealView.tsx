/**
 * Score-reveal view of the GratitudeModal — shown after AI scoring completes.
 */

import { useTranslation } from 'react-i18next';
import { getDemoDisplayFont } from '@/i18n';
import { Lightbulb, Brain, Coin } from '@phosphor-icons/react';
import { C, cardStyle, computeReflectionScore } from '../../barka-labs.constants';
import type { Blessing } from '../../types/barka-labs.types';

/** Fallback for blessings without dnz_earned */
function dnzFallback(depth: string): number {
  switch (depth) {
    case 'profound': return 30;
    case 'thoughtful': return 15;
    default: return 5;
  }
}

interface ScoreRevealViewProps {
  blessing: Blessing;
  onDone: () => void;
}

export function ScoreRevealView({ blessing, onDone }: ScoreRevealViewProps) {
  const { t } = useTranslation('demo');
  const score = blessing.score ?? 0;
  const scoreData = computeReflectionScore(score, 1, score >= 4 ? 1 : 0, 1);
  const dnz = blessing.dnz_earned || dnzFallback(blessing.depth ?? 'common');

  const dims = [
    { label: t('gratitude.dim.uniqueness'), value: scoreData.uniqueness, max: 25, color: C.teal },
    { label: t('gratitude.dim.depth'), value: scoreData.depth, max: 25, color: C.emL },
    { label: t('gratitude.dim.specificity'), value: scoreData.specificity, max: 25, color: C.blue },
    { label: t('gratitude.dim.perspective'), value: scoreData.perspective, max: 25, color: C.purple },
  ];

  return (
    <div style={{ paddingTop: 8 }}>
      <h2
        style={{
          fontFamily: getDemoDisplayFont(),
          fontSize: 22,
          fontWeight: 600,
          color: C.t1,
          textAlign: 'center',
          margin: '0 0 20px',
        }}
      >
        {t('gratitude.score.title')}
      </h2>

      {/* Big score */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <span
          style={{
            fontFamily: getDemoDisplayFont(),
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1,
            background: `linear-gradient(135deg, ${C.emL}, ${C.gold})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {scoreData.total}
        </span>
        <p style={{ fontSize: 12, color: C.t3, marginTop: 4 }}>{t('gratitude.score.outOf100')}</p>
      </div>

      {/* 4 Dimensions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
        {dims.map((d) => (
          <div key={d.label} style={{ ...cardStyle, padding: '12px 6px', textAlign: 'center' }}>
            <div
              style={{
                fontFamily: getDemoDisplayFont(),
                fontSize: 22,
                fontWeight: 700,
                color: d.color,
                lineHeight: 1,
              }}
            >
              {d.value}
            </div>
            <div style={{ fontSize: 8, color: C.t3, marginTop: 2 }}>/{d.max}</div>
            <div style={{ fontSize: 9, color: C.t2, marginTop: 6, fontWeight: 600 }}>{d.label}</div>
          </div>
        ))}
      </div>

      {/* AI Tip Card (green) */}
      <div
        style={{
          ...cardStyle,
          background: 'rgba(27,107,74,0.10)',
          border: `1px solid rgba(27,107,74,0.22)`,
          padding: '14px 16px',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <Lightbulb size={18} weight="duotone" style={{ color: C.emL, flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: C.emL, margin: 0, lineHeight: 1.55 }}>
            {blessing.depth === 'profound'
              ? t('gratitude.score.tipProfound')
              : blessing.depth === 'thoughtful'
                ? t('gratitude.score.tipThoughtful')
                : t('gratitude.score.tipCommon')}
          </p>
        </div>
      </div>

      {/* Metacognition Card (purple) */}
      {blessing.ai_reasoning && (
        <div
          style={{
            ...cardStyle,
            background: 'rgba(139,126,200,0.08)',
            border: `1px solid rgba(139,126,200,0.2)`,
            padding: '14px 16px',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <Brain size={18} weight="duotone" style={{ color: C.purple, flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 11, color: C.purple, fontWeight: 600, margin: '0 0 4px' }}>
                {t('gratitude.score.metacognition')}
              </p>
              <p style={{ fontSize: 12, color: C.t2, margin: 0, lineHeight: 1.55, fontStyle: 'italic' }}>
                {blessing.ai_reasoning}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DNZ Earned */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          marginBottom: 24,
          padding: '10px 0',
        }}
      >
        <Coin size={24} weight="duotone" style={{ color: C.dnz }} />
        <span
          style={{
            fontFamily: getDemoDisplayFont(),
            fontSize: 28,
            fontWeight: 700,
            color: C.dnz,
          }}
        >
          +{dnz} DNZ
        </span>
        <span style={{ fontSize: 12, color: C.t3 }}>{t('gratitude.score.earned')}</span>
      </div>

      {/* Done Button */}
      <button
        onClick={onDone}
        style={{
          width: '100%',
          padding: '14px 0',
          borderRadius: 14,
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
          border: `1px solid ${C.cardB}`,
          background: 'rgba(13,19,35,0.6)',
          color: C.t1,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = C.gold;
          e.currentTarget.style.color = C.gold;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = C.cardB;
          e.currentTarget.style.color = C.t1;
        }}
      >
        {t('gratitude.score.done')}
      </button>
    </div>
  );
}
