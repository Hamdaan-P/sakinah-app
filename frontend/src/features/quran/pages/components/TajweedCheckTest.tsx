/**
 * Tajweed-check test extracted from QuranTestPage.
 */

import { useEffect, useRef, useState } from 'react';
import { Check, Info, Play as PlayIcon, X } from '@phosphor-icons/react';
import type { HifzSession, QuranLine } from '../../types/quran.types';
import { fetchLinesWithWords, getAyahAudioUrl } from '../../services/quranApiService';
import { TajweedText, TajweedLegend } from '../../components/TajweedText';
import { pushCorrect, pushMistake } from '../../services/hifzEngine';

interface Props {
  session: HifzSession;
  setSession: (s: HifzSession) => void;
  lines: QuranLine[];
  onFinish: (s: HifzSession) => void;
}

export function TajweedCheckTest({ session, setSession, lines, onFinish }: Props) {
  const [idx, setIdx] = useState(0);
  const [tajweedByKey, setTajweedByKey] = useState<Record<string, string | undefined>>({});
  const [legendOpen, setLegendOpen] = useState(false);

  // Fetch tajweed text once (cheaper than pre-fetching every ayah upstream)
  useEffect(() => {
    if (lines.length === 0) return;
    const surahId = parseInt(lines[0].verseKey.split(':')[0], 10);
    if (!Number.isFinite(surahId)) return;
    (async () => {
      const { lines: tlines } = await fetchLinesWithWords(surahId);
      const map: Record<string, string | undefined> = {};
      for (const l of tlines) map[l.verseKey] = l.arabicTajweed;
      setTajweedByKey(map);
    })().catch(() => {});
  }, [lines]);

  const active = lines[idx];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const play = () => {
    audioRef.current?.pause();
    const a = new Audio(getAyahAudioUrl(active.verseKey));
    audioRef.current = a;
    a.play().catch(() => {});
  };

  const rate = (ok: boolean) => {
    if (ok) setSession(pushCorrect(session));
    else setSession(pushMistake(session, { verseKey: active.verseKey, type: 'pronunciation', expected: active.arabic }));
    if (idx + 1 < lines.length) setIdx(idx + 1);
    else onFinish(session);
  };

  return (
    <div className="px-4 py-5 space-y-4 pb-28">
      <div className="flex items-center justify-between text-[11px] text-white/40">
        <span>Ayah {idx + 1} / {lines.length}</span>
        <span>{active.verseKey}</span>
      </div>

      <div className="rounded-xl border border-[#D4A853]/20 bg-white/3 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] uppercase tracking-wide text-white/40">Tajweed-colored ayah</p>
          <button onClick={() => setLegendOpen((v) => !v)} className="flex items-center gap-1 text-[11px] text-[#D4A853]">
            <Info size={12} /> {legendOpen ? 'Hide' : 'Show'} legend
          </button>
        </div>
        <TajweedText
          html={tajweedByKey[active.verseKey]}
          fallback={active.arabic}
          className="text-2xl text-right leading-loose"
          fontSize={28}
          lineHeight={2.4}
        />
        {legendOpen && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <TajweedLegend />
          </div>
        )}
      </div>

      <button
        onClick={play}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#4FB892]/15 border border-[#4FB892]/30 text-[#4FB892] text-sm font-medium"
      >
        <PlayIcon size={16} weight="fill" /> Play reference recitation
      </button>

      <p className="text-center text-xs text-white/60">
        Listen, compare to your recitation, then self-rate this ayah.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => rate(false)}
          className="flex-1 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-medium"
        >
          <X size={14} weight="bold" className="inline mr-1" /> Needs work
        </button>
        <button
          onClick={() => rate(true)}
          className="flex-1 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium"
        >
          <Check size={14} weight="bold" className="inline mr-1" /> Correct
        </button>
      </div>
    </div>
  );
}
