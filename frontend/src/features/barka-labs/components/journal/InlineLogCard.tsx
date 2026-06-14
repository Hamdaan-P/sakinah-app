/**
 * InlineLogCard — gratitude input with voice recognition, used at the top of
 * the journal.
 */

import { useEffect, useRef, useState } from 'react';
import { Sparkle, Microphone, Stop } from '@phosphor-icons/react';
import { C } from '../../barka-labs.constants';
import { useVoiceInput } from './_useVoiceInput';

interface InlineLogCardProps {
  onSubmit: (text: string) => Promise<void>;
  submitting: boolean;
  onFlyingCard: (text: string) => void;
}

export function InlineLogCard({ onSubmit, submitting, onFlyingCard }: InlineLogCardProps) {
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { recording, interimText, stopRecording, toggleRecording } = useVoiceInput({
    onFinal: (chunk) => setText((prev) => (prev + ' ' + chunk).trim()),
  });

  useEffect(() => { textareaRef.current?.focus(); }, []);

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return;
    if (recording) stopRecording();
    const submitted = text.trim();
    onFlyingCard(submitted);
    setText('');
    try {
      await onSubmit(submitted);
      setDone(true);
      // Lose focus so the OthersStream rotator above becomes the visual anchor —
      // the user has just submitted, the next motivating beat is reading what
      // others are grateful for.
      textareaRef.current?.blur();
      setTimeout(() => setDone(false), 2000);
    } catch {
      // Error is handled by the store — restore text so user can retry
      setText(submitted);
    }
  };

  // Display text: typed text + interim speech in a lighter style
  const displayValue = interimText ? text + (text ? ' ' : '') + interimText : text;

  return (
    <div
      className="rounded-2xl p-5 mb-5"
      style={{
        background: C.card,
        border: `1px solid ${recording ? '#FF6B6B' : C.cardB}`,
        transition: 'border-color 0.3s',
      }}
    >
      <h3
        className="text-[15px] font-semibold mb-1"
        style={{ color: C.t1, fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}
      >
        🤲 What are you grateful for?
      </h3>
      <p className="text-[12px] mb-3" style={{ color: C.t3, lineHeight: 1.5 }}>
        Be specific and deep — your entry is 100% private.
      </p>

      {/* Textarea with interim text overlay */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={displayValue}
          onChange={(e) => { if (!recording) setText(e.target.value); }}
          placeholder={recording ? 'Listening...' : 'I am grateful for...'}
          rows={3}
          className="w-full rounded-xl text-[14px] outline-none resize-none transition-colors"
          style={{
            padding: '12px 14px',
            background: 'rgba(8,13,24,0.7)',
            border: `1px solid ${recording ? 'rgba(255,107,107,0.4)' : C.cardB}`,
            color: C.t1,
            lineHeight: 1.6,
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            transition: 'border-color 0.3s',
          }}
          onFocus={(e) => { if (!recording) e.currentTarget.style.borderColor = C.gold; }}
          onBlur={(e) => { if (!recording) e.currentTarget.style.borderColor = C.cardB; }}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
        />

        {/* Recording indicator pulse */}
        {recording && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-[10px] font-semibold text-red-400">REC</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          {/* Voice button */}
          <button
            onClick={toggleRecording}
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:scale-[1.05] active:scale-[0.95]"
            style={{
              background: recording
                ? 'rgba(255,107,107,0.15)'
                : 'rgba(215,181,106,0.1)',
              border: `1px solid ${recording ? 'rgba(255,107,107,0.3)' : 'rgba(215,181,106,0.2)'}`,
              color: recording ? '#FF6B6B' : C.gold,
            }}
            title={recording ? 'Stop recording' : 'Start voice input'}
          >
            {recording ? <Stop size={18} weight="fill" /> : <Microphone size={18} weight="fill" />}
          </button>
          <span className="text-[11px]" style={{ color: recording ? '#FF6B6B' : C.t3 }}>
            {recording ? 'Tap to stop' : `${text.length} chars`}
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!text.trim() || submitting}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold transition-all hover:scale-[1.02] active:scale-[0.97]"
          style={{
            background: text.trim()
              ? `linear-gradient(135deg, ${C.gold}, ${C.goldD})`
              : 'rgba(212,168,83,0.2)',
            color: text.trim() ? '#1E293A' : C.t3,
            opacity: text.trim() ? 1 : 0.5,
            cursor: text.trim() ? 'pointer' : 'not-allowed',
            border: 'none',
          }}
        >
          <Sparkle size={14} weight="fill" />
          {submitting ? 'Logging...' : done ? 'Alhamdulillah!' : 'Log Shukr'}
        </button>
      </div>
    </div>
  );
}
