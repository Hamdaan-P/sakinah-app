/**
 * Voice (ASR) Hifz test extracted from QuranTestPage.
 */

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Check, Microphone, MicrophoneSlash, Stop, X,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { HifzSession, QuranLine } from '../../types/quran.types';
import { compareAyahInput, pushCorrect, pushMistake } from '../../services/hifzEngine';

interface Props {
  session: HifzSession;
  setSession: (s: HifzSession) => void;
  lines: QuranLine[];
  onFinish: (s: HifzSession) => void;
}

export function VoiceTest({ session, setSession, lines, onFinish }: Props) {
  const [idx, setIdx] = useState(0);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<null | { ok: boolean; similarity: number; missing: string[] }>(null);
  const [unsupported, setUnsupported] = useState(false);
  const recogRef = useRef<unknown>(null);

  const active = lines[idx];

  const startListening = () => {
    const SR = (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;
    if (!SR) {
      setUnsupported(true);
      return;
    }
    const rec = new (SR as new () => {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      onresult: (e: { results: ArrayLike<{ 0: { transcript: string } }> }) => void;
      onend: () => void;
      onerror: () => void;
      start(): void;
      stop(): void;
    })();
    rec.lang = 'ar-SA';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript + ' ';
      setTranscript(text.trim());
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recogRef.current = rec;
    setTranscript('');
    setListening(true);
    rec.start();
  };

  const stopListening = () => {
    const rec = recogRef.current as { stop(): void } | null;
    rec?.stop();
    setListening(false);
  };

  const submit = () => {
    const result = compareAyahInput(active.arabic, transcript);
    setFeedback({ ok: result.correct, similarity: result.similarity, missing: result.missingWords });
    if (result.correct) setSession(pushCorrect(session));
    else setSession(pushMistake(session, { verseKey: active.verseKey, type: 'pronunciation', expected: active.arabic, actual: transcript }));
  };

  const next = () => {
    setFeedback(null);
    setTranscript('');
    if (idx + 1 < lines.length) setIdx(idx + 1);
    else onFinish(session);
  };

  if (unsupported) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-white/70">Voice recognition isn&apos;t available in this browser.</p>
        <p className="text-[11px] text-white/40 mt-1">Try the typing test instead.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 space-y-4 pb-28">
      <div className="flex items-center justify-between text-[11px] text-white/40">
        <span>Ayah {idx + 1} / {lines.length}</span>
        <span>{active.verseKey}</span>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/3 p-4">
        <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Recite this ayah</p>
        {active.translation && (
          <p className="text-xs text-white/50 mb-2">{active.translation}</p>
        )}
        <div className="min-h-[80px] rounded-lg bg-black/20 p-3 flex items-center justify-center">
          {listening ? (
            <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-xs text-red-300">
              Listening… speak now
            </motion.p>
          ) : transcript ? (
            <p className="text-lg font-arabic text-right leading-loose" dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>
              {transcript}
            </p>
          ) : (
            <p className="text-xs text-white/30">Tap the mic and recite the ayah.</p>
          )}
        </div>
      </div>

      <button
        onClick={listening ? stopListening : startListening}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border',
          listening
            ? 'bg-red-500/15 border-red-500/40 text-red-300'
            : 'bg-[#4FB892]/15 border-[#4FB892]/40 text-[#4FB892]',
        )}
      >
        {listening ? <><Stop size={18} weight="fill" /> Stop</> : <><Microphone size={18} weight="fill" /> Start recording</>}
      </button>

      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn('rounded-xl border p-3', feedback.ok ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30')}>
            <p className="text-sm flex items-center gap-1.5 mb-1">
              {feedback.ok ? <><Check size={15} weight="bold" className="text-emerald-300" /> <span className="text-emerald-300">Correct</span></> : <><X size={15} weight="bold" className="text-red-300" /> <span className="text-red-300">Not quite</span></>}
              <span className="text-white/50 text-[11px] ml-auto">{Math.round(feedback.similarity * 100)}% match</span>
            </p>
            {!feedback.ok && feedback.missing.length > 0 && (
              <p className="text-[11px] text-white/60">
                Missing words: <span className="font-arabic text-red-300" dir="rtl">{feedback.missing.slice(0, 5).join(' · ')}</span>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        {!feedback ? (
          <button
            onClick={submit}
            disabled={!transcript}
            className="flex-1 py-2.5 rounded-lg bg-[#D4A853]/20 border border-[#D4A853]/40 text-[#D4A853] font-medium disabled:opacity-40"
          >
            Submit
          </button>
        ) : (
          <button
            onClick={next}
            className="flex-1 py-2.5 rounded-lg bg-[#4FB892]/20 border border-[#4FB892]/40 text-[#4FB892] font-medium flex items-center justify-center gap-1.5"
          >
            {idx + 1 < lines.length ? 'Next' : 'Finish'} <ArrowRight size={14} />
          </button>
        )}
      </div>

      {listening && (
        <p className="text-[10px] text-center text-white/30 flex items-center justify-center gap-1"><MicrophoneSlash size={11}/> Speak clearly. Stop when done.</p>
      )}
    </div>
  );
}
