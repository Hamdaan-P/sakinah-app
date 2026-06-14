/**
 * Raya's One Wish — a single heartfelt sentence Raya wishes for the user.
 * Appears at the top of the profile.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkle, ArrowClockwise } from '@phosphor-icons/react';
import { useAuthStore } from '@/core/stores/auth.store';
import { authPost } from '@/lib/api';
import {
  CACHE_KEY_WISH,
  CACHE_KEY_NICKNAME,
  readCache,
  writeCache,
  loadKyc,
  buildRequest,
} from './raya-wish/_rayaWishData';

export function RayaWish({ userName }: { userName: string }) {
  const { user } = useAuthStore();
  const [wish, setWish] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasTried, setHasTried] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const cached = readCache(CACHE_KEY_WISH, user.id);
    if (cached) {
      setWish(cached);
      return;
    }
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function generate() {
    if (!user?.id || loading) return;
    setLoading(true);
    setHasTried(true);
    try {
      const kyc = await loadKyc(user.id);
      if (!kyc.full_name && !kyc.iman_level && !kyc.pascoArchetype) {
        setLoading(false);
        return;
      }
      const result = await authPost<{ wish: string }>(
        `/profile/one-wish/${user.id}`,
        buildRequest(kyc, userName),
        30000,
      );
      if (result.wish) {
        setWish(result.wish);
        writeCache(CACHE_KEY_WISH, user.id, result.wish);
      }
    } catch (e) {
      console.error('Wish generation failed:', e);
    } finally {
      setLoading(false);
    }
  }

  if (!wish && !loading && hasTried) return null;
  if (!wish && !loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative rounded-2xl p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(212,168,83,0.1), rgba(167,139,250,0.06))',
        border: '1px solid rgba(212,168,83,0.2)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(212,168,83,0.25), rgba(212,168,83,0.1))',
            border: '1px solid rgba(212,168,83,0.3)',
          }}
        >
          <Sparkle size={14} weight="fill" className="text-[#D4A853]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#5C5749] text-[10px] uppercase tracking-widest mb-1">Raya's Wish For You</p>
          {loading ? (
            <div className="flex items-center gap-2 py-1">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              >
                <Sparkle size={12} className="text-[#D4A853]/60" />
              </motion.div>
              <p className="text-[#7A7363] text-[12px]">Thinking about you...</p>
            </div>
          ) : (
            <p
              className="text-[#F5E8C7] text-[15px] leading-[1.5]"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
            >
              {wish}
            </p>
          )}
        </div>
        {wish && !loading && (
          <button
            onClick={generate}
            className="p-1.5 rounded-lg text-[#5C5749] hover:text-[#D4A853] hover:bg-[#D4A853]/10 transition-colors flex-shrink-0"
            title="New wish"
          >
            <ArrowClockwise size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function RayaNickname({ userName }: { userName: string }) {
  const { user } = useAuthStore();
  const [nickname, setNickname] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const cached = readCache(CACHE_KEY_NICKNAME, user.id);
    if (cached) {
      setNickname(cached);
      return;
    }
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function generate() {
    if (!user?.id || loading) return;
    setLoading(true);
    try {
      const kyc = await loadKyc(user.id);
      if (!kyc.full_name && !kyc.iman_level && !kyc.pascoArchetype) {
        setLoading(false);
        return;
      }
      const result = await authPost<{ nickname: string }>(
        `/profile/nickname/${user.id}`,
        buildRequest(kyc, userName),
        30000,
      );
      if (result.nickname) {
        setNickname(result.nickname);
        writeCache(CACHE_KEY_NICKNAME, user.id, result.nickname);
      }
    } catch (e) {
      console.error('Nickname generation failed:', e);
    } finally {
      setLoading(false);
    }
  }

  if (!nickname) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="text-center mt-3"
    >
      <p className="text-[#5C5749] text-[10px] uppercase tracking-widest mb-1">To Raya, you are</p>
      <p
        className="text-[#D4A853] text-[16px] italic"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        {nickname}
      </p>
    </motion.div>
  );
}
