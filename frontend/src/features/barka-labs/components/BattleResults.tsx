/**
 * Battle Results — Post-battle scoring reveal with winner announcement
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { useAuthStore } from '@/core/stores/auth.store';
import type { BattleData } from '../types/barka-labs.types';
import { WinnerBanner } from './battle-results/WinnerBanner';
import { BlessingList } from './battle-results/BlessingList';

interface BattleResultsProps {
  battle: BattleData;
  onClose: () => void;
}

export function BattleResults({ battle, onClose }: BattleResultsProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const [revealPhase, setRevealPhase] = useState(0);

  const isChallenger = userId === battle.challenger_id;
  const myBlessings = isChallenger ? battle.challenger_blessings : battle.opponent_blessings;
  const theirBlessings = isChallenger ? battle.opponent_blessings : battle.challenger_blessings;
  const myScore = isChallenger ? battle.challenger_score : battle.opponent_score;
  const theirScore = isChallenger ? battle.opponent_score : battle.challenger_score;
  const iWon = battle.winner_id === userId;
  const isTie = !battle.winner_id;
  const myDnz = userId ? (battle.dnz_awarded[userId] || 0) : 0;

  // Phased reveal: 0=scores, 1=blessings, 2=winner
  useEffect(() => {
    const t1 = setTimeout(() => setRevealPhase(1), 800);
    const t2 = setTimeout(() => setRevealPhase(2), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9998] flex items-start justify-center overflow-y-auto"
      style={{ backgroundColor: 'rgba(15,23,36,0.95)' }}
    >
      <button
        onClick={onClose}
        className="fixed right-4 z-[9999] p-2 rounded-full text-[#7F8A9A] hover:text-[#EBDCB8]"
        style={{ top: 'calc(env(safe-area-inset-top) + 1rem)', backgroundColor: 'rgba(36,50,70,0.8)' }}
      >
        <X size={20} />
      </button>

      <div className="max-w-lg w-full px-3 py-6 sm:px-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Winner Banner */}
        <AnimatePresence>
          {revealPhase >= 2 && (
            <WinnerBanner iWon={iWon} isTie={isTie} myDnz={myDnz} />
          )}
        </AnimatePresence>

        {/* Score Comparison */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between rounded-xl p-4"
          style={{
            backgroundColor: 'rgba(36,50,70,0.5)',
            border: '1px solid rgba(215,181,106,0.15)',
          }}
        >
          <div className="text-center flex-1">
            <p className="text-2xl sm:text-3xl font-bold text-[#D7B56A]">{myScore}</p>
            <p className="text-xs text-[#7F8A9A]">Your Score</p>
            <p className="text-[10px] text-[#7F8A9A]">{myBlessings.length} blessings</p>
          </div>
          <div className="text-base sm:text-lg text-[#7F8A9A] font-light">vs</div>
          <div className="text-center flex-1">
            <p className="text-2xl sm:text-3xl font-bold text-[#4A9EFF]">{theirScore}</p>
            <p className="text-xs text-[#7F8A9A]">Opponent</p>
            <p className="text-[10px] text-[#7F8A9A]">{theirBlessings.length} blessings</p>
          </div>
        </motion.div>

        {/* Your Blessings (scored) */}
        {revealPhase >= 1 && (
          <BlessingList title="Your Blessings" blessings={myBlessings} ownerKey="me" />
        )}

        {/* Opponent's Blessings */}
        {revealPhase >= 1 && (
          <BlessingList title="Opponent's Blessings" blessings={theirBlessings} ownerKey="them" baseDelay={0.5} />
        )}

        {/* Close */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          onClick={onClose}
          className="w-full py-3 rounded-xl text-sm font-medium text-[#D7B56A]"
          style={{ backgroundColor: 'rgba(215,181,106,0.1)', border: '1px solid rgba(215,181,106,0.2)' }}
        >
          Back to Barakah Labs
        </motion.button>
      </div>
    </motion.div>
  );
}
