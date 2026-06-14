/**
 * GratitudeModal — Bottom sheet modal for logging gratitude
 * Slides up from bottom. No framer-motion; CSS transitions only.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { C } from '../barka-labs.constants';
import type { Blessing, DecompositionResponse } from '../types/barka-labs.types';
import { InputView } from './gratitude/InputView';
import { LoadingView } from './gratitude/LoadingView';
import { ScoreRevealView } from './gratitude/ScoreRevealView';

interface GratitudeModalProps {
  onSubmit: (text: string) => Promise<void>;
  submitting: boolean;
  onClose: () => void;
  lastBlessing: Blessing | null;
  activeDecomposition: DecompositionResponse | null;
  decomposing: boolean;
}

type InputMode = 'type' | 'voice';
type View = 'input' | 'score' | 'loading';

export function GratitudeModal({ onSubmit, submitting, onClose, lastBlessing, decomposing }: GratitudeModalProps) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<InputMode>('type');
  const [submitted, setSubmitted] = useState(false);
  const [visible, setVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Slide-in on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Focus textarea on open
  useEffect(() => {
    if (!submitted && mode === 'type') {
      textareaRef.current?.focus();
    }
  }, [submitted, mode]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (!text.trim() || submitting) return;
    await onSubmit(text.trim());
    setSubmitted(true);
  }, [text, submitting, onSubmit]);

  /* Determine current view */
  let view: View = 'input';
  if (submitting || (submitted && decomposing)) {
    view = 'loading';
  } else if (submitted && lastBlessing && !decomposing) {
    view = 'score';
  }

  return (
    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- modal backdrop; Escape and close button handle keyboard a11y */
    <div
      onClick={handleClose}
      onKeyDown={(e) => { if (e.key === 'Escape') handleClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        transition: 'opacity 0.3s',
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Sheet */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- stopPropagation wrapper; inner controls handle their own a11y */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: C.card,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTop: `2px solid ${C.gold}`,
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          padding: '0 24px 32px',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(240,237,230,0.18)' }} />
        </div>

        {view === 'input' && (
          <InputView
            ref={textareaRef}
            text={text}
            mode={mode}
            submitting={submitting}
            onTextChange={setText}
            onModeChange={setMode}
            onSubmit={handleSubmit}
          />
        )}

        {view === 'loading' && <LoadingView submitting={submitting} />}

        {view === 'score' && lastBlessing && (
          <ScoreRevealView blessing={lastBlessing} onDone={handleClose} />
        )}
      </div>
    </div>
  );
}
