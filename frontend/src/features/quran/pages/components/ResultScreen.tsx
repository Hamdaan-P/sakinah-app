/**
 * Final results screen for QuranTestPage.
 */

import { motion } from 'framer-motion';
import type { HifzSession } from '../../types/quran.types';

interface Props {
  session: HifzSession;
  onRetry: () => void;
  onClose: () => void;
}

export function ResultScreen({ session, onRetry, onClose }: Props) {
  const acc = Math.round(session.accuracy * 100);
  return (
    <div className="px-4 py-8">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl border border-[#D4A853]/30 bg-gradient-to-br from-[#D4A853]/10 to-transparent p-6 text-center">
        <p className="text-[10px] uppercase tracking-wide text-white/40">Session complete</p>
        <p className="text-5xl font-bold text-[#D4A853] mt-2">{acc}%</p>
        <p className="text-sm text-white/60 mt-1">{session.correctCount} correct · {session.mistakeCount} mistake{session.mistakeCount === 1 ? '' : 's'} · {session.hintsUsed} hint{session.hintsUsed === 1 ? '' : 's'}</p>
      </motion.div>

      {session.mistakes.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs uppercase tracking-wide text-white/60 mb-2">Ayahs to review</h3>
          <div className="space-y-1.5">
            {session.mistakes.slice(0, 6).map((m, i) => (
              <div key={i} className="rounded-lg border border-red-500/20 bg-red-500/5 p-2.5">
                <p className="text-[11px] text-red-300">{m.verseKey} · {m.type}</p>
                <p className="text-sm font-arabic text-right mt-1 text-white/80" dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>
                  {m.expected}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-6">
        <button onClick={onRetry} className="flex-1 py-2.5 rounded-lg bg-white/5 text-white/70 font-medium">
          Retake
        </button>
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-[#D4A853]/20 text-[#D4A853] font-medium border border-[#D4A853]/40">
          Done
        </button>
      </div>
    </div>
  );
}
