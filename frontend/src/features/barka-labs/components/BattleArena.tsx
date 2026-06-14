/**
 * Battle Arena — 60-second split screen real-time blessing battle
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/core/stores/auth.store';
import * as api from '../services/barkaLabsService';
import type { BattleData } from '../types/barka-labs.types';
import { BattleCountdownOverlay } from './battle/BattleCountdownOverlay';
import { BattleEndedOverlay } from './battle/BattleEndedOverlay';
import { BattleInputBar } from './battle/BattleInputBar';
import { BattleHeader } from './battle/BattleHeader';

interface BattleArenaProps {
  battle: BattleData;
  onBattleEnd: (result: BattleData) => void;
}

export function BattleArena({ battle, onBattleEnd }: BattleArenaProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const [timeLeft, setTimeLeft] = useState(60);
  const [text, setText] = useState('');
  const [myBlessings, setMyBlessings] = useState<string[]>([]);
  const [opponentCount, setOpponentCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<'countdown' | 'active' | 'ended'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isChallenger = userId === battle.challenger_id;

  // Initial 3-2-1 countdown
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('active');
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, phase]);

  // 60-second timer
  useEffect(() => {
    if (phase !== 'active') return;
    if (timeLeft <= 0) {
      setPhase('ended');
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase]);

  // Focus input when active
  useEffect(() => {
    if (phase === 'active' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase]);

  // Poll for opponent's count
  useEffect(() => {
    if (phase !== 'active') return;
    pollRef.current = setInterval(async () => {
      try {
        const updated = await api.getBattle(battle.battle_id);
        const oppField = isChallenger ? 'opponent_blessings' : 'challenger_blessings';
        setOpponentCount(updated[oppField].length);
      } catch {
        // Ignore poll errors
      }
    }, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [phase, battle.battle_id, isChallenger]);

  // Finalize when ended
  useEffect(() => {
    if (phase !== 'ended') return;
    if (pollRef.current) clearInterval(pollRef.current);

    const finalize = async () => {
      try {
        const result = await api.finalizeBattle(battle.battle_id);
        onBattleEnd(result);
      } catch {
        // Other player may have already finalized
        try {
          const result = await api.getBattle(battle.battle_id);
          if (result.status === 'completed') onBattleEnd(result);
        } catch { /* ignore */ }
      }
    };
    finalize();
  }, [phase, battle.battle_id, onBattleEnd]);

  const handleSubmit = useCallback(async () => {
    if (!text.trim() || submitting || phase !== 'active' || !userId) return;
    const blessing = text.trim();
    setText('');
    setSubmitting(true);
    setMyBlessings((prev) => [...prev, blessing]);
    try {
      await api.submitBattleBlessing(battle.battle_id, userId, blessing);
    } catch {
      // Already added locally for UX
    } finally {
      setSubmitting(false);
      inputRef.current?.focus();
    }
  }, [text, submitting, phase, userId, battle.battle_id]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 3-2-1 Countdown overlay
  if (phase === 'countdown') {
    return <BattleCountdownOverlay countdown={countdown} />;
  }

  return (
    <div className="fixed inset-0 z-[9998] flex flex-col" style={{ backgroundColor: 'rgba(15,23,36,0.98)' }}>
      <BattleHeader timeLeft={timeLeft} myCount={myBlessings.length} opponentCount={opponentCount} />

      {/* My blessings list */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-2">
        <AnimatePresence>
          {myBlessings.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              className="px-3 py-2 rounded-lg text-sm text-[#EBDCB8]"
              style={{
                backgroundColor: 'rgba(215,181,106,0.08)',
                border: '1px solid rgba(215,181,106,0.1)',
              }}
            >
              {b}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      {phase === 'active' && (
        <BattleInputBar
          ref={inputRef}
          text={text}
          submitting={submitting}
          onChange={setText}
          onKeyDown={handleKeyDown}
          onSubmit={handleSubmit}
        />
      )}

      {/* Ended overlay */}
      {phase === 'ended' && <BattleEndedOverlay />}
    </div>
  );
}
