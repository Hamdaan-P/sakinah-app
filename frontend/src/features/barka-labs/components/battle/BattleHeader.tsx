/**
 * Top portion of the battle UI: timer, progress bar, and per-side scores.
 */

import { motion } from 'framer-motion';
import { Timer, Sword } from '@phosphor-icons/react';

interface BattleHeaderProps {
  timeLeft: number;
  myCount: number;
  opponentCount: number;
}

export function BattleHeader({ timeLeft, myCount, opponentCount }: BattleHeaderProps) {
  const timerColor = timeLeft <= 10 ? '#FF4444' : timeLeft <= 30 ? '#FF6B35' : '#D7B56A';

  return (
    <>
      {/* Timer Bar */}
      <div className="flex items-center justify-center gap-2 py-3 sm:py-4">
        <Timer size={18} weight="fill" style={{ color: timerColor }} />
        <motion.span
          key={timeLeft}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-2xl sm:text-3xl font-bold tabular-nums"
          style={{
            color: timerColor,
            fontFamily: 'Cormorant Garamond, serif',
          }}
        >
          {timeLeft}s
        </motion.span>
      </div>

      {/* Progress bar */}
      <div className="mx-4 h-1 rounded-full" style={{ backgroundColor: 'rgba(215,181,106,0.1)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: timerColor }}
          initial={{ width: '100%' }}
          animate={{ width: `${(timeLeft / 60) * 100}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>

      {/* Split Screen Scores */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 sm:py-3">
        <div className="text-center">
          <span className="text-2xl font-bold text-[#D7B56A]">{myCount}</span>
          <p className="text-[10px] text-[#7F8A9A]">You</p>
        </div>
        <Sword size={24} className="text-[#7F8A9A]" />
        <div className="text-center">
          <span className="text-2xl font-bold text-[#4A9EFF]">{opponentCount}</span>
          <p className="text-[10px] text-[#7F8A9A]">Opponent</p>
        </div>
      </div>
    </>
  );
}
