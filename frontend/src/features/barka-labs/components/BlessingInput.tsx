/**
 * Blessing Input — textarea with submit button for logging blessings
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperPlaneTilt, Spinner } from '@phosphor-icons/react';

interface BlessingInputProps {
  onSubmit: (text: string) => Promise<void>;
  submitting: boolean;
}

const PLACEHOLDERS = [
  'What blessing are you grateful for today?',
  'What did Allah bless you with that you normally overlook?',
  'Think deeper... what hidden blessing did you notice today?',
  'What would you miss most if it was taken away?',
  'What small mercy made your day easier?',
];

export function BlessingInput({ onSubmit, submitting }: BlessingInputProps) {
  const [text, setText] = useState('');
  const [placeholder] = useState(
    () => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)],
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;
    await onSubmit(trimmed);
    setText('');
    textareaRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      <div
        className="rounded-xl border p-4"
        style={{
          backgroundColor: 'rgba(36,50,70,0.6)',
          borderColor: 'rgba(215,181,106,0.2)',
        }}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={submitting}
          rows={2}
          maxLength={1000}
          className="w-full bg-transparent text-[#EBDCB8] placeholder-[#7F8A9A] resize-none outline-none text-sm leading-relaxed"
        />

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-[#7F8A9A]">
            {text.length}/1000
          </span>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={!text.trim() || submitting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
            style={{
              backgroundColor: text.trim()
                ? 'rgba(215,181,106,0.2)'
                : 'rgba(215,181,106,0.08)',
              color: '#D7B56A',
            }}
          >
            <AnimatePresence mode="wait">
              {submitting ? (
                <motion.span
                  key="spinner"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <Spinner size={16} />
                </motion.span>
              ) : (
                <PaperPlaneTilt key="send" size={16} weight="fill" />
              )}
            </AnimatePresence>
            {submitting ? 'Scoring...' : 'Log Blessing'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
