/**
 * Input view of the GratitudeModal — type-or-voice mode toggle and textarea.
 */

import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getDemoDisplayFont } from '@/i18n';
import { PencilSimple, Microphone, Sparkle } from '@phosphor-icons/react';
import { C, cardStyle } from '../../barka-labs.constants';

type InputMode = 'type' | 'voice';

interface InputViewProps {
  text: string;
  mode: InputMode;
  submitting: boolean;
  onTextChange: (t: string) => void;
  onModeChange: (m: InputMode) => void;
  onSubmit: () => void;
}

export const InputView = forwardRef<HTMLTextAreaElement, InputViewProps>(
  function InputView({ text, mode, submitting, onTextChange, onModeChange, onSubmit }, ref) {
    const { t } = useTranslation('demo');

    return (
      <div>
        {/* Title */}
        <h2
          style={{
            fontFamily: getDemoDisplayFont(),
            fontSize: 24,
            fontWeight: 600,
            color: C.t1,
            margin: '8px 0 6px',
          }}
        >
          {t('gratitude.title')}
        </h2>
        <p style={{ fontSize: 13, color: C.t3, margin: '0 0 20px', lineHeight: 1.55 }}>
          {t('gratitude.desc')}
        </p>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['type', 'voice'] as InputMode[]).map((m) => {
            const active = m === mode;
            return (
              <button
                key={m}
                onClick={() => onModeChange(m)}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: active ? `1px solid ${C.gold}` : `1px solid ${C.cardB}`,
                  background: active ? 'rgba(212,168,83,0.10)' : 'transparent',
                  color: active ? C.gold : C.t3,
                  transition: 'all 0.2s',
                }}
              >
                {m === 'type'
                  ? <><PencilSimple size={14} weight="bold" style={{ display: 'inline', verticalAlign: -2 }} /> {t('gratitude.modeType')}</>
                  : <><Microphone size={14} weight="bold" style={{ display: 'inline', verticalAlign: -2 }} /> {t('gratitude.modeVoice')}</>}
              </button>
            );
          })}
        </div>

        {mode === 'type' ? (
          <>
            <textarea
              ref={ref}
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder={t('gratitude.placeholder')}
              rows={5}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '14px 16px',
                borderRadius: 14,
                background: 'rgba(8,13,24,0.7)',
                border: `1px solid ${C.cardB}`,
                color: C.t1,
                fontSize: 14,
                lineHeight: 1.6,
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = C.gold; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = C.cardB; }}
            />
            <div style={{ textAlign: 'right', fontSize: 11, color: C.t3, margin: '6px 4px 16px 0' }}>
              {text.length} characters
            </div>
          </>
        ) : (
          <div style={{ ...cardStyle, padding: '40px 20px', textAlign: 'center', marginBottom: 16 }}>
            <Microphone size={40} weight="duotone" style={{ color: C.rose, margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: C.t2, margin: '0 0 6px' }}>{t('gratitude.voiceComingSoon')}</p>
            <p style={{ fontSize: 12, color: C.t3, margin: 0 }}>{t('gratitude.voiceSwitchHint')}</p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={onSubmit}
            disabled={!text.trim() || submitting}
            style={{
              flex: 1,
              padding: '13px 0',
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 700,
              cursor: text.trim() ? 'pointer' : 'not-allowed',
              border: 'none',
              background: text.trim()
                ? `linear-gradient(135deg, ${C.gold}, ${C.goldD})`
                : 'rgba(212,168,83,0.2)',
              color: text.trim() ? C.bg : C.t3,
              transition: 'all 0.2s',
              opacity: text.trim() ? 1 : 0.5,
            }}
          >
            <Sparkle size={16} weight="fill" style={{ display: 'inline', verticalAlign: -2 }} /> {t('gratitude.submit')}
          </button>
          <button
            onClick={() => onModeChange('voice')}
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              background: 'rgba(13,19,35,0.6)',
              border: `1px solid ${C.cardB}`,
              color: C.t2,
              fontSize: 20,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Microphone size={20} weight="duotone" />
          </button>
        </div>
      </div>
    );
  }
);
