/**
 * QuranHifzCircleJoinPage
 *
 * Landing page for shareable invite links: /quran/hifz/circles/join?code=XYZ123
 * Loads the circle preview, shows a single Join button, and bounces to the
 * circle detail page on join. If the user isn't signed in, sends them to
 * /login with a `next` URL so they return here automatically.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ArrowLeft, Spinner, Check, ArrowRight } from '@phosphor-icons/react';
import { auth } from '@/config/firebase.config';
import {
  getCircleMeta,
  joinCircle,
  type HifzCircle,
} from '../services/hifzCirclesService';
import { IslamicGeometryBackground } from '@/components/shared/IslamicGeometryBackground';

export function QuranHifzCircleJoinPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const code = (params.get('code') ?? '').trim().toUpperCase();

  const [circle, setCircle] = useState<HifzCircle | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code || code.length !== 6) {
      setError('Invalid invite link.');
      setLoading(false);
      return;
    }
    getCircleMeta(code)
      .then((c) => {
        if (!c) setError('No circle with that invite code.');
        setCircle(c);
      })
      .catch(() => setError('Could not load circle. Try again later.'))
      .finally(() => setLoading(false));
  }, [code]);

  const handleJoin = async () => {
    if (!auth.currentUser) {
      const next = encodeURIComponent(`/quran/hifz/circles/join?code=${code}`);
      navigate(`/login?next=${next}`);
      return;
    }
    setJoining(true);
    setError(null);
    try {
      const c = await joinCircle(code);
      navigate(`/quran/hifz/circles/${c.id}`, { replace: true });
    } catch (e) {
      setError((e as Error).message);
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] relative overflow-hidden">
      <IslamicGeometryBackground opacity={0.04} color="#D4A853" />

      <div className="sticky top-0 z-10 bg-[#0A0E16]/95 backdrop-blur-md border-b border-white/5 px-4 h-14 flex items-center">
        <button
          onClick={() => navigate('/quran/hifz/circles')}
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-white/70" />
        </button>
      </div>

      <div className="relative px-5 py-10 max-w-md mx-auto">
        {loading && (
          <div className="flex items-center justify-center gap-2 text-white/55 text-sm py-12">
            <Spinner size={14} className="animate-spin" /> Loading circle…
          </div>
        )}

        {!loading && error && !circle && (
          <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-6 text-center">
            <p className="text-base font-semibold text-rose-200 mb-1">Couldn't open invite</p>
            <p className="text-sm text-rose-100/85">{error}</p>
            <button
              onClick={() => navigate('/quran/hifz/circles')}
              className="mt-5 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm"
            >
              Back to my circles
            </button>
          </div>
        )}

        {!loading && circle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative rounded-3xl bg-gradient-to-br from-[#D4A853]/15 via-[#0F141F]/20 to-transparent border border-[#D4A853]/30 p-7 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-[#D4A853]/20 mx-auto flex items-center justify-center mb-3">
              <Users size={22} weight="fill" className="text-[#D4A853]" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#D4A853]/70 mb-2">You've been invited to join</p>
            <h1 className="text-2xl font-bold text-white mb-1">{circle.name}</h1>
            {circle.description && (
              <p className="text-sm text-white/65 mb-4">{circle.description}</p>
            )}
            <p className="text-xs text-white/45 mb-6">
              {circle.memberCount} member{circle.memberCount === 1 ? '' : 's'} · invite code <span className="font-mono text-[#F5E8C7]">{circle.id}</span>
            </p>

            {error && (
              <div className="mb-3 text-xs text-rose-300">{error}</div>
            )}

            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full py-3 rounded-xl bg-[#D4A853] text-[#0A0E16] text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {joining ? <Spinner size={14} className="animate-spin" /> : <Check size={14} weight="bold" />}
              {auth.currentUser ? 'Join circle' : 'Sign in & join'}
              <ArrowRight size={13} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default QuranHifzCircleJoinPage;
