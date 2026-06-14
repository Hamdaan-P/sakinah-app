/**
 * CircleRayaSheet
 *
 * Modal sheet that asks Raya something with the circle's context attached.
 * Three quick-action chips for the most common requests, plus free input.
 * Streams Raya's reply, and offers a "Save as note" button to persist.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkle,
  Brain,
  Calendar,
  ChatCircle,
  PaperPlaneTilt,
} from '@phosphor-icons/react';
import {
  askRayaAboutCircle,
  generateCallSummary,
  generateDailyReflection,
  generateStudyPlan,
  saveResponseAsNote,
} from '../services/hifzCirclesAi';
import { RayaResponseCard } from './circle-raya/RayaResponseCard';

interface Props {
  open: boolean;
  circleId: string;
  onClose: () => void;
}

type Tone = 'summary' | 'prompt' | 'plan' | 'free';

export function CircleRayaSheet({ open, circleId, onClose }: Props) {
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [response, setResponse] = useState('');
  const [lastTone, setLastTone] = useState<Tone | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setInput('');
    setResponse('');
    setLastTone(null);
    setSaved(false);
    setError(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const runQuickAction = async (tone: Exclude<Tone, 'free'>) => {
    setError(null);
    setSaved(false);
    setResponse('');
    setStreaming(true);
    setLastTone(tone);
    try {
      let text = '';
      if (tone === 'summary') text = await generateCallSummary(circleId);
      else if (tone === 'prompt') text = await generateDailyReflection(circleId);
      else if (tone === 'plan') text = await generateStudyPlan(circleId);
      setResponse(text);
      setSaved(true); // these helpers auto-save the result already
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Raya could not respond. Try again.');
    } finally {
      setStreaming(false);
    }
  };

  const sendFree = async () => {
    if (!input.trim()) return;
    setError(null);
    setSaved(false);
    setResponse('');
    setStreaming(true);
    setLastTone('free');
    try {
      const text = await askRayaAboutCircle(circleId, input, {
        onPartial: (t) => setResponse(t),
      });
      setResponse(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Raya could not respond. Try again.');
    } finally {
      setStreaming(false);
    }
  };

  const handleSave = async () => {
    if (!response.trim()) return;
    try {
      await saveResponseAsNote(circleId, response);
      setSaved(true);
    } catch {
      setError('Could not save note. Try again.');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            className="fixed bottom-0 inset-x-0 z-50 rounded-t-3xl bg-[#0A0E16] text-white shadow-2xl pb-safe"
            style={{ maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <div className="pt-3 pb-1 flex justify-center">
              <div className="h-1 w-10 rounded-full bg-white/15" />
            </div>

            <div className="px-5 pt-1 pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Sparkle size={16} weight="fill" className="text-[#D4A853]" /> Ask Raya
              </h3>
              <button onClick={close} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10" aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="px-4 pb-3 grid grid-cols-3 gap-2">
              <ActionChip icon={<Brain size={13} weight="fill" />} label="Summary" onClick={() => runQuickAction('summary')} disabled={streaming} />
              <ActionChip icon={<ChatCircle size={13} weight="fill" />} label="Reflection" onClick={() => runQuickAction('prompt')} disabled={streaming} />
              <ActionChip icon={<Calendar size={13} weight="fill" />} label="Study plan" onClick={() => runQuickAction('plan')} disabled={streaming} />
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <RayaResponseCard
                streaming={streaming}
                response={response}
                error={error}
                lastTone={lastTone}
                saved={saved}
                onSave={handleSave}
              />
            </div>

            <div className="px-4 pb-4 pt-2 border-t border-white/8">
              <div className="flex gap-2 items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendFree();
                    }
                  }}
                  rows={1}
                  placeholder="Ask anything about this circle…"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none resize-none max-h-32"
                />
                <button
                  onClick={sendFree}
                  disabled={!input.trim() || streaming}
                  className="px-3 py-2.5 rounded-xl bg-[#D4A853] text-[#0A0E16] disabled:opacity-50"
                  aria-label="Send"
                >
                  <PaperPlaneTilt size={14} weight="fill" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ActionChip({
  icon, label, onClick, disabled,
}: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-[11px] font-semibold bg-[#D4A853]/12 border border-[#D4A853]/30 text-[#D4A853] hover:bg-[#D4A853]/20 disabled:opacity-50"
    >
      {icon}
      {label}
    </button>
  );
}
