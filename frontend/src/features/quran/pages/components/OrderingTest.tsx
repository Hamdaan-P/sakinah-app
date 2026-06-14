/**
 * Ayah-ordering Hifz test extracted from QuranTestPage.
 */

import { useState } from 'react';
import { ArrowsVertical } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { HifzSession, QuranLine } from '../../types/quran.types';
import { pushCorrect, pushMistake } from '../../services/hifzEngine';

interface Props {
  session: HifzSession;
  setSession: (s: HifzSession) => void;
  lines: QuranLine[];
  onFinish: (s: HifzSession) => void;
}

export function OrderingTest({ session, setSession, lines, onFinish }: Props) {
  const [order, setOrder] = useState<QuranLine[]>(() => [...lines].sort(() => Math.random() - 0.5));
  const [checked, setChecked] = useState(false);

  const move = (from: number, to: number) => {
    if (checked) return;
    if (to < 0 || to >= order.length) return;
    const copy = [...order];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    setOrder(copy);
  };

  const submit = () => {
    let correct = 0;
    for (let i = 0; i < order.length; i++) {
      if (order[i].verseKey === lines[i].verseKey) correct += 1;
      else setSession(pushMistake(session, { verseKey: lines[i].verseKey, type: 'order', expected: lines[i].arabic, actual: order[i].arabic }));
    }
    for (let i = 0; i < correct; i++) setSession(pushCorrect(session));
    setChecked(true);
  };

  return (
    <div className="px-4 py-5 space-y-3 pb-28">
      <p className="text-xs text-white/60 text-center">Drag (or use arrows) to reorder these ayahs correctly.</p>
      {order.map((line, i) => {
        const correctPos = lines.findIndex((l) => l.verseKey === line.verseKey);
        const isCorrect = checked && correctPos === i;
        const isWrong = checked && correctPos !== i;
        return (
          <div
            key={line.verseKey}
            className={cn(
              'flex items-center gap-2 rounded-xl border p-3',
              !checked && 'bg-white/3 border-white/10',
              isCorrect && 'bg-emerald-500/15 border-emerald-500/50',
              isWrong && 'bg-red-500/15 border-red-500/50',
            )}
          >
            <div className="flex flex-col gap-0.5">
              <button onClick={() => move(i, i - 1)} disabled={checked || i === 0} className="p-1 rounded bg-white/5 disabled:opacity-30">
                <ArrowsVertical size={12} className="rotate-180 text-white/60" />
              </button>
              <button onClick={() => move(i, i + 1)} disabled={checked || i === order.length - 1} className="p-1 rounded bg-white/5 disabled:opacity-30">
                <ArrowsVertical size={12} className="text-white/60" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-arabic text-right leading-loose truncate" dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>
                {line.arabic}
              </p>
            </div>
          </div>
        );
      })}
      {!checked ? (
        <button onClick={submit} className="w-full py-2.5 rounded-lg bg-[#D4A853]/20 border border-[#D4A853]/40 text-[#D4A853] font-medium">
          Check order
        </button>
      ) : (
        <button onClick={() => onFinish(session)} className="w-full py-2.5 rounded-lg bg-[#4FB892]/20 border border-[#4FB892]/40 text-[#4FB892] font-medium">
          Finish
        </button>
      )}
    </div>
  );
}
