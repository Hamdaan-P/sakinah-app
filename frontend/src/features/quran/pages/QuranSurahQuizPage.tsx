/**
 * QuranSurahQuizPage — end-of-surah comprehension quiz.
 *
 * A short multiple-choice quiz (typically 5 questions) checking what the
 * reader understood of the surah they just finished. Questions come from
 * `GET /quran/surah/:id/quiz` — AI-generated and grounded in the verified
 * surah summary, so the AiDisclaimerBanner is mandatory here.
 *
 * Interaction mirrors "Guess the Ayah": pick → lock → reveal correct/wrong +
 * explanation → next. Best score is persisted per surah.
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, ArrowsClockwise, CheckCircle, XCircle, Brain } from '@phosphor-icons/react';
import {
  fetchSurahQuiz,
  getQuizBest,
  recordQuizScore,
  type SurahQuiz,
} from '../services/quizService';
import { AiDisclaimerBanner } from '../components/governance/AiDisclaimerBanner';
import { trackFeature } from '@/lib/analytics';

export function QuranSurahQuizPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const surahId = parseInt(id ?? '', 10);

  useEffect(() => { trackFeature('quran_surah_quiz'); }, []);

  const [quiz, setQuiz] = useState<SurahQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(0);
  const [newBest, setNewBest] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(surahId)) {
      setError('Invalid surah id');
      setLoading(false);
      return;
    }
    setBest(getQuizBest(surahId));
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchSurahQuiz(surahId)
      .then((r) => { if (!cancelled) setQuiz(r); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [surahId]);

  const questions = quiz?.questions ?? [];
  const total = questions.length;
  const current = questions[qIdx] ?? null;

  const handlePick = (optionIdx: number) => {
    if (picked !== null || !current) return;
    setPicked(optionIdx);
    if (optionIdx === current.answer_index) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (qIdx + 1 >= total) {
      setDone(true);
      setNewBest(recordQuizScore(surahId, score));
      setBest((b) => Math.max(b, score));
      return;
    }
    setQIdx((i) => i + 1);
    setPicked(null);
  };

  const restart = useCallback(() => {
    setQIdx(0);
    setPicked(null);
    setScore(0);
    setDone(false);
    setNewBest(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] pb-24 text-[#F5E8C7]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A0E16]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-4 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white/70" />
          </button>
          <div className="flex items-center gap-2">
            <Brain size={16} weight="fill" className="text-[#D4A853]" />
            <h1 className="text-sm font-semibold text-white">
              {quiz?.name_english ? `${quiz.name_english} Quiz` : `Surah ${surahId} Quiz`}
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <Trophy size={12} weight="fill" className="text-amber-400" />
            <span className="text-[11px] text-white/70 font-semibold">{best}</span>
          </div>
        </div>
      </div>

      <main className="px-4 pt-4 max-w-2xl mx-auto">
        <AiDisclaimerBanner className="mb-4" />

        {loading && (
          <div className="space-y-3" aria-busy="true">
            <div className="h-28 rounded-xl bg-white/5 animate-pulse" />
            <div className="grid gap-2">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />)}
            </div>
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-[#D4A853]">Could not load the quiz: {error}</p>
        )}

        {!loading && !error && total === 0 && (
          <div className="rounded-xl border border-[#D7B56A]/25 bg-[#D7B56A]/5 p-6 space-y-2">
            <p className="text-base text-[#EBDCB8] font-semibold">Quiz coming soon to this surah</p>
            <p className="text-sm text-[#A7B1C0] leading-relaxed">
              Comprehension quizzes are written and reviewed one surah at a time.
              This surah isn't ready yet — in the meantime you can explore its
              Depth FAQs or ask Raya. Check back soon.
            </p>
          </div>
        )}

        {/* Result */}
        {!loading && !error && done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-gradient-to-br from-[#D4A853]/15 to-[#0F141F]/30 border border-[#D4A853]/30 p-8 text-center"
          >
            <Trophy size={48} weight="fill" className="text-amber-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-white mb-1">{score} / {total}</p>
            <p className="text-sm text-white/60 mb-1">
              {score === total ? 'Perfect — mashaʾAllah!'
                : score >= Math.ceil(total * 0.6) ? 'Strong understanding.'
                : 'A good reason to revisit the surah.'}
            </p>
            {newBest && <p className="text-xs text-[#D4A853]">New best score!</p>}
            <div className="mt-5 grid gap-2">
              <button
                type="button"
                onClick={restart}
                className="w-full py-3 rounded-xl bg-[#D4A853] text-[#0A0E16] text-sm font-semibold hover:bg-[#E8C97A] transition-colors flex items-center justify-center gap-2"
              >
                <ArrowsClockwise size={14} weight="bold" /> Try again
              </button>
              <button
                type="button"
                onClick={() => navigate(`/quran/read?surah=${surahId}`)}
                className="w-full py-3 rounded-xl border border-white/10 bg-white/5 text-white/80 text-sm font-medium hover:bg-white/10"
              >
                Back to the surah
              </button>
            </div>
          </motion.div>
        )}

        {/* Active question */}
        {!loading && !error && !done && current && (
          <>
            <div className="flex items-center justify-between rounded-xl bg-white/3 border border-white/8 px-4 py-3 mb-4">
              <span className="text-[11px] uppercase tracking-wide text-white/50 font-semibold">
                Question {qIdx + 1} / {total}
              </span>
              <span className="text-base font-bold text-[#D4A853]">{score}</span>
            </div>

            <motion.div key={qIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="rounded-2xl bg-gradient-to-br from-[#D4A853]/8 to-[#0F141F]/30 border border-[#D4A853]/20 p-5 mb-5">
                <p className="text-base text-white leading-relaxed">{current.prompt}</p>
              </div>

              <div className="grid gap-2 mb-5">
                {current.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === current.answer_index;
                  const isPicked = picked === optIdx;
                  const showResult = picked !== null;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handlePick(optIdx)}
                      disabled={showResult}
                      className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all border ${
                        showResult
                          ? isCorrect
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                            : isPicked
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-200'
                            : 'bg-white/3 border-white/10 text-white/40'
                          : 'bg-white/5 border-white/10 text-white/85 hover:bg-white/10 hover:border-[#D4A853]/30 active:scale-[0.99]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {showResult && isCorrect && <CheckCircle size={16} weight="fill" className="shrink-0" />}
                        {showResult && isPicked && !isCorrect && <XCircle size={16} weight="fill" className="shrink-0" />}
                        <span>{opt}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {picked !== null && current.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="rounded-xl bg-white/3 border border-white/8 p-3 mb-3"
                  >
                    <p className="text-xs text-white/70 leading-relaxed">{current.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {picked !== null && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-3 rounded-xl bg-[#D4A853] text-[#0A0E16] text-sm font-semibold"
                >
                  {qIdx + 1 >= total ? 'See result' : 'Next question'}
                </button>
              )}
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}

export default QuranSurahQuizPage;
