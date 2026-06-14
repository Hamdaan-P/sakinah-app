/**
 * Battle Lobby — Create or join a 1v1 blessing battle
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sword, Copy, Check, Lightning, Spinner } from '@phosphor-icons/react';
import { useAuthStore } from '@/core/stores/auth.store';
import * as api from '../services/barkaLabsService';
import type { BattleData } from '../types/barka-labs.types';

interface BattleLobbyProps {
  onBattleReady: (battle: BattleData) => void;
}

export function BattleLobby({ onBattleReady }: BattleLobbyProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!userId) return;
    setCreating(true);
    setError('');
    try {
      const battle = await api.createBattle(userId);
      setInviteCode(battle.battle_id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async () => {
    if (!userId || !joinCode.trim()) return;
    setJoining(true);
    setError('');
    try {
      const battle = await api.acceptBattle(joinCode.trim(), userId);
      onBattleReady(battle);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setJoining(false);
    }
  };

  // Poll for opponent when we have an invite code
  const handleCheckOpponent = async () => {
    if (!inviteCode) return;
    try {
      const battle = await api.getBattle(inviteCode);
      if (battle.status === 'active') {
        onBattleReady(battle);
      }
    } catch {
      // Still waiting
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,107,53,0.15)' }}
        >
          <Sword size={22} weight="duotone" className="text-[#FF6B35]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#EBDCB8]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Blessing Battle
          </h2>
          <p className="text-xs text-[#7F8A9A]">
            60 seconds. Who sees more blessings?
          </p>
        </div>
      </div>

      {/* Create Battle */}
      {!inviteCode ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreate}
          disabled={creating}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all"
          style={{
            backgroundColor: 'rgba(255,107,53,0.15)',
            border: '1px solid rgba(255,107,53,0.3)',
            color: '#FF6B35',
          }}
        >
          {creating ? <Spinner size={16} className="animate-spin" /> : <Lightning size={16} weight="fill" />}
          {creating ? 'Creating...' : 'Create Battle'}
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 space-y-3"
          style={{
            backgroundColor: 'rgba(36,50,70,0.5)',
            border: '1px solid rgba(215,181,106,0.2)',
          }}
        >
          <p className="text-xs text-[#A7B1C0]">Share this code with your opponent:</p>
          <div className="flex items-center gap-2">
            <code
              className="flex-1 px-3 py-2 rounded-lg text-lg font-mono text-center tracking-widest text-[#D7B56A]"
              style={{ backgroundColor: 'rgba(215,181,106,0.1)' }}
            >
              {inviteCode}
            </code>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'rgba(215,181,106,0.1)' }}
            >
              {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="text-[#D7B56A]" />}
            </button>
          </div>
          <button
            onClick={handleCheckOpponent}
            className="w-full text-center text-xs text-[#7F8A9A] hover:text-[#A7B1C0] py-2"
          >
            Waiting for opponent... (tap to check)
          </button>
        </motion.div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(215,181,106,0.1)' }} />
        <span className="text-xs text-[#7F8A9A]">or</span>
        <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(215,181,106,0.1)' }} />
      </div>

      {/* Join Battle */}
      <div className="space-y-2">
        <input
          type="text"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.trim())}
          placeholder="Enter battle code"
          className="w-full px-4 py-2.5 rounded-xl text-sm text-[#EBDCB8] placeholder-[#7F8A9A] bg-transparent outline-none"
          style={{ border: '1px solid rgba(215,181,106,0.15)' }}
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleJoin}
          disabled={joining || !joinCode.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
          style={{
            backgroundColor: 'rgba(215,181,106,0.12)',
            border: '1px solid rgba(215,181,106,0.2)',
            color: '#D7B56A',
          }}
        >
          {joining ? <Spinner size={16} className="animate-spin" /> : <Sword size={16} />}
          {joining ? 'Joining...' : 'Join Battle'}
        </motion.button>
      </div>

      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}

      {/* Quran verse */}
      <p className="text-center text-[10px] text-[#7F8A9A] italic">
        &ldquo;So race to all that is good.&rdquo; — Surah Al-Baqarah 2:148
      </p>
    </div>
  );
}
