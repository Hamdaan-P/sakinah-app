/**
 * Find-Next-Ayah test extracted from QuranTestPage.
 */

import { useMemo, useState } from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { HifzSession, QuranLine } from '../../types/quran.types';
import { pushCorrect, pushMistake } from '../../services/hifzEngine';

interface Props {
  session: HifzSession;
  setSession: (s: HifzSession) => void;
  lines: QuranLine[];
  allLines: QuranLine[];
  onFinish: (s: HifzSession) => void;
}

export function FindNextAyahTest({ session, setSession, lines, allLines, onFinish }: Props) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const prompt = lines[idx];
  const correctNext = lines[idx + 1] ?? null;

  // 4 distractors: real next + 3 random ayahs from the same surah, not including the prompt
  const choices = useMemo(() => {
    if (!correctNext) return [];
    const distractors = allLines
      .filter((l) => l.verseKey !== prompt.verseKey && l.verseKey !== correctNext.verseKey)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [correctNext, ...distractors].sort(() => Math.random() - 0.5);
  }, [prompt, correctNext, allLines]);

  if (!correctNext) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-white/70">Not enough ayahs in range for Find-Next — add one more ayah.</p>
      </div>
    );
  }

  const pick = (line: QuranLine) => {
    if (picked) return;
    setPicked(line.verseKey);
    if (line.verseKey === correctNext.verseKey) setSession(pushCorrect(session));
    else setSession(pushMistake(session, { verseKey: correctNext.verseKey, type: 'order', expected: correctNext.arabic, actual: line.arabic }));
  };

  const next = () => {
    setPicked(null);
    if (idx + 2 < lines.length) setIdx(idx + 1);
    else onFinish(session);
  };

  return (
    <div className="px-4 py-5 space-y-4 pb-28">
      <div className="flex items-center justify-between text-[11px] text-white/40">
        <span>Pair {idx + 1} / {lines.length - 1}</span>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/3 p-4">
        <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">This ayah</p>
        <p className="text-xl font-arabic text-right leading-loose" dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>
          {prompt.arabic}
        </p>
      </div>
      <p className="text-xs text-white/60 text-center">Which ayah comes next?</p>
      <div className="space-y-2">
        {choices.map((c) => {
          const isCorrect = picked && c.verseKey === correctNext.verseKey;
          const isWrong = picked === c.verseKey && c.verseKey !== correctNext.verseKey;
          return (
            <button
              key={c.verseKey}
              onClick={() => pick(c)}
              disabled={!!picked}
              className={cn(
                'w-full text-right p-3 rounded-xl border transition-colors',
                !picked && 'bg-white/3 border-white/10 hover:border-[#D4A853]/30',
                isCorrect && 'bg-emerald-500/15 border-emerald-500/50',
                isWrong && 'bg-red-500/15 border-red-500/50',
                picked && !isCorrect && !isWrong && 'opacity-40',
              )}
            >
              <p className="text-lg font-arabic leading-loose" dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>
                {c.arabic}
              </p>
            </button>
          );
        })}
      </div>
      {picked && (
        <button onClick={next} className="w-full py-2.5 rounded-lg bg-[#4FB892]/20 border border-[#4FB892]/40 text-[#4FB892] font-medium flex items-center justify-center gap-1.5">
          {idx + 2 < lines.length ? 'Next' : 'Finish'} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
