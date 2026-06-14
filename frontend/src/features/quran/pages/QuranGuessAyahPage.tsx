/**
 * Guess the Ayah — quick-fire game where the user sees a verse (Arabic +
 * translation) and picks the right surah from 4 choices. Builds Quran
 * literacy and is genuinely fun. Best score persisted locally.
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, GameController, Trophy, ArrowsClockwise, Spinner, CheckCircle, XCircle } from '@phosphor-icons/react';
import { fetchSurahs, fetchVerse } from '../services/quranApiService';
import type { Surah, QuranLine } from '../types/quran.types';
import { trackFeature } from '@/lib/analytics';

const ROUNDS = 7;
const HIGH_SCORE_KEY = 'quran_guess_ayah_best';

interface Round {
  verse: QuranLine;
  correctSurahId: number;
  correctSurahName: string;
  choices: { id: number; name: string }[];
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length > 0) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

async function buildRound(surahs: Surah[]): Promise<Round | null> {
  const correct = surahs[Math.floor(Math.random() * surahs.length)];
  const ayahNumber = Math.max(1, Math.floor(Math.random() * Math.min(7, correct.versesCount)));
  const verse = await fetchVerse(correct.id, ayahNumber);
  if (!verse) return null;
  const wrong = pickRandom(surahs.filter((s) => s.id !== correct.id), 3);
  const choices = [
    { id: correct.id, name: correct.nameSimple },
    ...wrong.map((s) => ({ id: s.id, name: s.nameSimple })),
  ];
  // Shuffle choices
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return {
    verse,
    correctSurahId: correct.id,
    correctSurahName: correct.nameSimple,
    choices,
  };
}

export function QuranGuessAyahPage() {
  useEffect(() => { trackFeature('quran_guess_ayah'); }, []);
  const navigate = useNavigate();

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [round, setRound] = useState<Round | null>(null);
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [bestScore, setBestScore] = useState<number>(() => {
    const v = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0');
    return Number.isFinite(v) ? v : 0;
  });

  // Load surahs once
  useEffect(() => {
    fetchSurahs().then(setSurahs).catch(() => {});
  }, []);

  const nextRound = useCallback(async () => {
    if (surahs.length === 0) return;
    setBusy(true);
    setPicked(null);
    const r = await buildRound(surahs);
    setRound(r);
    setBusy(false);
  }, [surahs]);

  // Kick off first round once surahs load
  useEffect(() => {
    if (surahs.length > 0 && !round) void nextRound();
  }, [surahs, round, nextRound]);

  const handlePick = (id: number) => {
    if (picked !== null || !round) return;
    setPicked(id);
    if (id === round.correctSurahId) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = async () => {
    if (roundIdx + 1 >= ROUNDS) {
      setDone(true);
      // Save best
      const finalScore = score;
      if (finalScore > bestScore) {
        localStorage.setItem(HIGH_SCORE_KEY, String(finalScore));
        setBestScore(finalScore);
      }
      return;
    }
    setRoundIdx((i) => i + 1);
    await nextRound();
  };

  const restart = () => {
    setRoundIdx(0);
    setScore(0);
    setPicked(null);
    setDone(false);
    void nextRound();
  };

  const arabic = round?.verse.arabic || '';
  const translation = round?.verse.translation || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] pb-24">
      <div className="sticky top-0 z-10 bg-[#0A0E16]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white/70" />
          </button>
          <div className="flex items-center gap-2">
            <GameController size={16} weight="fill" className="text-[#D4A853]" />
            <h1 className="text-sm font-semibold text-white">Guess the Ayah</h1>
          </div>
          <div className="flex items-center gap-1">
            <Trophy size={12} weight="fill" className="text-amber-400" />
            <span className="text-[11px] text-white/70 font-semibold">{bestScore}</span>
          </div>
        </div>
      </div>

      {/* Score strip */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between rounded-xl bg-white/3 border border-white/8 px-4 py-3">
          <span className="text-[11px] uppercase tracking-wide text-white/50 font-semibold">
            Round {Math.min(roundIdx + 1, ROUNDS)} / {ROUNDS}
          </span>
          <span className="text-base font-bold text-[#D4A853]">{score}</span>
        </div>
      </div>

      {/* Game */}
      <div className="px-4 mt-5">
        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-gradient-to-br from-[#D4A853]/15 to-[#0F141F]/30 border border-[#D4A853]/30 p-8 text-center"
          >
            <Trophy size={48} weight="fill" className="text-amber-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-white mb-1">{score} / {ROUNDS}</p>
            <p className="text-sm text-white/60 mb-1">
              {score === ROUNDS ? 'Perfect score! 🎉'
                : score >= 5 ? 'Great recall!'
                : score >= 3 ? 'Nice work — keep practising'
                : 'A good Quran companion to study from'}
            </p>
            {score > bestScore && score === ROUNDS && (
              <p className="text-xs text-[#D4A853]">New best score!</p>
            )}
            <button
              onClick={restart}
              className="mt-5 w-full py-3 rounded-xl bg-[#D4A853] text-[#0A0E16] text-sm font-semibold hover:bg-[#E8C97A] transition-colors flex items-center justify-center gap-2"
            >
              <ArrowsClockwise size={14} weight="bold" /> Play again
            </button>
          </motion.div>
        ) : busy || !round ? (
          <div className="space-y-3">
            <div className="h-32 rounded-xl bg-white/5 animate-pulse" />
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />)}
            </div>
          </div>
        ) : (
          <motion.div
            key={roundIdx}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          >
            {/* Verse card */}
            <div className="rounded-2xl bg-gradient-to-br from-[#D4A853]/8 to-[#0F141F]/30 border border-[#D4A853]/20 p-5 mb-5">
              <p className="text-[10px] uppercase tracking-wider text-[#D4A853]/85 font-semibold mb-3">Which surah is this from?</p>
              <p
                dir="rtl"
                className="font-arabic text-right text-[#F5E8C7] leading-[2] text-xl mb-3"
              >
                {arabic}
              </p>
              {translation && (
                <p className="text-xs text-white/60 italic">
                  "{translation.replace(/<[^>]+>/g, '')}"
                </p>
              )}
            </div>

            {/* Choices */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {round.choices.map((c) => {
                const isCorrect = c.id === round.correctSurahId;
                const isPicked = picked === c.id;
                const showResult = picked !== null;
                return (
                  <button
                    key={c.id}
                    onClick={() => handlePick(c.id)}
                    disabled={showResult}
                    className={`p-3 rounded-xl text-sm font-medium transition-all border ${
                      showResult
                        ? isCorrect
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                          : isPicked
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-200'
                          : 'bg-white/3 border-white/10 text-white/40'
                        : 'bg-white/5 border-white/10 text-white/85 hover:bg-white/10 hover:border-[#D4A853]/30 active:scale-95'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {showResult && isCorrect && <CheckCircle size={14} weight="fill" />}
                      {showResult && isPicked && !isCorrect && <XCircle size={14} weight="fill" />}
                      <span>{c.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {picked !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="rounded-xl bg-white/3 border border-white/8 p-3 mb-3"
                >
                  <p className="text-xs text-white/70">
                    {picked === round.correctSurahId
                      ? <>Correct — <span className="text-emerald-300 font-semibold">Surah {round.correctSurahName}</span></>
                      : <>The answer is <span className="text-[#D4A853] font-semibold">Surah {round.correctSurahName}</span></>
                    } · {round.verse.verseKey}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {picked !== null && (
              <button
                onClick={handleNext}
                className="w-full py-3 rounded-xl bg-[#D4A853] text-[#0A0E16] text-sm font-semibold flex items-center justify-center gap-2"
              >
                {busy && <Spinner size={14} className="animate-spin" />}
                {roundIdx + 1 >= ROUNDS ? 'See result' : 'Next ayah'}
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default QuranGuessAyahPage;
